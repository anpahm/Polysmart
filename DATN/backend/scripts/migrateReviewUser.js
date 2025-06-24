const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/DB_ShopTao'); // Đổi <tên_db_của_bạn> thành tên database thực tế

const User = require('../models/userModel');
const Review = mongoose.model('Review', new mongoose.Schema({
  ma_nguoi_dung: String,
  ma_san_pham: String,
  so_sao: Number,
  binh_luan: String,
  ngay_danh_gia: Date,
}, { collection: 'reviews' }));

(async () => {
  const reviews = await Review.find({});
  for (const review of reviews) {
    // Nếu ma_nguoi_dung là email
    let user = await User.findOne({ email: review.ma_nguoi_dung });
    // Nếu không phải email, thử tìm theo tên
    if (!user) user = await User.findOne({ TenKH: review.ma_nguoi_dung });
    // Nếu vẫn không có, thử tìm theo _id (trường hợp đã đúng)
    if (!user && mongoose.Types.ObjectId.isValid(review.ma_nguoi_dung)) {
      user = await User.findById(review.ma_nguoi_dung);
    }
    if (user) {
      review.ma_nguoi_dung = user._id;
      await review.save();
      console.log(`Updated review ${review._id} -> user ${user._id}`);
    } else {
      console.log(`Không tìm thấy user cho review ${review._id} (giá trị: ${review.ma_nguoi_dung})`);
    }
  }
  console.log('Done migrate!');
  process.exit();
})();
