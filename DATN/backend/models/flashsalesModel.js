const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  id_san_pham: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  id_variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant', required: true },
  gia_flash_sale: { type: Number, required: true },
  so_luong_flash_sale: { type: Number, required: true },
  da_ban: { type: Number, default: 0 },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  trang_thai: { type: Boolean, default: true }
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);
