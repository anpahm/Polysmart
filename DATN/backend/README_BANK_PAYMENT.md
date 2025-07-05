# Hệ thống Thanh toán Tự động Ngân hàng

Hệ thống này cho phép tự động theo dõi và xử lý các giao dịch ngân hàng từ API web2m.com, tự động match với đơn hàng và cập nhật trạng thái thanh toán.

## Tính năng chính

1. **Tự động fetch giao dịch** từ API ngân hàng
2. **Tự động match** giao dịch với đơn hàng
3. **Quản lý giao dịch** với đầy đủ CRUD operations
4. **Thống kê giao dịch** theo thời gian
5. **Auto payment processor** chạy định kỳ

## Cài đặt và Cấu hình

### 1. Biến môi trường

Thêm các biến sau vào file `.env`:

```env
# Cấu hình ngân hàng
BANK_ACCOUNT_NUMBER=1770260769
BANK_TOKEN=your_token_here

# Cấu hình MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/DB_ShopTao
```

### 2. Cấu hình API ngân hàng

API endpoint: `https://api.web2m.com/historyapibidvv3/{bankCode}/{accountNumber}/{token}`

Ví dụ: `https://api.web2m.com/historyapibidvv3/mkbank/1770260769/your_token`

## API Endpoints

### Giao dịch Ngân hàng

#### 1. Lấy tất cả giao dịch
```
GET /api/bank-transactions
```

Query parameters:
- `page`: Số trang (default: 1)
- `limit`: Số lượng item mỗi trang (default: 20)
- `accountNumber`: Lọc theo số tài khoản
- `status`: Lọc theo trạng thái (pending, completed, failed)
- `startDate`: Ngày bắt đầu (YYYY-MM-DD)
- `endDate`: Ngày kết thúc (YYYY-MM-DD)
- `sortBy`: Sắp xếp theo field (default: transactionDate)
- `sortOrder`: Thứ tự sắp xếp (asc/desc, default: desc)

#### 2. Lấy giao dịch theo ID
```
GET /api/bank-transactions/:id
```

#### 3. Fetch giao dịch từ API ngân hàng
```
POST /api/bank-transactions/fetch
```

Body:
```json
{
  "bankCode": "mkbank",
  "accountNumber": "1770260769",
  "token": "your_token_here"
}
```

#### 4. Tự động match giao dịch
```
POST /api/bank-transactions/auto-match
```

#### 5. Match thủ công giao dịch
```
POST /api/bank-transactions/manual-match
```

Body:
```json
{
  "transactionId": "transaction_id_here",
  "orderId": "order_id_here"
}
```

#### 6. Lấy thống kê giao dịch
```
GET /api/bank-transactions/stats?accountNumber=1770260769&startDate=2024-01-01&endDate=2024-12-31
```

#### 7. Cập nhật trạng thái giao dịch
```
PUT /api/bank-transactions/:id/status
```

Body:
```json
{
  "status": "completed",
  "note": "Ghi chú tùy chọn"
}
```

#### 8. Xóa giao dịch
```
DELETE /api/bank-transactions/:id
```

### Auto Payment Processor

#### 1. Bắt đầu processor
```
POST /api/auto-payment/start
```

#### 2. Dừng processor
```
POST /api/auto-payment/stop
```

#### 3. Lấy trạng thái processor
```
GET /api/auto-payment/status
```

#### 4. Cập nhật cấu hình
```
PUT /api/auto-payment/config
```

Body:
```json
{
  "config": {
    "fetchInterval": 300000,
    "retryAttempts": 3,
    "bankAccounts": [
      {
        "bankCode": "mkbank",
        "accountNumber": "1770260769",
        "token": "your_token_here",
        "name": "Main Account"
      }
    ]
  }
}
```

#### 5. Chạy xử lý một lần
```
POST /api/auto-payment/run-once
```

#### 6. Lấy logs
```
GET /api/auto-payment/logs
```

## Cấu trúc Database

### Model: BankTransaction

```javascript
{
  transactionID: String,        // ID giao dịch từ ngân hàng
  amount: Number,               // Số tiền
  description: String,          // Mô tả giao dịch
  transactionDate: Date,        // Ngày giao dịch
  type: String,                 // Loại giao dịch (IN/OUT)
  accountNumber: String,        // Số tài khoản
  bankCode: String,             // Mã ngân hàng
  status: String,               // Trạng thái (pending/completed/failed)
  orderId: ObjectId,            // ID đơn hàng (nếu match)
  userId: ObjectId,             // ID user (nếu match)
  matchedOrder: Boolean,        // Đã match với đơn hàng chưa
  createdAt: Date,
  updatedAt: Date
}
```

## Cách sử dụng

### 1. Khởi động hệ thống

```bash
# Khởi động server
npm start

# Hoặc chạy auto payment processor riêng
node scripts/autoPaymentProcessor.js
```

### 2. Cấu hình tài khoản ngân hàng

1. Lấy token từ web2m.com
2. Cập nhật biến môi trường
3. Test API bằng endpoint `/api/bank-transactions/fetch`

### 3. Bắt đầu auto payment processor

```bash
curl -X POST http://localhost:3000/api/auto-payment/start
```

### 4. Kiểm tra trạng thái

```bash
curl http://localhost:3000/api/auto-payment/status
```

## Xử lý lỗi

### Lỗi thường gặp

1. **API ngân hàng không phản hồi**
   - Kiểm tra token có hợp lệ không
   - Kiểm tra kết nối internet
   - Thử lại sau vài phút

2. **Giao dịch không match được**
   - Kiểm tra số tiền có khớp với đơn hàng không
   - Kiểm tra đơn hàng có trạng thái pending không
   - Match thủ công nếu cần

3. **Processor không chạy**
   - Kiểm tra logs
   - Restart processor
   - Kiểm tra cấu hình

### Logs

Hệ thống sẽ log các hoạt động sau:
- Fetch giao dịch từ API
- Xử lý giao dịch mới
- Match giao dịch với đơn hàng
- Lỗi xảy ra

## Bảo mật

1. **Token API**: Không chia sẻ token với người khác
2. **Environment variables**: Sử dụng biến môi trường cho thông tin nhạy cảm
3. **Rate limiting**: API có thể bị giới hạn số request
4. **Validation**: Validate dữ liệu đầu vào

## Mở rộng

Hệ thống có thể mở rộng để:
1. Hỗ trợ nhiều ngân hàng khác
2. Thêm notification khi có giao dịch mới
3. Tích hợp với hệ thống kế toán
4. Thêm báo cáo chi tiết
5. Webhook cho real-time updates

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs
2. Test API riêng lẻ
3. Kiểm tra cấu hình
4. Liên hệ support 