const express = require("express");
const router = express.Router();
const { getAllVariants, getVariantsByProductId } = require("../controllers/variantController");

router.get("/", getAllVariants);
router.get("/by-product/:id", getVariantsByProductId);

module.exports = router;
