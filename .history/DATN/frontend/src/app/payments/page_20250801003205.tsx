"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { getApiUrl } from "@/config/api";
import { showSuccessModal, showErrorAlert } from '@/utils/sweetAlert';
import { getVnColorName } from '@/constants/colorMapShared';

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
                  title={getVnColorName(item.colorName)}
                />
                <span>{getVnColorName(item.colorName)}</span>
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
  const user = useSelector((state: RootState) => state.user.user);
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

  const [validationErrors, setValidationErrors] = useState({
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const flashSaleMap = useMemo(() => {
    const map = new Map<string, { price: number; available: number; flashSaleVariantId: string }>();
    if (activeFlashSales.length > 0) {
      activeFlashSales.forEach(variant => {
        map.set(variant.id_variant, {
          price: variant.gia_flash_sale,
          available: variant.so_luong - variant.da_ban,
          flashSaleVariantId: variant._id
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

  // Generate structured data for SEO
  const generateStructuredData = () => {
    const items = cartDetails?.items || [];
    const totalAmount = cartDetails?.total || 0;
    
    return {
      "@context": "https://schema.org",
      "@type": "CheckoutPage",
      "name": "Thanh toán đơn hàng",
      "description": "Trang thanh toán an toàn cho đơn hàng của bạn với nhiều phương thức thanh toán",
      "url": typeof window !== 'undefined' ? window.location.href : '',
      "potentialAction": {
        "@type": "OrderAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": typeof window !== 'undefined' ? window.location.href : ''
        }
      },
      "offers": items.map(item => ({
        "@type": "Offer",
        "name": item.name,
        "price": item.price,
        "priceCurrency": "VND",
        "availability": "https://schema.org/InStock",
        "image": item.image
      })),
      "totalPrice": totalAmount,
      "priceCurrency": "VND"
    };
  };

  if (loading || !mounted) {
     return (
      <>
        <Head>
          <title>Thanh toán đơn hàng - Đang tải | TechStore</title>
          <meta name="description" content="Đang tải trang thanh toán an toàn cho đơn hàng của bạn" />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500 text-lg">Đang tải trang thanh toán...</p>
        </div>
      </>
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

  const validateForm = () => {
    const errors = {
      email: "",
      fullName: "",
      phone: "",
      address: "",
      city: "",
    };

    // Validate email
    if (!customerInfo.email.trim()) {
      errors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) {
      errors.email = "Email không hợp lệ";
    }

    // Validate full name
    if (!customerInfo.fullName.trim()) {
      errors.fullName = "Họ và tên là bắt buộc";
    } else if (customerInfo.fullName.trim().length < 2) {
      errors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Validate phone
    if (!customerInfo.phone.trim()) {
      errors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) {
      errors.phone = "Số điện thoại không hợp lệ (10-11 số)";
    }

    // Validate address
    if (!customerInfo.address.trim()) {
      errors.address = "Địa chỉ là bắt buộc";
    }

    // Validate city
    if (!customerInfo.city.trim()) {
      errors.city = "Tỉnh thành là bắt buộc";
    }

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const handlePlaceOrder = async () => {
    if (orderLoading) return; // Chặn double submit
    
    // Validate form before proceeding
    if (!validateForm()) {
      setOrderLoading(false);
      return;
    }
    
    setOrderLoading(true);
    try {

      // Create order data with proper flash sale mapping
      const orderData = {
        customerInfo: {
          ...customerInfo,
          userId: user?._id || undefined
        },
        items: cartDetails.items.map(item => {
          const flashSaleInfo = flashSaleMap.get(item.variantId);
          return {
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            oldPrice: item.originPrice,
            name: item.name,
            image: item.image,
            colorName: item.colorName,
            // Map flash sale fields correctly
            isFlashSale: item.hasFlashSale || false,
            flashSaleVariantId: flashSaleInfo?.flashSaleVariantId || item.flashSaleVariantId || undefined
          };
        }),
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
            showSuccessModal('Thành công!', 'Đặt hàng thành công! Đang chuyển hướng...', () => {
              router.push('/payment-result?status=success');
            });
          } else {
            showErrorAlert('Thất bại!', 'Đặt hàng thất bại! Vui lòng thử lại.');
            router.push('/payment-result?status=fail');
          }
          break;

        case "atm":
          localStorage.setItem('pendingOrder', JSON.stringify(orderData));
          router.push('/payment/banking');
          return;

        default:
          showErrorAlert('Lỗi!', 'Vui lòng chọn phương thức thanh toán!');
          setOrderLoading(false);
          return;
      }
    } catch (err) {
      showErrorAlert('Lỗi!', 'Có lỗi khi đặt hàng! Vui lòng thử lại.');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Thanh toán đơn hàng - TechStore | An toàn & Nhanh chóng</title>
        <meta name="description" content="Thanh toán đơn hàng an toàn với nhiều phương thức: COD, ATM/Internet Banking. Giao hàng toàn quốc, hỗ trợ 24/7." />
        <meta name="keywords" content="thanh toán, đặt hàng, COD, ATM, internet banking, giao hàng, techstore" />
        <meta name="author" content="TechStore" />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Thanh toán đơn hàng - TechStore" />
        <meta property="og:description" content="Thanh toán đơn hàng an toàn với nhiều phương thức thanh toán" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:site_name" content="TechStore" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Thanh toán đơn hàng - TechStore" />
        <meta name="twitter:description" content="Thanh toán đơn hàng an toàn với nhiều phương thức thanh toán" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={typeof window !== 'undefined' ? window.location.href : ''} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData())
          }}
        />
      </Head>
      
      <main className="min-h-screen bg-gray-100 py-8">
<div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg flex flex-col md:flex-row">
          {/* Left Column - Shipping and Payment Info */}
          <section className="w-full md:w-3/5 p-4 md:p-8" aria-labelledby="shipping-heading">
            {/* Shipping Information */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h1 id="shipping-heading" className="text-xl font-semibold text-gray-800">Thông tin nhận hàng</h1>
              </div>
              <form className="space-y-4" noValidate>
                <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="Email *" 
                    className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`} 
                    value={customerInfo.email} 
                    onChange={(e) => {
                      setCustomerInfo({...customerInfo, email: e.target.value});
                      if (validationErrors.email) {
                        setValidationErrors({...validationErrors, email: ""});
                      }
                    }} 
                    aria-describedby={validationErrors.email ? "email-error" : undefined}
                    required
                  />
                  {validationErrors.email && <p id="email-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="fullName" className="sr-only">Họ và tên</label>
                  <input 
                    id="fullName"
                    type="text" 
                    placeholder="Họ và tên *" 
                    className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.fullName ? 'border-red-500' : 'border-gray-300'}`} 
                    value={customerInfo.fullName} 
                    onChange={(e) => {
                      setCustomerInfo({...customerInfo, fullName: e.target.value});
                      if (validationErrors.fullName) {
                        setValidationErrors({...validationErrors, fullName: ""});
                      }
                    }} 
                    aria-describedby={validationErrors.fullName ? "fullName-error" : undefined}
                    required
                  />
                  {validationErrors.fullName && <p id="fullName-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.fullName}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="sr-only">Số điện thoại</label>
                  <input 
                    id="phone"
                    type="tel" 
                    placeholder="Số điện thoại *" 
                    className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                    value={customerInfo.phone} 
                    onChange={(e) => {
                      setCustomerInfo({...customerInfo, phone: e.target.value});
                      if (validationErrors.phone) {
                        setValidationErrors({...validationErrors, phone: ""});
                      }
                    }} 
                    aria-describedby={validationErrors.phone ? "phone-error" : undefined}
                    required
                  />
                  {validationErrors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.phone}</p>}
                </div>
                
                <div>
                  <label htmlFor="address" className="sr-only">Địa chỉ</label>
                  <input 
                    id="address"
                    type="text" 
                    placeholder="Địa chỉ *" 
                    className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.address ? 'border-red-500' : 'border-gray-300'}`} 
                    value={customerInfo.address} 
                    onChange={(e) => {
                      setCustomerInfo({...customerInfo, address: e.target.value});
                      if (validationErrors.address) {
                        setValidationErrors({...validationErrors, address: ""});
                      }
                    }} 
                    aria-describedby={validationErrors.address ? "address-error" : undefined}
                    required
                  />
                  {validationErrors.address && <p id="address-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.address}</p>}
                </div>
                
                <div className="relative">
                  <label htmlFor="province" className="sr-only">Tỉnh thành</label>
                  <select 
                    id="province"
                    className={`w-full p-4 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.city ? 'border-red-500' : 'border-gray-300'}`} 
                    value={selectedProvinceCode || ''} 
                    onChange={(e) => {
                      const code = parseInt(e.target.value);
                      setSelectedProvinceCode(isNaN(code) ? null : code);
                      setCustomerInfo({...customerInfo, city: e.target.options[e.target.selectedIndex].text});
                      if (validationErrors.city) {
                        setValidationErrors({...validationErrors, city: ""});
                      }
                    }}
                    aria-describedby={validationErrors.city ? "city-error" : undefined}
                    required
                  >
                    <option value="">Tỉnh thành *</option>
                    {provinces.map(province => (
                      <option key={province.code} value={province.code}>{province.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                  {validationErrors.city && <p id="city-error" className="text-red-500 text-sm mt-1" role="alert">{validationErrors.city}</p>}
                </div>
                
                <div className="relative">
                  <label htmlFor="district" className="sr-only">Quận huyện</label>
                  <select 
                    id="district"
                    className="w-full p-4 border border-gray-300 rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    value={customerInfo.district} 
                    onChange={(e) => setCustomerInfo({...customerInfo, district: e.target.value})}
                  >
                    <option value="">Quận huyện (tùy chọn)</option>
                    {districts.map(district => (
                      <option key={district.code} value={district.name}>{district.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="note" className="sr-only">Ghi chú</label>
                  <textarea 
                    id="note"
                    placeholder="Ghi chú (tùy chọn)" 
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" 
                    value={customerInfo.note} 
                    onChange={(e) => setCustomerInfo({...customerInfo, note: e.target.value})}
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Shipping Method */}
            <section className="mb-8" aria-labelledby="shipping-method-heading">
              <h2 id="shipping-method-heading" className="text-xl font-semibold text-gray-800 mb-4">Vận chuyển</h2>
              <div className="p-4 bg-blue-100 text-blue-800 rounded-lg" role="status">
                Vui lòng nhập thông tin giao hàng
              </div>
            </section>

            {/* Payment Method */}
            <section aria-labelledby="payment-method-heading">
              <h2 id="payment-method-heading" className="text-xl font-semibold text-gray-800 mb-4">Thanh toán</h2>
              <fieldset className="space-y-3">
                <legend className="sr-only">Chọn phương thức thanh toán</legend>
                
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
                      aria-describedby="cod-description"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-800">Thanh toán khi giao hàng (COD)</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600" aria-hidden="true">
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
                      aria-describedby="atm-description"
                    />
                    <span className="ml-3 text-lg font-medium text-gray-800">Thanh toán ATM/Internet Banking</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9.75h19.5M2.25 12h19.5m-16.5 4.5h.008v.008h-.008V16.5zm.375 0h.008v.008h-.008V16.5zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm5.625-5.25h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm5.625-5.25h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008zm-.375 3h.008v.008h-.008v-.008zm.375 0h.008v.008h-.008v-.008z" />
                  </svg>
                </label>
              </fieldset>

              {/* Payment Method Descriptions */}
              {paymentMethod === "cod" && (
                <div id="cod-description" className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-700" role="status">
                  Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng.
                </div>
              )}
              {paymentMethod === "atm" && (
                <div id="atm-description" className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-700" role="status">
                  Bạn sẽ được chuyển đến trang thanh toán qua Internet Banking.
                </div>
              )}
            </section>
          </section>

          {/* Right Column - Order Summary */}
          <aside className="w-full md:w-2/5 bg-[#F8F9FA] p-4 md:p-8" aria-labelledby="order-summary-heading">
            <h2 id="order-summary-heading" className="text-xl font-semibold text-gray-800 mb-6">
              Đơn hàng ({cartDetails.items.length} sản phẩm)
            </h2>

            <CartItems items={cartDetails.items} formatVND={formatVND} />

            <div className="border-t my-6"></div>

            {/* Discount Code */}
            <section className="mb-4" aria-labelledby="discount-heading">
              <h3 id="discount-heading" className="sr-only">Mã giảm giá</h3>
              <div className="flex mb-2">
                <label htmlFor="voucherCode" className="sr-only">Nhập mã giảm giá</label>
                <input
                  id="voucherCode"
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  className="w-full p-4 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={voucherCode}
                  onChange={e => setVoucherCode(e.target.value)}
                  disabled={voucherApplied}
                  aria-describedby={voucherError ? "voucher-error" : voucherApplied ? "voucher-success" : undefined}
                />
                <button
                  className="px-6 bg-gray-300 text-gray-700 font-semibold rounded-r-lg hover:bg-gray-400"
                  onClick={handleApplyVoucher}
                  type="button"
                  disabled={voucherApplied}
                  aria-describedby="voucher-button-desc"
                >
                  {voucherApplied ? 'Đã áp dụng' : 'Áp dụng'}
                </button>
              </div>
              <div id="voucher-button-desc" className="sr-only">Nút để áp dụng mã giảm giá</div>
              {voucherError && <div id="voucher-error" className="text-red-500 mb-2" role="alert">{voucherError}</div>}
              {voucherApplied && voucherPercent && (
                <div id="voucher-success" className="text-green-600 mb-2" role="status">
                  Đã áp dụng mã giảm giá: -{formatVND(voucherDiscount)} ({voucherPercent}%)
                </div>
              )}
            </section>
       
            {/* Order Totals with Discount Line */}
            <section className="space-y-2 mb-6" aria-labelledby="order-totals-heading">
              <h3 id="order-totals-heading" className="sr-only">Tổng đơn hàng</h3>
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
            </section>

            <div className="flex items-center justify-between mt-8">
              <button 
                onClick={() => router.push('/cart')} 
                className="text-blue-600 font-semibold flex items-center gap-2 hover:underline"
                aria-label="Quay về giỏ hàng"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Quay về giỏ hàng
              </button>
              <button 
                onClick={handlePlaceOrder} 
                disabled={orderLoading} 
                className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                aria-describedby={orderLoading ? "order-loading" : undefined}
              >
                {orderLoading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
              {orderLoading && <div id="order-loading" className="sr-only">Đang xử lý đơn hàng</div>}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
