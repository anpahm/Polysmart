const products = require("../models/productModel");
const variants = require("../models/variantModel");
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

const getAllProducts = async (req, res) => {
  try {
    const productsList = await products.find();

    if (!productsList.length) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm nào" });
    }

    const productIds = productsList.map((product) => product._id.toString());
    const categoryIds = productsList.map((product) =>
      product.id_danhmuc.toString()
    );

    const variantAll = await variants.find({
      id_san_pham: { $in: productIds },
    });

    const categoryAll = await categories.find(
      { _id: { $in: categoryIds } },
      "ten_danh_muc banner_dm"
    );

    const productsWithCategories = productsList.map((product) => {
      const productObj = product.toObject();
      // Thêm categories từ categoryAll dựa trên id_danhmuc
      productObj.categories = categoryAll
        .filter(
          (category) =>
            category._id.toString() === product.id_danhmuc.toString()
        )
        .map((category) => category.toObject());
      // Gắn variants
      productObj.variants = variantAll
        .filter((variant) => variant.id_san_pham === product._id.toString())
        .map((variant) => variant.toObject());
      return productObj;
    });

    res.status(200).json(productsWithCategories);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};


const getProductById = async (req, res) => {
  try {
    const product = await products.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const variantList = await variants.find({
      id_san_pham: product._id.toString(),
    });

    const category = await categories.findById(
      product.id_danhmuc,
      "ten_danh_muc banner_dm"
    );
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    const productObj = product.toObject();
    // Thêm categories dưới dạng mảng
    productObj.categories = [category.toObject()];
    // Gắn variants
    productObj.variants = variantList.map((variant) => variant.toObject());

    res.status(200).json(productObj);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    res.status(500).json({ message: "Lỗi máy chủ: " + error.message });
  }
};

const addPro = async (req, res) => {
  try {
    const newProduct = new products(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm sản phẩm: " + error.message });
  }
};

const uploadImage = [upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Không có file được upload' });
  }
  // Đường dẫn public để frontend truy cập
  const imageUrl = `/images/${req.file.filename}`;
  res.status(200).json({ url: imageUrl });
}];

const deletePro = async (req, res) => {
  try {
    const deleted = await products.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }
    res.status(200).json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa sản phẩm: ' + error.message });
  }
};

const editPro = async (req, res) => {
  try {
    const updated = await products.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm: ' + error.message });
  }
};

module.exports = { getAllProducts, getProductById, addPro, uploadImage, deletePro, editPro };
