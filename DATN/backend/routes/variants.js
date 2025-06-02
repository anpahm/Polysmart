const express = require("express");
const router = express.Router();
const { getAllVariants } = require("../controllers/variantController");

router.get("/", getAllVariants);

module.exports = router;
