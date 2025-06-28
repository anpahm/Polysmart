const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Middleware để bảo vệ route (giả sử bạn có)
// const { protect, admin } = require('../middleware/authMiddleware');

// Route cho người dùng
router.get('/apply/:code', voucherController.applyVoucher);

// Routes cho admin
router.route('/')
    .get(voucherController.getAllVouchers)    // Lấy tất cả voucher
    .post(voucherController.createVoucher);   // Tạo voucher mới

router.route('/:id')
    .get(voucherController.getVoucherById)     // Lấy voucher theo ID
    .put(voucherController.updateVoucher)      // Cập nhật voucher
    .delete(voucherController.deleteVoucher); // Xóa voucher


// UserVoucher routes
router.post('/user-voucher', voucherController.createUserVoucher);
router.get('/user-voucher/:user_email', voucherController.getUserVouchers);
router.put('/user-voucher/use/:id', voucherController.useUserVoucher);

module.exports = router; 