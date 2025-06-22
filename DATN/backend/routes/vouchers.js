const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Lấy tất cả voucher
router.get('/', voucherController.getAllVouchers);
// Lấy voucher theo mã
router.get('/ma/:ma', voucherController.getVoucherByMa);
// Tạo voucher mới
router.post('/', voucherController.createVoucher);
// Cập nhật voucher
router.put('/:id', voucherController.updateVoucher);
// Xóa voucher
router.delete('/:id', voucherController.deleteVoucher);

// Lucky Wheel Result
router.post('/luckywheel-result', voucherController.createLuckyWheelResult);
router.get('/luckywheel-result/:user_email', voucherController.getUserLuckyWheelResults);

// UserVoucher routes
router.post('/user-voucher', voucherController.createUserVoucher);
router.get('/user-voucher/:user_email', voucherController.getUserVouchers);
router.put('/user-voucher/use/:id', voucherController.useUserVoucher);

module.exports = router; 