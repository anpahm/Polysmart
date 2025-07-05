# 🚀 Hướng dẫn Setup Dự án ShopTao

## 📋 Yêu cầu hệ thống

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB >= 4.4
- Git

## 🛠️ Cài đặt và Setup

### 1. Clone dự án
```bash
git clone <your-repository-url>
cd DuAnTotNghiep/DATN
```

### 2. Setup Environment Files
```bash
# Tự động tạo các file .env từ template
npm run setup-env
```

### 3. Cài đặt dependencies
```bash
# Cài đặt tất cả dependencies cho backend, frontend, admin
npm run install-all
```

### 4. Cấu hình Environment Variables

#### Backend (.env)
```bash
# Copy file example
cp backend/env.example backend/.env

# Chỉnh sửa các giá trị quan trọng:
# - BANK_TOKEN: Token từ web2m.com
# - EMAIL_USER: Gmail của bạn
# - EMAIL_PASSWORD: App password từ Gmail
# - JWT_SECRET: Chuỗi bí mật ngẫu nhiên
```

#### Frontend (.env.local)
```bash
# Copy file example
cp frontend/env.example frontend/.env.local

# Chỉnh sửa nếu cần:
# - NEXT_PUBLIC_API_URL: URL backend API
# - NEXT_PUBLIC_IMAGE_URL: URL hình ảnh
```

#### Admin Panel (.env.local)
```bash
# Copy file example
cp admin/env.example admin/.env.local

# Chỉnh sửa nếu cần:
# - NEXT_PUBLIC_API_URL: URL backend API
```

### 5. Khởi động MongoDB
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
```

### 6. Chạy dự án

#### Chạy tất cả cùng lúc (Development)
```bash
npm run dev
```

#### Chạy từng phần riêng biệt
```bash
# Backend (Port 3000)
npm run dev:backend

# Frontend (Port 3001)
npm run dev:frontend

# Admin Panel (Port 3002)
npm run dev:admin
```

#### Chạy Auto Payment Processor
```bash
# Chạy riêng auto payment processor
npm run auto-payment
```

## 🔧 Cấu hình Chi tiết

### 1. Bank API Configuration

#### Lấy Token từ web2m.com
1. Đăng ký tài khoản tại https://web2m.com
2. Tạo API key cho ngân hàng của bạn
3. Copy token vào `BANK_TOKEN` trong backend/.env

#### Cấu hình tài khoản ngân hàng
```env
BANK_ACCOUNT_NUMBER=1770260769
BANK_TOKEN=your_web2m_token_here
BANK_ACCOUNT_NAME=NGUYEN VAN A
BANK_BRANCH=Chi nhanh Ha Noi
```

### 2. Email Configuration

#### Setup Gmail App Password
1. Bật 2FA cho Gmail
2. Tạo App Password: https://myaccount.google.com/apppasswords
3. Copy password vào `EMAIL_PASSWORD`

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
```

### 3. Security Configuration

#### JWT Secret
Tạo một chuỗi bí mật ngẫu nhiên:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```env
JWT_SECRET=your_generated_secret_here
```

## 🚀 Deployment

### 1. Build Production
```bash
# Build frontend và admin
npm run build

# Start production server
npm run start:backend
```

### 2. Environment Variables cho Production
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-mongodb-url
JWT_SECRET=your-production-secret
```

## 📊 Monitoring và Logs

### 1. Auto Payment Processor Logs
```bash
# Xem logs real-time
tail -f backend/logs/auto-payment.log

# Kiểm tra trạng thái
curl http://localhost:3000/api/auto-payment/status
```

### 2. API Health Check
```bash
# Kiểm tra backend
curl http://localhost:3000/api/health

# Kiểm tra bank transactions
curl http://localhost:3000/api/bank-transactions
```

## 🔍 Troubleshooting

### 1. Lỗi MongoDB Connection
```bash
# Kiểm tra MongoDB service
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### 2. Lỗi Bank API
```bash
# Test API riêng lẻ
curl -X POST http://localhost:3000/api/bank-transactions/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "bankCode": "mkbank",
    "accountNumber": "1770260769",
    "token": "your_token"
  }'
```

### 3. Lỗi Port đã được sử dụng
```bash
# Tìm process đang sử dụng port
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Kill process
kill -9 <PID>
```

## 📁 Cấu trúc Dự án

```
DATN/
├── backend/                 # Express.js API Server
│   ├── controllers/         # API Controllers
│   ├── models/             # MongoDB Models
│   ├── routes/             # API Routes
│   ├── services/           # Business Logic
│   ├── scripts/            # Utility Scripts
│   └── .env               # Backend Environment
├── frontend/               # Next.js Frontend
│   ├── src/
│   ├── public/
│   └── .env.local         # Frontend Environment
├── admin/                  # Next.js Admin Panel
│   ├── src/
│   ├── public/
│   └── .env.local         # Admin Environment
├── setup-env.js           # Environment Setup Script
├── package-root.json      # Root Package.json
└── SETUP.md              # This file
```

## 🆘 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs trong console
2. Đảm bảo MongoDB đang chạy
3. Kiểm tra environment variables
4. Restart các services
5. Liên hệ support team

## 📝 Changelog

### v1.0.0
- ✅ Hệ thống thanh toán tự động
- ✅ Bank API integration
- ✅ Auto payment processor
- ✅ Admin panel
- ✅ Frontend e-commerce
- ✅ Email notifications 