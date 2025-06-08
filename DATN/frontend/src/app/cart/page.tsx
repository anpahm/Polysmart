"use client";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { removeFromCart, changeQuantity } from '../../store/cartSlice';

function formatVND(num: number) {
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function CartPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const [customer, setCustomer] = useState({ name: "", phone: "", gender: "Anh" });
  const [delivery, setDelivery] = useState({ method: "home", city: "", address: "", note: "", invoice: false });
  const [agree, setAgree] = useState(false);

  // Thêm kiểm tra client để tránh hydration error
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  if (!isClient) return null;

  const handleRemove = (idx: number) => {
    const item = cart[idx];
    dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }));
  };

  const handleChangeQty = (idx: number, delta: number) => {
    const item = cart[idx];
    dispatch(changeQuantity({ productId: item.productId, variantId: item.variantId, delta }));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-[#f5f5f7] min-h-screen py-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        {/* Cart Items */}
        <div className="mb-6">
          {cart.map((item, idx) => (
            <div key={item.productId + '-' + item.variantId} className="flex items-center border-b py-8 gap-8">
              <img src={item.image} alt={item.name} className="w-28 h-28 object-contain rounded-lg border" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xl mb-1">{item.name}</div>
                <div className="text-gray-500 mb-2">Màu sắc: {item.colorName || item.colors[item.selectedColor] || ''}</div>
                <div className="flex gap-2 mb-3">
                  <span
                    className="w-7 h-7 rounded-full border-2 border-black ring-2 ring-black"
                    style={{ background: item.colors[item.selectedColor] }}
                  />
                </div>
                <button onClick={() => handleRemove(idx)} className="px-6 py-1 rounded bg-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-300">Xóa</button>
              </div>
              <div className="flex flex-col items-end min-w-[140px]">
                <div className="font-bold text-xl mb-4">{formatVND(item.price)}</div>
                <div className="flex items-center gap-0">
                  <button onClick={() => handleChangeQty(idx, -1)} className="w-10 h-10 border border-gray-400 rounded-l text-xl font-bold bg-white hover:bg-gray-100">-</button>
                  <input type="number" min={1} value={item.quantity} readOnly className="w-12 h-10 text-center border-t border-b border-gray-400" />
                  <button onClick={() => handleChangeQty(idx, 1)} className="w-10 h-10 border border-gray-400 rounded-r text-xl font-bold bg-white hover:bg-gray-100">+</button>
                </div>
              </div>
            </div>
          ))}
          <div className="text-right font-semibold mt-2">Tạm tính ({cart.length} sản phẩm): <span className="text-red-500">{formatVND(total)}</span></div>
        </div>
        {/* Customer Info */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="font-semibold mb-2 text-lg">Thông tin khách hàng</div>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-1">
              <input type="radio" checked={customer.gender === "Anh"} onChange={() => setCustomer({ ...customer, gender: "Anh" })} /> <span className="font-medium">Anh</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" checked={customer.gender === "Chị"} onChange={() => setCustomer({ ...customer, gender: "Chị" })} /> <span className="font-medium">Chị</span>
            </label>
          </div>
          <div className="flex gap-4">
            <input type="text" placeholder="Họ và tên" className="flex-1 border rounded px-3 py-2" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
            <input type="text" placeholder="Số điện thoại" className="flex-1 border rounded px-3 py-2" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
          </div>
        </div>
        {/* Delivery Method */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="font-semibold mb-2 text-lg">Hình thức nhận hàng</div>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-1">
              <input type="radio" checked={delivery.method === "home"} onChange={() => setDelivery({ ...delivery, method: "home" })} /> <span className="font-medium">Giao tận nơi</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" checked={delivery.method === "store"} onChange={() => setDelivery({ ...delivery, method: "store" })} /> <span className="font-medium">Nhận tại cửa hàng</span>
            </label>
          </div>
          <div className="flex gap-4 mb-2 bg-gray-200 rounded-xl p-4">
            <input type="text" placeholder="Chọn tỉnh, thành phố" className="flex-1 border rounded px-3 py-2" value={delivery.city} onChange={e => setDelivery({ ...delivery, city: e.target.value })} />
            <input type="text" placeholder="Địa chỉ cụ thể" className="flex-1 border rounded px-3 py-2" value={delivery.address} onChange={e => setDelivery({ ...delivery, address: e.target.value })} />
          </div>
          <input type="text" placeholder="Nhập ghi chú (nếu có)" className="w-full border rounded px-3 py-2 mb-2" value={delivery.note} onChange={e => setDelivery({ ...delivery, note: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={delivery.invoice} onChange={e => setDelivery({ ...delivery, invoice: e.target.checked })} /> Xuất hóa đơn công ty
          </label>
        </div>
        {/* Total & Agreement */}
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-block bg-gray-100 p-2 rounded"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v-1.125A2.625 2.625 0 0013.875 2.25h-3.75A2.625 2.625 0 007.5 4.875V6m9 0v12.75A2.625 2.625 0 0113.875 21.375h-3.75A2.625 2.625 0 017.5 18.75V6m9 0H7.5" /></svg></span>
            <span className="font-semibold">Sử dụng mã giảm giá</span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-red-500 font-bold text-lg">{formatVND(total)}</span>
          </div>
          <hr className="my-2" />
          <label className="flex items-center gap-2 mb-2">
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />
            Tôi đã đọc và đồng ý với <a href="#" className="underline text-blue-600">điều khoản và điều kiện</a> của website
          </label>
          <button className="w-full bg-[#5B5BFF] text-white rounded-lg py-3 font-semibold mt-2 disabled:opacity-50" disabled={!agree}>
            Tiến hành thanh toán
          </button>
          <div className="text-center text-xs text-gray-500 mt-2">Bạn có thể lựa chọn các hình thức thanh toán ở bước sau</div>
        </div>
      </div>
    </div>
  );
} 