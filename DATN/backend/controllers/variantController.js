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

module.exports = { getAllVariants };
