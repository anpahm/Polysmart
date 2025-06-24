const express = require('express');
const router = express.Router();
const userVoucherController = require('../controllers/userVoucherController');

router.get('/', userVoucherController.getUserVouchers); // ?userId=xxx
router.post('/', userVoucherController.addUserVoucher);

module.exports = router; 