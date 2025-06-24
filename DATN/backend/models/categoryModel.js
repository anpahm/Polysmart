const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  ten_danh_muc: { type: String, required: true },
  video: String,
});

module.exports = mongoose.model("categories", categorySchema);
