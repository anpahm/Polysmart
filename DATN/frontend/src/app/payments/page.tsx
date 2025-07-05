"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { getApiUrl } from "@/config/api";

// Create a client-only component for the cart items
const CartItems = dynamic(() => Promise.resolve(({ items, formatVND }: { items: any[], formatVND: (num: number) => string }) => (
  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thumb-gray-400 scrollbar-track-gray-200 scrollbar-thin">
    {items.map((item) => (
      <div key={item.variantId} className="flex items-center py-2">
        <div className="relative mr-3">
          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-sm font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {item.quantity}
          </span>
        </div>
        <div className="flex-1">
          <div className="font-semibold text-gray-800 text-sm line-clamp-2">{item.name}</div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
             {item.colorName && (
              <div className="flex items-center gap-2">
                <span className="font-normal">Màu:</span>
                <span
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: item.colorName }}
                  title={item.colorName}
                />
              </div>
             )}
          </div>
        </div>
        <div className="text-right text-base">
           <div className="font-semibold text-blue-600">{formatVND(item.lineTotal)}</div>
           {item.hasFlashSale && (
             <div className="text-gray-500 line-through text-sm">
               {formatVND(item.originalItemPrice * item.quantity)}
             </div>
           )}
        </div>
      </div>
    ))}
  </div>
)), { ssr: false });

