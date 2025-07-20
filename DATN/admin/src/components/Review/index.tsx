"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Review {
  _id: string;
  ma_nguoi_dung: { TenKH: string; email: string } | string;
  ma_san_pham: { TenSP: string } | string;
  so_sao: number;
  binh_luan: string;
  ngay_danh_gia: string;
  images?: { duong_dan_anh: string }[];
  an_hien: boolean;
  phan_hoi?: string;
}

const ReviewAdminPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/reviews/all");
      const data = await res.json();
      // Đảm bảo luôn là mảng
      const arr = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
      setReviews(arr);
    } catch (err) {
      setError("Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(r =>
    r.binh_luan.toLowerCase().includes(search.toLowerCase()) ||
    (typeof r.ma_san_pham === "object" && r.ma_san_pham.TenSP?.toLowerCase().includes(search.toLowerCase())) ||
    (typeof r.ma_nguoi_dung === "object" && r.ma_nguoi_dung.TenKH?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleHide = async (id: string) => {
    try {
      await fetch(`http://localhost:3000/api/reviews/${id}/toggle-hide`, { method: 'PATCH' });
      fetchReviews();
    } catch (err) {
      alert('Lỗi khi cập nhật trạng thái ẩn/hiện!');
    }
  };

  const handleReply = async (id: string, reply: string) => {
    try {
      await fetch(`http://localhost:3000/api/reviews/${id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phan_hoi: reply })
      });
      fetchReviews();
    } catch (err) {
      alert('Lỗi khi gửi phản hồi!');
    }
  };

  const [replyInputs, setReplyInputs] = useState<{ [id: string]: string }>({});

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Quản lý đánh giá sản phẩm</h2>
      <div className="flex gap-4 mb-4">
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Tìm kiếm theo sản phẩm, user, bình luận..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button onClick={fetchReviews}>Làm mới</Button>
      </div>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>STT</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Người dùng</TableHead>
                <TableHead>Số sao</TableHead>
                <TableHead>Bình luận</TableHead>
                <TableHead>Ngày đánh giá</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead>Ẩn/Hiện</TableHead>
                <TableHead>Phản hồi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((r, idx) => (
                <TableRow key={r._id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{typeof r.ma_san_pham === "object" ? r.ma_san_pham.TenSP : r.ma_san_pham}</TableCell>
                  <TableCell>{typeof r.ma_nguoi_dung === "object" ? r.ma_nguoi_dung.TenKH : r.ma_nguoi_dung}</TableCell>
                  <TableCell>{r.so_sao} ⭐</TableCell>
                  <TableCell>{r.binh_luan}</TableCell>
                  <TableCell>{new Date(r.ngay_danh_gia).toLocaleString("vi-VN")}</TableCell>
                  <TableCell>
                    {r.images && r.images.length > 0 ? (
                      <div className="flex gap-2">
                        {r.images.map((img, imgIdx) => (
                          <img key={imgIdx} src={`http://localhost:3000${img.duong_dan_anh}`} alt="Ảnh review" className="w-12 h-12 object-cover rounded" />
                        ))}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant={r.an_hien ? 'destructive' : 'default'} size="sm" onClick={() => handleToggleHide(r._id)}>
                      {r.an_hien ? 'Ẩn' : 'Hiện'}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {r.phan_hoi && <div className="text-green-700 text-sm bg-green-50 rounded px-2 py-1">Phản hồi: {r.phan_hoi}</div>}
                      <input
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Nhập phản hồi..."
                        value={replyInputs[r._id] ?? ''}
                        onChange={e => setReplyInputs(inputs => ({ ...inputs, [r._id]: e.target.value }))}
                      />
                      <Button size="sm" onClick={() => handleReply(r._id, replyInputs[r._id] || '')} disabled={!replyInputs[r._id]}>Gửi</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredReviews.length === 0 && <div className="text-center text-gray-500 py-8">Không có đánh giá nào.</div>}
        </div>
      )}
    </div>
  );
};

export default ReviewAdminPage; 