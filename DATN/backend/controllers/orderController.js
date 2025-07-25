const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');
const BankTransaction = require('../models/bankTransactionModel');
const FlashSaleVariant = require('../models/FlashSaleVariant');

// Helper function to update flash sale quantities
const updateFlashSaleQuantities = async (orderId) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Order ${orderId} not found for flash sale update`);
      return false;
    }

    let flashSaleUpdated = false;

    for (const item of order.items) {
      if (item.isFlashSale && item.flashSaleVariantId) {
        const result = await FlashSaleVariant.updateOne(
          { _id: item.flashSaleVariantId },
          { $inc: { da_ban: item.quantity } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`Updated flash sale variant ${item.flashSaleVariantId}: +${item.quantity} sold`);
          flashSaleUpdated = true;
        } else {
          console.log(`Flash sale variant ${item.flashSaleVariantId} not found or not updated`);
        }
      }
    }

    return flashSaleUpdated;
  } catch (error) {
    console.error('Error updating flash sale quantities:', error);
    return false;
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalAmount, paymentMethod } = req.body;

    // Validate required fields
    // if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
    //   return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
    // }

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicateOrder = await Order.findOne({
      'customerInfo.phone': req.body.customerInfo.phone,
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentStatus: 'pending',
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (duplicateOrder) {
      // Nếu đơn hàng cũ vẫn pending trong 5 phút, trả về đơn cũ
      return res.status(200).json({
        message: 'Đơn hàng đã tồn tại (pending)',
        order: {
          id: duplicateOrder._id,
          transferContent: duplicateOrder.transferContent,
          bankInfo: duplicateOrder.bankInfo,
          totalAmount: duplicateOrder.totalAmount
        }
      });
    }

    // Lấy giá gốc cho từng item
    const itemsWithOldPrice = await Promise.all(items.map(async (item) => {
      const variant = await Variant.findById(item.variantId);
      return {
        ...item,
        oldPrice: variant ? variant.gia_goc : undefined
      };
    }));

    // Nếu không có đơn pending trong 5 phút, tạo đơn mới
    const order = new Order({
      customerInfo,
      items: itemsWithOldPrice,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'confirming',
      transferContent: `DH${Date.now().toString().slice(-6)}`
    });

    // If ATM payment, add bank info
    if (paymentMethod === 'atm') {
      order.bankInfo = {
        bankName: 'BIDV',
        accountNumber: process.env.BANK_ACCOUNT_NUMBER,
        accountName: process.env.BANK_ACCOUNT_NAME,
        branch: process.env.BANK_BRANCH
      };
    }

    // Save order
    try {
      await order.save();

      // Note: Flash sale quantity will be updated when payment is confirmed (paid status)
      // This ensures we don't reserve stock for unpaid orders

      return res.status(201).json({
        message: 'Đặt hàng thành công',
        order: {
          id: order._id,
          transferContent: order.transferContent,
          bankInfo: order.bankInfo,
          totalAmount: order.totalAmount
        }
      });
    } catch (err) {
      if (err.code === 11000) {
        // Nếu bị duplicate key, trả về đơn hàng cũ
        const duplicateOrder = await Order.findOne({
          'customerInfo.phone': req.body.customerInfo.phone,
          totalAmount: req.body.totalAmount,
          paymentMethod: req.body.paymentMethod,
          paymentStatus: 'pending'
        });
        return res.status(200).json({ message: 'Đơn hàng đã tồn tại', order: duplicateOrder });
      }
      throw err;
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi đặt hàng' });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const wasUnpaid = order.paymentStatus !== 'paid';
    order.paymentStatus = paymentStatus;
    
    if (paymentStatus === 'paid') {
      order.orderStatus = 'packing';
      
      // Update flash sale quantities when payment is confirmed
      if (wasUnpaid) {
        const flashSaleUpdated = await updateFlashSaleQuantities(orderId);
        if (flashSaleUpdated) {
          console.log(`Flash sale quantities updated for order ${orderId}`);
        }
      }
    }

    await order.save();

    res.json({ message: 'Cập nhật trạng thái thanh toán thành công', order });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật trạng thái thanh toán' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi lấy thông tin đơn hàng' });
  }
};

exports.verifyBankTransfer = async (req, res) => {
  try {
    const { orderId, transferContent } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.transferContent !== transferContent) {
      return res.status(400).json({ message: 'Mã giao dịch không hợp lệ' });
    }

    // In a real app, you would verify the transfer with the bank's API
    // For now, we'll just simulate a successful verification
    const wasUnpaid = order.paymentStatus !== 'paid';
    order.paymentStatus = 'paid';
    order.orderStatus = 'packing';
    
    // Update flash sale quantities when payment is confirmed
    if (wasUnpaid) {
      const flashSaleUpdated = await updateFlashSaleQuantities(order._id);
      if (flashSaleUpdated) {
        console.log(`Flash sale quantities updated for order ${order._id}`);
      }
    }
    
    await order.save();

    res.json({ message: 'Xác nhận thanh toán thành công', order });
  } catch (error) {
    console.error('Verify bank transfer error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi xác nhận thanh toán' });
  }
};

// API: Đối soát tự động đơn hàng với bank transactions
exports.autoConfirmOrders = async (req, res) => {
  try {
    const pendingOrders = await Order.find({ paymentStatus: 'pending' });
    let updated = 0;
    for (const order of pendingOrders) {
      try {
        console.log('Đang kiểm tra order:', order._id, order.totalAmount, order.transferContent);
        const matchedTx = await BankTransaction.findOne({
          amount: order.totalAmount,
          description: { $regex: order.transferContent, $options: 'i' },
          status: { $in: ['pending', 'completed'] }
        });
        if (matchedTx) {
          const wasUnpaid = order.paymentStatus !== 'paid';
          order.paymentStatus = 'paid';
          order.orderStatus = 'packing';
          
          // Update flash sale quantities when payment is confirmed
          if (wasUnpaid) {
            const flashSaleUpdated = await updateFlashSaleQuantities(order._id);
            if (flashSaleUpdated) {
              console.log(`Flash sale quantities updated for order ${order._id}`);
            }
          }
          
          await order.save();
          matchedTx.status = 'matched';
          matchedTx.orderId = order._id;
          matchedTx.matchedOrder = true;
          await matchedTx.save();
          updated++;
          console.log(`Matched order ${order._id} with transaction ${matchedTx._id}`);
        }
      } catch (err) {
        console.error('Error processing order:', order._id, err);
      }
    }
    res.json({ message: `Đã đối soát xong. Đã cập nhật ${updated} đơn hàng thành công.` });
  } catch (error) {
    console.error('Auto confirm orders error:', error);
    res.status(500).json({ message: 'Lỗi khi đối soát đơn hàng tự động' });
  }
};

// API endpoint để manual update flash sale quantities
exports.updateFlashSaleQuantitiesForOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Đơn hàng chưa được thanh toán' });
    }
    
    const flashSaleUpdated = await updateFlashSaleQuantities(orderId);
    
    if (flashSaleUpdated) {
      res.json({ 
        message: 'Cập nhật số lượng flash sale thành công',
        orderId: orderId,
        updated: true 
      });
    } else {
      res.json({ 
        message: 'Không có sản phẩm flash sale trong đơn hàng này',
        orderId: orderId,
        updated: false 
      });
    }
  } catch (error) {
    console.error('Error updating flash sale quantities for order:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng flash sale' });
  }
};

// Export helper function for external use
exports.updateFlashSaleQuantities = updateFlashSaleQuantities;

exports.getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) {
      query['customerInfo.userId'] = userId;
    }
    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra khi lấy danh sách đơn hàng' });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    // Chỉ cho phép hủy nếu chưa hoàn thành/giao hàng
    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ message: 'Đơn hàng đã bị hủy trước đó' });
    }
    if (order.orderStatus === 'completed' || order.orderStatus === 'delivered') {
      return res.status(400).json({ message: 'Không thể hủy đơn đã hoàn thành/giao hàng' });
    }
    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ success: true, message: 'Đã hủy đơn hàng', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi hủy đơn hàng' });
  }
};

// Cập nhật trạng thái đơn hàng (packing, shipping, delivered, ...)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    if (orderStatus) {
      order.orderStatus = orderStatus;
      // Nếu là đơn COD và chuyển sang delivered thì cập nhật luôn paymentStatus = 'paid'
      if (order.paymentMethod === 'cod' && orderStatus === 'delivered') {
        const wasUnpaid = order.paymentStatus !== 'paid';
        order.paymentStatus = 'paid';
        
        // Update flash sale quantities when COD order is delivered
        if (wasUnpaid) {
          const flashSaleUpdated = await updateFlashSaleQuantities(order._id);
          if (flashSaleUpdated) {
            console.log(`Flash sale quantities updated for COD order ${order._id}`);
          }
        }
      }
      await order.save();
      return res.json({ success: true, order });
    } else {
      return res.status(400).json({ message: 'Thiếu trường orderStatus' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Đã có lỗi xảy ra khi cập nhật trạng thái đơn hàng' });
  }
};

// Thống kê doanh thu theo ngày/tuần/tháng
exports.getRevenueStats = async (req, res) => {
  try {
    const { type } = req.query;
    let groupId = null;
    let dateFormat = null;
    if (type === 'month') {
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
      dateFormat = "%Y-%m";
    } else if (type === 'week') {
      groupId = { year: { $year: "$createdAt" }, week: { $isoWeek: "$createdAt" } };
      dateFormat = "%G-W%V";
    } else {
      // default: day
      groupId = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
      dateFormat = "%Y-%m-%d";
    }
    const stats = await Order.aggregate([
      { $match: { orderStatus: 'delivered' } },
      { $group: {
          _id: groupId,
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } }
    ]);
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi thống kê doanh thu: ' + error.message });
  }
};

// Lấy danh sách đơn hàng chưa xác nhận
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: 'confirming' }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách đơn hàng chưa xác nhận: ' + error.message });
  }
}; 