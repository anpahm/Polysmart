# Tính năng Bắt buộc Đăng nhập cho Thanh toán

## Tổng quan
Tính năng này yêu cầu người dùng phải đăng nhập trước khi có thể thực hiện thanh toán. Điều này giúp bảo mật thông tin đơn hàng và theo dõi lịch sử mua hàng của khách hàng.

## Các thành phần đã được thêm/sửa đổi

### 1. ProtectedPaymentRoute Component
**File:** `src/components/ProtectedPaymentRoute.tsx`

- Kiểm tra trạng thái đăng nhập của người dùng
- Hiển thị loading khi đang kiểm tra
- Hiển thị modal yêu cầu đăng nhập nếu chưa đăng nhập
- Tự động điền thông tin người dùng đã đăng nhập

### 2. LoginRequiredModal Component
**File:** `src/components/LoginRequiredModal.tsx`

- Modal thông báo yêu cầu đăng nhập
- Nút chuyển hướng đến trang đăng nhập
- Link đăng ký tài khoản mới
- Thông báo tùy chỉnh

### 3. Trang Thanh toán (Payments)
**File:** `src/app/payments/page.tsx`

- Được bọc bởi `ProtectedPaymentRoute`
- Tự động điền thông tin người dùng đã đăng nhập
- Yêu cầu đăng nhập trước khi cho phép thanh toán

### 4. Trang Thanh toán Banking
**File:** `src/app/payment/banking/page.tsx`

- Được bọc bởi `ProtectedPaymentRoute`
- Yêu cầu đăng nhập trước khi truy cập

### 5. Trang Giỏ hàng
**File:** `src/app/cart/page.tsx`

- Kiểm tra đăng nhập khi nhấn nút "Thanh toán"
- Hiển thị modal yêu cầu đăng nhập nếu chưa đăng nhập

### 6. Trang Đăng nhập
**File:** `src/app/login/page.tsx`

- Xử lý redirect sau khi đăng nhập thành công
- Hiển thị thông báo yêu cầu đăng nhập
- Chuyển hướng đến trang thanh toán nếu có redirect parameter

## Cách hoạt động

### Luồng thanh toán:
1. Người dùng thêm sản phẩm vào giỏ hàng
2. Nhấn nút "Thanh toán" từ giỏ hàng
3. Hệ thống kiểm tra trạng thái đăng nhập:
   - Nếu đã đăng nhập: Chuyển đến trang thanh toán
   - Nếu chưa đăng nhập: Hiển thị modal yêu cầu đăng nhập
4. Sau khi đăng nhập thành công: Tự động chuyển đến trang thanh toán
5. Thông tin người dùng được tự động điền vào form thanh toán

### Bảo mật:
- Kiểm tra token trong localStorage
- Xác thực session với server
- Tự động xóa token không hợp lệ
- Bảo vệ tất cả các trang thanh toán

## Tính năng bổ sung

### Tự động điền thông tin:
- Email từ tài khoản đã đăng nhập
- Họ tên từ tài khoản đã đăng nhập
- Số điện thoại từ tài khoản đã đăng nhập
- Địa chỉ từ tài khoản đã đăng nhập

### Trải nghiệm người dùng:
- Loading spinner khi kiểm tra đăng nhập
- Modal thông báo rõ ràng
- Chuyển hướng mượt mà sau đăng nhập
- Thông báo lỗi thân thiện

## Cấu hình

### Redux Store:
- Sử dụng `userSlice` để quản lý trạng thái đăng nhập
- `isLoggedIn` flag để kiểm tra nhanh trạng thái
- `user` object chứa thông tin người dùng

### API Endpoints:
- `API_ENDPOINTS.GET_USER`: Kiểm tra session
- `API_ENDPOINTS.LOGIN`: Đăng nhập

## Sử dụng

### Để bảo vệ một trang thanh toán mới:
```tsx
import ProtectedPaymentRoute from '@/components/ProtectedPaymentRoute';

export default function NewPaymentPage() {
  return (
    <ProtectedPaymentRoute>
      {/* Nội dung trang thanh toán */}
    </ProtectedPaymentRoute>
  );
}
```

### Để hiển thị modal yêu cầu đăng nhập:
```tsx
import LoginRequiredModal from '@/components/LoginRequiredModal';

const [showLoginModal, setShowLoginModal] = useState(false);

// Trong component
<LoginRequiredModal
  isOpen={showLoginModal}
  onClose={() => setShowLoginModal(false)}
  message="Vui lòng đăng nhập để tiếp tục"
/>
```

## Lưu ý

1. **Backend**: Đảm bảo API endpoints có xác thực token phù hợp
2. **Token Management**: Token được lưu trong localStorage và tự động xóa khi hết hạn
3. **Error Handling**: Xử lý lỗi khi token không hợp lệ hoặc network issues
4. **User Experience**: Modal không block hoàn toàn, người dùng có thể hủy và tiếp tục mua sắm

## Testing

### Test cases cần kiểm tra:
1. Truy cập trang thanh toán khi chưa đăng nhập
2. Đăng nhập và chuyển hướng đến trang thanh toán
3. Tự động điền thông tin người dùng
4. Token hết hạn và xử lý
5. Network errors và fallback
6. Modal đóng/mở hoạt động đúng 