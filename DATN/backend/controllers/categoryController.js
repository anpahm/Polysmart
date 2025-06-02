const categories = require("../models/categoryModel");
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const checkfile = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new Error('Bạn chỉ được upload file ảnh'));
  }
  return cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: checkfile });

const getAllCategories = async (req, res) => {
  try {
    const categoryList = await categories.find({}, "ten_danh_muc banner_dm");
    if (!categoryList.length) {
      return res.status(404).json({ message: "Không tìm thấy danh mục nào" });
    }
    res.status(200).json(categoryList);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục:", error);
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};

// Thêm danh mục
const addCategory = async (req, res) => {
  try {
    const newCategory = new categories(req.body);
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm danh mục: " + error.message });
  }
};

// Sửa danh mục
const updateCategory = async (req, res) => {
  try {
    const updated = await categories.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy danh mục để cập nhật" });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật danh mục: " + error.message });
  }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
  try {
    const deleted = await categories.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy danh mục để xóa" });
    }
    res.status(200).json({ message: "Đã xóa danh mục thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa danh mục: " + error.message });
  }
};

// Upload ảnh banner danh mục
const uploadImageCategory = [upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file được upload' });
  }
  const imageUrl = `/images/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
}];

// Lấy danh mục theo ID
const getCategoryById = async (req, res) => {
  try {
    const category = await categories.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin danh mục: " + error.message });
  }
};

module.exports = { getAllCategories, addCategory, updateCategory, deleteCategory, uploadImageCategory, getCategoryById };
