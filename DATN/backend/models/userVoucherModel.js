const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userVoucherSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  voucherCode: { type: String, required: true },
  type: { type: String, enum: ['gift', 'public'], required: true },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserVoucher', userVoucherSchema); 