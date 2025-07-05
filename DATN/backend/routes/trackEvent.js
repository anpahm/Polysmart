const express = require('express');
const router = express.Router();
const UserEvent = require('../models/userEventModel');
const User = require('../models/userModel');
const UserVoucher = require('../models/userVoucherModel');
const { sendVoucherEmail, generateVoucherCode } = require('../services/emailService');

// POST /api/track-event
router.post('/', async (req, res) => {
  const { userId, eventType, productId, searchKeyword } = req.body;
  if (!userId || !eventType) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    await UserEvent.create({ userId, eventType, productId, searchKeyword });

    // Kiểm tra điều kiện gửi mã giảm giá
    const events = await UserEvent.find({ userId, productId });
    const views = events.filter(e => e.eventType === 'view_product').length;
    const addedToCart = events.filter(e => e.eventType === 'add_to_cart').length;

    // Kiểm tra đã gửi voucher behavior cho userId+productId chưa
    const existed = await UserVoucher.findOne({ nguoi_dung: userId, san_pham: productId, loai: 'behavior' });
    if (views >= 10 && addedToCart >= 3 && !existed) {
      const user = await User.findById(userId);
      if (user && user.email) {
        const voucherCode = generateVoucherCode();
        const het_han = new Date(Date.now() + 30*24*60*60*1000); // 30 ngày
        await UserVoucher.create({
          nguoi_dung: userId,
          ma_voucher: voucherCode,
          loai: 'behavior',
          san_pham: productId,
          giam_gia: 500000,
          da_su_dung: false,
          het_han
        });
        await sendVoucherEmail(user.email, user.TenKH || user.name || 'bạn', voucherCode);
        console.log(`Đã gửi mã giảm giá behavior cho ${user.email} (userId: ${userId}, productId: ${productId})`);
      }
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save event' });
  }
});

module.exports = router; 