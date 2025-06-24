const UserVoucher = require('../models/userVoucherModel');
const GiftVoucher = require('../models/giftVoucherModel');
const Voucher = require('../models/voucherModel');

exports.getUserVouchers = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.json({ success: false, message: 'Missing userId' });
    const userVouchers = await UserVoucher.find({ user: userId });

    // Lấy thông tin chi tiết cho từng voucher
    const result = await Promise.all(userVouchers.map(async (uv) => {
      let detail = null;
      if (uv.type === 'public') {
        detail = await Voucher.findOne({ ma_voucher: uv.voucherCode });
      } else if (uv.type === 'gift') {
        detail = await GiftVoucher.findOne({ voucherCode: uv.voucherCode });
      }
      return {
        ...uv.toObject(),
        detail
      };
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

exports.addUserVoucher = async (req, res) => {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.json({ success: false, message: 'Thiếu thông tin' });
    const existed = await UserVoucher.findOne({ user: userId, voucherCode: code.toUpperCase() });
    if (existed) return res.json({ success: false, message: 'Bạn đã lưu mã này rồi!' });
    let voucher = await GiftVoucher.findOne({ voucherCode: code.toUpperCase(), isUsed: false, isDisabled: false });
    if (voucher) {
      await UserVoucher.create({ user: userId, voucherCode: code.toUpperCase(), type: 'gift' });
      return res.json({ success: true });
    }
    voucher = await Voucher.findOne({ 
      ma_voucher: code.toUpperCase(), 
      trang_thai: 'active', 
      so_luong: { $gt: 0 },
      ngay_bat_dau: { $lte: new Date() },
      ngay_ket_thuc: { $gte: new Date() }
    });
    if (voucher) {
      await UserVoucher.create({ user: userId, voucherCode: code.toUpperCase(), type: 'public' });
      return res.json({ success: true });
    }
    return res.json({ success: false, message: 'Mã voucher không hợp lệ hoặc đã hết lượt sử dụng/vô hiệu hóa.' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}; 