// components/Footer.js
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Facebook, Youtube, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Thông tin cửa hàng */}
          <div>
            <div className="mb-4">
              <Image
                src="/images/banner so 1.png"
                alt="Shop Logo"
                width={120}
                height={30}
              />
            </div>
            <p className="text-sm mb-4">
              Đại lý ủy quyền Apple chính thức tại Việt Nam
            </p>
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">123 Đường ABC, Quận 1, TP.HCM</span>
            </div>
            <div className="flex items-center mb-2">
              <Phone className="w-4 h-4 mr-2" />
              <a href="tel:1900123456" className="text-sm hover:text-white">
                1900.123.456
              </a>
            </div>
            <div className="flex items-center mb-4">
              <Mail className="w-4 h-4 mr-2" />
              <a href="mailto:info@shopdunk.com" className="text-sm hover:text-white">
                info@shopdunk.com
              </a>
            </div>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Thông tin */}
          <div>
            <h3 className="text-white font-bold mb-4">Thông tin</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tin-tuc" className="text-sm hover:text-white">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/gioi-thieu" className="text-sm hover:text-white">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/check-imei" className="text-sm hover:text-white">
                  Check IMEI
                </Link>
              </li>
              <li>
                <Link href="/bao-hanh" className="text-sm hover:text-white">
                  Phạm vi bảo hành
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach-bao-mat" className="text-sm hover:text-white">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/hook" className="text-sm hover:text-white">
                  Hook's Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="text-white font-bold mb-4">Chính sách</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tra-gop" className="text-sm hover:text-white">
                  Trả góp
                </Link>
              </li>
              <li>
                <Link href="/giao-hang" className="text-sm hover:text-white">
                  Giao hàng
                </Link>
              </li>
              <li>
                <Link href="/doi-tra" className="text-sm hover:text-white">
                  Đổi trả
                </Link>
              </li>
              <li>
                <Link href="/bao-hanh" className="text-sm hover:text-white">
                  Bảo hành
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-mua-hang" className="text-sm hover:text-white">
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link href="/ship-cod" className="text-sm hover:text-white">
                  Ship COD
                </Link>
              </li>
            </ul>
          </div>

          {/* Địa chỉ & Bản đồ */}
          <div>
            <h3 className="text-white font-bold mb-4">Hệ thống cửa hàng</h3>
            <div className="rounded-md overflow-hidden h-36 w-full">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.3193600167296!2d106.6952736!3d10.7815814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ1JzA5LjYiTiAxMDYwNDMnMjQuMyJF!5e0!3m2!1svi!2s!4v1647834072073!5m2!1svi!2s" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="Địa chỉ cửa hàng"
              ></iframe>
            </div>
            <Link 
              href="/he-thong-cua-hang" 
              className="block mt-3 text-sm text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Xem tất cả cửa hàng
            </Link>
          </div>
        </div>

       

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-xs text-center">
          <p>© 2025 ShopTech. Tất cả quyền được bảo lưu.</p>
          <p className="mt-2">
            Công ty Cổ phần Công nghệ ShopTech - GPĐKKD: 0123456789 do Sở KHĐT TP.HCM cấp ngày 01/01/2020
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;