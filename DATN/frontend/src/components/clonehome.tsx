'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Category, Product, ProductVariant, Banner, HomePageData } from './cautrucdata';
import { getApiUrl } from '@/config/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Navigation, Autoplay } from 'swiper/modules';
import { Fullscreen } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

interface FlashSale {
  _id: string;
  id_san_pham: Product;
  id_variant: ProductVariant;
  gia_flash_sale: number;
  so_luong_flash_sale: number;
  da_ban: number;
  start_time: string;
  end_time: string;
  trang_thai: boolean;
  phan_tram_giam_gia?: number;
}

interface NewsItem {
  _id: string;
  tieu_de: string;
  mo_ta: string;
  ngay: string;
  hinh: string;
  luot_xem?: number;
}

const getImageUrl = (url: string | string[]) => {
  // Log để debug
  console.log('Original image URL:', url);
  
  // Nếu url là mảng, lấy phần tử đầu tiên
  if (Array.isArray(url)) {
    url = url[0];
  }
  
  // Nếu là URL đầy đủ (http/https), giữ nguyên
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Thêm domain của backend cho các đường dẫn hình ảnh
  const backendUrl = process.env.NEXT_PUBLIC_IMAGE_URL;
  
  // Xử lý đường dẫn tương đối ../images
  if (url.startsWith('../images/')) {
    return url.replace('../images', '/images');
  }
  
  // Nếu url bắt đầu bằng /images, thêm domain backend
  if (url.startsWith('/images/')) {
    return `${backendUrl}${url}`;
  }
  
  // Trường hợp còn lại, giả định là tên file trong thư mục images
  return `${backendUrl}/images/${url}`;
};