// Create a client-only component for the totals
const OrderTotals = dynamic(() => Promise.resolve(({ totalAmount, shippingFee, formatVND }: { totalAmount: number, shippingFee: number, formatVND: (num: number) => string }) => (
  <div className="space-y-2 mb-6">
    <div className="flex justify-between text-gray-700">
      <span>Tạm tính:</span>
      <span>{formatVND(totalAmount)}</span>
    </div>
    <div className="flex justify-between text-gray-700">
      <span>Phí vận chuyển:</span>
      <span>{formatVND(shippingFee)}</span>
    </div>
    <div className="flex justify-between font-bold text-lg text-gray-800">
      <span>Tổng cộng:</span>
      <span className="text-blue-600">{formatVND(totalAmount + shippingFee)}</span>
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
  const [activeFlashSales, setActiveFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);

  const [voucherCode, setVoucherCode] = useState('');
  const [voucherPercent, setVoucherPercent] = useState<number | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  // Phí vận chuyển mặc định
  const SHIPPING_FEE = 0;

  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoading(true);

    const fetchAllData = async () => {
      try {
        const [provincesRes, flashSalesRes] = await Promise.all([
          fetch('https://provinces.open-api.vn/api/?depth=2'),
          fetch(getApiUrl('flashsales/active'))
        ]);
        
        if (!provincesRes.ok) throw new Error('Không lấy được danh sách tỉnh thành');
        const provincesData = await provincesRes.json();
        setProvinces(provincesData);

        const flashSalesData = await flashSalesRes.json();
        if (flashSalesData.data) {
          const allFlashSaleVariants = flashSalesData.data.flatMap((sale: any) =>
            sale.flashSaleVariants.map((variant: any) => ({
              ...variant,
              id_flash_sale: sale._id,
              ten_su_kien: sale.ten_su_kien
            }))
          );
          setActiveFlashSales(allFlashSaleVariants);
        }
      } catch (error) {
        console.error('Lỗi lấy tỉnh thành:', error);
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
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

  const flashSaleMap = useMemo(() => {
    const map = new Map<string, { price: number; available: number }>();
    if (activeFlashSales.length > 0) {
      activeFlashSales.forEach(variant => {
        map.set(variant.id_variant, {
          price: variant.gia_flash_sale,
          available: variant.so_luong - variant.da_ban,
        });
      });
    }
    return map;
  }, [activeFlashSales]);

  const cartDetails = useMemo(() => {
    const itemsWithDetails = cart.map(item => {
      const flashSaleInfo = flashSaleMap.get(item.variantId);
      const originalPrice = item.originPrice || item.price;
      let lineTotal = originalPrice * item.quantity;
      let hasFlashSale = false;

      if (flashSaleInfo && flashSaleInfo.available > 0) {
        const qtyWithDiscount = Math.min(item.quantity, flashSaleInfo.available);
        const qtyAtRegularPrice = item.quantity - qtyWithDiscount;
        
        if (qtyWithDiscount > 0) {
           lineTotal = (qtyWithDiscount * flashSaleInfo.price) + (qtyAtRegularPrice * originalPrice);
           hasFlashSale = true;
        }
      }
      
      return {
        ...item,
        lineTotal,
        hasFlashSale,
        originalItemPrice: originalPrice,
      };
    });

    const total = itemsWithDetails.reduce((sum, item) => sum + item.lineTotal, 0);
    return { items: itemsWithDetails, total };
  }, [cart, flashSaleMap]);

  if (loading || !mounted) {
     return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Đang tải trang thanh toán...</p>
      </div>
     )
  }

  const handleApplyVoucher = async () => {
    setVoucherError('');
    setVoucherApplied(false);
    setVoucherPercent(null);
    setVoucherDiscount(0);
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }
    try {
      // Thử gift voucher trước
      let res = await fetch(getApiUrl(`gift-vouchers/code/${voucherCode.trim()}`));
      let data = await res.json();
      if (data.success && data.data && !data.data.isUsed && !data.data.isDisabled) {
        const phan_tram = data.data.phan_tram ?? data.data.percent ?? 0;
        const giam_toi_da = data.data.maxDiscount || data.data.giam_toi_da || Infinity;
        setVoucherPercent(phan_tram);
        setVoucherApplied(true);
        // Tính số tiền giảm, có giới hạn tối đa
        const rawDiscount = Math.floor((cartDetails.total * phan_tram) / 100);
        const discount = Math.min(rawDiscount, giam_toi_da);
        console.log('Gift voucher discount:', discount); // DEBUG
        setVoucherDiscount(discount);
        return;
      }
      // Nếu không phải gift voucher, thử voucher công khai
      res = await fetch(getApiUrl(`vouchers/apply/${voucherCode.trim()}`));
      data = await res.json();
      console.log('Public voucher API response:', data); // DEBUG
      if (data.success && data.data) {
        const phan_tram = data.data.phan_tram_giam_gia || 0;
        const giam_toi_da = data.data.giam_toi_da || Infinity;
        setVoucherPercent(phan_tram);
        setVoucherApplied(true);
        // Tính số tiền giảm, có giới hạn tối đa
        const rawDiscount = Math.floor((cartDetails.total * phan_tram) / 100);
        const discount = Math.min(rawDiscount, giam_toi_da);
        console.log('Public voucher discount:', discount); // DEBUG
        setVoucherDiscount(discount);
        return;
      }
      setVoucherError('Mã giảm giá không hợp lệ hoặc đã được sử dụng/vô hiệu hóa');
    } catch (err) {
      setVoucherError('Có lỗi khi kiểm tra mã giảm giá');
    }
  };

  const handlePlaceOrder = async () => {
    if (orderLoading) return; // Chặn double submit
    setOrderLoading(true);
    try {
      // Validate required fields
      // if (!customerInfo.fullName || !customerInfo.phone || !customerInfo.address || !customerInfo.city) {
      //   alert("Vui lòng điền đầy đủ thông tin giao hàng!");
      //   setOrderLoading(false);
      //   return;
      // }

      // Create order data
      const orderData = {
        customerInfo,
        items: cartDetails.items,
        totalAmount: cartDetails.total - voucherDiscount,
        paymentMethod,
        voucher: voucherApplied ? {
          code: voucherCode,
          percent: voucherPercent,
          discount: voucherDiscount
        } : undefined,
      };

      // Handle different payment methods
      switch (paymentMethod) {
        case "cod":
          console.log("Order Data:", orderData);
          const res = await fetch('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await res.json();

          if (res.ok) {
            router.push('/payment-result?status=success');
          } else {
            router.push('/payment-result?status=fail');
          }
          break;

        case "atm":
          localStorage.setItem('pendingOrder', JSON.stringify(orderData));
          router.push('/payment/banking');
          return;

        default:
          alert("Vui lòng chọn phương thức thanh toán!");
          setOrderLoading(false);
          return;
      }
    } catch (err) {
      alert("Có lỗi khi đặt hàng!");
    } finally {
      setOrderLoading(false);
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
        <div className="w-2/5 bg-[#F8F9FA] p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Đơn hàng ({cartDetails.items.length} sản phẩm)</h2>

          <CartItems items={cartDetails.items} formatVND={formatVND} />

          <div className="border-t my-6"></div>

          {/* Discount Code */}
          <div className="flex mb-2">
            <input
              type="text"
              placeholder="Nhập mã giảm giá"
              className="w-full p-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value)}
              disabled={voucherApplied}
            />
            <button
              className="px-6 bg-gray-300 text-gray-700 font-semibold rounded-r-lg hover:bg-gray-400"
              onClick={handleApplyVoucher}
              type="button"
              disabled={voucherApplied}
            >
              {voucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
            </button>
          </div>
          {voucherError && <div className="text-red-500 mb-2">{voucherError}</div>}
          {voucherApplied && voucherPercent && (
            <div className="text-green-600 mb-2">Đã áp dụng mã giảm giá: -{formatVND(voucherDiscount)} ({voucherPercent}%)</div>
          )}
       
          {/* Order Totals with Discount Line */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>Tạm tính:</span>
              <span>{formatVND(cartDetails.total)}</span>
            </div>
            {voucherApplied && voucherDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Giảm giá:</span>
                <span>-{formatVND(voucherDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>Tổng cộng:</span>
              <span className="text-blue-600">{formatVND(cartDetails.total - voucherDiscount)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <button onClick={() => router.push('/cart')} className="text-blue-600 font-semibold flex items-center gap-2 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Quay về giỏ hàng
            </button>
            <button onClick={handlePlaceOrder} disabled={orderLoading} className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors">
              {orderLoading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
