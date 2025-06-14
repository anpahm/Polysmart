"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Product, ProductVariant, Category as BaseCategory } from "@/components/cautrucdata";

interface Category extends BaseCategory {
  video?: string;
}

// Thêm các trường vào Product (nếu dùng typescript type hoặc interface)
declare module "@/components/cautrucdata" {
  interface Product {
    hot?: boolean;
    ngay_tao?: string;
    ban_chay?: number;
  }
}

function getImageUrl(url: string | string[] | undefined | null) {
  if (!url) return "/images/no-image.png";
  if (Array.isArray(url)) url = url[0] || "";
  if (!url) return "/images/no-image.png";
  if (typeof url !== "string") return "/images/no-image.png";
  if (url.startsWith("http")) return url;
  return `http://localhost:3000/images/${url.replace(/^\/?images\//, "")}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

function getDiscountPercent(origin: number, sale: number): number {
  if (!origin || !sale) return 0;
  return Math.round(((origin - sale) / origin) * 100);
}

const reasons = [
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2" className="text-gray-800"><rect x="10" y="5" width="20" height="30" rx="4" fill="white" stroke="currentColor"/><rect x="17" y="32" width="6" height="2" rx="1" fill="currentColor"/></svg>
    ),
    title: "Tiết kiệm với Poly Trade In.",
    desc: "Nhận 4.500.000₫–20.600.000₫ dưới hình thức điểm tín dụng khi bạn trao đổi iPhone 12 trở lên."
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2" className="text-gray-800"><rect x="6" y="10" width="28" height="20" rx="4" fill="white" stroke="currentColor"/><rect x="10" y="20" width="8" height="2" rx="1" fill="currentColor"/></svg>
    ),
    title: "Thanh toán hàng tháng thật dễ dàng.",
    desc: "Bao gồm lựa chọn lãi suất 0%."
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2" className="text-gray-800"><rect x="6" y="14" width="20" height="14" rx="3" fill="white" stroke="currentColor"/><rect x="26" y="20" width="8" height="8" rx="2" fill="white" stroke="currentColor"/><circle cx="12" cy="30" r="2" fill="currentColor"/><circle cx="30" cy="30" r="2" fill="currentColor"/></svg>
    ),
    title: "Giao hàng miễn phí.",
    desc: "Giao hàng miễn phí thẳng đến tận nhà."
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2" className="text-gray-800"><ellipse cx="20" cy="20" rx="14" ry="10" fill="white" stroke="currentColor"/><ellipse cx="28" cy="28" rx="4" ry="3" fill="white" stroke="currentColor"/><circle cx="16" cy="20" r="1.5" fill="currentColor"/><circle cx="24" cy="20" r="1.5" fill="currentColor"/></svg>
    ),
    title: "Mua sắm trực tiếp với Chuyên Gia trực tuyến.",
    desc: "Chọn iPhone mới cho bạn với sự hỗ trợ từ Chuyên Gia trực tuyến."
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2" className="text-gray-800"><rect x="8" y="12" width="24" height="16" rx="3" fill="white" stroke="currentColor"/><circle cx="14" cy="30" r="2" fill="currentColor"/><circle cx="26" cy="30" r="2" fill="currentColor"/></svg>
    ),
    title: "Khám phá trải nghiệm mua sắm được thiết kế dành cho bạn.",
    desc: "Khi bạn mua sắm trong ứng dụng Poly Smart."
  },
  {
    icon: (
      <svg width="40" height="40" fill="none" viewBox="0 0 40 40" stroke="currentColor" strokeWidth="2" className="text-gray-800"><rect x="8" y="16" width="24" height="16" rx="3" fill="white" stroke="currentColor"/><rect x="8" y="12" width="24" height="8" rx="2" fill="white" stroke="currentColor"/><line x1="20" y1="12" x2="20" y2="32" stroke="currentColor" strokeWidth="2"/><circle cx="16" cy="16" r="2" fill="currentColor"/><circle cx="24" cy="16" r="2" fill="currentColor"/></svg>
    ),
    title: "Ưu đãi và quà tặng hấp dẫn.",
    desc: "Nhiều chương trình khuyến mãi, quà tặng khi mua iPhone tại Poly Smart."
  }
];

const CategoryDetailPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const [videoScale, setVideoScale] = useState(1);
  const [current, setCurrent] = useState(0);
  const [sortBy, setSortBy] = useState("hot");
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false);

  const sortOptions = [
    { label: "Mới ra mắt", value: "ngay_tao" },
    { label: "Bán chạy", value: "ban_chay" },
    { label: "Giá thấp đến cao", value: "price-asc" },
    { label: "Giá cao đến thấp", value: "price-desc" },
  ];

  // Extract unique storages and colors for filter options
  const allStorages = React.useMemo(() => {
    const storages = new Set<string>();
    products.forEach(product => {
      product.variants?.forEach(v => {
        if (v.dung_luong) storages.add(v.dung_luong);
      });
    });
    return Array.from(storages).sort();
  }, [products]);

  const allColors = React.useMemo(() => {
    const colors = new Set<string>();
    products.forEach(product => {
      product.variants?.forEach(v => {
        if (v.mau) colors.add(v.mau);
      });
    });
    return Array.from(colors).sort();
  }, [products]);

  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // Filter by price range
    const minP = parseFloat(minPriceFilter);
    const maxP = parseFloat(maxPriceFilter);
    if (!isNaN(minP) && minP >= 0) {
      filtered = filtered.filter(product => {
        const minVariantPrice = Math.min(...(product.variants?.map(v => v.gia) || [product.Gia]));
        return minVariantPrice >= minP;
      });
    }
    if (!isNaN(maxP) && maxP >= 0) {
      filtered = filtered.filter(product => {
        const minVariantPrice = Math.min(...(product.variants?.map(v => v.gia) || [product.Gia]));
        return minVariantPrice <= maxP;
      });
    }

    // Filter by selected storage
    if (selectedStorage) {
      filtered = filtered.filter(product =>
        product.variants?.some(v => v.dung_luong === selectedStorage)
      );
    }

    // Filter by selected color
    if (selectedColor) {
      filtered = filtered.filter(product =>
        product.variants?.some(v => v.mau === selectedColor)
      );
    }

    // Filter by promotion
    if (showPromotionsOnly) {
      filtered = filtered.filter(product =>
        (product.khuyen_mai && product.khuyen_mai > 0) ||
        product.variants?.some(v => v.gia_goc && v.gia_goc > v.gia)
      );
    }

    // Apply sorting (existing logic)
    switch (sortBy) {
      case "ngay_tao":
        filtered.sort((a, b) => {
          const dateA = a.ngay_tao ? new Date(a.ngay_tao).getTime() : 0;
          const dateB = b.ngay_tao ? new Date(b.ngay_tao).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "ban_chay":
        filtered.sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
        break;
      case "price-asc":
        filtered.sort((a, b) => {
          const aMin = Math.min(...(a.variants?.map(v => v.gia) || [a.Gia]));
          const bMin = Math.min(...(b.variants?.map(v => v.gia) || [b.Gia]));
          return aMin - bMin;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const aMin = Math.min(...(a.variants?.map(v => v.gia) || [a.Gia]));
          const bMin = Math.min(...(b.variants?.map(v => v.gia) || [b.Gia]));
          return bMin - aMin;
        });
        break;
      default:
        break;
    }
    return filtered;
  }, [products, minPriceFilter, maxPriceFilter, selectedStorage, selectedColor, showPromotionsOnly, sortBy]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    fetch(`http://localhost:3000/api/categories/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy danh mục");
        return res.json();
      })
      .then((data) => setCategory(data))
      .catch((err) => setError(err.message));
    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.filter((p: Product) => p.id_danhmuc === id));
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!videoWrapperRef.current) return;
      const rect = videoWrapperRef.current.getBoundingClientRect();
      // Khi top của video lên gần sát top màn hình thì scale nhỏ lại
      const minScale = 0.8;
      const shrinkDistance = 220; // px
   
      let scale = 1;
      if (rect.top <=0) {
              const scrolled = Math.min(Math.abs(rect.top), shrinkDistance);
      scale = 1 - (scrolled / shrinkDistance) * (1 - minScale);
      scale = Math.max(minScale, scale);
      }
      setVideoScale(scale);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Số card hiển thị tùy theo màn hình
  const getVisibleCount = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
    }
    return 3;
  };
  const visibleCount = getVisibleCount();
  const maxIndex = reasons.length - visibleCount;

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!category) return <div className="text-center py-20 text-red-500">Không tìm thấy danh mục</div>;

  return (
    <div className="w-screen p-0 m-0 overflow-x-hidden">
      <style>{`
      html, body {
        overflow-x: hidden !important;
      }
      /* Ẩn thanh trượt ngang cho mọi trình duyệt */
      ::-webkit-scrollbar {
        height: 0 !important;
        width: 0 !important;
        background: transparent;
      }
      body {
        overscroll-behavior-x: none;
      }
    `}</style>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[80px] font-bold text-black pb-[63px] pt-[63px]">{category.ten_danh_muc}</h1>
        {category.video ? (
          <div className="w-full flex flex-col items-center mb-8">
            <div
              ref={videoWrapperRef}
              className="sticky top-0 z-20 flex justify-center"
              style={{
                position: "relative",
                width: "100vw",
                minWidth: "100vw",
                maxWidth: "100vw",
                transform: `scale(${videoScale})`,
                transition: "transform 0.3s cubic-bezier(.4,2,.6,1)",
              }}
            >
              <video
                ref={videoRef}
                src={
                  category.video.startsWith('http')
                    ? category.video
                    : `http://localhost:3000/video/${category.video.replace(/^.*[\\/]/, '')}`
                }
                autoPlay
                loop
                muted
                controls={false}
                className="rounded-xl shadow-lg w-screen aspect-video object-cover bg-black"
                style={{ minHeight: 460, maxHeight: '80vh' }}
              />
              <button
                onClick={handlePlayPause}
                className="absolute bottom-8 right-8 bg-white bg-opacity-80 rounded-full p-3 shadow-lg hover:bg-opacity-100 transition"
                style={{ zIndex: 10 }}
              >
                {isPlaying ? (
                  <svg width="24" height="24" fill="none" stroke="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                ) : (
                  <svg width="24" height="24" fill="none" stroke="currentColor"><polygon points="5,3 19,12 5,21 5,3"/></svg>
                )}
              </button>
            </div>
          </div>
        ) : category.banner_dm && (
          <img
            src={getImageUrl(category.banner_dm)}
            alt={category.ten_danh_muc}
            className="w-full max-h-64 object-cover rounded mb-8"
          />
        )}
        <h2 className="text-2xl font-semibold mb-4">Khám Phá Dòng Sản Phẩm</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar for Filters */}
          <div className="lg:w-1/4 p-4 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Bộ lọc</h3>

              {/* Lọc theo giá */}
              <div className="mb-6">
                <label className="block text-base font-semibold mb-2">Giá:</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minPriceFilter}
                    onChange={e => setMinPriceFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                  <span className="mx-2">-</span>
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxPriceFilter}
                    onChange={e => setMaxPriceFilter(e.target.value)}
                    className="border rounded-lg px-3 py-2 w-full"
                  />
                </div>
              </div>

              {/* Lọc theo dung lượng */}
              <div className="mb-6">
                <label className="block text-base font-semibold mb-2">Dung lượng:</label>
                <select
                  value={selectedStorage}
                  onChange={e => setSelectedStorage(e.target.value)}
                  className="border rounded-lg px-3 py-2 bg-white text-black font-semibold w-full"
                >
                  <option value="">Tất cả</option>
                  {allStorages.map(storage => (
                    <option key={storage} value={storage}>{storage}</option>
                  ))}
                </select>
              </div>

              {/* Lọc theo màu sắc */}
              <div className="mb-6">
                <label className="block text-base font-semibold mb-2">Màu sắc:</label>
                <select
                  value={selectedColor}
                  onChange={e => setSelectedColor(e.target.value)}
                  className="border rounded-lg px-3 py-2 bg-white text-black font-semibold w-full"
                >
                  <option value="">Tất cả</option>
                  {allColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Lọc theo khuyến mãi */}
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="promotionsOnly"
                  checked={showPromotionsOnly}
                  onChange={e => setShowPromotionsOnly(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <label htmlFor="promotionsOnly" className="text-base font-semibold ml-2">Chỉ hiển thị khuyến mãi</label>
              </div>
          </div>

          {/* Right Main Content for Sorting and Products */}
          <div className="lg:w-3/4">
              {/* Dropdown sắp xếp */}
              <div className="flex justify-end mb-6">
                  <label className="text-base font-semibold mr-2 mt-2">Xếp theo:</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="border rounded-lg px-4 py-2 bg-white text-black font-semibold"
                    style={{ minWidth: 180 }}
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
              </div>

              {/* Product display */}
              {filteredAndSortedProducts.length === 0 ? (
                  <div className="text-gray-500 text-center py-10">Không tìm thấy sản phẩm nào phù hợp với các tiêu chí lọc.</div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                    {filteredAndSortedProducts.map((product) => {
                      // Lọc các variant đang hiện
                      const visibleVariants = (product.variants || []).filter(v => v.an_hien !== false);
                      const firstVariant = visibleVariants[0];
                      // Tính giá min/max
                      const prices = visibleVariants.map(v => v.gia);
                      const minPrice = prices.length ? Math.min(...prices) : product.Gia;
                      const maxPrice = prices.length ? Math.max(...prices) : product.Gia;
                      // Giá gốc (giá cao nhất trong variants hoặc product.Gia)
                      const originPrice = visibleVariants.length ? Math.max(...visibleVariants.map(v => v.gia_goc || v.gia)) : product.Gia;
                      // Giá khuyến mãi (giá thấp nhất trong variants hoặc product.Gia)
                      const salePrice = minPrice;
                      // Phần trăm giảm giá
                      const discount = getDiscountPercent(originPrice, salePrice);
                      // Tổng số lượng còn lại
                      const totalStock = visibleVariants.reduce((sum, v) => sum + (v.so_luong_hang || 0), 0);
                      // Dung lượng và màu của variant đầu tiên
                      const dungLuong = firstVariant?.dung_luong || "";
                      const mau = firstVariant?.mau || "";
                      return (
                        <div
                          key={product._id}
                          className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl duration-300 relative"
                        >
                          {/* Badge giảm giá */}
                          {(product.khuyen_mai ?? 0) > 0 && (
                            <div className="absolute top-3 left-3 z-10">
                              <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                                Giảm {product.khuyen_mai}%
                              </span>
                            </div>
                          )}
                          {/* Badge trả góp hoặc Sold out */}
                          {totalStock === 0 ? (
                            <div className="absolute top-3 right-3 z-10">
                              <img src="/images/het_hang.png" alt="Sold out" className="w-12 h-12 object-contain" />
                            </div>
                          ) : (
                            <div className="absolute top-3 right-3 z-10">
                              <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded shadow-sm">
                                Trả góp 0%
                              </span>
                            </div>
                          )}
                          <Link href={`/product/${product._id}`}>
                            {/* Ảnh sản phẩm */}
                            <div className="relative pt-[100%] overflow-hidden">
                              <img
                                src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                                alt={product.TenSP}
                                className="object-contain p-4 absolute top-0 left-0 w-full h-full"
                              />
                            </div>
                            {/* Thông tin sản phẩm */}
                            <div className="p-4">
                              <h3 className="text-[16px] font-bold mb-2 min-h-[2.5rem] text-gray-800 hover:text-black-600">
                                {product.TenSP}
                                {visibleVariants[0]?.dung_luong ? ` ${visibleVariants[0].dung_luong}` : ""}
                              </h3>
                              {/* Giá */}
                              <div className="flex gap-2 items-start mb-1">
                                {totalStock === 0 ? (
                                  <span className="text-[15px] font-bold text-red-500">Liên hệ</span>
                                ) : (
                                  <>
                                    <span className="text-[15px] font-bold text-[#0066D6]">
                                      {formatCurrency(salePrice)}
                                    </span>
                                    {originPrice > salePrice && (
                                      <span className="text-[14px] text-gray-700 line-through">
                                        {formatCurrency(originPrice)}
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
              )}
          </div>
        </div>
        {/* Section: Lý do mua hàng */}
        <section className="mt-16 mb-8">
          <h2 className="text-4xl font-bold text-center mb-12">Vì sao Poly Smart là nơi tốt nhất để mua iPhone.</h2>
          <div className="relative max-w-6xl mx-auto">
            {/* Nút chuyển trái */}
            <button
              onClick={() => setCurrent((prev) => Math.max(prev - 1, 0))}
              disabled={current === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-100 rounded-full p-3 shadow hover:bg-gray-200 transition disabled:opacity-50"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Nút chuyển phải */}
            <button
              onClick={() => setCurrent((prev) => Math.min(prev + 1, maxIndex))}
              disabled={current >= maxIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-100 rounded-full p-3 shadow hover:bg-gray-200 transition disabled:opacity-50"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {/* Slider */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ transform: `translateX(-${current * (100 / visibleCount)}%)` }}
              >
                {reasons.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl shadow p-8 flex flex-col justify-between min-h-[200px] mx-2"
                    style={{ minWidth: `calc(100% / ${visibleCount})`, maxWidth: `calc(100% / ${visibleCount})` }}
                  >
                    <div className="text-4xl mb-4">{item.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                    <div className="flex justify-end mt-4"><span className="bg-gray-200 rounded-full p-2 text-xl">＋</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryDetailPage;


