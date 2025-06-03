"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaEdit, FaTrash, FaPlus, FaHome, FaImage } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Category {
  _id: string;
  ten_danh_muc: string;
  banner_dm?: string;
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/no-image.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3000${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    ten_danh_muc: "",
    banner_dm: ""
  });
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu danh mục");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Lọc và phân trang
  const filtered = categories.filter(c =>
    c.ten_danh_muc.toLowerCase().includes(globalFilter.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const openEditModal = (category: Category) => {
    setEditCategory(category);
    setNewCategory({
      ten_danh_muc: category.ten_danh_muc || "",
      banner_dm: category.banner_dm || ""
    });
    setShowModal(true);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('http://localhost:3000/api/categories/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      setNewCategory(prev => ({ ...prev, banner_dm: data.url }));
      setImageError("");
    } else {
      setImageError(data.message || 'Lỗi upload ảnh');
    }
  };

  const handleSaveCategory = () => {
    if (!newCategory.ten_danh_muc) {
      toast.error("Vui lòng nhập tên danh mục!");
      return;
    }
    if (!newCategory.banner_dm) {
      setImageError("Vui lòng upload banner danh mục!");
      return;
    }
    setImageError("");
    if (editCategory) {
      // Sửa danh mục
      fetch(`http://localhost:3000/api/categories/${editCategory._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory)
      })
        .then(res => {
          if (!res.ok) throw new Error("Lỗi khi cập nhật danh mục");
          return res.json();
        })
        .then(data => {
          setCategories(prev => prev.map(c => c._id === data._id ? data : c));
          setShowModal(false);
          setEditCategory(null);
          setNewCategory({ ten_danh_muc: "", banner_dm: "" });
          toast.success('Đã cập nhật danh mục thành công!');
        })
        .catch(err => toast.error(err.message));
    } else {
      // Thêm danh mục
      fetch("http://localhost:3000/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory)
      })
        .then(res => {
          if (!res.ok) throw new Error("Lỗi khi thêm danh mục");
          return res.json();
        })
        .then(data => {
          setCategories([data, ...categories]);
          setShowModal(false);
          setNewCategory({ ten_danh_muc: "", banner_dm: "" });
          toast.success('Đã thêm danh mục thành công!');
        })
        .catch(err => {
          toast.error(err.message);
        });
    }
  };

  const handleDeleteCategory = () => {
    if (!deleteId) return;
    fetch(`http://localhost:3000/api/categories/${deleteId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Lỗi khi xóa danh mục');
        setCategories(prev => prev.filter(c => c._id !== deleteId));
        toast.success('Đã xóa danh mục thành công!');
        setDeleteId(null);
      })
      .catch(err => {
        toast.error(err.message);
        setDeleteId(null);
      });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý danh mục
        </h2>
        <div className="flex gap-4">
          <input
            placeholder="Tìm kiếm danh mục..."
            value={globalFilter}
            onChange={e => { setGlobalFilter(e.target.value); setPageIndex(0); }}
            className="w-64 border rounded px-3 py-2"
          />
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow flex items-center gap-2"
            onClick={() => { setShowModal(true); setEditCategory(null); setImageError(""); }}
          >
             Thêm danh mục
          </button>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden text-black">
          <thead>
            <tr className="text-black">
              <th className="border px-4 py-2 text-left">STT</th>
              <th className="border px-4 py-2 text-left">Tên danh mục</th>
              <th className="border px-4 py-2 text-left">Banner</th>
              <th className="border px-4 py-2 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-8">Chưa có danh mục nào.</td>
              </tr>
            ) : (
              paged.map((c, idx) => (
                <tr key={c._id}>
                  <td className="border px-4 py-2">{pageIndex * pageSize + idx + 1}</td>
                  <td className="border px-4 py-2">{c.ten_danh_muc}</td>
                  <td className="border px-4 py-2">
                    <Image
                      src={getImageUrl(c.banner_dm)}
                      alt={c.ten_danh_muc}
                      className="w-24 h-14 object-cover rounded"
                      width={96}
                      height={56}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/no-image.png'; }}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Sửa"
                        className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full shadow flex items-center justify-center"
                        onClick={() => openEditModal(c)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        title="Xóa"
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow flex items-center justify-center"
                        onClick={() => setDeleteId(c._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPageIndex(i => Math.max(i - 1, 0))}
            disabled={pageIndex === 0}
          >
            Trước
          </button>
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setPageIndex(i => Math.min(i + 1, pageCount - 1))}
            disabled={pageIndex >= pageCount - 1}
          >
            Sau
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Trang {pageIndex + 1} / {pageCount || 1}
          </span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPageIndex(0); }}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 30, 40, 50].map(sz => (
              <option key={sz} value={sz}>Hiển thị {sz}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal thêm/sửa danh mục */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-slide-down text-black">
            <h2 className="text-xl font-bold mb-4 text-blue-700">{editCategory ? "Sửa danh mục" : "Thêm danh mục mới"}</h2>
            <div className="flex flex-col gap-3">
              <input
                className="border rounded px-3 py-2 text-black"
                placeholder="Tên danh mục"
                value={newCategory.ten_danh_muc}
                onChange={e => setNewCategory({ ...newCategory, ten_danh_muc: e.target.value })}
              />
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-black font-medium">
                  <FaImage /> Banner danh mục
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="border rounded px-3 py-2 text-black"
                  onChange={handleImageChange}
                />
                {newCategory.banner_dm && (
                  <Image
                    src={getImageUrl(newCategory.banner_dm)}
                    alt="Banner danh mục"
                    className="w-full h-full object-cover rounded"
                    width={128}
                    height={80}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/no-image.png'; }}
                  />
                )}
                {imageError && (
                  <div className="text-red-600 text-sm mt-1">{imageError}</div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
                onClick={() => { setShowModal(false); setEditCategory(null); setImageError(""); }}
              >Đóng</button>
              <button
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                onClick={handleSaveCategory}
                disabled={!newCategory.ten_danh_muc || !newCategory.banner_dm}
              >Lưu</button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />

      {/* Modal xác nhận xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center animate-slide-down">
            <h3 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa danh mục</h3>
            <p className="mb-6 text-black">Bạn có chắc chắn muốn xóa danh mục này không?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
                onClick={() => setDeleteId(null)}
              >Hủy</button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={handleDeleteCategory}
              >Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}