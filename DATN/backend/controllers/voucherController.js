const Voucher = require('../models/voucherModel');
const LuckyWheelResult = require('../models/luckyWheelResultModel');
const UserVoucher = require('../models/userVoucherModel');

// Lấy tất cả voucher
exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json({ success: true, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy voucher theo mã
exports.getVoucherByMa = async (req, res) => {
  try {
    const { ma } = req.params;
    const voucher = await Voucher.findOne({ ma });
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    res.json({ success: true, data: voucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo voucher mới
exports.createVoucher = async (req, res) => {
  try {
    const voucher = new Voucher(req.body);
    await voucher.save();
    res.status(201).json({ success: true, data: voucher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Cập nhật voucher
exports.updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByIdAndUpdate(id, req.body, { new: true });
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    res.json({ success: true, data: voucher });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Xóa voucher
exports.deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });
    res.json({ success: true, message: 'Voucher deleted' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Thêm API: User quay trúng -> lưu lịch sử
exports.createLuckyWheelResult = async (req, res) => {
  try {
    const { user_email, voucher_id } = req.body;
    // Kiểm tra đã từng quay chưa
    const existed = await LuckyWheelResult.findOne({ user_email });
    if (existed) {
      return res.status(400).json({ success: false, message: 'User already spun the wheel' });
    }
    const result = new LuckyWheelResult({ user_email, voucher_id });
    await result.save();
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy lịch sử quay của user
exports.getUserLuckyWheelResults = async (req, res) => {
  try {
    const { user_email } = req.params;
    const results = await LuckyWheelResult.find({ user_email }).populate('voucher_id');
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo user voucher mới khi user quay trúng
exports.createUserVoucher = async (req, res) => {
  try {
    const { user_email, voucher_id, ma_voucher, expired_at } = req.body;
    // Kiểm tra đã phát voucher này cho user chưa
    const existed = await UserVoucher.findOne({ user_email, voucher_id });
    if (existed) {
      return res.status(400).json({ success: false, message: 'User already received this voucher' });
    }
    const userVoucher = new UserVoucher({
      user_email,
      voucher_id,
      ma_voucher,
      expired_at
    });
    await userVoucher.save();
    res.status(201).json({ success: true, data: userVoucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Lấy danh sách voucher của user
exports.getUserVouchers = async (req, res) => {
  try {
    const { user_email } = req.params;
    const vouchers = await UserVoucher.find({ user_email }).populate('voucher_id');
    res.json({ success: true, data: vouchers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Đánh dấu voucher đã sử dụng
exports.useUserVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const userVoucher = await UserVoucher.findByIdAndUpdate(id, { used: true }, { new: true });
    if (!userVoucher) return res.status(404).json({ success: false, message: 'User voucher not found' });
    res.json({ success: true, data: userVoucher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}; 