const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema({
  user_email: { type: String, required: true },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
  ma_voucher: { type: String, required: true },
  used: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  expired_at: { type: Date, required: true }
});

module.exports = mongoose.model('UserVoucher', userVoucherSchema); 