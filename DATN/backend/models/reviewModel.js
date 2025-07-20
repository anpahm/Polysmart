const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  ma_nguoi_dung: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  ma_san_pham: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  so_sao: { type: Number, required: true },
  binh_luan: { type: String, required: true },
  ngay_danh_gia: { type: Date, default: Date.now },
  an_hien: { type: Boolean, default: true },
  phan_hoi: { type: String, default: '' },
});

module.exports = mongoose.model('Review', reviewSchema); 