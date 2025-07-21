'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Category, Product, ProductVariant, Banner, HomePageData } from './cautrucdata';
import { getApiUrl } from '@/config/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { Navigation, Autoplay } from 'swiper/modules';
import { Fullscreen } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import LuckyWheel from './LuckyWheel';
import GiftVoucher from './GiftVoucher';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchRecommendedProducts } from '@/services/productService';
import PetMascot from './PetMascot';
import GridiPhone from './GridiPhone';
import GridiPad from './GridiPad';
import GridMac from './GridMac';

interface FlashSaleVariantInHomepage {
  id_variant: string;
  gia_flash_sale: number;
  so_luong: number;
  da_ban: number;
  product_name?: string;
  variant_details?: string;
  product_id: string;
  product_image: string | string[];
  phan_tram_giam_gia?: number;
  gia_goc?: number;
}

interface FlashSale {
  _id: string;
  ten_su_kien: string;
  thoi_gian_bat_dau: string;
  thoi_gian_ket_thuc: string;
  an_hien: boolean;
  flashSaleVariants: FlashSaleVariantInHomepage[];
}

interface NewsItem {
  _id: string;
  tieu_de: string;
  mo_ta: string;
  ngay: string;
  hinh: string;
  luot_xem?: number;
  id_danhmuc: string;
}

