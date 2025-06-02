"use client";

import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaEdit, FaTrash, FaEyeSlash, FaEye } from "react-icons/fa";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";

interface Product {
  _id: string;
  TenSP: string;
  Mota?: string;
  thongso?: string;
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
    Mota: "",
    thongso: "",
    hinh: "",
    khuyen_mai: 0,
    an_hien: true,
    id_danhmuc: ""
  });
  const [imageError, setImageError] = useState("");
  const [categories, setCategories] = useState<{ _id: string; ten_danh_muc: string }[]>([]);

  const columns = [
    {
      id: "STT",
      header: "STT",
      cell: ({
        row,
        table,
      }: {
        row: import('@tanstack/react-table').Row<Product>;
        table: import('@tanstack/react-table').Table<Product>;
      }) => {
        const pageSize = table.getState().pagination.pageSize;
        const pageIndex = table.getState().pagination.pageIndex;
        return pageSize * pageIndex + row.index + 1;
      },
    },
    {
      accessorKey: "hinh",
      header: "Hình ảnh",
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
      header: "Tên sản phẩm",
    },
    {
      accessorKey: "Mota",
      header: "Mô tả",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div className="max-w-[100px] truncate" title={row.getValue("Mota")}>
          {row.getValue("Mota")}
        </div>
      )
    },
    {
      accessorKey: "thongso",
      header: "Thông số kỹ thuật", 
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div className="max-w-[100px] truncate" title={row.getValue("thongso")}>
          {row.getValue("thongso")}
        </div>
      )
    },
    {
      accessorKey: "categories",
      header: "Danh mục",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => row.original.categories?.[0]?.ten_danh_muc || "Chưa phân loại"
    },
    {
      accessorKey: "khuyen_mai",
      header: "Khuyến mãi",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => `${row.getValue("khuyen_mai")}%`
    },
    {
      accessorKey: "an_hien",
      header: "Trạng thái",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium inline-block
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
      header: "Ngày tạo",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => new Date(row.getValue("ngay_tao")).toLocaleDateString("vi-VN")
    },
    {
      id: "actions",
      header: "Thao tác",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditProduct(row.original);
              setNewProduct({
                TenSP: row.original.TenSP,
                Mota: row.original.Mota || "",
                thongso: row.original.thongso || "",
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
            onClick={() => handleDeleteProduct(row.original._id)}
            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <FaTrash />
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(error => console.error("Error fetching categories:", error));
  }, []);

  const table = useReactTable({
    data: products,
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/upload-image`, {
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
          ? `${process.env.NEXT_PUBLIC_API_URL}/products/${editProduct._id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/products`,
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
        Mota: "",
        thongso: "",
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

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_IMAGE_URL}/products/${id}`, {
          method: 'DELETE'
        });
        setProducts(prev => prev.filter(p => p._id !== id));
        toast.success('Đã xóa sản phẩm thành công!');
      } catch (error) {
        toast.error('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  const handleToggleVisibility = async (product: Product) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_URL}/products/${product._id}`, {
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
      Mota: "",
      thongso: "",
      hinh: "",
      khuyen_mai: 0,
      an_hien: true,
      id_danhmuc: ""
    });
    setEditProduct(null);
    setImageError("");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý sản phẩm
        </h2>
        <div className="flex gap-4">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <Button 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={() => {
              setEditProduct(null); // Reset editProduct về null vì đây là thêm mới
              setNewProduct({ // Reset form về giá trị mặc định
                TenSP: "",
                Mota: "",
                thongso: "",
                hinh: "",
                khuyen_mai: 0,
                an_hien: true,
                id_danhmuc: ""
              });
              setShowModal(true); // Mở modal
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
                <TableRow key={row.id}>
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
              <input
                className="border rounded px-3 py-2"
                placeholder="Mô tả sản phẩm"
                value={newProduct.Mota}
                onChange={e => setNewProduct({...newProduct, Mota: e.target.value})}
              />
              <input
                className="border rounded px-3 py-2"
                placeholder="Thông số kỹ thuật"
                value={newProduct.thongso}
                onChange={e => setNewProduct({...newProduct, thongso: e.target.value})}
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

      <Toaster position="top-right" />
    </div>
  );
}

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/no-image.png';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${process.env.NEXT_PUBLIC_IMAGE_URL}/images/${imageUrl.replace(/^\/images\//, '')}`;
};