const variants = require("../models/variantModel");

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

module.exports = { getAllVariants, getVariantsByProductId };
