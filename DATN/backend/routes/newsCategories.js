const express = require('express');
const router = express.Router();
const newsCategoryController = require('../controllers/newsCategoryController');

router.get('/', newsCategoryController.getAllNewsCategories);

module.exports = router; 