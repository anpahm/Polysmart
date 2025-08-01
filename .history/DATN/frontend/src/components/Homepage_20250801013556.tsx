"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Category,
  Product,
  ProductVariant,
  Banner,
  HomePageData,
} from "./cautrucdata";
import { getApiUrl } from "@/config/api";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Autoplay } from "swiper/modules";
import { Fullscreen } from "lucide-react";
import { formatCurrency } from "@/utils/format";
import GiftVoucher from "./GiftVoucher";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { fetchRecommendedProducts } from "@/services/productService";
import PetMascot from "./PetMascot";
import { showWarningAlert } from "@/utils/sweetAlert";
import GridiPhone from "./GridiPhone";
import GridiPad from "./GridiPad";
import GridMac from "./GridMac";
import SectionIphone from "./SectionIphone";
import SectionIpad from "./SectionIpad";
import SectionMac from "./SectionMac";
import SEO from "./SEO";
import SectionNews from "./SectionNews";
import SectionHotIphone from "./SectionHotIphone";
import SectionHotIpad from "./SectionHotIpad";
import SectionHotMac from "./SectionHotMac";
import SectionFlashSale from "./SectionFlashSale";
import SectionBanner from "./SectionBanner";
import SectionRecommend from "./SectionRecommend";

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
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Thêm domain của backend cho các đường dẫn hình ảnh
  const backendUrl = process.env.NEXT_PUBLIC_IMAGE_URL;

  // Xử lý đường dẫn tương đối ../images
  if (url.startsWith("../images/")) {
    return url.replace("../images", "/images");
  }

  // Nếu url bắt đầu bằng /images, thêm domain backend
  if (url.startsWith("/images/")) {
    return `${backendUrl}${url}`;
  }

  // Trường hợp còn lại, giả định là tên file trong thư mục images
  return `${backendUrl}/images/${url}`;
};

