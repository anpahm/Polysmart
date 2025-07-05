# 🕐 Hướng dẫn Quản lý Cron Job

## 📊 Trạng thái hiện tại

**Cron job hiện tại:**
- ⏰ **Tần suất**: 2 phút/lần (đã cập nhật từ 5 phút)
- 🔄 **Trạng thái**: Không đang chạy
- 📝 **Mô tả**: Fetch giao dịch từ API ngân hàng và tự động match với đơn hàng

## 🎛️ Các lệnh quản lý Cron Job

### 1. **Kiểm tra trạng thái**
```bash
npm run cron-status
```

### 2. **Khởi động cron job**
```bash
npm run cron-start
```

### 3. **Dừng cron job**
```bash
npm run cron-stop
```

### 4. **Chạy một lần (không lặp)**
```bash
npm run cron-once
```

## ⏰ Thay đổi tần suất

### **Các tùy chọn tần suất có sẵn:**

| Lệnh | Tần suất | Mô tả | Sử dụng |
|------|----------|-------|---------|
| `npm run cron-1min` | 1 phút | Tần suất cao nhất | Giao dịch nhiều, cần xử lý nhanh |
| `npm run cron-2min` | 2 phút | Tần suất cao | **Mặc định hiện tại** |
| `npm run cron-5min` | 5 phút | Tần suất trung bình | Cân bằng giữa hiệu suất và tài nguyên |
| `npm run cron-10min` | 10 phút | Tần suất thấp | Giao dịch ít, tiết kiệm tài nguyên |
| `npm run cron-30min` | 30 phút | Tần suất rất thấp | Chỉ kiểm tra định kỳ |

### **Ví dụ thay đổi tần suất:**
```bash
# Thay đổi sang chạy mỗi 1 phút
npm run cron-1min

# Thay đổi sang chạy mỗi 5 phút
npm run cron-5min

# Thay đổi sang chạy mỗi 10 phút
npm run cron-10min
```

## 🔧 Cấu hình chi tiết

### **File cấu hình:** `scripts/autoPaymentProcessor.js`

```javascript
this.config = {
  // Cấu hình thời gian chạy
  fetchInterval: 2 * 60 * 1000, // 2 phút
  matchInterval: 1 * 60 * 1000, // 1 phút
  retryAttempts: 3,
  retryDelay: 30 * 1000 // 30 giây
};
```

### **Các tham số có thể điều chỉnh:**

| Tham số | Mô tả | Giá trị mặc định |
|---------|-------|------------------|
| `fetchInterval` | Thời gian giữa các lần fetch giao dịch | 2 phút |
| `matchInterval` | Thời gian giữa các lần auto match | 1 phút |
| `retryAttempts` | Số lần thử lại khi gặp lỗi | 3 lần |
| `retryDelay` | Thời gian chờ giữa các lần thử lại | 30 giây |

## 📋 Quy trình hoạt động

### **Mỗi lần cron job chạy:**

1. **Fetch giao dịch** từ API web2m.com
2. **Lưu giao dịch mới** vào MongoDB
3. **Auto match** giao dịch với đơn hàng
4. **Cập nhật trạng thái** đơn hàng
5. **Ghi log** kết quả xử lý

### **Ví dụ log khi chạy:**
```
[2024-01-15T10:30:00.000Z] Processing all bank accounts...
Processing account: Main Account (8824882445)
Fetched 3 transactions from Main Account
Processed 2 new transactions from Main Account
Running auto match...
Auto matched 1 transactions with orders
```

## 🚨 Lưu ý quan trọng

### **1. Tần suất cao (1-2 phút)**
- ✅ **Ưu điểm**: Xử lý giao dịch nhanh, real-time
- ⚠️ **Nhược điểm**: Tốn tài nguyên, có thể bị rate limit từ API

### **2. Tần suất trung bình (5-10 phút)**
- ✅ **Ưu điểm**: Cân bằng hiệu suất và tài nguyên
- ✅ **Phù hợp**: Hầu hết trường hợp sử dụng

### **3. Tần suất thấp (30 phút)**
- ✅ **Ưu điểm**: Tiết kiệm tài nguyên, ít gây tải cho API
- ⚠️ **Nhược điểm**: Xử lý giao dịch chậm

## 🔍 Troubleshooting

### **Cron job không chạy:**
```bash
# Kiểm tra trạng thái
npm run cron-status

# Khởi động lại
npm run cron-stop
npm run cron-start
```

### **Lỗi kết nối API:**
- Kiểm tra token có hợp lệ không
- Kiểm tra kết nối internet
- Kiểm tra log lỗi trong console

### **Giao dịch không được match:**
- Kiểm tra số tiền có khớp với đơn hàng không
- Kiểm tra đơn hàng có trạng thái pending không
- Chạy `npm run cron-once` để test thủ công

## 📊 Monitoring

### **Kiểm tra log real-time:**
```bash
# Theo dõi log khi cron job chạy
tail -f logs/auto-payment.log
```

### **Kiểm tra thống kê:**
```bash
# Gọi API để xem thống kê
curl http://localhost:3000/api/bank-transactions/stats
```

## 🎯 Khuyến nghị

### **Cho môi trường Development:**
- Sử dụng tần suất **2-5 phút** để test nhanh
- Chạy `npm run cron-once` để test thủ công

### **Cho môi trường Production:**
- Sử dụng tần suất **5-10 phút** để cân bằng hiệu suất
- Monitor log và thống kê thường xuyên
- Backup dữ liệu giao dịch định kỳ

---

**📞 Hỗ trợ:** Nếu gặp vấn đề, hãy kiểm tra log và liên hệ support team. 