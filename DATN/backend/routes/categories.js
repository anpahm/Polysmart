const express = require("express");
const router = express.Router();
const { getAllCategories, addCategory, updateCategory, deleteCategory, uploadImageCategory, getCategoryById } = require("../controllers/categoryController");

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", addCategory);
router.patch("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.post("/upload-image", uploadImageCategory);

module.exports = router;
