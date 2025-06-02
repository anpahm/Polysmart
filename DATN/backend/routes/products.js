const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addPro,
  uploadImage,
  deletePro,
  editPro,
} = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", addPro);
router.post("/upload-image", uploadImage);
router.delete("/:id", deletePro);
router.patch("/:id", editPro);

module.exports = router;
