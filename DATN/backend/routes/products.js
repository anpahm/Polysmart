const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addPro,
  uploadImage,
  deletePro,
  editPro,
  searchProducts,
  countProducts,
  getTopProducts,
} = require("../controllers/productController");

router.get("/find", searchProducts);
router.get("/count", countProducts);
router.get("/top", getTopProducts);
router.get("/", getAllProducts);
router.post("/", addPro);
router.post("/upload-image", uploadImage);
router.delete("/:id", deletePro);
router.patch("/:id", editPro);
router.get("/:id", getProductById);

module.exports = router;
