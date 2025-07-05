const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create new order
router.post('/', orderController.createOrder);

// Get order by ID
router.get('/:orderId', orderController.getOrder);

// Update payment status
router.put('/:orderId/payment', orderController.updatePaymentStatus);

// Verify bank transfer
router.post('/verify-transfer', orderController.verifyBankTransfer);

// Auto confirm orders (đối soát tự động)
router.post('/auto-confirm', orderController.autoConfirmOrders);

// Get all orders (optionally by userId)
router.get('/', orderController.getOrders);

// Hủy đơn hàng
router.put('/:orderId/cancel', orderController.cancelOrder);

module.exports = router; 