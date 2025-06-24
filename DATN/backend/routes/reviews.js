const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Lấy danh sách review theo mã sản phẩm
router.get('/', reviewController.getReviewsByProduct);

// Thêm review mới
router.post('/', reviewController.createReview);

// Thêm route mới
router.get('/by-user', reviewController.getReviewsByUser);

module.exports = router; 