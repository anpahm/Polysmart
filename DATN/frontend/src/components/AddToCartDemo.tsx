"use client";
import React from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '@/store/cartSlice';
import { showSuccessAlert, showInfoAlert, showWarningAlert } from '@/utils/sweetAlert';
import { ShoppingBag, Package, Heart, Zap } from 'lucide-react';

const AddToCartDemo: React.FC = () => {
  const dispatch = useDispatch();

  const demoProducts = [
    {
      id: 'demo-1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 29990000,
      image: '/images/ip15promax.png',
      variant: 'demo-variant-1'
    },
    {
      id: 'demo-2', 
      name: 'MacBook Air M2 13 inch',
      price: 27990000,
      image: '/images/macbookair.png',
      variant: 'demo-variant-2'
    },
    {
      id: 'demo-3',
      name: 'iPad Pro 11 inch',
      price: 20990000,
      image: '/images/ipadpro.png',
      variant: 'demo-variant-3'
    }
  ];

  const handleDemoAddToCart = (product: any) => {
    // Thêm sản phẩm demo vào giỏ hàng
    dispatch(addToCart({
      productId: product.id,
      variantId: product.variant,
      name: product.name,
      price: product.price,
      originPrice: product.price,
      image: product.image,
      colors: ['#000000', '#ffffff'],
      selectedColor: 0,
      colorName: 'Đen',
      quantity: 1,
    }));

    // Hiển thị thông báo modal đẹp
    showSuccessAlert(
      'Thành công!', 
      `Đã thêm "${product.name}" vào giỏ hàng`,
      3000
    );
  };

  const handleShowDemoNotifications = () => {
    setTimeout(() => showSuccessAlert('Thành công!', 'Đây là thông báo thành công', 2000), 0);
    setTimeout(() => showInfoAlert('Thông tin', 'Đây là thông báo thông tin'), 1000);
    setTimeout(() => showWarningAlert('Cảnh báo', 'Đây là thông báo cảnh báo', 2000), 2000);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
        <Package className="w-6 h-6 text-blue-600" />
        Demo Thông Báo Thêm Vào Giỏ Hàng
      </h2>
      
      {/* Demo Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {demoProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg p-4 shadow-md">
            <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-semibold text-sm mb-2 text-gray-800">{product.name}</h3>
            <p className="text-blue-600 font-bold mb-3">{product.price.toLocaleString()}₫</p>
            <button
              onClick={() => handleDemoAddToCart(product)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Thêm vào giỏ
            </button>
          </div>
        ))}
      </div>

      {/* Demo Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleShowDemoNotifications}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <Zap className="w-5 h-5" />
          Test Tất Cả Thông Báo
        </button>
        
        <button
          onClick={() => showSuccessAlert('🎉 Tuyệt vời!', 'Hệ thống thông báo đang hoạt động hoàn hảo!', 3000)}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Heart className="w-5 h-5" />
          Thông Báo Đặc Biệt
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">✨ Tính năng mới:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Thông báo modal đẹp với SweetAlert2</li>
          <li>• Hiệu ứng animation mượt mà</li>
          <li>• Thêm vào giỏ hàng và hiển thị thông báo ngay lập tức</li>
          <li>• Tự động đóng sau 2-3 giây</li>
          <li>• Responsive trên mọi thiết bị</li>
        </ul>
      </div>
    </div>
  );
};

export default AddToCartDemo; 