"use client";
import React from 'react';
import { showSuccessAlert, showSuccessModal } from '@/utils/sweetAlert';
import { ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';

const CartNotificationDemo: React.FC = () => {
  const handleAddToCartDemo = () => {
    // TOAST notification cho thêm vào giỏ hàng (góc trên phải)
    showSuccessAlert(
      'Thành công!', 
      'Đã thêm "iPhone 15 Pro Max" vào giỏ hàng', 
      3000
    );
  };

  const handleOrderSuccessDemo = () => {
    // MODAL notification cho đặt hàng thành công (giữa màn hình)
    showSuccessModal(
      'Đặt hàng thành công!', 
      'Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.',
      () => {
        console.log('Modal đã đóng');
      }
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        🔧 Demo: So Sánh Thông Báo
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add to Cart Demo */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Thêm Vào Giỏ Hàng</h3>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            • Hiển thị <strong>TOAST</strong> ở góc trên phải<br/>
            • Tự động biến mất sau 2-3 giây<br/>
            • Không cần click để đóng<br/>
            • Không che toàn bộ màn hình
          </p>
          <button
            onClick={handleAddToCartDemo}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Test Thêm Vào Giỏ
          </button>
        </div>

        {/* Order Success Demo */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-800">Đặt Hàng Thành Công</h3>
          </div>
          <p className="text-sm text-green-700 mb-4">
            • Hiển thị <strong>MODAL</strong> ở giữa màn hình<br/>
            • Có nút "Đóng" để người dùng click<br/>
            • Che toàn bộ màn hình<br/>
            • Quan trọng hơn, cần sự chú ý
          </p>
          <button
            onClick={handleOrderSuccessDemo}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Test Đặt Hàng Thành Công
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <ArrowRight className="w-5 h-5 text-gray-600" />
          <h4 className="font-semibold text-gray-800">Hướng Dẫn Test:</h4>
        </div>
        <ol className="text-sm text-gray-700 space-y-1 ml-7">
          <li>1. Click "Test Thêm Vào Giỏ" → Thấy toast ở góc trên phải</li>
          <li>2. Click "Test Đặt Hàng Thành Công" → Thấy modal ở giữa màn hình</li>
          <li>3. So sánh sự khác biệt về vị trí và cách hiển thị</li>
        </ol>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>✅ Kết luận:</strong> Nếu bạn thấy modal "Đặt hàng thành công!" khi click "Thêm vào giỏ hàng", 
          có nghĩa là đang click nhầm nút hoặc có lỗi trong code. 
          Thêm vào giỏ hàng chỉ nên hiển thị toast nhỏ ở góc màn hình!
        </p>
      </div>
    </div>
  );
};

export default CartNotificationDemo; 