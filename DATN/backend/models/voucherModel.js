const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount_type: { type: String, enum: ['percent', 'fixed'], required: true },
  discount_value: { type: Number, required: true },
  condition: { type: Object, default: {} },
  used: { type: Boolean, default: false },
  user_email: { type: String, default: null },
  created_at: { type: Date, required: true },
  expired_at: { type: Date, required: true }
});

module.exports = mongoose.model('Voucher', voucherSchema); 