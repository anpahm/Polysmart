const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/DB_ShopTao');

// Tạo schema tạm thời cho Review để không ảnh hưởng đến schema chính
const Review = mongoose.model('Review', new mongoose.Schema({
  ma_nguoi_dung: mongoose.Schema.Types.ObjectId,
  ma_san_pham: String, // Giữ là String để migration
  so_sao: Number,
  binh_luan: String,
  ngay_danh_gia: Date,
}, { collection: 'reviews' }));

// Tạo schema tạm thời cho Product để kiểm tra sự tồn tại của sản phẩm
const Product = mongoose.model('Product', new mongoose.Schema({}, { collection: 'products' }));

(async () => {
  try {
    const reviews = await Review.find({});
    console.log(`Found ${reviews.length} reviews to migrate`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const review of reviews) {
      try {
        // Kiểm tra xem sản phẩm có tồn tại không
        const productExists = await Product.findById(review.ma_san_pham).exec();
        
        if (productExists) {
          // Nếu ID hợp lệ và sản phẩm tồn tại, không cần chuyển đổi
          console.log(`Review ${review._id} has valid product ID ${review.ma_san_pham}`);
          successCount++;
        } else {
          console.log(`Product not found for review ${review._id} with product ID ${review.ma_san_pham}`);
          errorCount++;
        }
      } catch (err) {
        console.error(`Error processing review ${review._id}:`, err);
        errorCount++;
      }
    }

    console.log('\nMigration completed:');
    console.log(`Successfully verified: ${successCount} reviews`);
    console.log(`Failed to verify: ${errorCount} reviews`);
  } catch (err) {
    console.error('Migration failed:', err);
  }
  process.exit();
})(); 