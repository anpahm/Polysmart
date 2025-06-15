"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { removeFromCart, changeQuantity } from '../../store/cartSlice';
import { useRouter } from 'next/navigation';

function formatVND(num: number) {
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const [customer, setCustomer] = useState({ name: "", phone: "", gender: "Anh" });
  const [delivery, setDelivery] = useState({ method: "home", city: "", address: "", note: "", invoice: false });
  const [agree, setAgree] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 3000); // 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showSuccessModal, router]);

  const handleRemove = (idx: number) => {
    const item = cart[idx];
    dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }));
  };

  const handleChangeQty = (idx: number, delta: number) => {
    const item = cart[idx];
    dispatch(changeQuantity({ productId: item.productId, variantId: item.variantId, delta }));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmitOrder = () => {
    if (paymentMethod === "cod") {
      setShowSuccessModal(true);
    } else {
      // Handle other payment methods here (ATM, MoMo)
      alert(`Chức năng thanh toán ${paymentMethod} đang được phát triển.`);
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        {!isClient ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">Đang tải nội dung giỏ hàng...</p>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="mb-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">Vui lòng thêm sản phẩm</p>
                </div>
              ) : (
                <>
                  {cart.map((item, idx) => (
                    <div key={item.productId + '-' + item.variantId} className="flex items-center border-b py-4 px-2 last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-contain rounded-lg border mr-4" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col pr-4">
                          <div className="font-semibold text-lg line-clamp-2">{item.name}</div>
                          {item.colors && item.selectedColor !== undefined && item.colors[item.selectedColor] ? (
                            <span
                              className="w-5 h-5 rounded-full mt-1 mb-2"
                              style={{ background: item.colors[item.selectedColor] }}
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end min-w-[200px]">
                          <div className="flex items-center gap-0 border rounded-lg overflow-hidden mb-2">
                            <button onClick={() => handleChangeQty(idx, -1)} className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100">-</button>
                            <input type="number" min={1} value={item.quantity} readOnly className="w-10 h-8 text-center text-sm" />
                            <button onClick={() => handleChangeQty(idx, 1)} className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100">+</button>
                          </div>
                          <div className="font-semibold text-lg text-blue-600 mb-1">{formatVND(item.price * item.quantity)}</div>
                          <button onClick={() => handleRemove(idx)} className="text-sm text-blue-600 hover:underline">Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <hr className="my-4" />
                  <div className="flex justify-end items-center gap-4 mb-4">
                    <span className="font-semibold text-lg">Tổng tiền:</span>
                    <span className="text-red-500 font-bold text-2xl">{formatVND(total)}</span>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => router.push('/')} className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700">Tiếp tục mua hàng</button>
                    <button 
                      onClick={() => router.push('/payments')} 
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Thanh toán
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <svg className="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <h2 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h2>
              <p className="text-gray-700 mb-4">Hóa đơn của bạn đã được gửi về số điện thoại đã đăng ký.</p>
              <p className="text-sm text-gray-500">Bạn sẽ được chuyển hướng về trang chủ sau 3 giây...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 