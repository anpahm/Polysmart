/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3000',
        pathname: '/images/**',
      }
    ],
    unoptimized: true, // Cho phép dùng ảnh local mà không tối ưu hóa
  },
  // Tăng giới hạn kích thước hình ảnh
  experimental: {
    largePageDataBytes: 128 * 100000, // Tăng giới hạn dữ liệu trang
  },
  // Thêm các cấu hình khác nếu cần
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm)$/,
      type: 'asset/resource',
    });
    return config;
  }
}

module.exports = nextConfig
