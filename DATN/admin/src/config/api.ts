// Cấu hình API cho Admin
const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  BASE_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
  IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:3000/images',
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.API_URL}/${cleanEndpoint}`;
};

export const getBaseUrl = (): string => {
  return config.BASE_URL;
};

export const getImageUrl = (imagePath: string): string => {
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return `${config.IMAGE_URL}/${cleanPath}`;
}; 