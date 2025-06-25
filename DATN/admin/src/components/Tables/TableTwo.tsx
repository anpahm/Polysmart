"use client";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/no-image.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/')) return imageUrl;
  return `/images/${imageUrl}`;
};

const FILTER_OPTIONS = [
  { value: "top_sold", label: "Bán chạy nhất" },
  { value: "least_sold", label: "Bán ít nhất" },
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "hot", label: "Sản phẩm hot" },
  { value: "hidden", label: "Đang ẩn" },
];

const TableTwo = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filterOption, setFilterOption] = useState("top_sold");

  useEffect(() => {
    fetch("http://localhost:3000/api/products")
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = useMemo(() => {
    let arr = [...products];
    switch (filterOption) {
      case "top_sold":
        arr = arr.sort((a, b) => (b.ban_chay || 0) - (a.ban_chay || 0));
        break;
      case "least_sold":
        arr = arr.sort((a, b) => (a.ban_chay || 0) - (b.ban_chay || 0));
        break;
      case "newest":
        arr = arr.sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime());
        break;
      case "oldest":
        arr = arr.sort((a, b) => new Date(a.ngay_tao).getTime() - new Date(b.ngay_tao).getTime());
        break;
      case "hot":
        arr = arr.filter(p => p.hot);
        break;
      case "hidden":
        arr = arr.filter(p => p.an_hien === false);
        break;
      default:
        break;
    }
    return arr.slice(0, 5);
  }, [products, filterOption]);

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between px-4 py-6 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Sản phẩm nổi bật
        </h4>
        <select
          className="border rounded px-3 py-2"
          value={filterOption}
          onChange={e => setFilterOption(e.target.value)}
        >
          {FILTER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5">
        <div className="col-span-3 flex items-center">
          <p className="font-medium">Tên sản phẩm</p>
        </div>
        <div className="col-span-2 hidden items-center sm:flex">
          <p className="font-medium">Danh mục</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Giá</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Lượt bán</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Trạng thái</p>
        </div>
      </div>

      {filteredProducts.map((product, key) => (
        <div
          className="grid grid-cols-6 border-t border-stroke px-4 py-4.5 dark:border-strokedark sm:grid-cols-8 md:px-6 2xl:px-7.5"
          key={product._id || key}
        >
          <div className="col-span-3 flex items-center">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-12.5 w-15 rounded-md">
                <Image
                  src={getImageUrl(product.hinh)}
                  width={60}
                  height={50}
                  alt={product.TenSP || product.name || "Product"}
                />
              </div>
              <p className="text-sm text-black dark:text-white">
                {product.TenSP || product.name}
              </p>
            </div>
          </div>
          <div className="col-span-2 hidden items-center sm:flex">
            <p className="text-sm text-black dark:text-white">
              {product.categories?.[0]?.ten_danh_muc || product.category || "-"}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">
              {product.price ? `$${product.price}` : (product.gia ? `${product.gia}₫` : "Chưa có giá")}
            </p>
          </div>
          <div className="col-span-1 flex items-center">
            <p className="text-sm text-black dark:text-white">{product.ban_chay || product.sold || 0}</p>
          </div>
          <div className="col-span-1 flex items-center">
            <span className={`text-xs px-2 py-1 rounded-full ${product.an_hien === false ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
              {product.an_hien === false ? "Ẩn" : "Hiện"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTwo;
