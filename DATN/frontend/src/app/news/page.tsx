'use client';

import React, { useEffect, useState } from "react";
import { FaApple} from "react-icons/fa";
import NewsCard, { NewsItem } from "@/components/NewsCard";
import Link from "next/link";

// Định nghĩa kiểu dữ liệu
interface Category {
  _id: string;
  ten_danh_muc: string;
}

export default function NewsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy danh mục
    fetch("http://localhost:3000/api/newscategory")
      .then(res => res.json())
      .then((data: Category[]) => setCategories(data));

    // Gọi API lấy tin tức
    fetch("http://localhost:3000/api/news")
      .then(res => res.json())
      .then((data: NewsItem[]) => setNews(data))
      .finally(() => setLoading(false));
  }, []);

  // Lấy 3 tin đầu tiên làm featured
  const featuredNews = news.slice(0, 3);
  // News list chỉ lấy từ tin thứ 4 trở đi
  const newsList = news.slice(3);

  // Gom tin tức theo danh mục
  const newsByCategory: { [catId: string]: NewsItem[] } = {};
  categories.forEach(cat => {
    newsByCategory[cat._id] = news.filter(n => n.id_danh_muc && n.id_danh_muc.ten_danh_muc === cat.ten_danh_muc);
  });

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb + Title */}
      <div className="w-full bg-white pt-6 pb-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-gray-500 text-sm mb-2">Trang chủ <span className="mx-1">›</span> Tin tức</div>
          <h1 className="text-3xl font-bold text-center mb-2">Tin tức</h1>
        </div>
      </div>
      {/* Featured News */}
      <div className="max-w-5xl mx-auto px-4 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative rounded-xl overflow-hidden h-72 flex items-end">
            {featuredNews[0] && (
              <>
                <img src={featuredNews[0].hinh} alt={featuredNews[0].tieu_de} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="relative z-10 p-6 w-full">
                  <h2 className="text-2xl font-bold text-white mb-2 drop-shadow">{featuredNews[0].tieu_de}</h2>
                  <p className="text-white text-base drop-shadow">{featuredNews[0].mo_ta}</p>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-col gap-4">
            {featuredNews.slice(1).map((item) => (
              <div key={item._id} className="relative rounded-xl overflow-hidden h-32 flex items-end">
                <img src={item.hinh} alt={item.tieu_de} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                <div className="relative z-10 p-3 w-full">
                  <h3 className="text-lg font-semibold text-white drop-shadow mb-1">{item.tieu_de}</h3>
                  <p className="text-white text-xs drop-shadow">{item.mo_ta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Category Filter */}
      <div className="max-w-5xl mx-auto px-4 mt-6 flex flex-wrap gap-3 justify-center">
        {categories.map(cat => (
          <Link
            key={cat._id}
            href={`/news/${cat._id}`}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-100 transition text-base font-medium"
          >
            <span className="text-lg"><FaApple /></span>
            {cat.ten_danh_muc}
          </Link>
        ))}
      </div>
      {/* News by Category */}
      <div className="flex justify-center">
        <div className="max-w-5xl w-full px-4 mt-8">
          {categories.map(cat => (
            <div key={cat._id} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{cat.ten_danh_muc}</h2>
                <Link href={`/news/${cat._id}`} className="text-blue-600 text-sm hover:underline">Xem tất cả {cat.ten_danh_muc} &rarr;</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsByCategory[cat._id]?.slice(0, 4).map(item => <NewsCard key={item._id} item={item} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 