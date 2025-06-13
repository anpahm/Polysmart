'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Search, User } from 'lucide-react';
import { Category, Settings, Logo, Product } from './cautrucdata';
import { getApiUrl, fetchApi, API_ENDPOINTS } from '@/config/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useRouter } from 'next/navigation';

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

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [user, setUser] = useState<any>(null);
  const cart = useSelector((state: RootState) => state.cart.items);
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const router = useRouter();

  // Thêm state kiểm tra đã vào client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(getApiUrl('settings'));
        const settingsData = await response.json();
        console.log('Settings data received:', settingsData);
        const settingObj = Array.isArray(settingsData) ? settingsData[0] : settingsData;
        setSettings(settingObj);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(getApiUrl('/categories'));
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Xử lý hiệu ứng khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add debug effect
  useEffect(() => {
    if (settings?.Logo) {

    }
  }, [settings]);

  // Kiểm tra session khi component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const userData = await fetchApi(API_ENDPOINTS.GET_USER);
        setUser(userData);
      } catch (error: any) {
        console.log('Chưa đăng nhập');
        setUser(null); // Đảm bảo user là null nếu không đăng nhập
      }
    };

    checkSession();
  }, []); // Dependency array rỗng để chỉ chạy một lần khi component mount

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      await fetchApi(API_ENDPOINTS.LOGOUT, {
        method: 'POST'
      });
      // Xóa token khỏi localStorage
      localStorage.removeItem('token');
      setUser(null);
      setShowUserDropdown(false);
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error('Lỗi đăng xuất:', error);
      // Vẫn chuyển hướng về trang đăng nhập nếu có lỗi
      router.push("/");
      router.refresh();
    }
  };

  // Xử lý click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lấy logoUrl đúng chuẩn từ settings.Logo
  const logoUrl = settings?.Logo ? getImageUrl(settings.Logo) : '';

  // Xử lý tìm kiếm sản phẩm
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?keyword=${encodeURIComponent(searchTerm)}`;
      setShowSearch(false);
    }
  };

  // Hàm lọc sản phẩm theo từ khóa
  const filterProducts = (products: any[], searchTerm: string) => {
    const normalizedTerm = searchTerm.trim().toLowerCase();

    // Tách số từ chuỗi tìm kiếm (ví dụ: "iPhone 15" -> 15)
    const numberInSearch = parseInt(normalizedTerm.match(/\d+/)?.[0] || "0");
    const baseSearchTerm = normalizedTerm.replace(/\d+/g, '').trim(); // Lấy phần chữ (ví dụ: "iPhone 15" -> "iPhone")

    return products.filter(product => {
      if (!product.TenSP) return false;

      const productName = product.TenSP.trim().toLowerCase();
      const productNumber = parseInt(productName.match(/\d+/)?.[0] || "0");

      // Nếu tìm kiếm có số (ví dụ: iPhone 15)
      if (numberInSearch > 0) {
        // Kiểm tra xem tên sản phẩm có chứa phần chữ của từ khóa không
        const hasBaseTerm = productName.includes(baseSearchTerm);

        // Kiểm tra điều kiện số
        const numberMatches = productNumber >= numberInSearch;

        // Chỉ trả về true nếu cả hai điều kiện đều đúng
        return hasBaseTerm && numberMatches;
      }

      return productName.includes(normalizedTerm);
    });
  };

  // Fetch gợi ý sản phẩm khi nhập từ khóa (debounce)
  useEffect(() => {
    if (!showSearch || !searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggest(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(getApiUrl('products'));
        const data = await res.json();
        if (Array.isArray(data)) {
          const filteredProducts = filterProducts(data, searchTerm)
            .sort((a, b) => {
              // Sắp xếp ưu tiên sản phẩm có tên chứa đúng từ khóa
              const aName = a.TenSP.toLowerCase();
              const bName = b.TenSP.toLowerCase();
              const searchTermLower = searchTerm.toLowerCase();
              const aContains = aName.includes(searchTermLower);
              const bContains = bName.includes(searchTermLower);

              if (aContains && !bContains) return -1;
              if (!aContains && bContains) return 1;

              // Nếu cả hai đều chứa hoặc không chứa, sắp xếp theo độ tương đồng
              return aName.localeCompare(bName);
            })
            .slice(0, 6); // Giới hạn 6 gợi ý

          setSuggestions(filteredProducts);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggest(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm, showSearch]);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
      style={{ backgroundColor: '#515154' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              {logoUrl && (
                <div className="relative w-32 h-13">
                  <Image
                    src={logoUrl}
                    alt="Logo"
                    width={128}
                    height={24}
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </Link>
          </div>

          {/* Thanh tìm kiếm nổi bật khi showSearch */}
          {showSearch && (
            <>
              {/* Overlay làm mờ/tối nền */}
              <div
                className="fixed inset-0 bg-black bg-opacity-70 z-40"
                onClick={() => setShowSearch(false)}
              />
              {/* Ô tìm kiếm nổi bật */}
              <form
                onSubmit={handleSearch}
                className="fixed left-1/2 top-[-20px] -translate-x-1/2 mt-8 w-[760px] z-50"
                autoComplete="off"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Tìm kiếm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded shadow-lg text-black text-base"
                  />
                  {/* Gợi ý sản phẩm */}
                  {searchTerm && (
                    <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg max-h-80 overflow-y-auto z-50">
                      {loadingSuggest ? (
                        <div className="p-3 text-gray-500 text-sm">Đang tìm...</div>
                      ) : suggestions.length > 0 ? (
                        suggestions.map(product => (
                          <Link
                            key={product._id}
                            href={`/product/${product._id}`}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
                            onClick={() => setShowSearch(false)}
                          >
                            <img
                              src={getImageUrl(Array.isArray(product.hinh) ? product.hinh[0] : product.hinh)}
                              alt={product.TenSP}
                              className="w-10 h-10 object-contain rounded border"
                            />
                            <span className="text-sm text-gray-800">{product.TenSP}</span>
                          </Link>
                        ))
                      ) : (
                        <div className="p-3 text-gray-500 text-sm">Không tìm thấy sản phẩm</div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </>
          )}

          {/* Menu chính */}
          <nav className="hidden md:flex space-x-8">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category._id}`}
                className="text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium"
              >
                {category.ten_danh_muc}
              </Link>
            ))}

            <div className="relative group">
              <button className="text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium flex items-center">
                Dịch vụ
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                <div className="py-1">
                  <Link href="/bao-hanh" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Bảo hành
                  </Link>
                  <Link href="/sua-chua" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sửa chữa
                  </Link>
                  <Link href="/trade-in" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Trade-in
                  </Link>
                </div>
              </div>
            </div>
            <Link href="/news" className="text-gray-300 hover:text-white px-2 py-1 rounded-md text-sm font-medium">
              Tin tức
            </Link>
          </nav>

          {/* Icons bên phải */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-300 hover:text-white"
              onClick={() => setShowSearch(true)}
            >
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="text-gray-300 hover:text-white relative">
              <ShoppingBag className="w-5 h-5" />
              {isClient && totalQty > 0 && (
                <span
                  className="absolute -top-1 -right-1 bg-white text-[10px] font-bold rounded-full border border-gray-200 px-0.5 py-0.5 shadow"
                  style={{
                    minWidth: 12,
                    minHeight: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                  }}
                >
                  {totalQty}
                </span>
              )}
            </Link>

            {/* User account with click toggle dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="text-gray-300 hover:text-white flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                {user && (
                  <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">{user.TenKH}</span>
                )}
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10">
                  <div className="px-4 py-3">
                    {user ? (
                      <>
                        <Link
                          href="/profile"
                          className="block py-2 text-sm text-gray-800 hover:text-gray-600"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Tài khoản của tôi
                        </Link>
                        {/* <Link
                          href="/orders"
                          className="block py-2 text-sm text-gray-800 hover:text-gray-600"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Đơn hàng của tôi
                        </Link> */}
                        <div className="my-1 border-t border-gray-200"></div>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left py-2 text-sm text-gray-800 hover:text-gray-600"
                        >
                          Đăng xuất
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/register"
                          className="block py-2 text-sm text-gray-800 hover:text-gray-600"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Tạo tài khoản ngay
                        </Link>
                        <div className="my-1 border-t border-gray-200"></div>
                        <Link
                          href="/login"
                          className="block py-2 text-sm text-gray-800 hover:text-gray-600"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          Đăng nhập
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden flex items-center px-4 py-2">
        <button className="text-gray-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;