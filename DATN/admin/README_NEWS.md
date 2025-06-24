# Quản lý Tin tức - Admin Panel

## Tính năng

### 1. Quản lý Tin tức
- **Xem danh sách tin tức**: Hiển thị tất cả tin tức với thông tin chi tiết
- **Thêm tin tức mới**: Tạo bài viết mới với đầy đủ thông tin
- **Sửa tin tức**: Chỉnh sửa nội dung, hình ảnh và thông tin tin tức
- **Xóa tin tức**: Xóa tin tức không cần thiết
- **Ẩn/Hiện tin tức**: Điều khiển việc hiển thị tin tức trên frontend
- **Đánh dấu tin hot**: Đánh dấu tin tức quan trọng

### 2. Quản lý Danh mục Tin tức
- **Xem danh sách danh mục**: Hiển thị tất cả danh mục tin tức
- **Thêm danh mục mới**: Tạo danh mục mới
- **Sửa danh mục**: Chỉnh sửa tên danh mục
- **Xóa danh mục**: Xóa danh mục không sử dụng

### 3. Tính năng tìm kiếm và lọc
- **Tìm kiếm**: Tìm kiếm tin tức theo tiêu đề, mô tả, nội dung
- **Lọc theo danh mục**: Lọc tin tức theo danh mục cụ thể
- **Phân trang**: Hiển thị tin tức theo trang với số lượng tùy chọn

## Cấu trúc dữ liệu

### Tin tức (News)
```typescript
interface News {
  _id: string;
  tieu_de: string;        // Tiêu đề tin tức
  slug: string;           // URL slug tự động tạo từ tiêu đề
  mo_ta: string;          // Mô tả ngắn
  hinh: string;           // Đường dẫn hình ảnh
  ngay: string;           // Ngày đăng
  noi_dung: string;       // Nội dung chi tiết
  luot_xem: number;       // Số lượt xem
  hot: boolean;           // Tin hot
  an_hien: boolean;       // Trạng thái hiển thị
  nguoi_dang?: { _id: string; TenKH: string };  // Người đăng
  id_danh_muc?: { _id: string; ten_danh_muc: string };  // Danh mục
}
```

### Danh mục Tin tức (NewsCategory)
```typescript
interface NewsCategory {
  _id: string;
  ten_danh_muc: string;   // Tên danh mục
}
```

## API Endpoints

### Tin tức
- `GET /api/news` - Lấy tất cả tin tức
- `GET /api/news/:id` - Lấy tin tức theo ID
- `POST /api/news` - Tạo tin tức mới
- `PUT /api/news/:id` - Cập nhật tin tức
- `DELETE /api/news/:id` - Xóa tin tức
- `POST /api/news/upload` - Upload hình ảnh tin tức

### Danh mục Tin tức
- `GET /api/newscategory` - Lấy tất cả danh mục
- `POST /api/newscategory` - Tạo danh mục mới
- `PUT /api/newscategory/:id` - Cập nhật danh mục
- `DELETE /api/newscategory/:id` - Xóa danh mục

## Cách sử dụng

### 1. Khởi tạo dữ liệu mẫu
```bash
cd DATN/backend
npm run seed-news
```

### 2. Truy cập trang quản lý
- Đăng nhập vào admin panel
- Vào menu "Tin tức" để quản lý tin tức

### 3. Thêm tin tức mới
1. Click nút "Thêm tin tức"
2. Điền đầy đủ thông tin:
   - Tiêu đề tin tức
   - Chọn danh mục
   - Ngày đăng
   - Mô tả ngắn
   - Upload hình ảnh
   - Nội dung chi tiết
   - Cài đặt trạng thái (hiện/ẩn, hot)
3. Click "Lưu"

### 4. Quản lý danh mục
1. Click nút "Quản lý danh mục"
2. Thêm/sửa/xóa danh mục theo nhu cầu

## Lưu ý

- Hình ảnh tin tức được lưu trong thư mục `public/images/news/`
- Slug được tự động tạo từ tiêu đề tin tức
- Tin tức được sắp xếp theo ngày đăng mới nhất
- Có thể xem nội dung chi tiết tin tức bằng cách click vào icon thông tin
- Hệ thống hỗ trợ tìm kiếm fuzzy search 