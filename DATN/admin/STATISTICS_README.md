# Hướng dẫn sử dụng Thống kê Admin Dashboard

## Tổng quan

Hệ thống thống kê admin đã được cải thiện để lấy dữ liệu chính xác từ MongoDB và hiển thị các metrics quan trọng cho việc quản lý cửa hàng.

## Các tính năng mới

### 1. Thống kê thời gian thực (Real-time Statistics)

- **Doanh thu hôm nay**: Tổng doanh thu từ các đơn hàng đã thanh toán trong ngày
- **Đơn hàng hôm nay**: Số lượng đơn hàng đã thanh toán trong ngày
- **Sản phẩm bán hôm nay**: Tổng số lượng sản phẩm đã bán trong ngày
- **Tỷ lệ tăng trưởng**: So sánh với ngày hôm qua
- **Đơn hàng chờ xử lý**: Số đơn hàng đang chờ xác nhận
- **Đơn hàng gần đây**: 5 đơn hàng mới nhất với trạng thái

### 2. Thống kê tổng quan (Overall Statistics)

- **Tổng lượt xem**: Số lượt truy cập (simulated data)
- **Tổng sản phẩm**: Số sản phẩm trong database
- **Tổng người dùng**: Số người dùng đã đăng ký (không tính admin)
- **Tổng đơn hàng**: Tổng số đơn hàng trong hệ thống

### 3. Thống kê theo tuần (Weekly Statistics)

- **Đơn hàng hoàn thành**: Số đơn hàng đã thanh toán trong tuần
- **Doanh thu thực tế**: Tổng doanh thu từ đơn hàng đã thanh toán
- **Lợi nhuận ước tính**: 30% doanh thu (ước tính)
- **Sản phẩm đã bán**: Tổng số lượng sản phẩm đã bán

## API Endpoints

### 1. Thống kê chính
```
GET /api/admin/statistics?period=week
```

**Response:**
```json
{
  "sales": [0, 0, 0, 0, 0, 0, 0],
  "revenue": [0, 0, 0, 0, 0, 0, 0],
  "profit": [0, 0, 0, 0, 0, 0, 0],
  "labels": ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
  "summary": {
    "totalOrders": 0,
    "totalRevenue": 0,
    "totalProfit": 0,
    "totalProducts": 0,
    "period": "Tuần này",
    "growthRates": {
      "orders": "0",
      "revenue": "0",
      "products": "0"
    }
  },
  "overall": {
    "totalUsers": 0,
    "totalAllOrders": 0,
    "totalProductsInDb": 0,
    "viewCount": "3,456",
    "growthRates": {
      "users": "0",
      "orders": "0",
      "products": "0",
      "views": "0.43"
    }
  }
}
```

### 2. Thống kê thời gian thực
```
GET /api/admin/statistics/realtime
```

**Response:**
```json
{
  "today": {
    "revenue": 0,
    "orderCount": 0,
    "productCount": 0
  },
  "yesterday": {
    "revenue": 0,
    "orderCount": 0,
    "productCount": 0
  },
  "growthRates": {
    "revenue": "0",
    "orders": "0",
    "products": "0"
  },
  "pendingOrders": 0,
  "recentOrders": []
}
```

### 3. Thống kê doanh thu chi tiết
```
GET /api/admin/statistics/revenue-details?period=month
```

## Cách sử dụng

### 1. Khởi động Backend
```bash
cd DATN/backend
npm install
npm start
```

### 2. Khởi động Admin Frontend
```bash
cd DATN/admin
npm install
npm run dev
```

### 3. Truy cập Dashboard
- Đăng nhập vào admin panel
- Vào trang Dashboard để xem thống kê

## Lưu ý quan trọng

### 1. Dữ liệu thống kê
- Tất cả dữ liệu được lấy trực tiếp từ MongoDB
- Chỉ tính các đơn hàng có `paymentStatus: 'paid'`
- Lợi nhuận được ước tính 30% doanh thu (cần tính thêm chi phí thực tế)

### 2. Tỷ lệ tăng trưởng
- So sánh với tuần trước cho thống kê tuần
- So sánh với tháng trước cho thống kê tổng quan
- Hiển thị dấu + cho tăng trưởng dương, - cho âm

### 3. Cập nhật thời gian thực
- Thống kê thời gian thực được cập nhật mỗi 30 giây
- Có thể tắt auto-refresh bằng cách comment dòng interval

## Troubleshooting

### 1. Lỗi kết nối API
- Kiểm tra backend có đang chạy không
- Kiểm tra URL API trong config
- Kiểm tra token authentication

### 2. Dữ liệu hiển thị 0
- Kiểm tra có đơn hàng nào trong database không
- Kiểm tra trạng thái đơn hàng có đúng không
- Kiểm tra quyền truy cập admin

### 3. Lỗi hiển thị
- Kiểm tra console browser
- Kiểm tra network tab
- Restart frontend nếu cần

## Cải tiến tương lai

1. **Analytics Integration**: Tích hợp Google Analytics để lấy số lượt xem thực tế
2. **Cost Management**: Thêm quản lý chi phí để tính lợi nhuận chính xác
3. **Export Data**: Thêm tính năng xuất báo cáo PDF/Excel
4. **Custom Date Range**: Cho phép chọn khoảng thời gian tùy ý
5. **Real-time Notifications**: Thông báo đơn hàng mới real-time 