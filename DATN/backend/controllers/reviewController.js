const Review = require('../models/reviewModel');
const ImageReview = require('../models/imageReviewModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

process.on('uncaughtException', function (err) {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', function (err) {
  console.error('Unhandled Rejection:', err);
});

// Lấy tất cả review (và ảnh) của 1 sản phẩm
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { ma_san_pham } = req.query;
    console.log('Getting reviews for product:', ma_san_pham);
    
    if (!ma_san_pham) return res.status(400).json({ error: 'Thiếu mã sản phẩm' });
    
    console.log('Finding reviews...');
    const reviews = await Review.find({ ma_san_pham })
      .populate('ma_nguoi_dung', 'TenKH email avatar')
      .lean();
    console.log('Found reviews:', reviews);
    
    const reviewIds = reviews.map(r => r._id);
    console.log('Review IDs:', reviewIds);
    
    console.log('Finding images...');
    const images = await ImageReview.find({ ma_danh_gia: { $in: reviewIds } }).lean();
    console.log('Found images:', images);
    
    // Gắn ảnh vào review
    const reviewMap = {};
    reviews.forEach(r => reviewMap[r._id] = { ...r, images: [] });
    images.forEach(img => {
      if (reviewMap[img.ma_danh_gia]) {
        reviewMap[img.ma_danh_gia].images.push(img);
      }
    });
    res.json(Object.values(reviewMap));
  } catch (err) {
    console.error('Error in getReviewsByProduct:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
};

// Thêm review mới (có thể kèm ảnh)
exports.createReview = async (req, res) => {
  try {
    const { ma_nguoi_dung, ma_san_pham, so_sao, binh_luan, images } = req.body;
    if (!ma_nguoi_dung || !ma_san_pham || !so_sao || !binh_luan) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }
    const review = await Review.create({ ma_nguoi_dung, ma_san_pham, so_sao, binh_luan, ngay_danh_gia: new Date() });
    if (images && images.length) {
      await ImageReview.insertMany(images.map(url => ({
        ma_danh_gia: review._id,
        duong_dan_anh: url,
        ghi_chu: ''
      })));
    }
    res.json({ success: true, reviewId: review._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả review (và ảnh) của 1 user
exports.getReviewsByUser = async (req, res) => {
  try {
    const { ma_nguoi_dung } = req.query;
    if (!ma_nguoi_dung) return res.status(400).json({ error: 'Thiếu mã người dùng' });

    const reviews = await Review.find({ ma_nguoi_dung })
      .populate('ma_san_pham', 'TenSP hinh')
      .populate('ma_nguoi_dung', 'TenKH email avatar')
      .lean();

    const reviewIds = reviews.map(r => r._id);
    const images = await ImageReview.find({ ma_danh_gia: { $in: reviewIds } }).lean();

    // Gắn ảnh vào review
    const reviewMap = {};
    reviews.forEach(r => reviewMap[r._id] = { ...r, images: [] });
    images.forEach(img => {
      if (reviewMap[img.ma_danh_gia]) {
        reviewMap[img.ma_danh_gia].images.push(img);
      }
    });
    res.json(Object.values(reviewMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 