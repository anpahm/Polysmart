/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FaEdit, FaEye, FaEyeSlash, FaPlus, FaTrash } from "react-icons/fa";
import React from "react";

interface Variant {
  _id: string;
  id_san_pham: string;
  hinh: string[];
  gia: number;
  gia_goc?: number;
  dung_luong?: string;
  mau?: string;
  so_luong_hang?: number;
  an_hien?: boolean; 
}

export default function VariantProductPage({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImgs, setCurrentImgs] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editVariant, setEditVariant] = useState<Variant | null>(null);
  const [form, setForm] = useState<Partial<Variant>>({
    hinh: [],
    gia: 0,
    gia_goc: 0,
    dung_luong: "",
    mau: "",
    so_luong_hang: 0,
    an_hien: true,
  });
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

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

  // Mở modal Thêm
  const handleAdd = () => {
    setEditVariant(null);
    setForm({
      hinh: [],
      gia: 0,
      gia_goc: 0,
      dung_luong: "",
      mau: "",
      so_luong_hang: 0,
      an_hien: true,
    });
    setShowModal(true);
  };

  // Mở modal Sửa
  const handleEdit = (variant: Variant) => {
    setEditVariant(variant);
    setForm({ ...variant });
    setShowModal(true);
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.gia || !form.dung_luong || !form.mau) {
      setFormError("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      let res;
      if (editVariant) {
        res = await fetch(`http://localhost:3000/api/variants/${editVariant._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(`http://localhost:3000/api/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, id_san_pham: productId }),
        });
      }
      if (!res.ok) throw new Error("Lỗi khi lưu biến thể");
      setShowModal(false);
      setEditVariant(null);
      setForm({
        hinh: [],
        gia: 0,
        gia_goc: 0,
        dung_luong: "",
        mau: "",
        so_luong_hang: 0,
        an_hien: true,
      });
      // Refresh lại danh sách
      const data = await fetch(`http://localhost:3000/api/variants/by-product/${productId}`).then(r => r.json());
      setVariants(data);
      setCurrentImgs(Array(data.length).fill(0));
    } catch (err: any) {
      setFormError(err.message || "Lỗi không xác định");
    }
  };

  // Xử lý upload file hình ảnh
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      try {
        const res = await fetch("http://localhost:3000/api/variants/upload-image", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Lỗi upload hình ảnh");
        const data = await res.json();
        if (data.url) uploadedUrls.push(data.url);
      } catch (err) {
        alert("Lỗi upload hình ảnh: " + (err as any).message);
      }
    }
    setForm(f => ({ ...f, hinh: [...(f.hinh as string[] || []), ...uploadedUrls] }));
    setUploading(false);
    e.target.value = ""; // reset input
  };

  if (!productId) return <div>Không tìm thấy sản phẩm!</div>;
  if (loading) return <div>Đang tải biến thể...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Danh sách biến thể sản phẩm</h2>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
          onClick={handleAdd}
        >
          <FaPlus /> Thêm biến thể
        </button>
      </div>
      {/* Modal Thêm/Sửa biến thể */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm pt-20">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[900px] relative max-h-[90vh] flex flex-col">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">
              {editVariant ? "Sửa biến thể" : "Thêm biến thể mới"}
            </h2>
            {/* Nội dung form cuộn được */}
            <form className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[70vh]" onSubmit={handleSubmit}>
              {/* Thêm input nhiều hình ảnh */}
              <div>
                <label className="block font-semibold mb-1">Hình ảnh biến thể</label>
                {/* Input file để upload nhiều hình */}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mb-2"
                  onChange={handleFileChange}
                />
                {/* Danh sách preview hình và input link */}
                {(form.hinh as string[] || []).length > 0 && (
                  <div className="flex flex-col gap-2 mb-2 max-h-64 overflow-y-auto pr-0">
                    {(form.hinh as string[]).map((img, idx) => (
                      <div key={idx} className="flex items-center gap-2 min-w-0">
                        <img
                          src={getImageUrl(img)}
                          alt={`preview-${idx}`}
                          className="w-16 h-16 object-cover border rounded bg-white flex-shrink-0"
                          onError={e => (e.currentTarget.src = "/no-image.png")}
                        />
                        <input
                          type="text"
                          className="border rounded px-3 py-2 flex-1 min-w-0"
                          style={{overflow: 'hidden', textOverflow: 'ellipsis'}}
                          placeholder={`Link hình #${idx + 1}`}
                          value={img}
                          onChange={e => setForm(f => ({
                            ...f,
                            hinh: (f.hinh as string[]).map((h, i) => i === idx ? e.target.value : h)
                          }))}
                        />
                        {/* Nút di chuyển lên */}
                        <button
                          type="button"
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          disabled={idx === 0}
                          onClick={() => setForm(f => ({
                            ...f,
                            hinh: (() => {
                              const arr = [...(f.hinh as string[])];
                              if (idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                              return arr;
                            })()
                          }))}
                          title="Di chuyển lên"
                        >↑</button>
                        {/* Nút di chuyển xuống */}
                        <button
                          type="button"
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          disabled={idx === (form.hinh as string[]).length - 1}
                          onClick={() => setForm(f => ({
                            ...f,
                            hinh: (() => {
                              const arr = [...(f.hinh as string[])];
                              if (idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                              return arr;
                            })()
                          }))}
                          title="Di chuyển xuống"
                        >↓</button>
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                          onClick={() => setForm(f => ({
                            ...f,
                            hinh: (f.hinh as string[]).filter((_, i) => i !== idx)
                          }))}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  onClick={() => setForm(f => ({
                    ...f,
                    hinh: [...(f.hinh as string[] || []), ""]
                  }))}
                >
                  + Thêm hình (bằng link)
                </button>
              </div>
              <input
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Giá"
                value={form.gia ?? ""}
                onChange={e => setForm(f => ({ ...f, gia: Number(e.target.value) }))
                }
                required
              />
              <input
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Giá gốc"
                value={form.gia_goc ?? ""}
                onChange={e => setForm(f => ({ ...f, gia_goc: Number(e.target.value) }))
                }
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Dung lượng"
                value={form.dung_luong ?? ""}
                onChange={e => setForm(f => ({ ...f, dung_luong: e.target.value }))
                }
                required
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Màu"
                value={form.mau ?? ""}
                onChange={e => setForm(f => ({ ...f, mau: e.target.value }))
                }
                required
              />
              <input
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Số lượng hàng"
                value={form.so_luong_hang ?? ""}
                onChange={e => setForm(f => ({ ...f, so_luong_hang: Number(e.target.value) }))
                }
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.an_hien ?? true}
                  onChange={e => setForm(f => ({ ...f, an_hien: e.target.checked }))
                  }
                />
                <span>Hiện biến thể</span>
              </div>
              {formError && <div className="text-red-600 text-sm mt-1">{formError}</div>}
              {/* Thanh action luôn cố định dưới */}
              <div className="flex justify-end gap-2 mt-6 sticky bottom-0 bg-white pt-2 pb-1 z-10">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant, idx) => {
              // Không lọc an_hien, luôn render tất cả biến thể
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium inline-block font-semibold ${variant.an_hien ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {variant.an_hien ? "Hiện" : "Ẩn"}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <button
                      className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full mr-2"
                      title="Sửa"
                      onClick={() => handleEdit(variant)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`p-2 ${variant.an_hien ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-full`}
                      title={variant.an_hien ? "Ẩn" : "Hiện"}
                      onClick={async () => {
                        try {
                          const res = await fetch(`http://localhost:3000/api/variants/toggle-visibility/${variant._id}`, { method: "PATCH" });
                          if (!res.ok) throw new Error("Lỗi đổi trạng thái");
                          // Refresh lại danh sách
                          const data = await fetch(`http://localhost:3000/api/variants/by-product/${productId}`).then(r => r.json());
                          setVariants(data);
                          setCurrentImgs(Array(data.length).fill(0));
                        } catch (err) {
                          alert("Lỗi đổi trạng thái biến thể!");
                        }
                      }}
                    >
                      {variant.an_hien ? <FaEyeSlash /> : <FaEye />}
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
