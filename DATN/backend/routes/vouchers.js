const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucherController');

// Lấy tất cả voucher
router.get('/', voucherController.getAllVouchers);
// Lấy voucher theo code
router.get('/code/:code', voucherController.getVoucherByCode);
// Tạo voucher mới
router.post('/', voucherController.createVoucher);
// Cập nhật voucher
router.put('/:id', voucherController.updateVoucher);
// Xóa voucher
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router; 