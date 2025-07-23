import Swal from 'sweetalert2';

// Success Alert (Toast ở góc trên phải)
export const showSuccessAlert = (title: string, text?: string, timer: number = 2000) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    timer: timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    customClass: {
      popup: 'swal-toast-popup'
    }
  });
};

// Add to Cart Success Toast (Dành riêng cho thêm vào giỏ hàng)
export const showAddToCartSuccess = (productName: string, timer: number = 2500) => {
  return Swal.fire({
    title: '🛒 Thành công!',
    text: `Đã thêm "${productName}" vào giỏ hàng`,
    icon: 'success',
    timer: timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    customClass: {
      popup: 'swal-toast-popup'
    }
  });
};

// Error Alert
export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonText: 'Đóng',
    confirmButtonColor: '#ef4444',
    customClass: {
      popup: 'swal2-popup'
    }
  });
};

// Warning Alert
export const showWarningAlert = (title: string, text?: string, timer: number = 3000) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'warning',
    timer: timer,
    timerProgressBar: true,
    showConfirmButton: false,
    toast: true,
    position: 'top-end',
    customClass: {
      popup: 'swal-toast-popup'
    }
  });
};

// Info Alert
export const showInfoAlert = (title: string, text?: string) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'info',
    confirmButtonText: 'Đóng',
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'swal2-popup'
    }
  });
};

// Confirmation Alert
export const showConfirmAlert = (title: string, text?: string, confirmText: string = 'Xác nhận', cancelText: string = 'Hủy') => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'swal2-popup'
    }
  });
};

// Loading Alert
export const showLoadingAlert = (title: string = 'Đang xử lý...', text?: string) => {
  return Swal.fire({
    title: title,
    text: text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    customClass: {
      popup: 'swal2-popup'
    }
  });
};

// Success Modal (không phải toast)
export const showSuccessModal = (title: string, text?: string, callback?: () => void) => {
  return Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    confirmButtonText: 'Đóng',
    confirmButtonColor: '#10b981',
    customClass: {
      popup: 'swal2-popup'
    },
    didClose: callback
  });
};

// Custom HTML Alert
export const showCustomAlert = (title: string, html: string, confirmText: string = 'Đóng') => {
  return Swal.fire({
    title: title,
    html: html,
    confirmButtonText: confirmText,
    confirmButtonColor: '#3b82f6',
    customClass: {
      popup: 'swal2-popup'
    }
  });
}; 