const getImageUrl = (url: string | string[]) => {
  // Log để debug
  
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
    MacProducts: Product[];
    WatchProducts: Product[];
    PhuKienProducts: Product[];
    AmThanhProducts: Product[];
    CameraProducts: Product[];
    categories: Category[];   
  }>({
    flashSaleProducts: [],
    iPhoneProducts: [],
    iPadProducts: [],
    MacProducts: [],
    WatchProducts: [],
    PhuKienProducts: [],
    AmThanhProducts: [],
    CameraProducts: [],
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
  const [showFlashSale, setShowFlashSale] = useState(false);
  const user = useSelector((state: RootState) => state.user.user);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommend, setLoadingRecommend] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");

  const [specialBanners] = useState<Banner[]>([
    {
      id: 1,
      image: '/images/ipsl.png',
      title: 'Banner 1',
      subtitle: '',
      link: '#',
    },
    {
      id: 2,
      image: '/images/ron12.png',
      title: 'Banner 2',
      subtitle: '',
      link: '#',
    },
    {
      id: 3,
      image: '/images/ron13.jpg',
      title: 'Banner 3',
      subtitle: '',
      link: '#',
    },
  ]);
  const [specialBannersiPad] = useState<Banner[]>([
    {
      id: 1,

      image: '/images/ronlap1.jpg',
      title: 'Banner 1',
      subtitle: '',
      link: '#',
    },
    {
      id: 2,
      image: '/images/ronlapbn.png',
      title: 'Banner 2',
      subtitle: '',
      link: '#',
    },
  ]);
  const [specialBannersMac] = useState<Banner[]>([
    {
      id: 1,
      image: '/images/bnmac.png',
      title: 'Banner 1',
      subtitle: '',
      link: '#',
    },
    {
      id: 2,
      image: '/images/bnmac1.png',
      title: 'Banner 2',
      subtitle: '',
      link: '#',
    },
  ]);

  // Tính thời gian kết thúc flash sale và kiểm tra trạng thái hiển thị
  useEffect(() => {
    let endDate: Date;

    if (data.flashSaleProducts && data.flashSaleProducts.length > 0) {
      // Lấy Flash Sale đầu tiên (đã được backend filter là đang hoạt động)
      endDate = new Date(data.flashSaleProducts[0].thoi_gian_ket_thuc);
      setShowFlashSale(true);
    } else {
      endDate = new Date();
      setShowFlashSale(false);
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setShowFlashSale(false);
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
  }, [data.flashSaleProducts]);

  // Fetch settings and create banner objects
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl('settings'));
        const settingsData = await response.json();
        const settingObj = Array.isArray(settingsData) ? settingsData[0] : settingsData;
        setSettings(settingObj);        
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

        // Fetch active flash sale products từ backend mới
        const flashSaleResponse = await fetch(getApiUrl('flashsales/active'));
        const flashSaleData = await flashSaleResponse.json();
        const flashSaleProducts: FlashSale[] = Array.isArray(flashSaleData.data) ? flashSaleData.data : [];

        // Fetch iPhone products
        const IPHONE_CATEGORY_ID = '681d97db2a400db1737e6de3';
        const iPhoneResponse = await fetch(getApiUrl(`products?id_danhmuc=${IPHONE_CATEGORY_ID}`));
        const iPhoneData = await iPhoneResponse.json();
        
        // Fetch iPad products
        const IPAD_CATEGORY_ID = '681d97db2a400db1737e6de4';
        const iPadResponse = await fetch(getApiUrl(`products?id_danhmuc=${IPAD_CATEGORY_ID}`));
        const iPadData = await iPadResponse.json();

        // Fetch Mac products
        const MAC_CATEGORY_ID = '681d97db2a400db1737e6de5';
        const MacResponse = await fetch(getApiUrl(`products?id_danhmuc=${MAC_CATEGORY_ID}`));
        const MacData = await MacResponse.json();
        
        // Fetch Watch products
        const WATCH_CATEGORY_ID = '681d97db2a400db1737e6de6';
        const WatchResponse = await fetch(getApiUrl(`products?id_danhmuc=${WATCH_CATEGORY_ID}`));
        const WatchData = await WatchResponse.json();

        // Fetch Phu kien products
        const PHUKIEN_CATEGORY_ID = '681d97db2a400db1737e6de7';
        const PhuKienResponse = await fetch(getApiUrl(`products?id_danhmuc=${PHUKIEN_CATEGORY_ID}`));
        const PhuKienData = await PhuKienResponse.json();

        // Fetch Am thanh products
        const AMTHANH_CATEGORY_ID = '68219963d5680e4c448c7891';
        const AmThanhResponse = await fetch(getApiUrl(`products?id_danhmuc=${AMTHANH_CATEGORY_ID}`));
        const AmThanhData = await AmThanhResponse.json();   

        // Fetch Camera products
        const CAMERA_CATEGORY_ID = '68219980d5680e4c448c7892';
        const CameraResponse = await fetch(getApiUrl(`products?id_danhmuc=${CAMERA_CATEGORY_ID}`));
        const CameraData = await CameraResponse.json();

        // Fetch categories
        const categoriesResponse = await fetch(getApiUrl('categories'));
        const categoriesData = await categoriesResponse.json();

        setData({
          flashSaleProducts: flashSaleProducts,
          iPhoneProducts: Array.isArray(iPhoneData) ? iPhoneData.filter(product => 
            product.id_danhmuc === IPHONE_CATEGORY_ID
          ).slice(0, 40) : [],
          iPadProducts: Array.isArray(iPadData) ? iPadData.filter(product => 
            product.id_danhmuc === IPAD_CATEGORY_ID
          ).slice(0, 40) : [],
          MacProducts: Array.isArray(MacData) ? MacData.filter(product => 
            product.id_danhmuc === MAC_CATEGORY_ID
          ).slice(0, 40) : [],
          WatchProducts: Array.isArray(WatchData) ? WatchData.filter(product => 
            product.id_danhmuc === WATCH_CATEGORY_ID
          ).slice(0, 40) : [],
          PhuKienProducts: Array.isArray(PhuKienData) ? PhuKienData.filter(product => 
            product.id_danhmuc === PHUKIEN_CATEGORY_ID
          ).slice(0, 40) : [],
          AmThanhProducts: Array.isArray(AmThanhData) ? AmThanhData.filter(product => 
            product.id_danhmuc === AMTHANH_CATEGORY_ID
          ).slice(0, 40) : [],
          CameraProducts: Array.isArray(CameraData) ? CameraData.filter(product => 
            product.id_danhmuc === CAMERA_CATEGORY_ID
          ).slice(0, 40) : [],
          categories: categoriesData || []
        });
      } catch (error) {
        setData({
          flashSaleProducts: [],
          iPhoneProducts: [],
          iPadProducts: [],
          MacProducts: [],
          WatchProducts: [],
          PhuKienProducts: [],
          AmThanhProducts: [],
          CameraProducts: [],
          categories: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto refresh Flash Sale data every minute to check for expired events
  useEffect(() => {
    const refreshFlashSaleData = async () => {
      try {
        const flashSaleResponse = await fetch(getApiUrl('flashsales/active'));
        const flashSaleData = await flashSaleResponse.json();
        const flashSaleProducts: FlashSale[] = Array.isArray(flashSaleData.data) ? flashSaleData.data : [];
        
        setData(prevData => ({
          ...prevData,
          flashSaleProducts: flashSaleProducts
        }));
      } catch (error) {
        console.error('Error refreshing flash sale data:', error);
      }
    };

    // Refresh every minute
    const interval = setInterval(refreshFlashSaleData, 60000);
    return () => clearInterval(interval);
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
                  {/* Badge Flash Sale bên trái */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                      Flash Sale
                    </span>
                  </div>
                  {/* Badge % giảm giá bên phải */}
                  {variant.phan_tram_giam_gia && (
                    <div className="absolute top-2 right-2 z-10">
                      <span className="bg-yellow-400 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                        -{variant.phan_tram_giam_gia}%
                      </span>
                    </div>
                  )}
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
    const prices = variants.map(v => v.gia).filter(price => typeof price === 'number' && !isNaN(price));
    if (prices.length === 0) return null; // No valid prices found
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

  // Fetch recommended products for user
  useEffect(() => {
    if (!user || !user._id) {
      setRecommendedProducts([]);
      setAiAdvice("");
      return;
    }
    setLoadingRecommend(true);
    fetchRecommendedProducts(user._id)
      .then((products) => setRecommendedProducts(products))
      .catch(() => setRecommendedProducts([]))
      .finally(() => setLoadingRecommend(false));

    // Fetch AI advice message
    fetch(`/api/ai-advice?userId=${user._id}`)
      .then(res => res.json())
      .then(data => {
        let msg = data.message || "";
        if (Array.isArray(msg)) msg = msg[0] || "";
        if (typeof msg === "string") {
          // Lấy câu đầu tiên, ưu tiên tách theo dấu xuống dòng, nếu không có thì tách theo dấu chấm
          msg = msg.split('\n')[0];
          if (msg.length > 180) msg = msg.split('. ')[0] + '.';
        }
        setAiAdvice(msg);
      })
      .catch(() => setAiAdvice(""));
  }, [user]);

  if (loading) {
    return <div className="mt-16 flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
    
  }

  return (
    <div className="mt-0" style={{ fontFamily: "SF Pro, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }}>
      {/* Banner Slider */}
      <div className="container mx-auto overflow-hidden">
        <div className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[475px] group">
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
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 rounded-full p-1 sm:p-2 shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setCurrentSlide((prev) => prev === 0 ? banners.length - 1 : prev - 1)}
            aria-label="Previous slide"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
              <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 rounded-full p-1 sm:p-2 shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            onClick={() => setCurrentSlide((prev) => prev === banners.length - 1 ? 0 : prev + 1)}
            aria-label="Next slide"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
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
      {showFlashSale && data.flashSaleProducts.length > 0 && (
        <section className="py-0 pt-10 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-40">
            <div className="bg-gradient-to-r from-red-600 to-pink-500 rounded-2xl p-8 shadow-xl overflow-hidden relative group">
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
                navigation={{
                  nextEl: '.flash-sale-next',
                  prevEl: '.flash-sale-prev',
                }}
                spaceBetween={10}
                slidesPerView={1}
                slidesPerGroup={1}
                loop={true}
                speed={1500}
                cssMode={false}
                autoplay={{
                  delay: 10000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    spaceBetween: 10,
                  },
                  480: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                    spaceBetween: 15,
                  },
                  768: {
                    slidesPerView: 3,
                    slidesPerGroup: 3,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 4,
                    slidesPerGroup: 4,
                    spaceBetween: 20,
                  },
                  1280: {
                    slidesPerView: 5,
                    slidesPerGroup: 5,
                    spaceBetween: 20,
                  },
                }}
                className="mySwiper"
              >
                {data.flashSaleProducts
                  .flatMap((flashSale) => flashSale.flashSaleVariants)
                  .map((variant) => {
                    if (!variant) return null; // Bỏ qua nếu không có biến thể

                    const total = variant.so_luong;
                    const sold = variant.da_ban;
                    const remaining = total - sold;
                    const percent = total > 0 ? Math.round((sold / total) * 100) : 0;

                    return (
                      <SwiperSlide key={variant.id_variant}>
                        <Link
                          href={`/product/${variant?.product_id || ''}`}
                          className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block"
                        >
                          {/* Ảnh sản phẩm */}
                          <div className="relative pt-[100%] overflow-hidden">
                            {/* Badge Flash Sale bên trái */}
                            <div className="absolute top-2 left-2 z-10">
                              <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                                Flash Sale
                              </span>
                            </div>
                            {/* Badge % giảm giá bên phải */}
                            {variant.phan_tram_giam_gia && (
                              <div className="absolute top-2 right-2 z-10">
                                <span className="bg-yellow-400 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                  -{variant.phan_tram_giam_gia}%
                                </span>
                              </div>
                            )}
                            <Image
                              src={getImageUrl(variant?.product_image || '')}
                              alt={variant?.product_name || 'Sản phẩm Flash Sale'}
                              fill
                              className="object-contain p-4"
                            />
                            {/* Số lượng còn lại với progress bar */}
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[85%] flex flex-col items-center">
                              <div className="w-full h-6 rounded-full bg-gray-200 flex items-center relative overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 absolute left-0 top-0 transition-all duration-500"
                                  style={{ width: `${(remaining / total) * 100}%` }}
                                ></div>
                                <div className="w-full h-full flex items-center justify-center z-10 relative">
                                  <span className="flex items-center gap-1 text-black font-semibold text-sm">
                                    <span role="img" aria-label="fire">🔥</span>
                                    Còn {remaining}/{total} suất
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Thông tin sản phẩm */}
                          <div className="p-5">
                            <h3 className="text-sm text-[16px] mb-2 line-clamp-2 min-h-[2.5rem] text-gray-800 hover:text-red-600">
                              {variant?.product_name} {variant?.variant_details?.split(' - ')[0]}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex flex-col items-start space-y-1">
                                <span className="text-lg font-bold text-red-600">
                                  {formatCurrency(variant.gia_flash_sale)}
                                </span>
                                {variant.gia_goc && variant.gia_flash_sale !== variant.gia_goc && (
                                  <span className="text-sm text-gray-400 line-through">
                                    {formatCurrency(variant.gia_goc)}
                                  </span>
                                )}
                                {variant.gia_goc && variant.gia_flash_sale && variant.gia_goc > variant.gia_flash_sale && (
                                  <span className="text-xs text-green-600 font-semibold">
                                    Tiết kiệm {(variant.gia_goc - variant.gia_flash_sale).toLocaleString()}₫
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

              {/* Custom Navigation Buttons for Flash Sale Swiper */}
              <div className="flash-sale-prev absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                  <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flash-sale-next absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                  <path d="M9 5l7 7-7 7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </section>
      )}
<GiftVoucher />
      {/* Gợi ý cho bạn Section */}
      {user && user._id && recommendedProducts.length > 0 && (
        <section className="section bg-white">
          <div className="container mx-auto px-40 bg-white">
            <div className="section-header flex justify-between items-center mb-6 bg-white">
              <PetMascot message={aiAdvice || "Xin chào, đây là gợi ý cho bạn!"} />
            </div>
            <div className="relative group bg-white">
              <Swiper
                modules={[Navigation]}
                navigation={{
                  nextEl: '.recommend-next',
                  prevEl: '.recommend-prev',
                }}
                spaceBetween={20}
                slidesPerView={1}
                slidesPerGroup={1}
                loop={true}
                speed={800}
                breakpoints={{
                  320: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 10 },
                  480: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 15 },
                  768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
                  1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 }
                }}
                className="mySwiper bg-white"
              >
                {recommendedProducts.map((product) => (
                  <SwiperSlide key={product._id}>
                    <Link
                      href={`/product/${product._id}`}
                      className="bg-white rounded-2xl overflow-hidden border transition-all duration-300 group relative w-[285px] h-[410px] block"
                    >
                      {/* Discount Badge */}
                      {(product.khuyen_mai ?? 0) > 0 && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                            Giảm {product.khuyen_mai}%
                          </span>
                        </div>
                      )}
                      {/* Installment Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                          Trả góp 0%
                        </span>
                      </div>
                      {/* Product Image */}
                      <div className="relative flex items-center justify-center pt-10 bg-white">
                        <Image
                          src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                          alt={product.TenSP}
                          width="0"
                          height="0"
                          className="w-[280px] h-[280px]"
                        />
                      </div>
                      {/* Product Info */}
                      <div className="flex flex-col pl-4">
                        <h3 className="text-[18px] font-bold mb-3 text-black min-h-[2.5rem]">
                          {product.TenSP}
                          {product.variants && product.variants.length > 0 && product.variants[0].dung_luong && (
                            ` ${product.variants[0].dung_luong}`
                          )}
                        </h3>
                        
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
              <div className="recommend-prev absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                  <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="recommend-next absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                  <path d="M9 5l7 7-7 7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </section>
      )}
      {/* Special Product Section - Sản phẩm nổi bật */}
      <section  style={{background:'#fff'}}>
      <div style={{
        position: 'relative',
        width: 1278,
        margin: '0 auto',
        zIndex: 30,
        background:'#fff',
        paddingTop:90,
      }}>
        <img
          src="/images/anhcuacam.png"
          alt="Điện thoại kế bên số 1"
          style={{
            height: 314,
            maxWidth: 558,
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            right: 50,
            zIndex: 30,
          }}
        />
      </div>
      <section
        className="relative mx-auto flex items-center justify-center"
        style={{
          background: `url('/images/maucam.png') center/cover no-repeat`,
          width: 1278,
          height: 827,
          minWidth: '320px',
          maxWidth: '100vw',
          overflowX: 'auto',
        }}
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8" style={{paddingLeft:65}}>
          {/* Left: Slide sản phẩm nổi bật */}
          <div className="w-[668px] h-[515px] flex flex-col items-start" style={{marginBottom:180}}>
            {/* Ảnh motcam.png + chữ in trên ảnh */}
            <div
              className="flex items-center justify-center text-center"
              style={{
                backgroundImage: "url('/images/motcam.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                width: 732,
                height: 108,
              }}
            >
              <p className="w-full"  style={{textAlign:'left', paddingLeft:90}}>
                <b style={{fontSize:22, fontWeight:400,color:'#fff'}}>CHỈ CÓ TẠI POLYSMART </b><br />
                <span style={{fontSize:36, fontWeight:800,color:'#fff'}}> MÁY SIÊU TỐT - GIÁ SIÊU HỜI</span>
              </p>
            </div>
            {/* Card lớn bao 3 card nhỏ */}
            <div className="bg-white rounded-2xl h-[515px] max-w-[668px] mt-[60px]" style={{padding:'20px 20px 30px 20px'}}>
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold text-black">Điện thoại nổi bật nhất</h2>
              </div>
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={24}
                slidesPerView={3}
                loop={true}
                className="w-full h-full"
              >
                {data.iPhoneProducts.map((product) => (
                  <SwiperSlide key={product._id} className="h-full">
                  
                    <Link href={`/product/${product._id}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300" style={{height:410}}>
                      <div className="relative flex items-center justify-center pt-10 bg-white">
                        <div className="relative w-[170px] h-[140px] flex items-center justify-center">
                          <Image
                            src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                            alt={product.TenSP}
                            className="w-[180px] h-[160px] object-contain"
                            width={170}
                            height={140}
                          />
                          {product.khuyen_mai && (
                            <img
                              src="/images/khungfl.png"
                              alt="Khung Flash Sale"
                              className="absolute left-0 pointer-events-none"
                              style={{ zIndex: 10, width:185, height: 176 }}
                            />
                          )}
                        </div>
                        {/* % giảm giá nếu có */}
                        {product.khuyen_mai && (
                          <span className="absolute top-2 right-2 bg-[#FF7337] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">-{product.khuyen_mai}%</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[14px]" style={{fontWeight:800, color:'#333', marginTop:20}}>{product.TenSP}</p>
                        {/* Lựa chọn dung lượng */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {product.variants
                              .filter(variant => product.variants?.[0]?.mau && variant.mau === product.variants[0].mau)
                              .map((variant, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-[8px] border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                                  style={{ borderRadius: 18,}}
                                >
                                  {variant.dung_luong}
                                </span>
                              ))}
                          </div>
                        )}
                        {/* Giá tiền nằm ngoài chip dung lượng */}
                        {(() => {
                          const variants = product.variants?.filter(
                            v => product.variants?.[0]?.mau && v.mau === product.variants[0].mau
                          ) || [];
                          if (variants.length === 0) return null;
                          const minPrice = Math.min(...variants.map(v => v.gia));
                          const hasDiscount = !!product.khuyen_mai;
                          const salePrice = hasDiscount ? minPrice * (1 - (product.khuyen_mai ?? 0) / 100) : minPrice;
                          return (
                            <div className="items-center mt-2">
                              <span className="text-[13px]" style={{ fontWeight: 800, color: '#FF763B',}}>
                                {formatCurrency(salePrice)}
                              </span> 
                              {hasDiscount && (
                                <span className="text-[10px] text-gray-400 line-through ml-2">
                                  {formatCurrency(minPrice)}
                                </span> 
                              )}
                              
                            </div>
                          );
                        })()}
                        <div style={{background:'#F2F4F6', borderRadius:8, fontSize:10, padding:10,height:60,width:160, marginTop:10}}>
                                <p>Hỗ trợ trả góp 0%</p>
                                <p>Thu cũ đổi mới</p>
                                <p>Ưu đãi khách hàng thân thiết</p>
                        </div>
                      </div>
                    </Link>
               
                  </SwiperSlide>
                ))}
              </Swiper>
             
            </div>
          </div>
          {/* Right: Banner slide */}
          <div className="flex flex-col items-center" style={{marginTop:115, marginRight:100}}>
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className="w-[455px] h-[515px]"
                style={{ width: 455, height: 515, maxWidth: 455, maxHeight: 515 }}
              >
                {(specialBanners || []).map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    <div
                      className="flex items-center justify-center w-[455px] h-[515px] rounded-2xl overflow-hidden shadow-xl bg-white"
                      style={{ width: 455, height: 515, maxWidth: 455, maxHeight: 515 }}>
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
        </div>
      </section>
      </section>
    
      {/* iPhone Section */}
      <section className="section bg-white">
        <div className="container mx-auto px-40 bg-white">
          <div className="section-header flex justify-between items-center mb-6 bg-white">
            <h2 className="section-title text-2xl font-bold">iPhone</h2>
            <Link 
              href="/iphone" 
              className="section-link text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center space-x-1 group"
            >
              <span>Xem tất cả</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative group bg-white">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.iphone-next',
                prevEl: '.iphone-prev',
              }}
              spaceBetween={20}
              slidesPerView={1}
              slidesPerGroup={1}
              loop={true}
              speed={800}
              breakpoints={{
                320: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 10 },
                480: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 }
              }}
              className="mySwiper bg-white"
            >
              {data.iPhoneProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden border transition-all duration-300 group relative w-[285px] h-[410px] block"
                  >
                    {/* Discount Badge */}
                    {(product.khuyen_mai ?? 0) > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                          Giảm {product.khuyen_mai}%
                        </span>
                      </div>
                    )}
                    {/* Installment Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Trả góp 0%
                      </span>
                    </div>
                    {/* Product Image */}
                    <div className="relative flex items-center justify-center pt-10 bg-white">
                      <Image
                        src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                        alt={product.TenSP}
                        width="0" 
                        height="0" 
                        className="w-[280px] h-[280px]"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-col pl-4">
                      <h3 className="text-[18px] font-bold mb-3 text-black min-h-[2.5rem]">
                        {product.TenSP}
                        {product.variants && product.variants.length > 0 && product.variants[0].dung_luong && (
                          ` ${product.variants[0].dung_luong}`
                        )}
                      </h3>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#0066D6]">
                          {(() => {
                            const priceRange = getPriceRange(product.variants);
                            if (priceRange) {
                              return formatCurrency(priceRange.minPrice);
                            }
                            const price = (typeof product.Gia === 'number' && !isNaN(product.Gia)) ? product.Gia : 0;
                            const discount = (typeof product.khuyen_mai === 'number' && !isNaN(product.khuyen_mai)) ? product.khuyen_mai : 0;
                            return formatCurrency(price * (1 - discount / 100));
                          })()}
                        </span>
                        {(() => {
                          const priceRange = getPriceRange(product.variants);
                          if (priceRange && priceRange.maxPrice > priceRange.minPrice) {
                            return (
                              <span className="text-gray-400 line-through text-[14px]">
                                {formatCurrency(priceRange.maxPrice)}
                              </span>
                            );
                          }
                          const originalPrice = (typeof product.Gia === 'number' && !isNaN(product.Gia)) ? product.Gia : 0;
                          if (product.khuyen_mai && originalPrice > 0) {
                            return (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(originalPrice)}
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
            <div className="iphone-prev absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                    <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="iphone-next absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                    <path d="M9 5l7 7-7 7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>
      </section>
      <GridiPhone/>

      <section style={{background:'#fff'}}>
      <div style={{
        position: 'relative',
        width: 1278,
        margin: '0 auto',
        zIndex: 30,
        background:'#fff',
        paddingTop:90,
      }}>
        <img
          src="/images/anhcuatim.png"
          alt="Điện thoại kế bên số 1"
          style={{
            height: 314,
            maxWidth: 558,
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            right: 50,
            zIndex: 30,
          }}
        />
      </div>
      <section
        className="relative mx-auto flex items-center justify-center"
        style={{
          background: `url('/images/mautim.png') center/cover no-repeat`,
          width: 1278,
          height: 827,
          minWidth: '320px',
          maxWidth: '100vw',
          overflowX: 'auto',
        }}
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8" style={{paddingLeft:65}}>
          {/* Left: Slide sản phẩm nổi bật */}
          <div className="w-[668px] h-[515px] flex flex-col items-start" style={{marginBottom:180}}>
            {/* Ảnh motcam.png + chữ in trên ảnh */}
            <div
              className="flex items-center justify-center text-center"
              style={{
                backgroundImage: "url('/images/mottim.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                width: 732,
                height: 108,
              }}
            >
              <p className="w-full" style={{textAlign:'left', paddingLeft:90}}>
                <b style={{fontSize:22, fontWeight:400,color:'#fff',}}>CHỈ CÓ TẠI POLYSMART </b><br />
                <span style={{fontSize:36, fontWeight:800,color:'#fff'}}> TRẢI NGHIỆM THỊ GIÁC TUYỆT VỜI</span>
              </p>
            </div>
            {/* Card lớn bao 3 card nhỏ */}
            <div className="bg-white rounded-2xl h-[515px] max-w-[668px] mt-[60px]" style={{padding:'20px 20px 30px 20px'}}>
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold text-black">iPad bán chạy nhất</h2>
              </div>
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={24}
                slidesPerView={3}
                loop={true}
                className="w-full h-full"
              >
                {data.iPhoneProducts.map((product) => (
                  <SwiperSlide key={product._id} className="h-full">
                  
                    <Link href={`/product/${product._id}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300" style={{height:410}}>
                      <div className="relative flex items-center justify-center pt-10 bg-white">
                        <div className="relative w-[170px] h-[140px] flex items-center justify-center">
                          <Image
                            src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                            alt={product.TenSP}
                            className="w-[180px] h-[160px] object-contain"
                            width={170}
                            height={140}
                          />
                          {product.khuyen_mai && (
                            <img
                              src="/images/khungfl.png"
                              alt="Khung Flash Sale"
                              className="absolute left-0 pointer-events-none"
                              style={{ zIndex: 10, width:185, height: 176 }}
                            />
                          )}
                        </div>
                        {/* % giảm giá nếu có */}
                        {product.khuyen_mai && (
                          <span className="absolute top-2 right-2 bg-[#FF7337] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">-{product.khuyen_mai}%</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[14px]" style={{fontWeight:800, color:'#333', marginTop:20}}>{product.TenSP}</p>
                        {/* Lựa chọn dung lượng */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {product.variants
                              .filter(variant => product.variants?.[0]?.mau && variant.mau === product.variants[0].mau)
                              .map((variant, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-[8px] border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                                  style={{ borderRadius: 18,}}
                                >
                                  {variant.dung_luong}
                                </span>
                              ))}
                          </div>
                        )}
                        {/* Giá tiền nằm ngoài chip dung lượng */}
                        {(() => {
                          const variants = product.variants?.filter(
                            v => product.variants?.[0]?.mau && v.mau === product.variants[0].mau
                          ) || [];
                          if (variants.length === 0) return null;
                          const minPrice = Math.min(...variants.map(v => v.gia));
                          const hasDiscount = !!product.khuyen_mai;
                          const salePrice = hasDiscount ? minPrice * (1 - (product.khuyen_mai ?? 0) / 100) : minPrice;
                          return (
                            <div className="items-center mt-2">
                              <span className="text-[13px]" style={{ fontWeight: 800, color: '#FF763B',}}>
                                {formatCurrency(salePrice)}
                              </span> 
                              {hasDiscount && (
                                <span className="text-[10px] text-gray-400 line-through ml-2">
                                  {formatCurrency(minPrice)}
                                </span> 
                              )}
                              
                            </div>
                          );
                        })()}
                        <div style={{background:'#F2F4F6', borderRadius:8, fontSize:10, padding:10,height:60,width:160, marginTop:10}}>
                                <p>Hỗ trợ trả góp 0%</p>
                                <p>Thu cũ đổi mới</p>
                                <p>Ưu đãi khách hàng thân thiết</p>
                        </div>
                      </div>
                    </Link>
               
                  </SwiperSlide>
                ))}
              </Swiper>
             
            </div>
          </div>
          {/* Right: Banner slide */}
          <div className="flex flex-col items-center" style={{marginTop:115, marginRight:100}}>
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className="w-[455px] h-[515px]"
                style={{ width: 455, height: 515, maxWidth: 455, maxHeight: 515 }}
              >
                {(specialBannersiPad || []).map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    <div
                      className="flex items-center justify-center w-[455px] h-[515px] rounded-2xl overflow-hidden shadow-xl bg-white"
                      style={{ width: 455, height: 515, maxWidth: 455, maxHeight: 515 }}>
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
        </div>
      </section>
      </section>
      {/* iPad Section */}
      <section className="section bg-white">
        <div className="container mx-auto px-40 bg-white">
          <div className="section-header flex justify-between items-center mb-6 bg-white">
              <h2 className="section-title text-2xl font-bold">iPad</h2>
            <Link 
              href="/ipad" 
              className="section-link text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center space-x-1 group"
            >
              <span>Xem tất cả</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative group bg-white">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.ipad-next',
                prevEl: '.ipad-prev',
              }}
              spaceBetween={20}
              slidesPerView={1}
              slidesPerGroup={1}
              loop={true}
              speed={800}
              breakpoints={{
                320: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 10 },
                480: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 }
              }}
              className="mySwiper bg-white"
            >
              {data.iPadProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden border transition-all duration-300 group relative w-[285px] h-[410px] block"
                  >
                    {/* Discount Badge */}
                    {(product.khuyen_mai ?? 0) > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                          Giảm {product.khuyen_mai}%
                        </span>
                      </div>
                    )}
                    {/* Installment Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Trả góp 0%
                      </span>
                    </div>
                    {/* Product Image */}
                    <div className="relative flex items-center justify-center pt-8 bg-white">
                      <Image
                        src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                        alt={product.TenSP}
                        width="0" 
                        height="0" 
                        className="w-[280px] h-[280px]"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-col justify-between px-4 py-2 w-[265px]">
                      <h3 className="text-[18px] font-bold mb-1 text-black min-h-[2.5rem]">
                        {product.TenSP}
                        {product.variants && product.variants.length > 0 && product.variants[0].dung_luong && (
                          ` ${product.variants[0].dung_luong}`
                        )}
                      </h3>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#0066D6]">
                          {(() => {
                            const priceRange = getPriceRange(product.variants);
                            if (priceRange) {
                              return formatCurrency(priceRange.minPrice);
                            }
                            const price = (typeof product.Gia === 'number' && !isNaN(product.Gia)) ? product.Gia : 0;
                            const discount = (typeof product.khuyen_mai === 'number' && !isNaN(product.khuyen_mai)) ? product.khuyen_mai : 0;
                            return formatCurrency(price * (1 - discount / 100));
                          })()}
                        </span>
                        {(() => {
                          const priceRange = getPriceRange(product.variants);
                          if (priceRange && priceRange.maxPrice > priceRange.minPrice) {
                            return (
                              <span className="text-gray-400 line-through text-[14px]">
                                {formatCurrency(priceRange.maxPrice)}
                              </span>
                            );
                          }
                          const originalPrice = (typeof product.Gia === 'number' && !isNaN(product.Gia)) ? product.Gia : 0;
                          if (product.khuyen_mai && originalPrice > 0) {
                            return (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(originalPrice)}
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
            <div className="ipad-prev absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                    <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="ipad-next absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                    <path d="M9 5l7 7-7 7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>
      </section>
      <GridiPad/>
      <section style={{background:'#fff'}}>
      <div style={{
        position: 'relative',
        width: 1278,
        margin: '0 auto',
        zIndex: 30,
        background:'#fff',
        paddingTop:90,
      }}>
        <img
          src="/images/anhcuaxanh.png"
          alt="Điện thoại kế bên số 1"
          style={{
            height: 314,
            maxWidth: 558,
            objectFit: 'contain',
            position: 'absolute',
            top: 0,
            right: 50,
            zIndex: 30,
          }}
        />
      </div>
      <section
        className="relative mx-auto flex items-center justify-center"
        style={{
          background: `url('/images/mauxanh.png') center/cover no-repeat`,
          width: 1278,
          height: 827,
          minWidth: '320px',
          maxWidth: '100vw',
          overflowX: 'auto',
        }}
      >
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8" style={{paddingLeft:65}}>
          {/* Left: Slide sản phẩm nổi bật */}
          <div className="w-[668px] h-[515px] flex flex-col items-start" style={{marginBottom:180}}>
            {/* Ảnh motcam.png + chữ in trên ảnh */}
            <div
              className="flex items-center justify-center text-center"
              style={{
                backgroundImage: "url('/images/motxanh.png')",
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                width: 732,
                height: 108,
              }}
            >
              <p className="w-full"  style={{textAlign:'left', paddingLeft:90}}>
                <b style={{fontSize:22, fontWeight:400,color:'#fff'}}>HIỆU SUẤT CAO</b><br />
                <span style={{fontSize:36, fontWeight:800,color:'#fff'}}>BÙNG NỔ SÁNG TẠO</span>
              </p>
            </div>
            {/* Card lớn bao 3 card nhỏ */}
            <div className="bg-white rounded-2xl h-[515px] max-w-[668px] mt-[60px]" style={{padding:'20px 20px 30px 20px'}}>
              <div className="flex items-center mb-6">
                <h2 className="text-3xl font-bold text-black">Macbook bán chạy nhất</h2>
              </div>
              <Swiper
                modules={[Navigation]}
                navigation
                spaceBetween={24}
                slidesPerView={3}
                loop={true}
                className="w-full h-full"
              >
                {data.iPhoneProducts.map((product) => (
                  <SwiperSlide key={product._id} className="h-full">
                  
                    <Link href={`/product/${product._id}`} className="block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300" style={{height:410}}>
                      <div className="relative flex items-center justify-center pt-10 bg-white">
                        <div className="relative w-[170px] h-[140px] flex items-center justify-center">
                          <Image
                            src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                            alt={product.TenSP}
                            className="w-[180px] h-[160px] object-contain"
                            width={170}
                            height={140}
                          />
                          {product.khuyen_mai && (
                            <img
                              src="/images/khungfl.png"
                              alt="Khung Flash Sale"
                              className="absolute left-0 pointer-events-none"
                              style={{ zIndex: 10, width:185, height: 176 }}
                            />
                          )}
                        </div>
                        {/* % giảm giá nếu có */}
                        {product.khuyen_mai && (
                          <span className="absolute top-2 right-2 bg-[#FF7337] text-white text-[11px] px-2 py-0.5 rounded-full font-bold">-{product.khuyen_mai}%</span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-[14px]" style={{fontWeight:800, color:'#333', marginTop:20}}>{product.TenSP}</p>
                        {/* Lựa chọn dung lượng */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {product.variants
                              .filter(variant => product.variants?.[0]?.mau && variant.mau === product.variants[0].mau)
                              .map((variant, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-[8px] border border-gray-300 bg-gray-50 text-gray-700 font-semibold"
                                  style={{ borderRadius: 18,}}
                                >
                                  {variant.dung_luong}
                                </span>
                              ))}
                          </div>
                        )}
                        {/* Giá tiền nằm ngoài chip dung lượng */}
                        {(() => {
                          const variants = product.variants?.filter(
                            v => product.variants?.[0]?.mau && v.mau === product.variants[0].mau
                          ) || [];
                          if (variants.length === 0) return null;
                          const minPrice = Math.min(...variants.map(v => v.gia));
                          const hasDiscount = !!product.khuyen_mai;
                          const salePrice = hasDiscount ? minPrice * (1 - (product.khuyen_mai ?? 0) / 100) : minPrice;
                          return (
                            <div className="items-center mt-2">
                              <span className="text-[13px]" style={{ fontWeight: 800, color: '#FF763B',}}>
                                {formatCurrency(salePrice)}
                              </span> 
                              {hasDiscount && (
                                <span className="text-[10px] text-gray-400 line-through ml-2">
                                  {formatCurrency(minPrice)}
                                </span> 
                              )}
                              
                            </div>
                          );
                        })()}
                        <div style={{background:'#F2F4F6', borderRadius:8, fontSize:10, padding:10,height:60,width:160, marginTop:10}}>
                                <p>Hỗ trợ trả góp 0%</p>
                                <p>Thu cũ đổi mới</p>
                                <p>Ưu đãi khách hàng thân thiết</p>
                        </div>
                      </div>
                    </Link>
               
                  </SwiperSlide>
                ))}
              </Swiper>
             
            </div>
          </div>
          {/* Right: Banner slide */}
          <div className="flex flex-col items-center" style={{marginTop:115, marginRight:100}}>
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop={true}
                className="w-[455px] h-[515px]"
                style={{ width: 455, height: 515, maxWidth: 455, maxHeight: 515 }}
              >
                {(specialBannersMac || []).map((banner, idx) => (
                  <SwiperSlide key={idx}>
                    <div
                      className="flex items-center justify-center w-[455px] h-[515px] rounded-2xl overflow-hidden shadow-xl bg-white"
                      style={{ width: 455, height: 515, maxWidth: 455, maxHeight: 515 }}>
                      <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
        </div>
      </section>
      </section>
      {/* Mac Section */}
      <section className="section bg-white">
        <div className="container mx-auto px-40 bg-white">
          <div className="section-header flex justify-between items-center mb-6 bg-white">
              <h2 className="section-title text-2xl font-bold">Mac</h2>
         

            <Link 
              href="/mac" 
              className="section-link text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center space-x-1 group"
            >
              <span>Xem tất cả</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="relative group bg-white">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.mac-next',
                prevEl: '.mac-prev',
              }}
              spaceBetween={20}
              slidesPerView={1}
              slidesPerGroup={1}
              loop={true}
              speed={800}
              breakpoints={{
                320: { slidesPerView: 1, slidesPerGroup: 1, spaceBetween: 10 },
                480: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 15 },
                768: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
                1024: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 20 }
              }}
              className="mySwiper bg-white"
            >
              {data.MacProducts.map((product) => (
                <SwiperSlide key={product._id}>
                  <Link
                    href={`/product/${product._id}`}
                    className="bg-white rounded-2xl overflow-hidden border transition-all duration-300 group relative w-[285px] h-[410px] block"
                  >
                    {/* Discount Badge */}
                    {(product.khuyen_mai ?? 0) > 0 && (
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                          Giảm {product.khuyen_mai}%
                        </span>
                      </div>
                    )}
                    {/* Installment Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white border border-blue-500 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                        Trả góp 0%
                      </span>
                    </div>
                    {/* Product Image */}
                    <div className="relative pt-5 flex items-center justify-center h-[180px] sm:h-[220px] bg-gradient-to-b from-white to-gray-50">
                      <Image
                        src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                        alt={product.TenSP}
                        width="0" 
                        height="0" 
                       className="w-[280px] h-[280px]"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="flex flex-col justify-between px-4 py-14 min-h-[100px] w-[300px]">
                      <h3 className="text-[18px] font-bold mb-3 text-black min-h-[2.5rem]">
                        {product.TenSP}
                        {product.variants && product.variants.length > 0 && product.variants[0].dung_luong && (
                          ` ${product.variants[0].dung_luong}`
                        )}
                      </h3>
                      <div className="flex gap-2 mb-1">
                        <span className="text-[16px] font-bold text-[#0066D6]">
                          {(() => {
                            const priceRange = getPriceRange(product.variants);
                            if (priceRange) {
                              return formatCurrency(priceRange.minPrice);
                            }
                            const price = (typeof product.Gia === 'number' && !isNaN(product.Gia)) ? product.Gia : 0;
                            const discount = (typeof product.khuyen_mai === 'number' && !isNaN(product.khuyen_mai)) ? product.khuyen_mai : 0;
                            return formatCurrency(price * (1 - discount / 100));
                          })()}
                        </span>
                        {(() => {
                          const priceRange = getPriceRange(product.variants);
                          if (priceRange && priceRange.maxPrice > priceRange.minPrice) {
                            return (
                              <span className="text-gray-400 line-through text-[14px]">
                                {formatCurrency(priceRange.maxPrice)}
                              </span>
                            );
                          }
                          const originalPrice = (typeof product.Gia === 'number' && !isNaN(product.Gia)) ? product.Gia : 0;
                          if (product.khuyen_mai && originalPrice > 0) {
                            return (
                              <span className="text-gray-400 line-through text-sm">
                                {formatCurrency(originalPrice)}
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
            <div className="mac-prev absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                    <path d="M15 19l-7-7 7-7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div className="mac-next absolute top-1/2 -right-4 sm:-right-8 -translate-y-1/2 z-10 bg-white/70 rounded-full p-1 sm:p-2 shadow cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-gray-600 sm:w-[28px] sm:h-[28px]">
                    <path d="M9 5l7 7-7 7" stroke="#484848" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
          </div>
        </div>
      </section>
      <GridMac/>
      {/* Newsfeed Section */}
      <section className="section bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-40">
          <h2 className="text-2xl font-bold text-center mb-6">Tin Tức</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {news
              .sort((a, b) => (b.luot_xem || 0) - (a.luot_xem || 0))
              .slice(0, 3)
              .map(item => (
                <Link
                  key={item._id}
                  href={`/news/${item.id_danhmuc}/${item._id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow border hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <img
                    src={getImageUrl(item.hinh)}
                    alt={item.tieu_de}
                    className="w-full h-[220px] object-cover"
                  />
                  <div className="flex-1 flex flex-col p-4">
                    <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {item.tieu_de}
                    </h3>
                    <div className="text-gray-500 text-sm mb-2 line-clamp-2">{item.mo_ta}</div>
                    <div className="text-gray-400 text-xs mt-auto">{new Date(item.ngay).toLocaleDateString()}</div>
                  </div>
                </Link>
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