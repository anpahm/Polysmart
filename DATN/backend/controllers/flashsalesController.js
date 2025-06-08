const FlashSale = require('../models/flashsalesModel');

// Lấy tất cả flash sales
exports.getAllFlashSales = async (req, res) => {
  try {
    const flashSales = await FlashSale.find().populate('id_san_pham').populate('id_variant');
    res.json({ success: true, data: flashSales });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tạo flash sale mới
exports.createFlashSale = async (req, res) => {
  try {
    const flashSale = new FlashSale(req.body);
    await flashSale.save();
    res.status(201).json({ success: true, data: flashSale });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Lấy flash sale theo ID
exports.getFlashSaleById = async (req, res) => {
  try {
    const flashSale = await FlashSale.findById(req.params.id);
    if (!flashSale) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: flashSale });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cập nhật flash sale
exports.updateFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flashSale) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: flashSale });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Xóa flash sale
exports.deleteFlashSale = async (req, res) => {
  try {
    const flashSale = await FlashSale.findByIdAndDelete(req.params.id);
    if (!flashSale) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
