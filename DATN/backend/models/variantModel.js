const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  id_san_pham: { type: String, required: true },
  hinh: [String],
  gia: { type: Number, required: true },
  gia_goc: Number,
  dung_luong: String,
  mau: String,
  ram: String,
  phien_ban: String,
  so_luong_hang: Number,
  an_hien: { type : Boolean, default: true }
});

module.exports = mongoose.model("Variant", variantSchema);
