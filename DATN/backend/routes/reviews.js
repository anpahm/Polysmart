const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Lấy danh sách review theo mã sản phẩm
router.get('/', reviewController.getReviewsByProduct);

// Thêm review mới
router.post('/', reviewController.createReview);

// Thêm route mới
router.get('/by-user', reviewController.getReviewsByUser);

// Lấy toàn bộ review cho admin
router.get('/all', reviewController.getAllReviews);

// Ẩn/hiện bình luận
router.patch('/:id/toggle-hide', reviewController.toggleReviewVisibility);
// Phản hồi bình luận
router.patch('/:id/reply', reviewController.replyToReview);

module.exports = router; 