'use client';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaBoxOpen, FaUser, FaMoneyBill, FaHistory, FaArrowLeft, FaTruck, FaCheckCircle } from "react-icons/fa";

interface OrderDetail {
  _id: string;
  customerInfo: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    note?: string;
    email?: string;
  };
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    name?: string;
    image?: string;
    colorName?: string;
    imei?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
  updatedAt: string;
  transferContent?: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branch?: string;
  };
  shippingFee?: number;
  discount?: number;
  voucherCode?: string;
  statusHistory?: Array<{
    status: string;
    time: string;
  }>;
}

const statusMap: Record<string, { label: string; icon: any; color: string }> = {
  confirming: { label: 'Chờ xác nhận', icon: <FaHistory />, color: 'text-yellow-500' },
  packing: { label: 'Chờ lấy hàng', icon: <FaBoxOpen />, color: 'text-blue-600' },
  shipping: { label: 'Chờ giao hàng', icon: <FaTruck />, color: 'text-orange-500' },
  delivered: { label: 'Đã giao', icon: <FaCheckCircle />, color: 'text-green-600' },
  returned: { label: 'Trả hàng', icon: <FaHistory />, color: 'text-purple-500' },
  cancelled: { label: 'Đã hủy', icon: <FaHistory />, color: 'text-red-500' },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://polysmart.me/api/orders/${id}`);
        const data = await res.json();
        setOrder(data);
      } catch {
        setOrder(null);
      }
      setLoading(false);
    };
    if (id) fetchOrder();
  }, [id]);

  // Các hàm cập nhật trạng thái mới
  const handleConfirmOrder = async () => {
    if (!order || !order._id) return;
    setActionLoading(true);
    await fetch(`https://polysmart.me/api/orders/${order._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: 'packing' })
    });
    location.reload();
  };
  const handleShippingOrder = async () => {
    if (!order || !order._id) return;
    setActionLoading(true);
    await fetch(`https://polysmart.me/api/orders/${order._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: 'shipping' })
    });
    location.reload();
  };
  const handleDeliveredOrder = async () => {
    if (!order || !order._id) return;
    setActionLoading(true);
    await fetch(`https://polysmart.me/api/orders/${order._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: 'delivered' })
    });
    location.reload();
  };
  const handleCancelOrder = async () => {
    if (!order || !order._id) return;
    setActionLoading(true);
    await fetch(`https://polysmart.me/api/orders/${order._id}/cancel`, { method: 'PUT' });
    router.push('/order/orders');
  };

  if (loading) return <DefaultLayout><div className="p-8">Đang tải chi tiết đơn hàng...</div></DefaultLayout>;
  if (!order) return <DefaultLayout><div className="p-8 text-red-500">Không tìm thấy đơn hàng.</div></DefaultLayout>;

  // Tính toán tổng kết
  const shippingFee = order.shippingFee ?? 30000; // giả định phí ship 30k nếu chưa có
  const discount = order.discount ?? 0;
  const voucherCode = order.voucherCode ?? '';
  const total = order.totalAmount;
  const totalBeforeDiscount = total + discount;
  const totalPayment = total + shippingFee;

  return (
    <DefaultLayout>
      <div className="max-w-6xl mx-auto bg-white rounded shadow p-8">
        {/* Thanh điều hướng */}
        <div className="mb-6 flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/order/orders')} className="flex items-center gap-2"><FaArrowLeft /> Trở lại / Đơn hàng</Button>
        </div>

        {/* Thông tin đơn hàng */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-lg font-semibold"><FaBoxOpen /> Thông tin đơn hàng</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Mã đơn hàng: <b>#{order._id ? order._id.slice(-8).toUpperCase() : 'N/A'}</b></div>
            <div>Ngày đặt: {new Date(order.createdAt).toLocaleDateString()}</div>
            <div>Trạng thái: <span className={`font-semibold ${statusMap[order.orderStatus]?.color || ''}`}>{statusMap[order.orderStatus]?.icon} {statusMap[order.orderStatus]?.label}</span></div>
            <div>Phương thức thanh toán: {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : (order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A')}</div>
            <div>Phương thức vận chuyển: Giao nhanh (2-3 ngày)</div>
          </div>
        </div>

        {/* Thông tin người nhận */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-lg font-semibold"><FaUser /> Thông tin người nhận</div>
          <div>Họ tên: {order.customerInfo.fullName || '-'}</div>
          <div>SĐT: {order.customerInfo.phone || '-'}</div>
          <div>Địa chỉ: {order.customerInfo.address || ''}, {order.customerInfo.city || ''}</div>
          <div>Ghi chú: {order.customerInfo.note || '-'}</div>
        </div>

        {/* Sản phẩm trong đơn hàng */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-lg font-semibold"><FaBoxOpen /> Sản phẩm trong đơn hàng</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Ảnh</th>
                  <th className="p-2 border">Tên sản phẩm</th>
                  <th className="p-2 border">SL</th>
                  <th className="p-2 border">Giá</th>
                  <th className="p-2 border">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border"><img src={item.image || '/images/no-image.svg'} alt={item.name} className="w-16 h-16 object-contain rounded" /></td>
                    <td className="p-2 border">
                      <div className="font-semibold">{item.name}</div>
                      {item.colorName && <div className="text-xs text-gray-500">Màu: {item.colorName}</div>}
                      {item.imei && <div className="text-xs text-gray-500">IMEI: {item.imei}</div>}
                    </td>
                    <td className="p-2 border text-center">{item.quantity}</td>
                    <td className="p-2 border">{item.price.toLocaleString()}₫</td>
                    <td className="p-2 border">{(item.price * item.quantity).toLocaleString()}₫</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tổng kết đơn hàng */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-lg font-semibold"><FaMoneyBill /> Tổng kết đơn hàng</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Tổng tiền hàng:</div>
            <div className="text-right">{totalBeforeDiscount.toLocaleString()}₫</div>
            <div>Phí vận chuyển:</div>
            <div className="text-right">{shippingFee.toLocaleString()}₫</div>
            <div>Giảm giá {voucherCode && `(Mã: ${voucherCode})`}:</div>
            <div className="text-right">-{discount.toLocaleString()}₫</div>
            <div className="col-span-2 border-t my-2"></div>
            <div className="font-bold text-lg">Tổng thanh toán:</div>
            <div className="text-right font-bold text-blue-600 text-lg">{totalPayment.toLocaleString()}₫</div>
          </div>
        </div>

        {/* Lịch sử trạng thái đơn hàng */}
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2 text-lg font-semibold"><FaHistory /> Trạng thái đơn hàng</div>
          <div className="space-y-1">
            <div>✅ Đã đặt hàng: {new Date(order.createdAt).toLocaleString()}</div>
            {order.orderStatus === 'packing' && <div>✅ Đã xác nhận: {new Date(order.updatedAt).toLocaleString()}</div>}
            {order.orderStatus === 'shipping' && <div>🚚 Đang giao: {new Date(order.updatedAt).toLocaleString()}</div>}
            {order.orderStatus === 'delivered' && <div>✅ Đã giao: {new Date(order.updatedAt).toLocaleString()}</div>}
            {order.orderStatus === 'cancelled' && <div>❌ Đã hủy: {new Date(order.updatedAt).toLocaleString()}</div>}
            {/* Có thể bổ sung lịch sử chi tiết nếu backend trả về */}
          </div>
        </div>

        {/* Hành động */}
        <div className="border rounded-lg p-4 bg-gray-50 flex gap-2">
          {order.orderStatus === 'confirming' && (
            <Button
              onClick={handleConfirmOrder}
              disabled={actionLoading}
              className="bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              Xác nhận đơn (Chuyển sang Chờ lấy hàng)
            </Button>
          )}
          {order.orderStatus === 'packing' && (
            <Button
              onClick={handleShippingOrder}
              disabled={actionLoading}
              className="bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              Chuyển sang Chờ giao hàng
            </Button>
          )}
          {order.orderStatus === 'shipping' && (
            <Button
              onClick={handleDeliveredOrder}
              disabled={actionLoading}
              className="bg-white text-black border border-gray-300 hover:bg-gray-100"
            >
              Chuyển sang Đã giao
            </Button>
          )}
          {['confirming','packing','shipping'].includes(order.orderStatus) && (
            <Button variant="destructive" onClick={handleCancelOrder} disabled={actionLoading}>Huỷ đơn hàng</Button>
          )}
          <Button variant="outline" onClick={() => router.push('/order/orders')}>Quay lại</Button>
        </div>
      </div>
    </DefaultLayout>
  );
} 