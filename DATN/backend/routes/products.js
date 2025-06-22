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
} = require("../controllers/productController");

router.get("/find", searchProducts);
router.get("/:id", getProductById);
router.get("/", getAllProducts);
router.post("/", addPro);
router.post("/upload-image", uploadImage);
router.delete("/:id", deletePro);
router.patch("/:id", editPro);

module.exports = router;
