"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getApiUrl } from "@/config/api";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN").format(amount) + "₫";

const DEFAULT_PAGE_SIZE = 8;

export default function SearchResult() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Cập nhật keyword khi URL thay đổi
  useEffect(() => {
    setKeyword(searchParams.get("keyword") || "");
    setPage(1); // Reset về trang 1 khi keyword thay đổi
  }, [searchParams]);

  // Lấy sản phẩm theo từ khóa
  useEffect(() => {
    if (!keyword) return;
    setLoading(true);
    fetch(getApiUrl(`products?keyword=${encodeURIComponent(keyword)}`))
      .then((res) => res.json())
      .then((data) => {
        // Lọc chính xác TenSP (không phân biệt hoa thường, bỏ khoảng trắng thừa)
        const filtered = Array.isArray(data)
          ? data.filter(
              (sp) =>
                sp.TenSP &&
                sp.TenSP.trim().toLowerCase() === keyword.trim().toLowerCase()
            )
          : [];
        setProducts(filtered);
      })
      .finally(() => setLoading(false));
  }, [keyword]);

  // Xử lý submit form tìm kiếm
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  // Phân trang
  const totalPages = Math.ceil(products.length / pageSize);
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  // Khi đổi pageSize thì về trang 1
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  return (
    <div className="bg-[#f5f6fa] min-h-screen py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Tìm kiếm</h1>
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block mb-2 font-medium">Tìm từ khóa:</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 border rounded px-4 py-2"
              placeholder="Nhập tên sản phẩm..."
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 rounded font-semibold hover:bg-blue-700 transition"
            >
              TÌM KIẾM
            </button>
          </div>
        </form>

        {/* Bộ lọc & phân trang */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Sắp xếp theo</span>
            <select className="border rounded px-2 py-1 text-sm">
              <option>Mới nhất</option>
              <option>Giá tăng dần</option>
              <option>Giá giảm dần</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Hiển thị</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
            <span className="text-sm">trên một trang</span>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        {loading ? (
          <div className="text-center py-10 text-gray-500">Đang tải...</div>
        ) : pagedProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Không tìm thấy sản phẩm nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {pagedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-3 relative"
              >
                {/* Badge giảm giá, mới, trả góp */}
                {product.khuyen_mai && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Giảm {product.khuyen_mai}%
                  </span>
                )}
                {product.moi && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                    Mới
                  </span>
                )}
                {/* Ảnh sản phẩm */}
                <Link href={`/product/${product._id}`}>
                  <div className="relative w-full h-48 mb-3">
                    <Image
                      src={
                        Array.isArray(product.hinh)
                          ? product.hinh[0]
                          : product.hinh
                      }
                      alt={product.TenSP}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <div className="font-semibold text-gray-800 mb-1 min-h-[40px]">
                    {product.TenSP}
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(
                        product.Gia *
                          (1 - (product.khuyen_mai ? product.khuyen_mai / 100 : 0))
                      )}
                    </span>
                    {product.khuyen_mai && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.Gia)}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-3 py-1 rounded border bg-white ${page === i + 1 ? "bg-blue-600 text-white" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}