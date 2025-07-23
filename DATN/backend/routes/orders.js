const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create new order
router.post('/', orderController.createOrder);

// Update payment status
router.put('/:orderId/payment', orderController.updatePaymentStatus);

// Verify bank transfer
router.post('/verify-transfer', orderController.verifyBankTransfer);

// Auto confirm orders (đối soát tự động)
router.post('/auto-confirm', orderController.autoConfirmOrders);

// Get revenue stats
router.get('/revenue', orderController.getRevenueStats);

// Get pending orders
router.get('/pending', orderController.getPendingOrders);

// Get all orders (optionally by userId)
router.get('/', orderController.getOrders);

// Hủy đơn hàng
router.put('/:orderId/cancel', orderController.cancelOrder);

// Cập nhật trạng thái đơn hàng (packing, shipping, delivered, ...)
router.put('/:orderId', orderController.updateOrderStatus);

// Get order by ID
router.get('/:orderId', orderController.getOrder);

// Update flash sale quantities for specific order
router.post('/:orderId/update-flashsale', orderController.updateFlashSaleQuantitiesForOrder);

module.exports = router; 