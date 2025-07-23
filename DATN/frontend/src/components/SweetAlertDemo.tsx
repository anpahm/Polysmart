'use client';

import React from 'react';
import { 
  showSuccessAlert, 
  showErrorAlert, 
  showWarningAlert, 
  showInfoAlert, 
  showConfirmAlert, 
  showLoadingAlert,
  showSuccessModal,
  showCustomAlert
} from '@/utils/sweetAlert';

const SweetAlertDemo = () => {
  const handleSuccess = () => {
    showSuccessAlert('Thành công!', 'Thao tác đã được thực hiện thành công', 3000);
  };

  const handleError = () => {
    showErrorAlert('Lỗi!', 'Đã xảy ra lỗi trong quá trình xử lý');
  };

  const handleWarning = () => {
    showWarningAlert('Cảnh báo!', 'Sản phẩm sắp hết hàng', 4000);
  };

  const handleInfo = () => {
    showInfoAlert('Thông tin', 'Đây là thông tin hữu ích cho bạn');
  };

  const handleConfirm = async () => {
    const result = await showConfirmAlert(
      'Xác nhận xóa?', 
      'Bạn có chắc chắn muốn xóa item này không?',
      'Xóa',
      'Hủy'
    );
    
    if (result.isConfirmed) {
      showSuccessAlert('Đã xóa!', 'Item đã được xóa thành công');
    }
  };

  const handleLoading = () => {
    showLoadingAlert('Đang xử lý...', 'Vui lòng chờ trong giây lát');
    
    // Giả lập loading 3 giây
    setTimeout(() => {
      showSuccessAlert('Hoàn thành!', 'Quá trình xử lý đã hoàn tất');
    }, 3000);
  };

  const handleModal = () => {
    showSuccessModal(
      'Đặt hàng thành công!', 
      'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      () => {
        console.log('Modal đã đóng');
      }
    );
  };

  const handleCustom = () => {
    showCustomAlert(
      'Thông tin chi tiết',
      `
        <div style="text-align: left;">
          <p><strong>Tên sản phẩm:</strong> iPhone 15 Pro Max</p>
          <p><strong>Giá:</strong> 29.990.000đ</p>
          <p><strong>Màu sắc:</strong> Natural Titanium</p>
          <p><strong>Dung lượng:</strong> 256GB</p>
        </div>
      `,
      'Đóng'
    );
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="text-lg font-bold mb-4 text-center">SweetAlert2 Demo</h3>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={handleSuccess}
          className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
        >
          Success
        </button>
        <button 
          onClick={handleError}
          className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        >
          Error
        </button>
        <button 
          onClick={handleWarning}
          className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
        >
          Warning
        </button>
        <button 
          onClick={handleInfo}
          className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Info
        </button>
        <button 
          onClick={handleConfirm}
          className="px-3 py-2 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
        >
          Confirm
        </button>
        <button 
          onClick={handleLoading}
          className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
        >
          Loading
        </button>
        <button 
          onClick={handleModal}
          className="px-3 py-2 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600"
        >
          Modal
        </button>
        <button 
          onClick={handleCustom}
          className="px-3 py-2 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
        >
          Custom
        </button>
      </div>
    </div>
  );
};

export default SweetAlertDemo; 