// Định nghĩa cấu trúc cho Category
export interface Category {
  _id: string;
  ten_danh_muc: string;
  banner_dm: string;
}

// Định nghĩa cấu trúc cho ProductVariant
export interface ProductVariant {
  _id: string;
  id_san_pham: string;
  hinh: string;
  gia: number;
  gia_goc: number;
  phien_ban: string;
  dung_luong: string;
  mau: string;
  so_luong_hang: number;
}

// Định nghĩa cấu trúc cho Product
export interface Product {
  _id: string;
  TenSP: string;
  Gia: number;
  khuyen_mai?: number;
  Mota?: string;
  hinh: string[];
  thongso?: string;
  an_hien?: boolean;
  ngay_tao?: string;
  id_danhmuc: string;
  Soluong: number;
  variants?: ProductVariant[];
}

// Định nghĩa Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
export interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  link: string;
}
export interface Logo{
  id: number;
  image: string;
  title: string;
  
}
export interface HomePageData {
  flashSaleProducts: Product[];
  iPhoneProducts: Product[];
  iPadProducts: Product[];
  categories: Category[];
}
export interface Settings {
  _id: string;
  Logo: string;
  Banner: string;
  Page: string;
  So_dien_thoai: string;
  Thong_bao: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
