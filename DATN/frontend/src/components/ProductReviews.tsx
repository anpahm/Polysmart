import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';


//bình luận đánh giá sp
interface ImageReview {
  duong_dan_anh: string;
  ghi_chu?: string;
}

interface Review {
  _id: string;
  ma_nguoi_dung: {
    _id: string;
    TenKH?: string;
    email: string;
    avatar?: string;
  };
  ma_san_pham: string;
  so_sao: number;
  binh_luan: string;
  ngay_danh_gia: string;
  images?: ImageReview[];
  phan_hoi?: string;
}

interface ProductReviewsProps {
  ma_san_pham: string;
  ma_nguoi_dung: string;
}

// Hàm chuẩn hóa đường dẫn ảnh review
const API_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:3000";
const getImageUrl = (url: string) => {
  // Nếu là URL đầy đủ, thay thế /api/images/ thành /images/
  if (url.startsWith('http')) {
    return url.replace('/api/images/', '/images/');
  }
  // Nếu bắt đầu bằng /api/images/, thay thành /images/
  if (url.startsWith('/api/images/')) {
    return `${API_BASE_URL}/images/${url.split('/api/images/')[1]}`;
  }
  // Nếu bắt đầu bằng /images/, thêm domain
  if (url.startsWith('/images/')) {
    return `${API_BASE_URL}${url}`;
  }
  // Trường hợp còn lại
  return `${API_BASE_URL}/images/reviews/${url}`;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ ma_san_pham, ma_nguoi_dung }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [soSao, setSoSao] = useState<number>(5);
  const [binhLuan, setBinhLuan] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [product, setProduct] = useState(null);
  const [replyInputs, setReplyInputs] = useState<{ [id: string]: string }>({});

  const user = useSelector((state: RootState) => state.user?.user);
  const userId = user?._id;
//   console.log('userId:', userId);

