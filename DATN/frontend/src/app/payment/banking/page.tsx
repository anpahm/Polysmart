"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { orderService } from '@/services/orderService';
import type { OrderResponse } from '@/services/orderService';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function BankingPaymentPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [orderData, setOrderData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Get order data from localStorage
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      const parsedOrder = JSON.parse(savedOrder);
      createOrder(parsedOrder);
    } else {
      router.push('/cart');
    }
  }, [router]);

  useEffect(() => {
    if (!orderData) return;
    // Polling kiểm tra trạng thái đơn hàng mỗi 5 giây
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderData.id}`);
        const data = await res.json();
        console.log("Order status polling:", data); // Thêm log để debug
        if (data.paymentStatus === 'paid' || data.orderStatus === 'confirmed') {
          clearInterval(interval);
          router.push('/payment-result?status=success');
        }
      } catch (err) {
        // Có thể log lỗi hoặc bỏ qua
      }
    }, 5000); // 5 giây

    return () => clearInterval(interval);
  }, [orderData, router]);

  const createOrder = async (orderData: any) => {
    try {
      const order = await orderService.createOrder({
        customerInfo: {
          ...orderData.customerInfo,
          userId: user?._id
        },
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentMethod: 'atm'
      });
      setOrderData(order);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Đã có lỗi xảy ra khi tạo đơn hàng');
      router.push('/cart');
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!orderData) return;

    setIsVerifying(true);
    try {
      // Kiểm tra trạng thái đơn hàng trước
      const res = await fetch(`/api/orders/${orderData.id}`);
      const data = await res.json();
      console.log("Order status on verify:", data); // Thêm log để debug khi bấm nút
      if (data.paymentStatus === 'paid' || data.orderStatus === 'confirmed') {
        router.push('/payment-result?status=success');
      } else {
        alert('Xin chờ đến khi thanh toán thành công! Đơn hàng của bạn vẫn đang được xử lý.');
        setIsVerifying(false);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Đã có lỗi xảy ra khi xác nhận thanh toán');
      setIsVerifying(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-800">Đang tạo đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Thanh toán qua Internet Banking</h1>
          <p className="text-gray-600">
            Vui lòng chuyển khoản theo thông tin bên dưới
          </p>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-700 font-semibold">Số tiền thanh toán:</p>
          <p className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(orderData.totalAmount)}
          </p>
        </div>

        {/* QR Code Section */}
        <div className="mb-6 flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <img 
              src={`https://img.vietqr.io/image/ACB-17418271-compact.png?amount=${orderData.totalAmount}&addInfo=${orderData.transferContent}&accountName=${encodeURIComponent(orderData.bankInfo.accountName)}`}
              alt="VietQR Payment Code"
              className="w-48 h-48 object-contain"
            />
            <p className="text-sm text-gray-500 text-center mt-2">Quét mã để thanh toán</p>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Thông tin chuyển khoản:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">17418271</span>
                <button
                  onClick={() => 17418271}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tên tài khoản:</span>
              <span className="font-medium">Chu Quang Dũng</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Chi nhánh:</span>
              <span className="font-medium">HCM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nội dung chuyển khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{orderData.transferContent}</span>
                <button
                  onClick={() => handleCopyText(orderData.transferContent)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {copied && (
            <div className="mt-2 text-center text-sm text-green-600">
              Đã sao chép vào clipboard!
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerifyPayment}
            disabled={isVerifying}
            className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg ${
              isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {isVerifying ? 'Đang xác nhận...' : 'Tôi đã chuyển khoản'}
          </button>
          <button
            onClick={() => router.push('/cart')}
            disabled={isVerifying}
            className="w-full py-3 text-gray-600 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            Hủy thanh toán
          </button>
        </div>
      </div>
    </div>
  );
} 