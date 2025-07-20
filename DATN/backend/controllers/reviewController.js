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

// Lấy tất cả review (và ảnh) của 1 sản phẩm (chỉ review gốc, không nhiều lớp)
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { ma_san_pham } = req.query;
    if (!ma_san_pham) return res.status(400).json({ error: 'Thiếu mã sản phẩm' });

    // Chỉ lấy review gốc (không có parent_id)
    const reviews = await Review.find({ ma_san_pham, an_hien: true })
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

// Lấy toàn bộ review cho admin
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('ma_nguoi_dung', 'TenKH email avatar')
      .populate('ma_san_pham', 'TenSP')
      .lean();
    const reviewIds = reviews.map(r => r._id);
    const images = await ImageReview.find({ ma_danh_gia: { $in: reviewIds } }).lean();
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

// Cập nhật trạng thái ẩn/hiện bình luận
exports.toggleReviewVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });
    review.an_hien = !review.an_hien;
    await review.save();
    res.json({ success: true, an_hien: review.an_hien });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật phản hồi bình luận
exports.replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { phan_hoi } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ error: 'Không tìm thấy review' });
    review.phan_hoi = phan_hoi;
    await review.save();
    res.json({ success: true, phan_hoi: review.phan_hoi });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 