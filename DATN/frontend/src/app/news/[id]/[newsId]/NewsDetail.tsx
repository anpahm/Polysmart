'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface NewsDetail {
  _id: string;
  tieu_de: string;
  mo_ta: string;
  hinh: string;
  ngay: string;
  noi_dung: string;
  luot_xem: number;
  id_danh_muc: {
    _id: string;
    ten_danh_muc: string;
  };
  nguoi_dang: {
    TenKH: string;
  };
}

export default function NewsDetailComponent({ newsId }: { newsId: string }) {
  const [newsDetail, setNewsDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        const response = await fetch(`https://polysmart.me/api/news/${newsId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news detail');
        }
        const data = await response.json();
        setNewsDetail(data);
      } catch (error) {
        console.error('Error fetching news detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!newsDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Không tìm thấy tin tức</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:underline">Trang chủ</Link>
        <span className="mx-2">/</span>
        <Link href="/news" className="hover:underline">Tin tức</Link>
        <span className="mx-2">/</span>
        <span>{newsDetail.tieu_de}</span>
      </nav>

      {/* Article Content */}
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {newsDetail.tieu_de}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <time dateTime={newsDetail.ngay}>
              {format(new Date(newsDetail.ngay), 'dd MMMM yyyy', { locale: vi })}
            </time>
            <span className="mx-2">•</span>
            <span>{newsDetail.luot_xem} lượt xem</span>
            <span className="mx-2">•</span>
            <span>Đăng bởi {newsDetail.nguoi_dang?.TenKH || "Không rõ"}</span>
          </div>

          {newsDetail.hinh && (
            <figure className="relative w-full h-[400px] mb-8">
              <Image
                src={`https://polysmart.me/${newsDetail.hinh}`}
                alt={newsDetail.tieu_de}
                fill
                className="object-cover rounded-lg"
              />
            </figure>
          )}

          {/* Mô tả */}
          <div className="text-lg text-gray-600 mb-8 font-medium italic border-l-4 border-blue-500 pl-4">
            {newsDetail.mo_ta}
          </div>

          {/* Nội dung chính với định dạng đẹp */}
          <div className="prose prose-lg max-w-none space-y-6">
            {newsDetail.noi_dung.split('\n\n').map((paragraph, index) => {
              // Kiểm tra nếu đoạn bắt đầu bằng emoji hoặc ký tự đặc biệt
              if (paragraph.match(/^[🔒✅🔐🎛️📲🌐🤖🍏🗣️💡⚙️💰📊☁️🌍📸🔋🔊]/)) {
                const [title, ...content] = paragraph.split('\n');
                return (
                  <div key={index} className="mt-8">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 mb-4">
                      {title}
                    </h2>
                    <div className="text-gray-600 leading-relaxed pl-4 border-l-2 border-gray-200">
                      {content.map((line, i) => (
                        <p key={i} className="mb-2">{line}</p>
                      ))}
                    </div>
                  </div>
                );
              }
              // Đoạn văn bình thường
              return (
                <p key={index} className="text-gray-600 leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      </article>

      {/* Schema.org Article Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": newsDetail.tieu_de,
            "description": newsDetail.mo_ta,
            "image": [`https://polysmart.me/${newsDetail.hinh}`],
            "datePublished": newsDetail.ngay,
            "dateModified": newsDetail.ngay,
            "author": [{
              "@type": "Person",
              "name": newsDetail.nguoi_dang?.TenKH || "Không rõ"
            }],
            "publisher": {
              "@type": "Organization",
              "name": "Polysmart",
              "logo": {
                "@type": "ImageObject",
                "url": "https://polysmart.me/logo.png"
              }
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://polysmart.me/news/${newsDetail.id_danh_muc._id}/${newsDetail._id}`
            }
          })
        }}
      />
    </div>
  );
} 