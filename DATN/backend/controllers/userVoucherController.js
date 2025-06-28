const UserVoucher = require('../models/userVoucherModel');
const GiftVoucher = require('../models/giftVoucherModel');
const Voucher = require('../models/voucherModel');
const mongoose = require('mongoose');

exports.getUserVouchers = async (req, res) => {
  try {
    const { nguoi_dung } = req.query;
    if (!nguoi_dung) return res.json({ success: false, message: 'Thiếu nguoi_dung' });
    const userVouchers = await UserVoucher.find({ nguoi_dung });

    // Lấy thông tin chi tiết cho từng voucher
    const result = await Promise.all(userVouchers.map(async (uv) => {
      let detail = null;
      if (uv.loai === 'public') {
        detail = await Voucher.findOne({ ma_voucher: uv.ma_voucher });
      } else if (uv.loai === 'gift') {
        detail = await GiftVoucher.findOne({ ma_voucher: uv.ma_voucher });
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
    const { nguoi_dung, code } = req.body;
    if (!nguoi_dung || !code) return res.json({ success: false, message: 'Thiếu thông tin' });
    const nguoiDungObjId = new mongoose.Types.ObjectId(nguoi_dung);
    const existed = await UserVoucher.findOne({ nguoi_dung: nguoiDungObjId, ma_voucher: code.toUpperCase() });
    if (existed) return res.json({ success: false, message: 'Bạn đã lưu mã này rồi!' });
    
    // Kiểm tra gift voucher
    let voucher = await GiftVoucher.findOne({ ma_voucher: code.toUpperCase(), da_su_dung: false, da_vo_hieu_hoa: false });
    if (voucher) {
      await UserVoucher.create({ nguoi_dung: nguoiDungObjId, ma_voucher: code.toUpperCase(), loai: 'gift', het_han: voucher.het_han });
      return res.json({ success: true });
    }
    
    // Kiểm tra voucher công khai
    voucher = await Voucher.findOne({ 
      ma_voucher: code.toUpperCase(), 
      trang_thai: 'active', 
      $expr: { $gt: ["$so_luong", "$da_su_dung"] },
      ngay_bat_dau: { $lte: new Date() },
      ngay_ket_thuc: { $gte: new Date() }
    });
    if (voucher) {
      await UserVoucher.create({ nguoi_dung: nguoiDungObjId, ma_voucher: code.toUpperCase(), loai: 'public', het_han: voucher.ngay_ket_thuc });
      return res.json({ success: true });
    }
    return res.json({ success: false, message: 'Mã voucher không hợp lệ hoặc đã hết lượt sử dụng/vô hiệu hóa.' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
}; 