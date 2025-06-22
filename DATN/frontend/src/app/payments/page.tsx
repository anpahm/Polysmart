"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

// Create a client-only component for the cart items
const CartItems = dynamic(() => Promise.resolve(({ cart, formatVND }: { cart: any[], formatVND: (num: number) => string }) => (
  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thin">
    {cart.map((item, idx) => (
      <div key={item.productId + "-" + item.variantId} className="flex items-center py-2">
        <div className="relative mr-3">
          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-sm font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {item.quantity}
          </span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800 text-sm line-clamp-2">{item.name}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {item.colorName && !item.colorName.startsWith('#') ? (
              <span>Màu: {item.colorName}</span>
            ) : (
              <span>Màu đã chọn</span>
            )}
            {item.colors && item.selectedColor !== undefined && item.colors[item.selectedColor] && (
              <span
                className="w-5 h-5 rounded-full ring-2 ring-blue-500 ring-offset-2"
                style={{ background: item.colors[item.selectedColor] }}
              />
            )}
          </div>
        </div>
        <div className="text-right text-blue-600 font-semibold text-base">
          {formatVND(item.price * item.quantity)}
        </div>
      </div>
    ))}
  </div>
)), { ssr: false });

// Create a client-only component for the totals
const OrderTotals = dynamic(() => Promise.resolve(({ totalAmount, formatVND }: { totalAmount: number, formatVND: (num: number) => string }) => (
  <div className="space-y-2 mb-6">
    <div className="flex justify-between text-gray-700">
      <span>Tạm tính:</span>
      <span>{formatVND(totalAmount)}</span>
    </div>
    <div className="flex justify-between text-gray-700">
      <span>Phí vận chuyển:</span>
      <span>-</span>
    </div>
    <div className="flex justify-between font-bold text-lg text-gray-800">
      <span>Tổng cộng:</span>
      <span className="text-blue-600">{formatVND(totalAmount)}</span>
    </div>
  </div>
)), { ssr: false });

function formatVND(num: number) {
  return num.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

export default function PaymentsPage() {
  const cart = useSelector((state: RootState) => state.cart.items);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);

    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/?depth=2');
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvinceCode) {
      const selectedProvince = provinces.find(p => p.code === selectedProvinceCode);
      if (selectedProvince && selectedProvince.districts) {
        setDistricts(selectedProvince.districts);
        setCustomerInfo(prev => ({ ...prev, district: '' })); // Reset district when province changes
      }
    } else {
      setDistricts([]);
      setCustomerInfo(prev => ({ ...prev, district: '' }));
    }
  }, [selectedProvinceCode, provinces]);

  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const totalAmount = mounted ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;

  const handlePlaceOrder = () => {
    // Validate required fields
    if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    // Create order data
    const orderData = {
      customerInfo,
      items: cart,
      totalAmount,
      paymentMethod,
    };

    // Handle different payment methods
    switch (paymentMethod) {
      case "cod":
        // Handle COD payment
        alert("Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.");
        // Here you would typically send the order to your backend
        console.log("Order Data:", orderData);
        break;

      case "atm":
        // Store order data in localStorage for retrieval after payment
        localStorage.setItem('pendingOrder', JSON.stringify(orderData));

        // Redirect to bank selection page
        router.push('/payment/banking');
        return;

      default:
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg flex">
        {/* Left Column - Shipping and Payment Info */}
        <div className="w-3/5 p-8">
          {/* Shipping Information */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Thông tin nhận hàng</h2>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Email" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} />
              <input type="text" placeholder="Họ và tên" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={customerInfo.fullName} onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})} />
              <input type="text" placeholder="Số điện thoại (tùy chọn)" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} />
              <input type="text" placeholder="Địa chỉ (tùy chọn)" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={customerInfo.address} onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})} />
              <div className="relative">
                <select className="w-full p-4 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={selectedProvinceCode || ''} onChange={(e) => {
                  const code = parseInt(e.target.value);
                  setSelectedProvinceCode(isNaN(code) ? null : code);
                  setCustomerInfo({...customerInfo, city: e.target.options[e.target.selectedIndex].text});
                }}>
                  <option value="">Tỉnh thành ---</option>
                  {provinces.map(province => (
                    <option key={province.code} value={province.code}>{province.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <div className="relative">
                <select className="w-full p-4 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" value={customerInfo.district} onChange={(e) => setCustomerInfo({...customerInfo, district: e.target.value})}>
                  <option value="">Quận huyện (tùy chọn)</option>
                  {districts.map(district => (
                    <option key={district.code} value={district.name}>{district.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <textarea placeholder="Ghi chú (tùy chọn)" className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={customerInfo.note} onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}></textarea>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Vận chuyển</h2>
            <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
              Vui lòng nhập thông tin giao hàng
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Thanh toán</h2>
            <div className="space-y-3">
              {/* COD Payment */}
              <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-800">Thanh toán khi giao hàng (COD)</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9.75h19.5M2.25 12h19.5m-16.5 4.5h.008v.008h-.008V16.5zm.375 0h.008v.008h-.008V16.5zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm5.625-5.25h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm5.625-5.25h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008z" />
                </svg>
              </label>

              {/* ATM Payment */}
              <label className="flex items-center justify-between p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="atm"
                    checked={paymentMethod === "atm"}
                    onChange={() => setPaymentMethod("atm")}
                    className="form-radio h-5 w-5 text-blue-600"
                  />
                  <span className="ml-3 text-lg font-medium text-gray-800">Thanh toán ATM/Internet Banking</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9.75h19.5M2.25 12h19.5m-16.5 4.5h.008v.008h-.008V16.5zm.375 0h.008v.008h-.008V16.5zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm5.625-5.25h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm5.625-5.25h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008z" />
                </svg>
              </label>
            </div>

            {/* Payment Method Descriptions */}
            {paymentMethod === "cod" && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng.
              </div>
            )}
            {paymentMethod === "atm" && (
              <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
                <p className="text-gray-700">Bạn sẽ được chuyển đến trang thanh toán qua Internet Banking.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-2/5 bg-gray-50 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Đơn hàng {mounted && `(${cart.length} sản phẩm)`}
          </h2>
          {mounted && <CartItems cart={cart} formatVND={formatVND} />}

          <hr className="my-6" />

          {/* Discount Code */}
          <div className="flex mb-6">
            <input type="text" placeholder="Nhập mã giảm giá" className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-r-lg hover:bg-gray-400">Áp dụng</button>
          </div>

          {/* Totals */}
          {mounted && <OrderTotals totalAmount={totalAmount} formatVND={formatVND} />}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/cart')}
              className="w-full py-3 text-blue-600 font-semibold rounded-lg border border-blue-600 hover:bg-blue-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 inline-block mr-2 -mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              Quay về giỏ hàng
            </button>
            <button
              onClick={handlePlaceOrder}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Đặt hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