const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("images", file);

  const response = await fetch(getApiUrl("upload"), {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  return data.path; // Đường dẫn hình ảnh đã upload
};

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
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
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
  const [isRefreshingFlashSale, setIsRefreshingFlashSale] = useState(false);

  // State cho loading từng section
  const [loadingFlashSale, setLoadingFlashSale] = useState(true);
  const [loadingRecommendSection, setLoadingRecommendSection] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingIphone, setLoadingIphone] = useState(true);
  const [loadingIpad, setLoadingIpad] = useState(true);
  const [loadingMac, setLoadingMac] = useState(true);

  // Function to update flash sale quantity when purchased
  const updateFlashSaleQuantity = (variantId: string) => {
    setData((prevData) => ({
      ...prevData,
      flashSaleProducts: prevData.flashSaleProducts.map((flashSale) => ({
        ...flashSale,
        flashSaleVariants: flashSale.flashSaleVariants.map((variant) => {
          if (variant.id_variant === variantId) {
            // Kiểm tra nếu còn hàng
            if (variant.so_luong > variant.da_ban) {
              return {
                ...variant,
                da_ban: variant.da_ban + 1,
              };
            }
          }
          return variant;
        }),
      })),
    }));
  };

  // Function to handle flash sale product click
  const handleFlashSaleClick = async (variant: FlashSaleVariantInHomepage) => {
    try {
      // Kiểm tra còn hàng không
      if (variant.so_luong <= variant.da_ban) {
        showWarningAlert("Hết hàng!", "Sản phẩm flash sale đã hết hàng", 3000);
        return;
      }

      // Chuyển hướng đến trang sản phẩm với flash sale info
      const url = `/product/${variant?.product_id || ""}?flashsale=${variant.id_variant
      }&price=${variant.gia_flash_sale}`;
      window.location.href = url;
    } catch (error) {
      console.error("Error navigating to flash sale product:", error);
    }
  };

  // Function to refresh flash sale data after successful purchase
  const refreshFlashSaleData = async () => {
    try {
      setIsRefreshingFlashSale(true);
      console.log("Refreshing flash sale data..."); // Debug log

      const flashSaleResponse = await fetch(getApiUrl("flashsales/active"));
      const flashSaleData = await flashSaleResponse.json();
      const flashSaleProducts: FlashSale[] = Array.isArray(flashSaleData.data)
        ? flashSaleData.data
        : [];

      setData((prevData) => ({
        ...prevData,
        flashSaleProducts: flashSaleProducts,
      }));

      console.log("Flash sale data refreshed:", flashSaleProducts); // Debug log
    } catch (error) {
      console.error("Error refreshing flash sale data:", error);
    } finally {
      setTimeout(() => setIsRefreshingFlashSale(false), 500); // Show loading for a bit
    }
  };

  // Function to manually process flash sale order (for testing/fixing)
  const processFlashSaleOrder = async (orderId: string) => {
    try {
      console.log(`Processing flash sale order: ${orderId}`);

      // First try the dedicated flash sale processing endpoint
      let response = await fetch(
        getApiUrl(`orders/${orderId}/process-flashsale`),
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        console.log("Dedicated endpoint failed, trying alternative...");
        // Alternative: directly update flash sale quantities
        response = await fetch(getApiUrl(`flashsales/update-quantities`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ orderId }),
        });
      }

      if (response.ok) {
        const result = await response.json();
        console.log("Flash sale order processed successfully:", result);
        // Refresh data after processing
        setTimeout(() => refreshFlashSaleData(), 1000);
        return true;
      } else {
        const error = await response.text();
        console.error("Failed to process flash sale order:", error);
        return false;
      }
    } catch (error) {
      console.error("Error processing flash sale order:", error);
      return false;
    }
  };

  // Function to debug current flash sale state
  const debugFlashSaleState = () => {
    console.log("=== FLASH SALE DEBUG ===");
    console.log("Current flash sale products:", data.flashSaleProducts);

    data.flashSaleProducts.forEach((flashSale, index) => {
      console.log(`Flash Sale ${index + 1}:`, {
        id: flashSale._id,
        name: flashSale.ten_su_kien,
        variants: flashSale.flashSaleVariants.map((v) => ({
          id: v.id_variant,
          product: v.product_name,
          total: v.so_luong,
          sold: v.da_ban,
          remaining: v.so_luong - v.da_ban,
        })),
      });
    });
    console.log("========================");
  };

  // Expose functions globally for testing
  useEffect(() => {
    (window as any).refreshFlashSale = refreshFlashSaleData;
    (window as any).processFlashSaleOrder = processFlashSaleOrder;
    (window as any).checkOrderStatus = checkOrderStatus;
    (window as any).debugFlashSale = debugFlashSaleState;

    // Helper function to fix flash sale for specific order
    (window as any).fixFlashSaleOrder = async (orderId: string) => {
      console.log(`Attempting to fix flash sale for order: ${orderId}`);
      await processFlashSaleOrder(orderId);
      await refreshFlashSaleData();
    };

    // Helper to manually update flash sale quantity
    (window as any).updateFlashSaleQuantity = async (
      variantId: string,
      newSoldCount: number
    ) => {
      try {
        const response = await fetch(
          getApiUrl(`flashsales/variants/${variantId}/update`),
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ da_ban: newSoldCount }),
          }
        );

        if (response.ok) {
          console.log(
            `Updated variant ${variantId} sold count to ${newSoldCount}`
          );
          refreshFlashSaleData();
        } else {
          console.error("Failed to update flash sale quantity");
        }
      } catch (error) {
        console.error("Error updating flash sale quantity:", error);
      }
    };

    // Helper to show current quantities
    (window as any).showFlashSaleStatus = () => {
      debugFlashSaleState();
      const elements = document.querySelectorAll("[data-flash-variant]");
      elements.forEach((el) => {
        const variantId = el.getAttribute("data-flash-variant");
        const quantityEl = el.querySelector(".quantity-display");
        if (quantityEl) {
          console.log(
            `UI shows: ${quantityEl.textContent} for variant ${variantId}`
          );
        }
      });
    };

    return () => {
      delete (window as any).refreshFlashSale;
      delete (window as any).processFlashSaleOrder;
      delete (window as any).checkOrderStatus;
      delete (window as any).fixFlashSaleOrder;
      delete (window as any).debugFlashSale;
      delete (window as any).updateFlashSaleQuantity;
      delete (window as any).showFlashSaleStatus;
    };
  }, []);

  // Function to handle successful purchase (call this after payment success)
  const handlePurchaseSuccess = (variantId: string) => {
    // Refresh data from server to get latest quantities
    refreshFlashSaleData();

    // Optional: Show success message
    // toast.success('Mua hàng thành công!');
  };

  const [specialBanners] = useState<Banner[]>([
    {
      id: 1,
      image: "/images/ipsl.png",
      title: "Banner 1",
      subtitle: "",
      link: "#",
    },
    {
      id: 2,
      image: "/images/ron12.png",
      title: "Banner 2",
      subtitle: "",
      link: "#",
    },
    {
      id: 3,
      image: "/images/ron13.jpg",
      title: "Banner 3",
      subtitle: "",
      link: "#",
    },
  ]);
  const [specialBannersiPad] = useState<Banner[]>([
    {
      id: 1,

      image: "/images/ronlap1.jpg",
      title: "Banner 1",
      subtitle: "",
      link: "#",
    },
    {
      id: 2,
      image: "/images/ronlapbn.png",
      title: "Banner 2",
      subtitle: "",
      link: "#",
    },
  ]);
  const [specialBannersMac] = useState<Banner[]>([
    {
      id: 1,
      image: "/images/bnmac.png",
      title: "Banner 1",
      subtitle: "",
      link: "#",
    },
    {
      id: 2,
      image: "/images/bnmac1.png",
      title: "Banner 2",
      subtitle: "",
      link: "#",
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
        const response = await fetch(getApiUrl("settings"));
        const settingsData = await response.json();
        const settingObj = Array.isArray(settingsData)
          ? settingsData[0]
          : settingsData;
        setSettings(settingObj);
        if (settingObj && settingObj.Banner) {
          const bannerImages = settingObj.Banner.split("|");
          setBanners(
            bannerImages.map((img: string, index: number) => ({
              id: index + 1,
              image: getImageUrl(img),
              title: "",
              subtitle: "",
              link: "/mac/macbook-air",
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
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
        setLoadingFlashSale(true);
        setLoadingIphone(true);
        setLoadingIpad(true);
        setLoadingMac(true);

        // Fetch active flash sale products từ backend mới
        const flashSaleResponse = await fetch(getApiUrl("flashsales/active"));
        const flashSaleData = await flashSaleResponse.json();
        const flashSaleProducts: FlashSale[] = Array.isArray(flashSaleData.data)
          ? flashSaleData.data
          : [];
        setLoadingFlashSale(false);

        // Fetch iPhone products
        const IPHONE_CATEGORY_ID = "681d97db2a400db1737e6de3";
        const iPhoneResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${IPHONE_CATEGORY_ID}`)
        );
        const iPhoneData = await iPhoneResponse.json();
        setLoadingIphone(false);

        // Fetch iPad products
        const IPAD_CATEGORY_ID = "681d97db2a400db1737e6de4";
        const iPadResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${IPAD_CATEGORY_ID}`)
        );
        const iPadData = await iPadResponse.json();
        setLoadingIpad(false);

        // Fetch Mac products
        const MAC_CATEGORY_ID = "681d97db2a400db1737e6de5";
        const MacResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${MAC_CATEGORY_ID}`)
        );
        const MacData = await MacResponse.json();
        setLoadingMac(false);

        // Fetch Watch products
        const WATCH_CATEGORY_ID = "681d97db2a400db1737e6de6";
        const WatchResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${WATCH_CATEGORY_ID}`)
        );
        const WatchData = await WatchResponse.json();

        // Fetch Phu kien products
        const PHUKIEN_CATEGORY_ID = "681d97db2a400db1737e6de7";
        const PhuKienResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${PHUKIEN_CATEGORY_ID}`)
        );
        const PhuKienData = await PhuKienResponse.json();

        // Fetch Am thanh products
        const AMTHANH_CATEGORY_ID = "68219963d5680e4c448c7891";
        const AmThanhResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${AMTHANH_CATEGORY_ID}`)
        );
        const AmThanhData = await AmThanhResponse.json();

        // Fetch Camera products
        const CAMERA_CATEGORY_ID = "68219980d5680e4c448c7892";
        const CameraResponse = await fetch(
          getApiUrl(`products?id_danhmuc=${CAMERA_CATEGORY_ID}`)
        );
        const CameraData = await CameraResponse.json();

        // Fetch categories
        const categoriesResponse = await fetch(getApiUrl("categories"));
        const categoriesData = await categoriesResponse.json();

        setData({
          flashSaleProducts: flashSaleProducts,
          iPhoneProducts: Array.isArray(iPhoneData)
            ? iPhoneData
                .filter((product) => product.id_danhmuc === IPHONE_CATEGORY_ID)
                .slice(0, 40)
            : [],
          iPadProducts: Array.isArray(iPadData)
            ? iPadData
                .filter((product) => product.id_danhmuc === IPAD_CATEGORY_ID)
                .slice(0, 40)
            : [],
          MacProducts: Array.isArray(MacData)
            ? MacData.filter(
                (product) => product.id_danhmuc === MAC_CATEGORY_ID
              ).slice(0, 40)
            : [],
          WatchProducts: Array.isArray(WatchData)
            ? WatchData.filter(
                (product) => product.id_danhmuc === WATCH_CATEGORY_ID
              ).slice(0, 40)
            : [],
          PhuKienProducts: Array.isArray(PhuKienData)
            ? PhuKienData.filter(
                (product) => product.id_danhmuc === PHUKIEN_CATEGORY_ID
              ).slice(0, 40)
            : [],
          AmThanhProducts: Array.isArray(AmThanhData)
            ? AmThanhData.filter(
                (product) => product.id_danhmuc === AMTHANH_CATEGORY_ID
              ).slice(0, 40)
            : [],
          CameraProducts: Array.isArray(CameraData)
            ? CameraData.filter(
                (product) => product.id_danhmuc === CAMERA_CATEGORY_ID
              ).slice(0, 40)
            : [],
          categories: categoriesData || [],
        });
      } catch (error) {
        setLoadingFlashSale(false);
        setLoadingIphone(false);
        setLoadingIpad(false);
        setLoadingMac(false);
        setLoadingNews(false);
        setLoadingRecommendSection(false);
        setData({
          flashSaleProducts: [],
          iPhoneProducts: [],
          iPadProducts: [],
          MacProducts: [],
          WatchProducts: [],
          PhuKienProducts: [],
          AmThanhProducts: [],
          CameraProducts: [],
          categories: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto refresh Flash Sale data every minute to check for expired events and quantity updates
  useEffect(() => {
    const refreshFlashSaleData = async () => {
      try {
        const flashSaleResponse = await fetch(getApiUrl("flashsales/active"));
        const flashSaleData = await flashSaleResponse.json();
        const flashSaleProducts: FlashSale[] = Array.isArray(flashSaleData.data)
          ? flashSaleData.data
          : [];

        setData((prevData) => ({
          ...prevData,
          flashSaleProducts: flashSaleProducts,
        }));
      } catch (error) {
        console.error("Error refreshing flash sale data:", error);
      }
    };

    // Refresh every 30 seconds to catch quantity updates from purchases
    const interval = setInterval(refreshFlashSaleData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh flash sale data when user returns to the page
        refreshFlashSaleData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Listen for purchase success events
  useEffect(() => {
    const handlePurchaseSuccess = (event: any) => {
      if (event.detail && event.detail.type === "flashsale_purchase") {
        // Refresh immediately when a flash sale purchase is made
        setTimeout(() => {
          refreshFlashSaleData();
        }, 1000); // Small delay to ensure backend is updated
      }
    };

    window.addEventListener("purchaseSuccess", handlePurchaseSuccess);
    return () =>
      window.removeEventListener("purchaseSuccess", handlePurchaseSuccess);
  }, []);

  // Check for order success on component mount
  useEffect(() => {
    const checkOrderSuccess = () => {
      // Check URL params for order success
      const urlParams = new URLSearchParams(window.location.search);
      const orderSuccess = urlParams.get("order_success");
      const flashsaleOrder = urlParams.get("flashsale_order");
      const orderId = urlParams.get("order_id");

      // Check localStorage for recent order
      const recentOrder = localStorage.getItem("recent_flashsale_order");
      const lastOrderCheck = localStorage.getItem("last_order_check");

      if (
        orderSuccess === "true" ||
        flashsaleOrder === "true" ||
        recentOrder ||
        orderId
      ) {
        // Clear the localStorage flag
        if (recentOrder) {
          localStorage.removeItem("recent_flashsale_order");
        }

        // If we have an order ID, check its status
        if (orderId && orderId !== lastOrderCheck) {
          checkOrderStatus(orderId);
          localStorage.setItem("last_order_check", orderId);
        }

        // Refresh flash sale data multiple times to ensure update
        setTimeout(() => refreshFlashSaleData(), 1000);
        setTimeout(() => refreshFlashSaleData(), 3000);
        setTimeout(() => refreshFlashSaleData(), 5000);

        // Clean up URL params
        if (orderSuccess || flashsaleOrder) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };

    checkOrderSuccess();
  }, []);

  // Function to check order status and trigger refresh if needed
  const checkOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch(getApiUrl(`orders/${orderId}`));
      const orderData = await response.json();

      // If order is paid/delivered and contains flash sale items, refresh
      interface OrderItem {
        isFlashSale?: boolean;
        // Add other properties if needed
      }

      if (
        (orderData.paymentStatus === "paid" ||
          orderData.orderStatus === "delivered") &&
        orderData.items &&
        orderData.items.some((item: OrderItem) => item.isFlashSale)
      ) {
        console.log("Flash sale order detected, refreshing data...");
        refreshFlashSaleData();
      }
    } catch (error) {
      console.error("Error checking order status:", error);
    }
  };

  // Periodic check for recent orders that might affect flash sale
  useEffect(() => {
    const checkRecentOrders = async () => {
      try {
        // Get recent orders from last 5 minutes
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

        const response = await fetch(
          getApiUrl(`orders/recent?since=${fiveMinutesAgo.toISOString()}`)
        );
        const recentOrders = await response.json();

        // Check if any recent orders contain flash sale items
        const hasFlashSaleOrders = recentOrders.some(
          (order: any) =>
            (order.paymentStatus === "paid" ||
              order.orderStatus === "delivered") &&
            order.items &&
            order.items.some((item: any) => item.isFlashSale)
        );

        if (hasFlashSaleOrders) {
          console.log("Recent flash sale orders found, refreshing...");
          refreshFlashSaleData();
        }
      } catch (error) {
        // Silently fail - this is just a backup check
        console.log("Background order check failed (normal if not logged in)");
      }
    };

    // Check every 2 minutes for recent orders
    const interval = setInterval(checkRecentOrders, 120000);
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
    return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
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
                <div key={variant._id} className="relative group">
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
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {variant.mau}
                  </span>
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 
                    bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200 whitespace-nowrap z-10"
                  >
                    {formatCurrency(variant.gia)}
                    {variant.so_luong_hang === 0 && " - Hết hàng"}
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
    const prices = variants
      .map((v) => v.gia)
      .filter((price) => typeof price === "number" && !isNaN(price));
    if (prices.length === 0) return null; // No valid prices found
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return { minPrice, maxPrice };
  };

  // Fetch news data
  useEffect(() => {
    setLoadingNews(true);
    fetch("http://localhost:3000/api/news")
      .then((res) => res.json())
      .then((data: NewsItem[]) => setNews(data))
      .finally(() => setLoadingNews(false));
  }, []);

  // Fetch recommended products for user
  useEffect(() => {
    if (!user || !user._id) {
      setRecommendedProducts([]);
      setAiAdvice("");
      setLoadingRecommendSection(false);
      return;
    }
    setLoadingRecommend(true);
    setLoadingRecommendSection(true);
    fetchRecommendedProducts(user._id)
      .then((products) => setRecommendedProducts(products))
      .catch(() => setRecommendedProducts([]))
      .finally(() => setLoadingRecommend(false));

    // Fetch AI advice message
    fetch(`/api/ai-advice?userId=${user._id}`)
      .then((res) => res.json())
      .then((data) => {
        let msg = data.message || "";
        if (Array.isArray(msg)) msg = msg[0] || "";
        if (typeof msg === "string") {
          msg = msg.split("\n")[0];
          if (msg.length > 180) msg = msg.split(". ")[0] + ".";
        }
        setAiAdvice(msg);
      })
      .catch(() => setAiAdvice(""))
      .finally(() => setLoadingRecommendSection(false));
  }, [user]);

  // Các biến lọc sản phẩm hot cho từng loại (đặt ngay trước return)
  const hotIphones: Product[] = data.iPhoneProducts.filter(
    (product: Product) => (product.ban_chay ?? 0) > 10000
  );
  const hotIpads: Product[] = data.iPadProducts.filter(
    (product: Product) => (product.ban_chay ?? 0) > 10000
  );
  const hotMacs: Product[] = data.MacProducts.filter(
    (product: Product) => (product.ban_chay ?? 0) > 10000
  );

  if (loading) {
    return (
      <div className="mt-16 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Generate structured data for homepage
  const generateStructuredData = () => {
    const allProducts = [
      ...data.iPhoneProducts,
      ...data.iPadProducts,
      ...data.MacProducts,
      ...(recommendedProducts || []),
    ];

    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Poly Smart",
      url: "https://polysmart.me",
      description: "Đại lý ủy quyền Apple chính hãng tại Việt Nam",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://polysmart.me/search?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
      offers: allProducts.slice(0, 10).map((product) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: product.TenSP,
          description: product.Mota,
          image: getImageUrl(product.hinh || ""),
          brand: {
            "@type": "Brand",
            name: "Apple",
          },
        },
        price: product.Gia,
        priceCurrency: "VND",
        availability: "https://schema.org/InStock",
      })),
    };
  };

  return (
    <>
      <SEO
        title="Trang chủ"
        description="Poly Smart - Đại lý ủy quyền Apple chính hãng tại Việt Nam. Chuyên cung cấp iPhone, iPad, MacBook, Apple Watch, AirPods với giá tốt nhất. Giao hàng toàn quốc, bảo hành chính hãng."
        keywords={[
          "iPhone chính hãng",
          "iPad chính hãng",
          "MacBook chính hãng",
          "Apple Watch",
          "AirPods",
          "đại lý Apple",
          "Poly Smart",
          "Apple Việt Nam",
        ]}
        structuredData={generateStructuredData()}
      />
      <div
        className="mt-0"
        style={{
          fontFamily:
            "SF Pro, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
        }}
      >
        {/* Banner Slider */}
        <SectionBanner
          banners={banners}
          currentSlide={currentSlide}
          setCurrentSlide={setCurrentSlide}
        />
        {/* Flash Sale Section */}
        <SectionFlashSale
          flashSaleProducts={data.flashSaleProducts}
          showFlashSale={showFlashSale}
          countdown={countdown}
          isRefreshingFlashSale={isRefreshingFlashSale}
          refreshFlashSaleData={refreshFlashSaleData}
          handleFlashSaleClick={handleFlashSaleClick}
          getImageUrl={getImageUrl}
          formatCurrency={formatCurrency}
          loading={loadingFlashSale}
        />
        <GiftVoucher />
        {/* Gợi ý cho bạn Section */}
        <SectionRecommend
          user={user}
          recommendedProducts={recommendedProducts}
          aiAdvice={aiAdvice}
          loadingRecommend={loadingRecommendSection}
          getImageUrl={getImageUrl}
        />
        {/*Sản phẩm nổi bật */}
         <SectionHotIphone
          hotIphones={hotIphones}
          getImageUrl={getImageUrl}
          formatCurrency={formatCurrency}
          specialBanners={specialBanners}
          loading={loadingIphone}
        />
        {/* iPhone Section */}
        <SectionIphone
          products={data.iPhoneProducts}
          getPriceRange={getPriceRange}
          formatCurrency={formatCurrency}
          getImageUrl={getImageUrl}
          loading={loadingIphone}
        />
        <GridiPhone />
        {/*Sản phẩm nổi bật iPad*/}
        <SectionHotIpad
          hotIpads={hotIpads}
          getImageUrl={getImageUrl}
          formatCurrency={formatCurrency}
          specialBannersiPad={specialBannersiPad}
          loading={loadingIpad}
        />
        
        {/* iPad Section */}
        <SectionIpad
          products={data.iPadProducts}
          getPriceRange={getPriceRange}
          formatCurrency={formatCurrency}
          getImageUrl={getImageUrl}
          loading={loadingIpad}
        />
        <GridiPad />
        {/*Sản phẩm nổi bật */}
        {/*Sản phẩm nổi bật Mac*/}
        <SectionHotMac
          hotMacs={hotMacs}
          getImageUrl={getImageUrl}
          formatCurrency={formatCurrency}
          specialBannersMac={specialBannersMac}
          loading={loadingMac}
        />
        {/* Mac Section */}
        <SectionMac
          products={data.MacProducts}
          getPriceRange={getPriceRange}
          formatCurrency={formatCurrency}
          getImageUrl={getImageUrl}
          loading={loadingMac}
        />
        <GridMac />
        {/* Newsfeed Section */}
        <SectionNews news={news} getImageUrl={getImageUrl} loading={loadingNews} />
      </div>
    </>
  );
};

export default HomePage;
