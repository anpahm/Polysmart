"use client";

import { useState, useEffect, useMemo } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { FaEdit, FaTrash, FaEyeSlash, FaEye } from "react-icons/fa";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";

interface Product {
  _id: string;
  TenSP: string;
  id_danhmuc: string;
  khuyen_mai: number;
  hinh: string;
  an_hien: boolean;
  ngay_tao: string;
  categories?: { ten_danh_muc: string }[];
}


export default function ProductTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    TenSP: "",
    hinh: "",
    khuyen_mai: 0,
    an_hien: true,
    id_danhmuc: ""
  });
  const [imageError, setImageError] = useState("");
  const [categories, setCategories] = useState<{ _id: string; ten_danh_muc: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Thêm state để lưu sản phẩm đang được chọn để show variant
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [variantModal, setVariantModal] = useState<{ open: boolean; productId: string | null }>({ open: false, productId: null });
  const [variants, setVariants] = useState<any[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const columns: ColumnDef<Product, any>[] = [
    {
      id: "STT",
      header: () => <span className="text-black font-semibold">STT</span>,
      cell: ({
        row,
        table,
      }: {
        row: import('@tanstack/react-table').Row<Product>;
        table: import('@tanstack/react-table').Table<Product>;
      }) => {
        const pageSize = table.getState().pagination.pageSize;
        const pageIndex = table.getState().pagination.pageIndex;
        return <span className="text-black">{pageSize * pageIndex + row.index + 1}</span>;
      },
    },
    {
      accessorKey: "hinh",
      header: () => <span className="text-black font-semibold">Hình ảnh</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <Image
          src={getImageUrl(row.getValue("hinh"))}
          alt={row.getValue("TenSP")}
          width={48}
          height={48}
          className="h-12 w-12 object-cover rounded-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/no-image.png';
          }}
        />
      ),
    },
    {
      accessorKey: "TenSP",
      header: () => <span className="text-black font-semibold">Tên sản phẩm</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div className="max-w-[80px] truncate text-black">{row.getValue("TenSP")}</div>
      ),
    },
    {
      accessorKey: "categories",
      header: () => <span className="text-black font-semibold">Danh mục</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <span className="text-black">{row.original.categories?.[0]?.ten_danh_muc || "Chưa phân loại"}</span>
      )
    },
    {
      accessorKey: "khuyen_mai",
      header: () => <span className="text-black font-semibold">Khuyến mãi</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <span className="text-black">{`${row.getValue("khuyen_mai")}%`}</span>
      )
    },
    {
      accessorKey: "ban_chay",
      header: () => <span className="text-black font-semibold">Lượt bán</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <span className="text-black">{`${row.getValue("ban_chay")}%`}</span>
      )
    },
    {
      accessorKey: "hot",
      header: () => <span className="text-black font-semibold">Sản phẩm hot</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <span className="text-black">{`${row.getValue("hot")}%`}</span>
      )
    },
    {
      accessorKey: "an_hien",
      header: () => <span className="text-black font-semibold">Trạng thái</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium inline-block text-black font-semibold
            ${row.getValue("an_hien") 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"}`}
        >
          {row.getValue("an_hien") ? "Hiện" : "Ẩn"}
        </div>
      ),
    },
    {
      accessorKey: "ngay_tao",
      header: () => <span className="text-black font-semibold">Ngày tạo</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <span className="text-black">{new Date(row.getValue("ngay_tao")).toLocaleDateString("vi-VN")}</span>
      )
    },
    {
      id: "actions",
      header: () => <span className="text-black font-semibold">Thao tác</span>,
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditProduct(row.original);
              setNewProduct({
                TenSP: row.original.TenSP,
                hinh: row.original.hinh || "",
                khuyen_mai: row.original.khuyen_mai || 0,
                an_hien: row.original.an_hien ?? true,
                id_danhmuc: row.original.id_danhmuc || ""
              });
              setShowModal(true);
            }}
            className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleToggleVisibility(row.original)}
            className={`p-2 ${
              row.original.an_hien 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            } text-white rounded-full`}
          >
            {row.original.an_hien ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
      )
    },
  ];

  // hàm fuzzy filter
  const fuzzyFilter = (row: any, columnId: string, value: string) => {
    const searchValue = value.toLowerCase();
    let cellValue = row.getValue(columnId);

    // Xử lý các trường hợp đặc biệt
    if (columnId === "categories") {
      cellValue = row.original.categories?.[0]?.ten_danh_muc || "";
    } else if (typeof cellValue === "boolean") {
      cellValue = cellValue ? "hiện" : "ẩn";
    } else if (columnId === "ngay_tao") {
      cellValue = new Date(cellValue).toLocaleDateString("vi-VN");
    }

    return String(cellValue)
      .toLowerCase()
      .includes(searchValue);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/products");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Fetch categories
    fetch("http://localhost:3000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => console.error("Error fetching categories:", error));
  }, []);

  // Lọc sản phẩm theo danh mục bằng useMemo để tránh filter lại mỗi lần render
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    return products.filter(p => String(p.id_danhmuc) === String(selectedCategory));
  }, [products, selectedCategory]);

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(), 
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter, 
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  // Thêm các hàm xử lý
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('http://localhost:3000/api/products/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setNewProduct(prev => ({ ...prev, hinh: data.url }));
      }
    } catch (error) {
      toast.error('Lỗi khi upload ảnh');
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.TenSP || !newProduct.id_danhmuc) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const res = await fetch(
        editProduct 
          ? `http://localhost:3000/api/products/${editProduct._id}`
          : "http://localhost:3000/api/products",
        {
          method: editProduct ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProduct)
        }
      );

      if (!res.ok) throw new Error('Có lỗi xảy ra');

      const data = await res.json();
      
      if (editProduct) {
        setProducts(prev => prev.map(p => p._id === data._id ? data : p));
        toast.success('Đã cập nhật sản phẩm thành công!');
      } else {
        setProducts(prev => [data, ...prev]);
        toast.success('Đã thêm sản phẩm thành công!');
      }

      setShowModal(false);
      setNewProduct({
        TenSP: "",
        hinh: "",
        khuyen_mai: 0,
        an_hien: true,
        id_danhmuc: ""
      });
      setEditProduct(null);

    } catch (error) {
      toast.error('Có lỗi xảy ra!');
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      const res = await fetch(`http://localhost:3000/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ an_hien: !product.an_hien })
      });
      const data = await res.json();
      setProducts(prev => prev.map(p => p._id === data._id ? data : p));
      toast.success(`Đã ${data.an_hien ? 'hiện' : 'ẩn'} sản phẩm!`);
    } catch (error) {
      toast.error('Có lỗi xảy ra!');
    }
  };

  // Thêm hàm resetForm vào trong component
  const resetForm = () => {
    setNewProduct({
      TenSP: "",
      hinh: "",
      khuyen_mai: 0,
      an_hien: true,
      id_danhmuc: ""
    });
    setEditProduct(null);
    setImageError("");
  };

  // Hàm lấy variant theo productId
  const handleShowVariants = async (productId: string) => {
    setLoadingVariants(true);
    setVariantModal({ open: true, productId });
    try {
      const res = await fetch(`http://localhost:3000/api/variants/by-product/${productId}`);
      const data = await res.json();
      setVariants(data);
    } catch (error) {
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg text-gray-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý sản phẩm
        </h2>
        <div className="flex gap-4">
          <select
            className="border rounded px-3 py-2"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">-- Tất cả danh mục --</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.ten_danh_muc}</option>
            ))}
          </select>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={() => {
              setEditProduct(null);
              setNewProduct({
                TenSP: "",
                hinh: "",
                khuyen_mai: 0,
                an_hien: true,
                id_danhmuc: ""
              });
              setShowModal(true);
            }}
          >
            Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-blue-50 transition"
                  onClick={e => {
                    // Không trigger khi click vào nút thao tác
                    if ((e.target as HTMLElement).closest("button")) return;
                    handleShowVariants(row.original._id);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không tìm thấy sản phẩm
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Trang {table.getState().pagination.pageIndex + 1} /
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Hiển thị {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal thêm/sửa sản phẩm */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-blue-700">
              {editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h2>
            <div className="flex flex-col gap-3">
              <input
                className="border rounded px-3 py-2"
                placeholder="Tên sản phẩm"
                value={newProduct.TenSP}
                onChange={e => setNewProduct({...newProduct, TenSP: e.target.value})}
              />
              <select
                className="border rounded px-3 py-2"
                value={newProduct.id_danhmuc}
                onChange={e => setNewProduct({...newProduct, id_danhmuc: e.target.value})}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.ten_danh_muc}</option>
                ))}
              </select>
              <input
                  type="file"
                  accept="image/*"
                  className="border rounded px-3 py-2 text-black"
                  onChange={handleImageChange}
                />
                {newProduct.hinh && (
                  <div className="relative w-24 h-24 mt-2">
                    <Image
                      src={getImageUrl(newProduct.hinh)}
                      alt="Ảnh sản phẩm"
                      fill
                      className="object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/no-image.png';
                        console.error('Error loading image:', newProduct.hinh);
                      }}
                      sizes="96px"
                      style={{ objectFit: 'cover', borderRadius: '0.375rem' }}
                    />
                  </div>
                )}
                {imageError && (
                  <div className="text-red-600 text-sm mt-1">{imageError}</div>
                )}
              <input
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Khuyến mãi (%)"
                value={newProduct.khuyen_mai}
                onChange={e => setNewProduct({...newProduct, khuyen_mai: Number(e.target.value)})}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newProduct.an_hien}
                  onChange={e => setNewProduct({...newProduct, an_hien: e.target.checked})}
                />
                <span>Hiện sản phẩm</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleSaveProduct}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal hiển thị variant */}
      {variantModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setVariantModal({ open: false, productId: null })}
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-blue-700">Danh sách biến thể sản phẩm</h2>
            {loadingVariants ? (
              <div className="text-center py-8">Đang tải dữ liệu...</div>
            ) : variants.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có biến thể nào cho sản phẩm này.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2 border">Tên biến thể</th>
                      <th className="px-3 py-2 border">Dung lượng</th>
                      <th className="px-3 py-2 border">Màu sắc</th>
                      <th className="px-3 py-2 border">Giá</th>
                      <th className="px-3 py-2 border">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v, idx) => (
                      <tr key={v._id || idx}>
                        <td className="px-3 py-2 border">{v.ten_variant || v.ten_bien_the || '-'}</td>
                        <td className="px-3 py-2 border">{v.dung_luong || '-'}</td>
                        <td className="px-3 py-2 border">{v.mau_sac || '-'}</td>
                        <td className="px-3 py-2 border">{v.gia ? v.gia.toLocaleString('vi-VN') + '₫' : '-'}</td>
                        <td className="px-3 py-2 border">{v.so_luong ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/no-image.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3000/images/${imageUrl.replace(/^\/images\//, '')}`;
};