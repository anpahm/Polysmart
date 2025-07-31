"use client";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

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
      
      // Debug: Log dữ liệu để kiểm tra
      console.log('Fetched reviews:', arr.map(r => ({
        id: r._id,
        user: r.ma_nguoi_dung,
        userType: typeof r.ma_nguoi_dung,
        product: r.ma_san_pham
      })));
      
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
      // Xóa input sau khi gửi
      setReplyInputs(inputs => ({ ...inputs, [id]: '' }));
    } catch (err) {
      alert('Lỗi khi gửi phản hồi!');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        const res = await fetch(`http://localhost:3000/api/reviews/${id}`, { 
          method: 'DELETE' 
        });
        if (res.ok) {
          alert('Đã xóa đánh giá thành công!');
          fetchReviews();
        } else {
          alert('Lỗi khi xóa đánh giá!');
        }
      } catch (err) {
        alert('Lỗi khi xóa đánh giá!');
      }
    }
  };

  const [replyInputs, setReplyInputs] = useState<{ [id: string]: string }>({});

  // Hàm render sao
  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  return (
    <>
      <Breadcrumb pageName="Quản lý đánh giá sản phẩm" />
      
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex-1">
            <input
              className="w-full md:w-80 border border-stroke rounded-lg px-4 py-2 focus:outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
              placeholder="Tìm kiếm theo sản phẩm, user, bình luận..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={fetchReviews}
            className="bg-primary hover:bg-opacity-90 text-white px-6 py-2 rounded-lg"
          >
            Làm mới
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-600">Đang tải...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-meta-4">
                  <TableHead className="font-semibold text-black dark:text-white">STT</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Sản phẩm</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Người dùng</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Số sao</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Bình luận</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Ngày đánh giá</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Ảnh</TableHead>
                  <TableHead className="font-semibold text-black dark:text-white">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((r, idx) => (
                  <TableRow key={r._id} className="border-b border-gray-200 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-black dark:text-white">
                      {typeof r.ma_san_pham === "object" && r.ma_san_pham ? r.ma_san_pham.TenSP : r.ma_san_pham}
                    </TableCell>
                    <TableCell className="text-black dark:text-white">
                      {(() => {
                        if (typeof r.ma_nguoi_dung === "object" && r.ma_nguoi_dung) {
                          return r.ma_nguoi_dung.TenKH || r.ma_nguoi_dung.email || 'N/A';
                        }
                        return r.ma_nguoi_dung || 'N/A';
                      })()}
                    </TableCell>
                    <TableCell className="text-yellow-500 font-semibold">
                      {renderStars(r.so_sao)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="text-black dark:text-white break-words">
                        {r.binh_luan}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(r.ngay_danh_gia).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      {r.images && r.images.length > 0 ? (
                        <div className="flex gap-1">
                          {r.images.map((img, imgIdx) => (
                            <img 
                              key={imgIdx} 
                              src={`http://localhost:3000${img.duong_dan_anh}`} 
                              alt="Ảnh review" 
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 hover:scale-110 transition-transform cursor-pointer" 
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        {/* Phản hồi hiện tại */}
                        {r.phan_hoi && (
                          <div className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <strong>Phản hồi:</strong> {r.phan_hoi}
                          </div>
                        )}
                        
                        {/* Input phản hồi */}
                        <input
                          className="border border-stroke rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                          placeholder="Nhập phản hồi..."
                          value={replyInputs[r._id] ?? ''}
                          onChange={e => setReplyInputs(inputs => ({ ...inputs, [r._id]: e.target.value }))}
                        />
                        
                        {/* Các nút hành động */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleReply(r._id, replyInputs[r._id] || '')} 
                            disabled={!replyInputs[r._id]}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-xs"
                          >
                            Gửi
                          </Button>
                          
                          <Button 
                            variant={r.an_hien ? 'destructive' : 'default'} 
                            size="sm" 
                            onClick={() => handleToggleHide(r._id)}
                            className="px-3 py-1 text-xs"
                          >
                            {r.an_hien ? 'Ẩn' : 'Hiện'}
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(r._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredReviews.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-lg">Không có đánh giá nào.</div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReviewAdminPage; 