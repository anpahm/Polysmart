"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaEdit, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";

interface Variant {
  _id: string;
  id_san_pham: string;
  hinh: string[];
  gia: number;
  gia_goc?: number;
  dung_luong?: string;
  mau?: string;
  so_luong_hang?: number;
}

export default function VariantProductPage({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImgs, setCurrentImgs] = useState<number[]>([]);

  useEffect(() => {
    if (!productId) return;
    const fetchVariants = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/variants/by-product/${productId}`);
        if (!res.ok) throw new Error("Không tìm thấy biến thể hoặc lỗi server");
        const data = await res.json();
        setVariants(data);
        setCurrentImgs(Array(data.length).fill(0));
        setError("");
      } catch (error: any) {
        setVariants([]);
        setCurrentImgs([]);
        setError(error.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [productId]);

  if (!productId) return <div>Không tìm thấy sản phẩm!</div>;
  if (loading) return <div>Đang tải biến thể...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Danh sách biến thể sản phẩm</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          onClick={() => {/* TODO: handle add variant */}}
        >
          <FaPlus /> Thêm biến thể
        </button>
      </div>
      {variants.length === 0 ? (
        <div>Không có biến thể nào cho sản phẩm này.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">STT</th>
              <th className="border px-4 py-2">Hình</th>
              <th className="border px-4 py-2">Giá</th>
              <th className="border px-4 py-2">Giá gốc</th>
              <th className="border px-4 py-2">Dung lượng</th>
              <th className="border px-4 py-2">Màu</th>
              <th className="border px-4 py-2">Số lượng</th>
              <th className="border px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, idx) => {
              const totalImgs = variant.hinh?.length || 0;
              const currentImg = currentImgs[idx] || 0;
              return (
                <tr key={variant._id}>
                  <td className="border px-4 py-2 text-center">{idx + 1}</td>
                  <td className="border px-4 py-2 min-w-[80px]">
                    {totalImgs > 0 ? (
                      <div className="relative flex items-center justify-center w-20 h-20">
                        <button
                          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full px-1 py-0.5 text-xs"
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentImgs(imgs => imgs.map((v, i) => i === idx ? (v - 1 + totalImgs) % totalImgs : v));
                          }}
                          disabled={totalImgs <= 1}
                        >
                          &#8592;
                        </button>
                        <Image
                          src={getImageUrl(variant.hinh[currentImg])}
                          alt={`variant-img-${currentImg}`}
                          width={64}
                          height={64}
                          className="rounded object-cover border mx-6"
                        />
                        <button
                          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full px-1 py-0.5 text-xs"
                          onClick={e => {
                            e.stopPropagation();
                            setCurrentImgs(imgs => imgs.map((v, i) => i === idx ? (v + 1) % totalImgs : v));
                          }}
                          disabled={totalImgs <= 1}
                        >
                          &#8594;
                        </button>
                      </div>
                    ) : (
                      <span>Không có ảnh</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">{variant.gia?.toLocaleString()}₫</td>
                  <td className="border px-4 py-2">{variant.gia_goc?.toLocaleString() || "-"}₫</td>
                  <td className="border px-4 py-2">{variant.dung_luong || "-"}</td>
                  <td className="border px-4 py-2">{variant.mau || "-"}</td>
                  <td className="border px-4 py-2">{variant.so_luong_hang ?? "-"}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full mr-2"
                      title="Sửa"
                      onClick={() => {/* TODO: handle edit variant */}}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`p-2 ${variant.so_luong_hang === 0 ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white rounded-full`}
                      title={variant.so_luong_hang === 0 ? "Hiện" : "Ẩn"}
                      onClick={() => {/* TODO: handle toggle visibility */}}
                    >
                      {variant.so_luong_hang === 0 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function getImageUrl(image: string | undefined): string {
  if (!image) return "/no-image.png";
  if (image.startsWith("http")) return image;
  return `http://localhost:3000/images/${image.replace(/^\/images\//, "")}`;
}
