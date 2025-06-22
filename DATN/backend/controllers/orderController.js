const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Variant = require('../models/variantModel');

exports.createOrder = async (req, res) => {
  try {
    const { customerInfo, items, totalAmount, paymentMethod } = req.body;

    // Validate required fields
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin giao hàng' });
    }

    // Create order with initial payment status
    const order = new Order({
      customerInfo,
      items,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      transferContent: `DH${Date.now().toString().slice(-6)}` // Generate order code
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
    await order.save();

    // Update product quantities (in a real app, you'd want to handle this in a transaction)
    for (const item of items) {
      const variant = await Variant.findById(item.variantId);
      if (variant) {
        variant.quantity -= item.quantity;
        await variant.save();
      }
    }

    res.status(201).json({
      message: 'Đặt hàng thành công',
      order: {
        id: order._id,
        transferContent: order.transferContent,
        bankInfo: order.bankInfo,
        totalAmount: order.totalAmount
      }
    });
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