const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('images', file);
  
  const response = await fetch(getApiUrl('upload'), {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  return data.path; // Đường dẫn hình ảnh đã upload
}

const HomePage = () => {
  // State cho banner slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const [data, setData] = useState<{
    flashSaleProducts: FlashSale[];
    iPhoneProducts: Product[];
    iPadProducts: Product[];
    WatchProducts: Product[];
    categories: Category[];
  }>({
    flashSaleProducts: [],
    iPhoneProducts: [],
    iPadProducts: [],
    WatchProducts: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [countdown, setCountdown] = useState<{days: number, hours: number, minutes: number, seconds: number}>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });
  const [iphoneSlide, setIphoneSlide] = useState(0);
  const productsPerSlide = 4;
  const totalSlides = Math.ceil(data.iPhoneProducts.length / productsPerSlide);
  const [news, setNews] = useState<NewsItem[]>([]);

  // Tính thời gian kết thúc flash sale 
useEffect(() => {
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 2); 

  const updateCountdown = () => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    setCountdown({ days, hours, minutes, seconds });
  };

  updateCountdown();
  const interval = setInterval(updateCountdown, 1000);
  return () => clearInterval(interval);
}, []);


  // Fetch settings and create banner objects
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl('settings'));
        const settingsData = await response.json();
        console.log('settingsData:', settingsData);
        const settingObj = Array.isArray(settingsData) ? settingsData[0] : settingsData;
        setSettings(settingObj);
        
        console.log('settingsData[0]:', settingObj);
        console.log('Banner:', settingObj?.Banner);
        
        if (settingObj && settingObj.Banner) {
          const bannerImages = settingObj.Banner.split('|');
          setBanners(bannerImages.map((img: string, index: number) => ({
            id: index + 1,
            image: getImageUrl(img),
            title: '',
            subtitle: '',
            link: '/mac/macbook-air',
          })));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    
    fetchSettings();
  }, []);

  const [banners, setBanners] = useState<Banner[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch flash sale products từ backend mới
        const flashSaleResponse = await fetch(getApiUrl('flashsales'));
        const flashSaleData = await flashSaleResponse.json();
        const flashSaleProducts: FlashSale[] = Array.isArray(flashSaleData.data) ? flashSaleData.data : [];

        // Fetch iPhone products
        const IPHONE_CATEGORY_ID = '681d97db2a400db1737e6de3';
        const iPhoneResponse = await fetch(getApiUrl(`products?id_danhmuc=${IPHONE_CATEGORY_ID}&limit=10`));
        const iPhoneData = await iPhoneResponse.json();
        
        // Fetch iPad products
        const IPAD_CATEGORY_ID = '681d97db2a400db1737e6de4';
        const iPadResponse = await fetch(getApiUrl(`products?id_danhmuc=${IPAD_CATEGORY_ID}&limit=10`));
        const iPadData = await iPadResponse.json();

        // Fetch Watch products
        const WATCH_CATEGORY_ID = '681d97db2a400db1737e6de6';
        const WatchResponse = await fetch(getApiUrl(`products?id_danhmuc=${WATCH_CATEGORY_ID}&limit=10`));
        const WatchData = await WatchResponse.json();
        
        // Fetch categories
        const categoriesResponse = await fetch(getApiUrl('categories'));
        const categoriesData = await categoriesResponse.json();

        console.log('iPhone Products Data:', iPhoneData);

        setData({
          flashSaleProducts: flashSaleProducts,
          iPhoneProducts: Array.isArray(iPhoneData) ? iPhoneData.filter(product => 
            product.id_danhmuc === IPHONE_CATEGORY_ID
          ).slice(0, 10) : [],
          iPadProducts: Array.isArray(iPadData) ? iPadData.filter(product => 
            product.id_danhmuc === IPAD_CATEGORY_ID
          ).slice(0, 10) : [],
          WatchProducts: Array.isArray(WatchData) ? WatchData.filter(product => 
            product.id_danhmuc === WATCH_CATEGORY_ID
          ).slice(0, 10) : [],
          categories: categoriesData || []
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setData({
          flashSaleProducts: [],
          iPhoneProducts: [],
          iPadProducts: [],
          WatchProducts: [],
          categories: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto chuyển slide sau 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 9000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Hàm format tiền VND
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
  };

  // Tính phần trăm giảm giá
  const calculateDiscount = (original: number, sale: number): number => {
    return Math.round(((original - sale) / original) * 100);
  };

  // Hàm hiển thị thông tin variant
  const renderVariantInfo = (variants: ProductVariant[] | undefined) => {
    if (!variants || variants.length === 0) return null;

    // Nhóm các variants theo dung lượng
    const variantsByStorage = variants.reduce((acc, variant) => {
      if (!acc[variant.dung_luong]) {
        acc[variant.dung_luong] = [];
      }
      acc[variant.dung_luong].push(variant);
      return acc;
    }, {} as Record<string, ProductVariant[]>);

    return (
      <div className="mt-3 space-y-2">
        {Object.entries(variantsByStorage).map(([storage, storageVariants]) => (
          <div key={storage} className="space-y-1">
            <div className="text-xs font-medium text-gray-700">{storage}</div>
            <div className="flex flex-wrap gap-1">
              {storageVariants.map((variant) => (
                <div
                  key={variant._id}
                  className="relative group"
                >
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-md 
                    ${variant.so_luong_hang > 0 
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                      : 'bg-gray-100 text-gray-400'}`}
                  >
                    {variant.mau}
                  </span>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
                    bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 whitespace-nowrap z-10">
                    {formatCurrency(variant.gia)}
                    {variant.so_luong_hang === 0 && ' - Hết hàng'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hàm hiển thị giá thấp nhất và cao nhất của variants (trả về object)
  const getPriceRange = (variants: ProductVariant[] | undefined) => {
    if (!variants || variants.length === 0) return null;
    const prices = variants.map(v => v.gia);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return { minPrice, maxPrice };
  };

  // Fetch news data
  useEffect(() => {
    fetch("http://localhost:3000/api/news")
      .then(res => res.json())
      .then((data: NewsItem[]) => setNews(data));
  }, []);

  if (loading) {
    return <div className="mt-16 flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
    
  }


  return (
    <div className="mt-0">
      {/* Banner Slider */}
      <div className="container mx-auto overflow-hidden">
        <div className="relative w-full" style={{ height: '475px' }}>
          <div className="flex transition-transform duration-700 ease-in-out h-full"
            style={{
              width: `${banners.length * 100}%`,
              transform: `translateX(-${currentSlide * (100 / banners.length)}%)`
            }}>
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className="w-full flex-shrink-0 h-full relative"
                style={{ width: `${100 / banners.length}%` }}
              >
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>
          {/* Nút chuyển slide banner */}
          <button
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow z-10"
            onClick={() => setCurrentSlide((prev) => prev === 0 ? banners.length - 1 : prev - 1)}
            aria-label="Previous slide"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
            
              <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 rounded-full p-2 shadow z-10"
            onClick={() => setCurrentSlide((prev) => prev === banners.length - 1 ? 0 : prev + 1)}
            aria-label="Next slide"
          >
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600">
              <path d="M9 5l7 7-7 7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Dots nằm đè lên banner */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex">
            {banners.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full mx-1 ${idx === currentSlide ? 'bg-blue-600' : 'bg-gray-300'}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Flash Sale Section */}
      <section className="py-0 pt-10">
        <div className="container mx-auto px-40">
          <div className="bg-gradient-to-r from-red-600 to-pink-500 rounded-2xl p-8 shadow-xl overflow-hidden relative">
            {/* Background pattern - Thêm họa tiết nền */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32 animate-pulse"></div>

            {/* Header with timer - Phần tiêu đề và đếm ngược */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="flex items-center">
                  <span className="text-yellow-300 text-4xl animate-bounce">⚡</span>
                  <h2 className="text-4xl md:text-5xl font-bold text-white tracking-wider mx-3">FLASH SALE</h2>
                  <span className="text-yellow-300 text-4xl animate-bounce">⚡</span>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2 flex flex-col items-center">
                  <span className="text-white text-sm mb-1">Kết thúc sau</span>
                  <span className="text-white text-lg font-bold tracking-widest">
                    {countdown.days}d : {countdown.hours}h : {countdown.minutes}m : {countdown.seconds}s
                  </span>
                </div>
              </div>
              <Link href="/flash-sale" className="bg-white text-red-600 px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all duration-300">
                Xem tất cả
              </Link>
            </div>

            {/* Products grid - Lưới sản phẩm */}
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              spaceBetween={20}
              slidesPerView={5}
              slidesPerGroup={5}
              loop={true}
              speed={1500}
              cssMode={true}
              autoplay={{
                delay: 10000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  slidesPerGroup: 1,
                },
                640: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                },
                1280: {
                  slidesPerView: 5,
                  slidesPerGroup: 5,
                },
              }}
              className="mySwiper"
            >
              {data.flashSaleProducts.map((flashSale) => {
                const product = flashSale.id_san_pham;
                const variant = flashSale.id_variant;
                return (
                  <SwiperSlide key={flashSale._id}>
                    <Link
                      href={`/product/${product._id}`}
                      className="bg-white rounded-2xl overflow-hidden shadow border hover:shadow-xl transition-all duration-300 group relative w-[285px] h-[410px] block"
                    >
                      {/* Badge Flash Sale bên trái */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">Flash Sale</span>
                      </div>
                      {/* Badge % giảm giá bên phải */}
                      {flashSale.phan_tram_giam_gia && (
                        <div className="absolute top-3 right-3 z-10">
                          <span className="bg-yellow-400 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">-{flashSale.phan_tram_giam_gia}%</span>
                        </div>
                      )}
                      {/* Ảnh sản phẩm */}
                      <div className="relative flex items-center justify-center pt-10 bg-white">
                        <Image
                          src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                          alt={product.TenSP}
                          fill
                          className="object-contain p-4"
                        />
                      </div>
                      
                      {/* Thông tin sản phẩm */}
                      <div className="p-4">
                        <h3 className="text-sm text-[16px] mb-2 line-clamp-2 min-h-[2.5rem] text-gray-800 hover:text-red-600">
                          {product.TenSP} {variant.dung_luong}
                        </h3>
                        <div className="space-y-2">
                          <div className="flex flex-col items-start space-y-1">
                            <span className="text-lg font-bold text-red-600">
                              {formatCurrency(flashSale.gia_flash_sale)}
                            </span>
                            {variant.gia && flashSale.gia_flash_sale !== variant.gia && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatCurrency(variant.gia)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </section>

      {/* iPhone Section */}
      <section className="section">
        <div className="container mx-auto px-40">
          <div className="section-header flex justify-between items-center mb-6">
            <h2 className="section-title text-2xl font-bold">iPhone</h2>
            <Link href="/" className="section-link text-blue-600 font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              spaceBetween={20}
              slidesPerView={4}
              slidesPerGroup={4}
              loop={true}
              speed={800}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  slidesPerGroup: 1,
                },
                640: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                }
              }}
              className="mySwiper"
            >
              {data.iPhoneProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow border hover:shadow-xl transition-all duration-300 group relative w-[285px] h-[410px] block"
                  >
                    {/* Badge giảm giá */}
                    {(product.khuyen_mai ?? 0) > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                          Giảm {product.khuyen_mai}%
                        </span>
                      </div>
                    )}
                    {/* Badge trả góp */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded shadow-sm">
                        Trả góp 0%
                      </span>
                    </div>
                    {/* Ảnh sản phẩm */}
                    <div className="relative flex items-center justify-center pt-10 bg-white">
                      <Image
                        src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                        alt=""
                        width="0"
                        height="0"
                        className="w-[280px] h-[280px]"
                      />
                    </div>
                    {/* Thông tin sản phẩm */}
                    <div className="flex flex-col pl-4">
                      <h3 className="text-[18px] font-bold mb-3 text-black min-h-[2.5rem]">
                        {product.TenSP}
                        {product.variants && product.variants.length > 0 && (
                          ` ${product.variants[0].dung_luong}`
                        )}
                      </h3>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#0066D6]">
                          {(() => {
                            const priceRange = getPriceRange(product.variants);
                            if (priceRange) {
                              const { minPrice } = priceRange;
                              return formatCurrency(minPrice);
                            }
                            return formatCurrency(product.Gia * (1 - (product.khuyen_mai || 0) / 100));
                          })()}
                        </span>
                        {/* Giá gốc nếu có */}
                        {(() => {
                          const priceRange = getPriceRange(product.variants);
                          if (priceRange && priceRange.maxPrice > priceRange.minPrice) {
                            return (
                              <span className="text-gray-400 line-through text-[14px]">
                                {formatCurrency(priceRange.maxPrice)}
                              </span>
                            );
                          }
                          if (product.khuyen_mai) {
                            return (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(product.Gia)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* iPad Section */}
      <section className="section">
        <div className="container mx-auto px-40">
          <div className="section-header flex justify-between items-center mb-6">
            <h2 className="section-title text-2xl font-bold">iPad</h2>
            <Link href="/" className="section-link text-blue-600 font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              spaceBetween={20}
              slidesPerView={4}
              slidesPerGroup={4}
              loop={true}
              speed={800}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  slidesPerGroup: 1,
                },
                640: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                }
              }}
              className="mySwiper"
            >
              {data.iPadProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow border hover:shadow-xl transition-all duration-300 group relative w-[285px] h-[410px] block"
                  >
                    {/* Badge giảm giá */}
                    {(product.khuyen_mai ?? 0) > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                          Giảm {product.khuyen_mai}%
                        </span>
                      </div>
                    )}
                    {/* Badge trả góp */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded shadow-sm">
                        Trả góp 0%
                      </span>
                    </div>
                    {/* Ảnh sản phẩm */}
                    <div className="relative flex items-center justify-center pt-10 bg-white">
                      <Image
                        src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                        alt=""
                        width="0"
                        height="0"
                        className="w-[280px] h-[280px]"
                      />
                    </div>
                    {/* Thông tin sản phẩm */}
                    <div className="flex flex-col pl-4">
                      <h3 className="text-[18px] font-bold mb-3 text-black min-h-[2.5rem]">
                        {product.TenSP}
                        {product.variants && product.variants.length > 0 && (
                          ` ${product.variants[0].dung_luong}`
                        )}
                      </h3>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#0066D6]">
                          {(() => {
                            const priceRange = getPriceRange(product.variants);
                            if (priceRange) {
                              const { minPrice } = priceRange;
                              return formatCurrency(minPrice);
                            }
                            return formatCurrency(product.Gia * (1 - (product.khuyen_mai || 0) / 100));
                          })()}
                        </span>
                        {/* Giá gốc nếu có */}
                        {(() => {
                          const priceRange = getPriceRange(product.variants);
                          if (priceRange && priceRange.maxPrice > priceRange.minPrice) {
                            return (
                              <span className="text-gray-400 line-through text-[14px]">
                                {formatCurrency(priceRange.maxPrice)}
                              </span>
                            );
                          }
                          if (product.khuyen_mai) {
                            return (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(product.Gia)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Watch Section */}
      <section className="section">
        <div className="container mx-auto px-40">
          <div className="section-header flex justify-between items-center mb-6">
            <h2 className="section-title text-2xl font-bold">Watch</h2>
            <Link href="/" className="section-link text-blue-600 font-semibold hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              spaceBetween={20}
              slidesPerView={4}
              slidesPerGroup={4}
              loop={true}
              speed={800}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                320: {
                  slidesPerView: 1,
                  slidesPerGroup: 1,
                },
                640: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                }
              }}
              className="mySwiper"
            >
              {data.WatchProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow border hover:shadow-xl transition-all duration-300 group relative w-[285px] h-[410px] block"
                  >
                    {/* Badge giảm giá */}
                    {(product.khuyen_mai ?? 0) > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                          Giảm {product.khuyen_mai}%
                        </span>
                      </div>
                    )}
                    {/* Badge trả góp */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded shadow-sm">
                        Trả góp 0%
                      </span>
                    </div>
                    {/* Ảnh sản phẩm */}
                    <div className="relative flex items-center justify-center pt-10 bg-white">
                      <Image
                        src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                        alt=""
                        width="0"
                        height="0"
                        className="w-[280px] h-[280px]"
                      />
                    </div>
                    {/* Thông tin sản phẩm */}
                    <div className="flex flex-col pl-4">
                      <h3 className="text-[18px] font-bold mb-3 text-black min-h-[2.5rem]">
                        {product.TenSP}
                        {product.variants && product.variants.length > 0 && (
                          ` ${product.variants[0].dung_luong}`
                        )}
                      </h3>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#0066D6]">
                          {(() => {
                            const priceRange = getPriceRange(product.variants);
                            if (priceRange) {
                              const { minPrice } = priceRange;
                              return formatCurrency(minPrice);
                            }
                            return formatCurrency(product.Gia * (1 - (product.khuyen_mai || 0) / 100));
                          })()}
                        </span>
                        {/* Giá gốc nếu có */}
                        {(() => {
                          const priceRange = getPriceRange(product.variants);
                          if (priceRange && priceRange.maxPrice > priceRange.minPrice) {
                            return (
                              <span className="text-gray-400 line-through text-[14px]">
                                {formatCurrency(priceRange.maxPrice)}
                              </span>
                            );
                          }
                          if (product.khuyen_mai) {
                            return (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(product.Gia)}
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Newsfeed Section */}
      <section className="mt-16 mb-10">
        <div className="container mx-auto px-40">
          <h2 className="text-2xl font-bold text-center mb-6">Tin Tức</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {news
              .sort((a, b) => (b.luot_xem || 0) - (a.luot_xem || 0))
              .slice(0, 3)
              .map(item => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl overflow-hidden shadow border hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <img
                    src={getImageUrl(item.hinh)}
                    alt={item.tieu_de}
                    className="w-full h-[220px] object-cover"
                  />
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">{item.tieu_de}</h3>
                    <div className="text-gray-500 text-sm mb-2 line-clamp-2">{item.mo_ta}</div>
                    <div className="text-gray-400 text-xs mt-auto">{new Date(item.ngay).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex justify-center mt-6">
            <a href="/news" className="text-blue-600 font-medium border border-blue-600 rounded-xl px-6 py-2 hover:bg-blue-50 transition">Xem tất cả Tin Tức &rarr;</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;