const variants = require("../models/variantModel");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getAllVariants = async (req, res) => {
  try {
    const variantList = await variants.find();
    if (!variantList.length) {
      return res.status(404).json({ message: "Không tìm thấy biến thể nào" });
    }
    res.status(200).json(variantList);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách biến thể:", error);
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};

const getVariantsByProductId = async (req, res) => {
  try {
    const productId = req.params.id;
    const variantList = await variants.find({ id_san_pham: productId });
    if (!variantList.length) {
      return res.status(404).json({ message: "Không tìm thấy biến thể nào cho sản phẩm này" });
    }
    res.status(200).json(variantList);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách biến thể:", error);
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};

const createVariant = async (req, res) => {
  try {
    const newVariant = new variants(req.body);
    await newVariant.save();
    res.status(201).json(newVariant);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm biến thể: " + error.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await variants.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy biến thể" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật biến thể: " + error.message });
  }
};

const toggleVariantVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await variants.findById(id);
    if (!variant) return res.status(404).json({ message: "Không tìm thấy biến thể" });
    variant.an_hien = !variant.an_hien;
    await variant.save();
    res.status(200).json(variant);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đổi trạng thái biến thể: " + error.message });
  }
};

// Cấu hình lưu file cho variant
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});
const upload = multer({ storage: storage });

// API upload 1 file, trả về link ảnh
const uploadVariantImage = [upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file được upload' });
  }
  const imageUrl = `/images/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
}];

module.exports = {
  getAllVariants,
  getVariantsByProductId,
  createVariant,
  updateVariant,
  toggleVariantVisibility,
  uploadVariantImage
};
