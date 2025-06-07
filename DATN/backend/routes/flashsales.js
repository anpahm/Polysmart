const express = require('express');
const router = express.Router();
const flashsalesController = require('../controllers/flashsalesController');

router.get('/', flashsalesController.getAllFlashSales);
router.post('/', flashsalesController.createFlashSale);
router.get('/:id', flashsalesController.getFlashSaleById);
router.put('/:id', flashsalesController.updateFlashSale);
router.delete('/:id', flashsalesController.deleteFlashSale);

module.exports = router;
