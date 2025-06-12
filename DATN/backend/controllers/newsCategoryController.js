const NewsCategory = require('../models/newsCategoryModel');

exports.getAllNewsCategories = async (req, res) => {
  try {
    const categories = await NewsCategory.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 