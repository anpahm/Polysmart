// Cấu hình API cho Admin
const config = {
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
};

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${config.API_URL}/${cleanEndpoint}`;
}; 