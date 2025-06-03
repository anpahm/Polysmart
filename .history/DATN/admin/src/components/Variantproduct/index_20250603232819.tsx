"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Variant {
  _id: string;
  productId: string;
  ten_bien_the: string;
  gia: number;
  so_luong: number;
  // Thêm các trường khác nếu cần
}

export default function VariantProductPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    const fetchVariants = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/variants?productId=${productId}`);
        const data = await res.json();
        setVariants(data);
      } catch (error) {
        setVariants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVariants();
  }, [productId]);

  if (!productId) return <div>Không tìm thấy sản phẩm!</div>;
  if (loading) return <div>Đang tải biến thể...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Danh sách biến thể sản phẩm</h2>
      {variants.length === 0 ? (
        <div>Không có biến thể nào cho sản phẩm này.</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Tên biến thể</th>
              <th className="border px-4 py-2">Giá</th>
              <th className="border px-4 py-2">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {variants.map(variant => (
              <tr key={variant._id}>
                <td className="border px-4 py-2">{variant.ten_bien_the}</td>
                <td className="border px-4 py-2">{variant.gia}</td>
                <td className="border px-4 py-2">{variant.so_luong}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
