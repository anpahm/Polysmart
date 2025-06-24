const mongoose = require('mongoose');

const giftVoucherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  voucherCode: {
    type: String,
    required: true,
    unique: true
  },
  selectedGift: {
    type: Number,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 năm
  },
  percent: {
    type: Number,
    required: true
  },
  isDisabled: {
    type: Boolean,
    default: false
  }
});

// Index để tìm kiếm nhanh
giftVoucherSchema.index({ email: 1 });
giftVoucherSchema.index({ phone: 1 });

module.exports = mongoose.model('GiftVoucher', giftVoucherSchema); 