const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');
const BankTransaction = require('../models/bankTransactionModel');

exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalAmount, paymentMethod } = req.body;

    // Validate required fields
    // if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
    //   return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
    // }

    // Kiểm tra trùng lặp đơn hàng (KHÔNG kiểm tra transferContent)
    const duplicateOrder = await Order.findOne({
      'customerInfo.fullName': customerInfo.fullName,
      'customerInfo.phone': customerInfo.phone,
      'customerInfo.address': customerInfo.address,
      'customerInfo.city': customerInfo.city,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending'
    });
    if (duplicateOrder) {
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

    // Nếu không có, mới sinh transferContent và tạo đơn hàng mới
    const order = new Order({
      customerInfo,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
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

    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.orderStatus = 'confirmed';
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
    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
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
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
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