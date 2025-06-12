const News = require('../models/newsModel');

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find()
      .populate('id_danh_muc', 'ten_danh_muc')
      .populate('nguoi_dang', 'TenKH')
      .sort({ ngay: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 