# Polysmart - Flash Sale Auto Hide Feature

## Tính năng Flash Sale tự động ẩn khi hết thời gian

### Các thay đổi đã thực hiện:

#### Backend Changes:

1. **Thêm endpoint mới trong `flashSaleController.js`:**
   - `getActiveFlashSales()`: Chỉ trả về các Flash Sale đang hoạt động
   - Kiểm tra điều kiện: `an_hien: true`, `thoi_gian_bat_dau <= now`, `thoi_gian_ket_thuc >= now`

2. **Cập nhật routes trong `flashsales.js`:**
   - Thêm route: `GET /flashsales/active` để lấy Flash Sale đang hoạt động

#### Frontend Changes:

1. **Cập nhật `Homepage.tsx`:**
   - Thêm state `showFlashSale` để kiểm soát việc hiển thị Flash Sale section
   - Sử dụng endpoint `/flashsales/active` thay vì `/flashsales`
   - Thêm logic countdown timer tự động ẩn Flash Sale khi hết thời gian
   - Thêm auto-refresh mỗi phút để kiểm tra Flash Sale mới/hết hạn
   - Điều kiện hiển thị: `showFlashSale && data.flashSaleProducts.length > 0`

### Cách hoạt động:

1. **Khi trang được load:**
   - Frontend gọi API `/flashsales/active` để lấy Flash Sale đang hoạt động
   - Backend filter theo thời gian hiện tại và trạng thái `an_hien`
   - Nếu có Flash Sale đang hoạt động, hiển thị section Flash Sale

2. **Countdown timer:**
   - Tính thời gian còn lại của Flash Sale
   - Khi hết thời gian, tự động ẩn Flash Sale section
   - Cập nhật mỗi giây

3. **Auto-refresh:**
   - Mỗi phút tự động gọi lại API để kiểm tra Flash Sale mới
   - Đảm bảo tính năng hoạt động chính xác khi có Flash Sale mới hoặc hết hạn

### API Endpoints:

- `GET /flashsales` - Lấy tất cả Flash Sale (cho admin)
- `GET /flashsales/active` - Lấy chỉ Flash Sale đang hoạt động (cho frontend)
- `GET /flashsales/:id` - Lấy Flash Sale theo ID
- `POST /flashsales` - Tạo Flash Sale mới
- `PUT /flashsales/:id` - Cập nhật Flash Sale
- `DELETE /flashsales/:id` - Xóa Flash Sale

### Lợi ích:

1. **Tự động hóa:** Không cần can thiệp thủ công để ẩn Flash Sale
2. **Hiệu suất:** Chỉ load Flash Sale đang hoạt động
3. **Trải nghiệm người dùng:** Flash Sale biến mất tự nhiên khi hết thời gian
4. **Độ tin cậy:** Auto-refresh đảm bảo dữ liệu luôn cập nhật

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
