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
  console.log('API Request Details:', {
    baseUrl: API_BASE_URL,
    endpoint: endpoint,
    fullUrl: url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body
  });

  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    console.log('Response Details:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Fetch Error:', error);
    throw error;
  }
};

// Các endpoint API
export const API_ENDPOINTS = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  LOGOUT: '/users/logout',
  GET_USER: '/users/userinfo',
  SETTINGS: '/settings',
  CATEGORIES: '/categories',
  PRODUCTS: '/products',
};

const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
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