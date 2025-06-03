const express = require("express");
const router = express.Router();
const { getAllVariants, getVariantsByProductId, createVariant, updateVariant, toggleVariantVisibility } = require("../controllers/variantController");

router.get("/", getAllVariants);
router.get("/by-product/:id", getVariantsByProductId);
router.post("/", createVariant);
router.patch("/:id", updateVariant);
router.patch("/toggle-visibility/:id", toggleVariantVisibility);

module.exports = router;
