"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { removeFromCart, changeQuantity } from '../../store/cartSlice';
import { useRouter } from 'next/navigation';
import { getApiUrl } from "@/config/api";
import { showInfoAlert, showSuccessModal } from '@/utils/sweetAlert';

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

  const [activeFlashSales, setActiveFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    const fetchFlashSales = async () => {
      setLoading(true);
      try {
        const res = await fetch(getApiUrl('flashsales/active'));
        const data = await res.json();
        if (data.data) {
          const allFlashSaleVariants = data.data.flatMap((sale: any) =>
            sale.flashSaleVariants.map((variant: any) => ({
              ...variant,
              id_flash_sale: sale._id,
              ten_su_kien: sale.ten_su_kien
            }))
          );
          setActiveFlashSales(allFlashSaleVariants);
        }
      } catch (error) {
        console.error("Failed to fetch flash sales", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFlashSales();
  }, []);



  const handleRemove = (idx: number) => {
    const item = cart[idx];
    dispatch(removeFromCart({ productId: item.productId, variantId: item.variantId }));
  };

  const handleChangeQty = (idx: number, delta: number) => {
    const item = cart[idx];
    dispatch(changeQuantity({ productId: item.productId, variantId: item.variantId, delta }));
  };

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

  if (loading && isClient) {
    return (
      <div className="bg-[#f5f5f7] min-h-screen py-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 text-lg">Đang cập nhật giá và khuyến mãi...</p>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = () => {
    if (paymentMethod === "cod") {
      // Hiển thị modal thành công và chuyển hướng
      showSuccessModal(
        'Đặt hàng thành công!', 
        'Hóa đơn của bạn đã được gửi về số điện thoại đã đăng ký.',
        () => {
          router.push('/');
        }
      );
    } else {
      // Handle other payment methods here (ATM, MoMo)
      showInfoAlert('Thông báo', `Chức năng thanh toán ${paymentMethod} đang được phát triển.`);
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
                  {cartDetails.items.map((item, idx) => (
                    <div key={item.variantId} className="flex items-center border-b py-4 px-2 last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-24 h-24 object-contain rounded-lg border mr-4" />
                      <div className="flex-1 flex items-center justify-between">
                        <div className="flex flex-col pr-4">
                          <div className="font-semibold text-lg line-clamp-2">{item.name}</div>
                          {item.colorName ? (
                             <div className="flex items-center gap-2 mt-1">
                               <span
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: item.colorName }}
                              />
                              <span className="text-sm text-gray-600">{item.colorName}</span>
                             </div>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end min-w-[200px]">
                          <div className="flex items-center gap-0 border rounded-lg overflow-hidden mb-2">
                            <button onClick={() => handleChangeQty(idx, -1)} className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100">-</button>
                            <input type="number" min={1} value={item.quantity} readOnly className="w-10 h-8 text-center text-sm" />
                            <button onClick={() => handleChangeQty(idx, 1)} className="w-8 h-8 text-lg font-bold bg-white hover:bg-gray-100">+</button>
                          </div>
                          <div className="mb-1 text-right">
                            <div className="font-semibold text-lg text-blue-600">{formatVND(item.lineTotal)}</div>
                            {item.hasFlashSale && (
                              <div className="text-sm text-gray-500 line-through">
                                {formatVND(item.originalItemPrice * item.quantity)}
                              </div>
                            )}
                          </div>
                          <button onClick={() => handleRemove(idx)} className="text-sm text-blue-600 hover:underline">Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <hr className="my-4" />
                  <div className="flex justify-end items-center gap-4 mb-4">
                    <span className="font-semibold text-lg">Tổng tiền:</span>
                    <span className="text-red-500 font-bold text-2xl">{formatVND(cartDetails.total)}</span>
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


      </div>
    </div>
  );
} 