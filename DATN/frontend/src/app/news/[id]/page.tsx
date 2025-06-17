'use client';

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NewsCard, { NewsItem } from "@/components/NewsCard";

interface Category {
  _id: string;
  ten_danh_muc: string;
}

export default function NewsCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    fetch("http://localhost:3000/api/newscategory")
      .then(res => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        const found = data.find(c => c._id === categoryId);
        setCategory(found || null);
      });
  }, [categoryId]);

  useEffect(() => {
    fetch("http://localhost:3000/api/news")
      .then(res => res.json())
      .then((data: NewsItem[]) => {
        const filtered = data.filter(n => n.id_danh_muc && n.id_danh_muc.ten_danh_muc === (category?.ten_danh_muc || ""));
        setNews(filtered);
      });
  }, [category?.ten_danh_muc]);

  const filteredNews = news.filter(n =>
    n.tieu_de.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNews.length / pageSize);
  const pagedNews = filteredNews.slice((page - 1) * pageSize, page * pageSize);

  if (!category) return <div>Đang tải...</div>;

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      <div className="max-w-6xl mx-auto w-full flex py-4">
        {/* Sidebar */}
        <aside className="w-60 bg-gray rounded-lg shadow-sm min-h-[calc(100vh-2rem)] py-8 px-4">
          <div className="font-bold mb-4">Tin tức</div>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li key={cat._id}>
                <button
                  className={`w-full text-left px-3 py-2 rounded ${cat._id === categoryId ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100"}`}
                  onClick={() => router.push(`/news/${cat._id}`)}
                >
                  {cat.ten_danh_muc}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        {/* Main content */}
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">{category.ten_danh_muc}</h1>
            <input
              className="border px-3 py-2 rounded mb-6 w-full max-w-md"
              placeholder="Tìm kiếm"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pagedNews.map(item => <NewsCard key={item._id} item={item} />)}
            </div>
            {/* Pagination */}
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-500 text-white" : "bg-white border"}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
