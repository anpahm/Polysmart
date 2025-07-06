"use client";

import { useEffect, useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Order {
  _id: string;
  customerInfo: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    email?: string;
  };
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
}

interface OrderDetail extends Order {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    name?: string;
    image?: string;
    colorName?: string;
  }>;
  updatedAt: string;
  transferContent?: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    branch?: string;
  };
}

const ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const handleRowClick = async (orderId: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      setSelectedOrder(data);
    } catch (err) {
      setSelectedOrder(null);
    }
    setDetailLoading(false);
  };

  // Cập nhật trạng thái thanh toán (xác nhận đơn)
  const handleConfirmOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await fetch(`/api/orders/${selectedOrder._id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' })
      });
      // reload chi tiết đơn
      await handleRowClick(selectedOrder._id);
      // reload danh sách
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setActionLoading(false);
    }
  };

  // Chuyển sang đang giao
  const handleShippingOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'shipping' })
      });
      await handleRowClick(selectedOrder._id);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setActionLoading(false);
    }
  };

  // Chuyển sang hoàn thành
  const handleDeliveredOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'delivered' })
      });
      await handleRowClick(selectedOrder._id);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setActionLoading(false);
    }
  };

  // Hủy đơn
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);
    try {
      await fetch(`/api/orders/${selectedOrder._id}/cancel`, {
        method: 'PUT'
      });
      setSelectedOrder(null);
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } finally {
      setActionLoading(false);
    }
  };

  // Lọc và tìm kiếm trên client
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch =
        order._id.toLowerCase().includes(search.toLowerCase()) ||
        order.customerInfo.fullName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter ? order.orderStatus === statusFilter : true;
      const matchDateFrom = dateFrom ? new Date(order.createdAt) >= new Date(dateFrom) : true;
      const matchDateTo = dateTo ? new Date(order.createdAt) <= new Date(dateTo) : true;
      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  // Xuất CSV
  const handleExportCSV = () => {
    const header = [
      'Mã đơn', 'Khách hàng', 'SĐT', 'Địa chỉ', 'Tổng tiền', 'PT Thanh toán', 'Trạng thái', 'Ngày tạo'
    ];
    const rows = filteredOrders.map(order => [
      order._id,
      order.customerInfo.fullName,
      order.customerInfo.phone,
      `${order.customerInfo.address}, ${order.customerInfo.city}`,
      order.totalAmount,
      order.paymentMethod,
      order.orderStatus,
      new Date(order.createdAt).toLocaleString()
    ]);
    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>
      <div className="flex flex-wrap gap-2 mb-4 items-end">
        <input
          type="text"
          placeholder="Tìm kiếm mã đơn, tên khách..."
          className="border px-2 py-1 rounded"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border px-2 py-1 rounded"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          {ORDER_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <label className="text-sm">Từ ngày:</label>
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />
        <label className="text-sm">Đến ngày:</label>
        <input
          type="date"
          className="border px-2 py-1 rounded"
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />
        <Button onClick={handleExportCSV} variant="outline">Xuất CSV</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>PT Thanh toán</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8}>Đang tải...</TableCell>
            </TableRow>
          ) : filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8}>Không có đơn hàng nào</TableCell>
            </TableRow>
          ) : (
            filteredOrders.map((order) => (
              <TableRow key={order._id} onClick={() => router.push(`/order/orders/${order._id}`)} className="cursor-pointer hover:bg-gray-100">
                <TableCell>{order._id}</TableCell>
                <TableCell>{order.customerInfo.fullName}</TableCell>
                <TableCell>{order.customerInfo.phone}</TableCell>
                <TableCell>{order.customerInfo.address}, {order.customerInfo.city}</TableCell>
                <TableCell>{order.totalAmount.toLocaleString()}₫</TableCell>
                <TableCell>{order.paymentMethod.toUpperCase()}</TableCell>
                <TableCell>{order.orderStatus}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Modal chi tiết đơn hàng */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg min-w-[400px] max-w-[90vw] relative">
            <button className="absolute top-2 right-2 text-xl" onClick={() => setSelectedOrder(null)}>&times;</button>
            {detailLoading ? (
              <div>Đang tải chi tiết...</div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-2">Chi tiết đơn hàng</h2>
                <div className="mb-2"><b>Mã đơn:</b> {selectedOrder._id}</div>
                <div className="mb-2"><b>Khách hàng:</b> {selectedOrder.customerInfo.fullName} ({selectedOrder.customerInfo.phone})</div>
                <div className="mb-2"><b>Địa chỉ:</b> {selectedOrder.customerInfo.address}, {selectedOrder.customerInfo.city}</div>
                <div className="mb-2"><b>Phương thức thanh toán:</b> {selectedOrder.paymentMethod.toUpperCase()}</div>
                <div className="mb-2"><b>Trạng thái thanh toán:</b> {selectedOrder.paymentStatus}</div>
                <div className="mb-2"><b>Trạng thái đơn:</b> {selectedOrder.orderStatus}</div>
                <div className="mb-2"><b>Ngày tạo:</b> {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                <div className="mb-2"><b>Ngày cập nhật:</b> {new Date(selectedOrder.updatedAt).toLocaleString()}</div>
                <div className="mb-2"><b>Mã giao dịch:</b> {selectedOrder.transferContent || '-'}</div>
                {selectedOrder.bankInfo && selectedOrder.paymentMethod === 'atm' && (
                  <div className="mb-2">
                    <b>Thông tin ngân hàng:</b> {selectedOrder.bankInfo.bankName} - {selectedOrder.bankInfo.accountNumber} ({selectedOrder.bankInfo.accountName})<br/>
                    Chi nhánh: {selectedOrder.bankInfo.branch}
                  </div>
                )}
                <div className="mb-2">
                  <b>Sản phẩm:</b>
                  <ul className="list-disc ml-6">
                    {selectedOrder.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name} x{item.quantity} - {item.price.toLocaleString()}₫
                        {item.colorName && ` (${item.colorName})`}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mb-2">
                  <b>SĐT khách:</b> <a href={`tel:${selectedOrder.customerInfo.phone}`} className="text-blue-600 underline">{selectedOrder.customerInfo.phone}</a>
                  <span className="ml-2">|</span>
                  <a href={`mailto:${selectedOrder.customerInfo.email || ''}`} className="text--600 underline" target="_blank" rel="noopener noreferrer">Gửi email</a>
                </div>
                {/* Nút xác nhận thanh toán nếu chưa paid */}
                {selectedOrder.paymentStatus !== 'paid' && (
                  <div className="mb-2">
                    <Button onClick={handleConfirmOrder} disabled={actionLoading}>Xác nhận đã thanh toán</Button>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {selectedOrder.orderStatus === 'pending' && (
                    <Button onClick={handleConfirmOrder} disabled={actionLoading}>Xác nhận đơn</Button>
                  )}
                  {selectedOrder.orderStatus === 'confirmed' && (
                    <Button onClick={handleShippingOrder} disabled={actionLoading}>Chuyển sang Đang giao</Button>
                  )}
                  {selectedOrder.orderStatus === 'shipping' && (
                    <Button onClick={handleDeliveredOrder} disabled={actionLoading}>Chuyển sang Hoàn thành</Button>
                  )}
                  {['pending','confirmed','shipping'].includes(selectedOrder.orderStatus) && (
                    <Button variant="destructive" onClick={handleCancelOrder} disabled={actionLoading}>Hủy đơn</Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders; 