//   console.log('product._id:', ma_san_pham, 'userId:', ma_nguoi_dung);

  // Lấy danh sách đánh giá
  useEffect(() => {
    if (!ma_san_pham) return;
    setLoading(true);
    axios.get(`/api/reviews?ma_san_pham=${ma_san_pham}`)
      .then(res => setReviews(res.data))
      .finally(() => setLoading(false));
  }, [ma_san_pham, refresh]);

  // Upload ảnh (chỉ lưu file vào state, không upload ngay)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  // Gửi đánh giá
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Bạn cần đăng nhập để đánh giá!');
    // 1. Gửi đánh giá trước, không gửi ảnh
    const res = await axios.post('/api/reviews', {
      ma_nguoi_dung: user._id,
      ma_san_pham,
      so_sao: soSao,
      binh_luan: binhLuan
    });
    const reviewId = res.data.reviewId;
    // 2. Nếu có ảnh, upload từng ảnh với ma_danh_gia
    if (images.length > 0) {
      setUploading(true);
      for (let file of images) {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('ma_danh_gia', reviewId);
        await axios.post('/api/upload-review-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setUploading(false);
    }
    // 3. Reset form và refresh
    setSoSao(5);
    setBinhLuan('');
    setImages([]);
    setRefresh(r => r + 1);
  };

  const handleReply = async (parentId: string) => {
    if (!user) return alert('Bạn cần đăng nhập để phản hồi!');
    const reply = replyInputs[parentId];
    if (!reply) return;
    await axios.post('/api/reviews', {
      ma_nguoi_dung: user._id,
      ma_san_pham,
      so_sao: 5,
      binh_luan: reply,
      parent_id: parentId
    });
    setReplyInputs(inputs => ({ ...inputs, [parentId]: '' }));
    setRefresh(r => r + 1);
  };

  // Tính toán tổng điểm và bộ lọc
  const total = reviews.length;
  const avgRating = total ? (reviews.reduce((sum, r) => sum + r.so_sao, 0) / total).toFixed(1) : 0;
  const countByStar = [5, 4, 3, 2, 1].map(star => reviews.filter(r => r.so_sao === star).length);
  const [filter, setFilter] = useState<'all' | number>('all');
  const [showImageOnly, setShowImageOnly] = useState(false);
  let filtered = reviews;
  if (filter !== 'all') filtered = filtered.filter(r => r.so_sao === filter);
  if (showImageOnly) filtered = filtered.filter(r => r.images && r.images.length > 0);

  return (
    <div className="bg-white rounded-xl p-8 shadow border">
      {/* Form đánh giá - chỉ hiện khi đã đăng nhập */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-lg bg-gray-50">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Đánh giá của bạn</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSoSao(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= soSao ? 'text-yellow-400' : 'text-gray-300'
                    } cursor-pointer hover:text-yellow-400 transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-gray-600">{soSao} sao</span>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Bình luận của bạn
            </label>
            <textarea
              value={binhLuan}
              onChange={e => setBinhLuan(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              required
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Thêm hình ảnh
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed hover:bg-gray-100 hover:border-gray-300">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg className="w-12 h-12 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                    Chọn hình ảnh
                  </p>
                </div>
                <input type="file" className="opacity-0" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            {uploading && (
              <div className="mt-2 flex items-center text-blue-500">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang tải ảnh lên...
              </div>
            )}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {images.map((file, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </form>
      )}

      {/* Thông báo đăng nhập nếu chưa đăng nhập */}
      {!user && (
        <div className="mb-8 p-4 border rounded bg-gray-50">
          <p className="text-gray-600 mb-2">Bạn cần <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để đánh giá sản phẩm này.</p>
        </div>
      )}

      {/* Thống kê và bộ lọc */}
      <div className="mb-6">
        <div className="text-xl font-bold mb-2">ĐÁNH GIÁ SẢN PHẨM</div>
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center mr-8">
            <span className="text-4xl font-bold text-yellow-500">{avgRating} <span className="text-lg text-gray-500 font-normal">trên 5</span></span>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 mb-2">
              <button className={`px-3 py-1 rounded border ${filter==='all'?'bg-yellow-500 text-white':'bg-white text-gray-700'}`} onClick={()=>setFilter('all')}>Tất Cả</button>
              {[5,4,3,2,1].map((star,i)=>(
                <button key={star} className={`px-3 py-1 rounded border ${filter===star?'bg-yellow-500 text-white':'bg-white text-gray-700'}`} onClick={()=>setFilter(star)}>{star} Sao ({countByStar[i]})</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className={`px-3 py-1 rounded border ${!showImageOnly?'bg-gray-200':''} text-gray-700`} onClick={()=>setShowImageOnly(false)}>Có Bình Luận ({reviews.length})</button>
              <button className={`px-3 py-1 rounded border ${showImageOnly?'bg-gray-200':''} text-gray-700`} onClick={()=>setShowImageOnly(true)}>Có Hình Ảnh / Video ({reviews.filter(r=>r.images && r.images.length>0).length})</button>
            </div>
          </div>
        </div>
      </div>
      {/* Danh sách đánh giá */}
      <div className="flex flex-col gap-8">
        {loading && <div>Đang tải đánh giá...</div>}
        {!loading && filtered.length === 0 && <div className="text-gray-500 text-center">Chưa có đánh giá phù hợp</div>}
        {filtered.map(r => (
          <div key={r._id} className="flex gap-4 border-b pb-6">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {r.ma_nguoi_dung && r.ma_nguoi_dung.avatar ? (
                <img src={getImageUrl(r.ma_nguoi_dung.avatar)} alt={r.ma_nguoi_dung.TenKH || r.ma_nguoi_dung.email || 'avatar'} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2.5a5.5 5.5 0 00-3.096 10.047 9.005 9.005 0 00-5.9 8.18.75.75 0 001.5.045 7.5 7.5 0 0114.993 0 .75.75 0 001.499-.044 9.005 9.005 0 00-5.9-8.181A5.5 5.5 0 0012 2.5zM8 8a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{r.ma_nguoi_dung?.TenKH || r.ma_nguoi_dung?.email || 'Ẩn danh'}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < r.so_sao ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">{new Date(r.ngay_danh_gia).toLocaleDateString('vi-VN', {
                  year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</span>
              </div>
              <p className="text-gray-800 mb-3 text-[15px]">{r.binh_luan}</p>
              {r.images && r.images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {r.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={getImageUrl(img.duong_dan_anh)}
                        alt={img.ghi_chu || 'review'}
                        className="w-[70px] h-[70px] object-contain bg-white border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* PHẢN HỒI QTV */}
              {r.phan_hoi && (
                <div className="flex gap-3 mt-4 ml-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-500">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm-1-13h2v6h-2zm0 8h2v2h-2z" /></svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">Quản Trị Viên</span>
                      <span className="ml-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">QTV</span>
                    </div>
                    <div className="bg-gray-100 rounded px-3 py-2 mt-1 text-gray-800">{r.phan_hoi}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
