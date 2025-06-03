"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    if (!productId) return;
    const fetchVariants = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/variants/by-product/${productId}`);
        if (!res.ok) throw new Error("Không tìm thấy biến thể hoặc lỗi server");
        const data = await res.json();
        setVariants(data);
        setError("");
      } catch (error: any) {
        setVariants([]);
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
      <h2 className="text-2xl font-semibold mb-4">Danh sách biến thể sản phẩm</h2>
      {variants.length === 0 ? (
        <div>Không có biến thể nào cho sản phẩm này.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Hình</th>
              <th className="border px-4 py-2">Giá</th>
              <th className="border px-4 py-2">Giá gốc</th>
              <th className="border px-4 py-2">Phiên bản</th>
              <th className="border px-4 py-2">Dung lượng</th>
              <th className="border px-4 py-2">Màu</th>
              <th className="border px-4 py-2">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(variant => (
              <tr key={variant._id}>
                <td className="border px-4 py-2">
                  {variant.hinh && variant.hinh.length > 0 ? (
                    <img src={variant.hinh[0]} alt="variant" className="w-16 h-16 object-cover rounded" />
                  ) : (
                    <span>Không có ảnh</span>
                  )}
                </td>
                <td className="border px-4 py-2">{variant.gia?.toLocaleString()}₫</td>
                <td className="border px-4 py-2">{variant.gia_goc?.toLocaleString() || "-"}₫</td>
                <td className="border px-4 py-2">{variant.phien_ban || "-"}</td>
                <td className="border px-4 py-2">{variant.dung_luong || "-"}</td>
                <td className="border px-4 py-2">{variant.mau || "-"}</td>
                <td className="border px-4 py-2">{variant.so_luong_hang ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
