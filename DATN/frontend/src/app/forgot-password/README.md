# Mobile Responsive Configuration for Forgot Password Page

## Tổng quan
Trang "Quên mật khẩu" đã được tối ưu hóa cho mobile responsive mà không ảnh hưởng đến CSS hiện tại của desktop.

## Cấu trúc file

### 1. `page.tsx`
- Component chính với các class CSS tùy chỉnh
- Import các file CSS responsive

### 2. `mobile-responsive.css`
- CSS cơ bản cho mobile (màn hình < 768px)
- Điều chỉnh layout, font size, padding cho mobile
- Hỗ trợ dark mode và touch devices

### 3. `mobile-enhancements.css`
- CSS nâng cao cho mobile
- Tối ưu cho màn hình nhỏ (320px)
- Hỗ trợ tablet (768px - 1024px)
- Cải thiện accessibility và performance

## Breakpoints được hỗ trợ

| Breakpoint | Mô tả | CSS File |
|------------|-------|----------|
| 320px | Màn hình rất nhỏ | mobile-enhancements.css |
| 480px | Điện thoại nhỏ | mobile-responsive.css |
| 767px | Mobile (max) | mobile-responsive.css |
| 768px-1024px | Tablet | mobile-enhancements.css |
| >1024px | Desktop | Không thay đổi |

## Tính năng responsive

### Mobile (< 768px)
- ✅ Layout tối ưu cho màn hình nhỏ
- ✅ Font size điều chỉnh tự động
- ✅ Touch targets tối thiểu 44px
- ✅ Padding và margin tối ưu
- ✅ Hỗ trợ landscape mode
- ✅ Dark mode support

### Tablet (768px - 1024px)
- ✅ Layout trung gian
- ✅ Font size cân bằng
- ✅ Touch friendly

### Desktop (> 1024px)
- ✅ Giữ nguyên CSS hiện tại
- ✅ Không thay đổi gì

## Accessibility

- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Screen reader friendly
- ✅ Focus states cải thiện
- ✅ Safe area support (notch devices)

## Performance

- ✅ CSS được tối ưu cho mobile
- ✅ Will-change properties
- ✅ Backface-visibility hidden
- ✅ Minimal repaints

## Cách sử dụng

1. **Không cần thay đổi gì** - CSS responsive sẽ tự động áp dụng
2. **Desktop**: Giữ nguyên trải nghiệm hiện tại
3. **Mobile**: Tự động tối ưu hóa

## Customization

Để tùy chỉnh responsive:

1. Chỉnh sửa `mobile-responsive.css` cho breakpoints cơ bản
2. Chỉnh sửa `mobile-enhancements.css` cho tính năng nâng cao
3. Thêm class CSS mới vào component nếu cần

## Testing

### Desktop Testing
- Mở DevTools (F12)
- Chọn device simulation
- Test các breakpoints khác nhau

### Mobile Testing
- Test trên thiết bị thật
- Kiểm tra orientation changes
- Test touch interactions

## Lưu ý

- CSS responsive chỉ áp dụng cho mobile, không ảnh hưởng desktop
- Sử dụng media queries để đảm bảo tách biệt
- Tất cả class CSS có prefix `forgot-password-` để tránh conflict 