const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  ma: { type: String, required: true, unique: true },
  giam_gia: { type: Number, required: true },
  ma_voucher: { type: String, default: '' },
  used: { type: Boolean, default: false },
  created_at: { type: Date, required: true },
  expired_at: { type: Date, required: true }
});

module.exports = mongoose.model('Voucher', voucherSchema); 