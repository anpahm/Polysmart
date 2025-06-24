const mongoose = require('mongoose');
const NewsCategory = require('../models/newsCategoryModel');
const News = require('../models/newsModel');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/datn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedNewsCategories = async () => {
  try {
    // Xóa dữ liệu cũ
    await NewsCategory.deleteMany({});
    await News.deleteMany({});

    // Tạo danh mục tin tức mẫu
    const categories = [
      { ten_danh_muc: 'Công nghệ' },
      { ten_danh_muc: 'Điện thoại' },
      { ten_danh_muc: 'Laptop' },
      { ten_danh_muc: 'Máy tính bảng' },
      { ten_danh_muc: 'Phụ kiện' },
      { ten_danh_muc: 'Tin khuyến mãi' }
    ];

    const createdCategories = await NewsCategory.insertMany(categories);
    console.log('Đã tạo danh mục tin tức:', createdCategories.length);

    // Tạo tin tức mẫu
    const sampleNews = [
      {
        tieu_de: 'iPhone 15 Pro Max - Điện thoại cao cấp nhất của Apple',
        slug: 'iphone-15-pro-max-dien-thoai-cao-cap-nhat-cua-apple',
        mo_ta: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP và thiết kế titan cao cấp',
        hinh: '/images/news/iphone15.jpg',
        ngay: new Date('2024-01-15'),
        noi_dung: `iPhone 15 Pro Max là flagship mới nhất của Apple với nhiều cải tiến đáng kể:

🔒 Chip A17 Pro: Hiệu năng mạnh mẽ hơn 20% so với thế hệ trước
📲 Camera 48MP: Chụp ảnh chất lượng cao với nhiều tính năng mới
🌐 Kết nối USB-C: Tốc độ truyền dữ liệu nhanh hơn
🔋 Pin bền bỉ: Thời gian sử dụng lâu hơn với công nghệ sạc mới

Sản phẩm được thiết kế với khung titan cao cấp, màn hình Super Retina XDR 6.7 inch và nhiều tính năng bảo mật tiên tiến.`,
        luot_xem: 1250,
        hot: true,
        an_hien: true,
        id_danh_muc: createdCategories[1]._id
      },
      {
        tieu_de: 'MacBook Pro M3 - Hiệu năng đột phá cho người dùng chuyên nghiệp',
        slug: 'macbook-pro-m3-hieu-nang-dot-pha-cho-nguoi-dung-chuyen-nghiep',
        mo_ta: 'MacBook Pro với chip M3 mới nhất, hiệu năng vượt trội cho công việc sáng tạo',
        hinh: '/images/news/macbook-m3.jpg',
        ngay: new Date('2024-01-10'),
        noi_dung: `MacBook Pro M3 mang đến hiệu năng đột phá cho người dùng chuyên nghiệp:

🤖 Chip M3: Hiệu năng CPU và GPU mạnh mẽ hơn 20%
🍏 macOS Sonoma: Hệ điều hành mới với nhiều tính năng hữu ích
💡 Màn hình Liquid Retina XDR: Độ sáng và màu sắc chính xác
⚙️ RAM thống nhất: Tối ưu hiệu năng cho các tác vụ nặng

Laptop này phù hợp cho các công việc như chỉnh sửa video, thiết kế đồ họa và phát triển phần mềm.`,
        luot_xem: 890,
        hot: false,
        an_hien: true,
        id_danh_muc: createdCategories[2]._id
      },
      {
        tieu_de: 'iPad Pro 2024 - Máy tính bảng mạnh nhất thế giới',
        slug: 'ipad-pro-2024-may-tinh-bang-manh-nhat-the-gioi',
        mo_ta: 'iPad Pro với chip M2, màn hình Mini-LED và Apple Pencil thế hệ mới',
        hinh: '/images/news/ipad-pro.jpg',
        ngay: new Date('2024-01-05'),
        noi_dung: `iPad Pro 2024 là máy tính bảng mạnh nhất thế giới hiện tại:

📊 Chip M2: Hiệu năng tương đương MacBook
🎨 Màn hình Mini-LED: Độ tương phản và màu sắc tuyệt vời
✏️ Apple Pencil: Độ chính xác cao cho vẽ và ghi chú
🔊 Hệ thống âm thanh 4 loa: Trải nghiệm âm nhạc sống động

Sản phẩm hoàn hảo cho các nghệ sĩ, nhà thiết kế và người dùng doanh nghiệp.`,
        luot_xem: 567,
        hot: false,
        an_hien: true,
        id_danh_muc: createdCategories[3]._id
      }
    ];

    const createdNews = await News.insertMany(sampleNews);
    console.log('Đã tạo tin tức mẫu:', createdNews.length);

    console.log('Seed dữ liệu tin tức thành công!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedNewsCategories(); 