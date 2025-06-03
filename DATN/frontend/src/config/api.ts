// Cấu hình API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Log để debug
console.log('API Base URL:', API_BASE_URL);

// Hàm xử lý lỗi fetch
const handleFetchError = (error: any) => {
  console.error('Lỗi kết nối:', error);
  throw new Error('Không thể kết nối đến server. Vui lòng thử lại sau.');
};

// Hàm fetch với xử lý lỗi
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Fetching URL:', url); // Log URL đang gọi

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Response status:', response.status); // Log status code

    // Kiểm tra content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server trả về định dạng không hợp lệ');
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', data); // Log chi tiết lỗi
      throw new Error(data.message || 'Có lỗi xảy ra');
    }

    return data;
  } catch (error: any) {
    console.error('Fetch Error:', error); // Log chi tiết lỗi

    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error(`Không thể kết nối đến server (${url}). Vui lòng kiểm tra:
        1. Backend đã được khởi động chưa
        2. URL backend có đúng không
        3. Có vấn đề về CORS không
        4. Kết nối mạng có ổn định không`);
    }

    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      throw new Error('Server trả về dữ liệu không hợp lệ');
    }

    throw error;
  }
};

// Các endpoint API
export const API_ENDPOINTS = {
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  LOGOUT: '/api/users/logout',
  GET_USER: '/api/users/userinfo',
  SETTINGS: '/api/settings',
  CATEGORIES: '/api/categories',
  PRODUCTS: '/api/products',
};

const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL,
  STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL,
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.API_URL}/${cleanEndpoint}`;
};

export const getImageUrl = (path: string) => {
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:3000';
  if (!path) return '/images/no-image.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Xóa /images/ ở đầu nếu có, tránh lặp
  const cleanPath = path.replace(/^\/?images\//, '');
  return `${IMAGE_BASE_URL}/images/${cleanPath}`;
};

export const getStorageUrl = (path: string): string => {
  if (!path) return '/images/no-image.png';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/images/')) {
    return path;
  }
  return `/images/${path}`;
};

export default config; 