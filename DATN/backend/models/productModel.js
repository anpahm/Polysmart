const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    TenSP: { type: String, required: true },
    hinh: String,
    video: [String],
    hot: { type: Boolean, default: false },
    ban_chay: { type: Number, default: 0 },
    khuyen_mai: { type: Number, default: 0 },
    an_hien: { type: Boolean, default: true },
    ngay_tao: { type: Date, default: Date.now },
    id_danhmuc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
  thong_so_ky_thuat: {
    CPU: String,
    Camera: [String],
    GPU: String,
    Cong_nghe_man_hinh: String,
    He_dieu_hanh: String,
    Do_phan_giai: String,
    Ket_noi: [String],
    Kich_thuoc_khoi_luong: [String],
    Kich_thuoc_man_hinh: String,
    Tien_ich_khac: [String],
    Tinh_nang_camera: [String]
  }
  },
  { versionKey: false }
);

module.exports = mongoose.model("products", productSchema);
