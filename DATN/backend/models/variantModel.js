const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  id_san_pham: { type: String, required: true },
  hinh: [String],
  gia: { type: Number, required: true },
  gia_goc: Number,
  phien_ban: String,
  dung_luong: String,
  mau: String,
  so_luong_hang: Number
});

module.exports = mongoose.model("Variant", variantSchema);
