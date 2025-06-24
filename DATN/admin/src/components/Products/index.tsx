"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import toast, { Toaster } from 'react-hot-toast';
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { FaEdit, FaTrash, FaEyeSlash, FaEye, FaInfoCircle } from "react-icons/fa";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable, getFilteredRowModel } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { colorMap, getVnColorName } from '../../../../src/constants/colorMapShared';

interface Product {
  _id: string;
  TenSP: string;
  id_danhmuc: string;
  khuyen_mai: number;
  hinh: string;
  an_hien: boolean;
  ngay_tao: string;
  categories?: { ten_danh_muc: string }[];
  video?: string[];
  thong_so_ky_thuat?: Record<string, any>;
  ban_chay?: number;
  hot?: boolean;
}

export default function ProductTable() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<{
    TenSP: string;
    hinh: string;
    khuyen_mai: number;
    an_hien: boolean;
    id_danhmuc: string;
    video: string[];
    thong_so_ky_thuat: Record<string, any>;
    ban_chay: number;
    ngay_tao: string;
    hot: boolean;
  }>({
    TenSP: "",
    hinh: "",
    khuyen_mai: 0,
    an_hien: true,
    id_danhmuc: "",
    video: [],
    thong_so_ky_thuat: {},
    ban_chay: 0,
    ngay_tao: new Date().toISOString().split('T')[0],
    hot: false
  });
  const [imageError, setImageError] = useState("");
  const [categories, setCategories] = useState<{ _id: string; ten_danh_muc: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [specProduct, setSpecProduct] = useState<Product | null>(null);
  const specModalRef = useRef<HTMLDivElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoProduct, setVideoProduct] = useState<Product | null>(null);
  const videoModalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

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
        <span className="text-black">{`${row.getValue("ban_chay")}`}</span>
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
      header: () => <span className="text-black font-semibold">Video</span>,
      id: "video",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <button
          className="text-blue-600 hover:text-blue-800"
          title="Xem video sản phẩm"
          onClick={e => {
            e.stopPropagation();
            setVideoProduct(row.original);
            setShowVideoModal(true);
          }}
        >
          <FaInfoCircle size={20} />
        </button>
      ),
    },
    {
      header: () => <span className="text-black font-semibold">Thông số</span>,
      id: "specs",
      cell: ({ row }: { row: import('@tanstack/react-table').Row<Product> }) => (
        <button
          className="text-blue-600 hover:text-blue-800"
          title="Xem thông số kỹ thuật"
          onClick={e => {
            e.stopPropagation();
            setSpecProduct(row.original);
            setShowSpecModal(true);
          }}
        >
          <FaInfoCircle size={20} />
        </button>
      ),
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
                id_danhmuc: row.original.id_danhmuc || "",
                video: row.original.video || [],
                thong_so_ky_thuat: row.original.thong_so_ky_thuat || {},
                ban_chay: row.original.ban_chay || 0,
                ngay_tao: row.original.ngay_tao || new Date().toISOString().split('T')[0],
                hot: row.original.hot ?? false
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
    let sorted = [...products].sort((a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime());
    if (!selectedCategory) return sorted;
    return sorted.filter(p => String(p.id_danhmuc) === String(selectedCategory));
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

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('video', file);
      const res = await fetch('http://localhost:3000/api/products/upload-video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) uploadedUrls.push(data.url);
    }
    setNewProduct(prev => ({
      ...prev,
      video: [...(prev.video || []), ...uploadedUrls]
    }));
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
        id_danhmuc: "",
        video: [],
        thong_so_ky_thuat: {},
        ban_chay: 0,
        ngay_tao: new Date().toISOString().split('T')[0],
        hot: false
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
      id_danhmuc: "",
      video: [],
      thong_so_ky_thuat: {},
      ban_chay: 0,
      ngay_tao: new Date().toISOString().split('T')[0],
      hot: false
    });
    setEditProduct(null);
    setImageError("");
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
            <option value="">Tất cả danh mục</option>
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
                id_danhmuc: "",
                video: [],
                thong_so_ky_thuat: {},
                ban_chay: 0,
                ngay_tao: new Date().toISOString().split('T')[0],
                hot: false
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
                    router.push(`/variant/${row.original._id}`);
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
        <div className="fixed z-150 flex items-center justify-center backdrop-blur-sm top-5 left-30 right-0 bottom-0 w-full h-full">
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-row gap-8 overflow-y-auto max-h-[70vh] max-w-[1000px] w-full">
            {/* Cột trái: Thông tin sản phẩm */}
            <div className="flex-1 flex flex-col gap-4">
              <h2 className="text-xl font-bold mb-2 text-blue-700">{editProduct ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
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
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Khuyến mãi (%)"
                value={newProduct.khuyen_mai}
                onChange={e => setNewProduct({...newProduct, khuyen_mai: Number(e.target.value)})}
              />
              <input
                type="number"
                className="border rounded px-3 py-2"
                placeholder="Lượt bán"
                value={newProduct.ban_chay}
                onChange={e => setNewProduct({...newProduct, ban_chay: Number(e.target.value)})}
              />
              <input
                type="date"
                className="border rounded px-3 py-2"
                placeholder="Ngày tạo"
                value={newProduct.ngay_tao}
                onChange={e => setNewProduct({...newProduct, ngay_tao: e.target.value})}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newProduct.an_hien}
                  onChange={e => setNewProduct({...newProduct, an_hien: e.target.checked})}
                />
                <span>Hiện sản phẩm</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newProduct.hot}
                  onChange={e => setNewProduct({...newProduct, hot: e.target.checked})}
                />
                <span>Hot</span>
              </div>
              {/* Thông số kỹ thuật động */}
              <div className="flex flex-col gap-2 mt-2">
                <label className="font-semibold">Thông số kỹ thuật</label>
                <input className="border rounded px-3 py-2" placeholder="CPU" value={newProduct.thong_so_ky_thuat.CPU || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, CPU: e.target.value}}))} />
                <input className="border rounded px-3 py-2" placeholder="Camera (cách nhau dấu phẩy)" value={newProduct.thong_so_ky_thuat.Camera?.join(', ') || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Camera: e.target.value.split(',').map(s => s.trim())}}))} />
                <input className="border rounded px-3 py-2" placeholder="GPU" value={newProduct.thong_so_ky_thuat.GPU || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, GPU: e.target.value}}))} />
                <input className="border rounded px-3 py-2" placeholder="Công nghệ màn hình" value={newProduct.thong_so_ky_thuat.Cong_nghe_man_hinh || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Cong_nghe_man_hinh: e.target.value}}))} />
                <input className="border rounded px-3 py-2" placeholder="Hệ điều hành" value={newProduct.thong_so_ky_thuat.He_dieu_hanh || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, He_dieu_hanh: e.target.value}}))} />
                <input className="border rounded px-3 py-2" placeholder="Độ phân giải" value={newProduct.thong_so_ky_thuat.Do_phan_giai || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Do_phan_giai: e.target.value}}))} />
                <input className="border rounded px-3 py-2" placeholder="Kết nối (cách nhau dấu phẩy)" value={newProduct.thong_so_ky_thuat.Ket_noi?.join(', ') || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Ket_noi: e.target.value.split(',').map(s => s.trim())}}))} />
                <input className="border rounded px-3 py-2" placeholder="Kích thước khối lượng (cách nhau dấu phẩy)" value={newProduct.thong_so_ky_thuat.Kich_thuoc_khoi_luong?.join(', ') || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Kich_thuoc_khoi_luong: e.target.value.split(',').map(s => s.trim())}}))} />
                <input className="border rounded px-3 py-2" placeholder="Kích thước màn hình" value={newProduct.thong_so_ky_thuat.Kich_thuoc_man_hinh || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Kich_thuoc_man_hinh: e.target.value}}))} />
                <input className="border rounded px-3 py-2" placeholder="Tiện ích khác (cách nhau dấu phẩy)" value={newProduct.thong_so_ky_thuat.Tien_ich_khac?.join(', ') || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Tien_ich_khac: e.target.value.split(',').map(s => s.trim())}}))} />
                <input className="border rounded px-3 py-2" placeholder="Tính năng camera (cách nhau dấu phẩy)" value={newProduct.thong_so_ky_thuat.Tinh_nang_camera?.join(', ') || ''} onChange={e => setNewProduct(prev => ({...prev, thong_so_ky_thuat: {...prev.thong_so_ky_thuat, Tinh_nang_camera: e.target.value.split(',').map(s => s.trim())}}))} />
              </div>
            </div>
            {/* Cột phải: Ảnh & Video */}
            <div className="flex-1 flex flex-col gap-4 border-l pl-8">
              <h3 className="font-semibold mb-2">Ảnh & Video sản phẩm</h3>
              {/* Ảnh sản phẩm */}
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
              {/* Video sản phẩm */}
              <input
                type="file"
                accept="video/*"
                multiple
                className="border rounded px-3 py-2 text-black"
                onChange={handleVideoChange}
              />
              <div className="flex flex-col gap-2">
                {newProduct.video && newProduct.video.map((videoUrl, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <video width={160} height={90} controls src={`http://localhost:3000/video/${videoUrl.replace(/^\/video\//, '')}`} />
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => setNewProduct(prev => ({
                        ...prev,
                        video: prev.video?.filter((_, i) => i !== idx) || []
                      }))}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="px-4 py-2 bg-gray-200 rounded h-[40px]"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded  h-[40px]"
                onClick={handleSaveProduct}
              >
                Lưu
              </button>
            </div>
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold" onClick={() => setShowModal(false)}>&times;</button>
          </div>
        </div>
      )}

      {/* Modal xem thông số kỹ thuật */}
      {showSpecModal && specProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowSpecModal(false)}>
          <div
            ref={specModalRef}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-blue-700">Thông số kỹ thuật</h3>
            {specProduct.thong_so_ky_thuat && Object.keys(specProduct.thong_so_ky_thuat).length > 0 ? (
              <ul className="text-sm text-gray-700 space-y-2 max-h-72 overflow-y-auto">
                {Object.entries(specProduct.thong_so_ky_thuat).map(([key, value]) => (
                  value && value !== '' && (
                    <li key={key} className="flex gap-2">
                      <span className="font-semibold min-w-[110px]">{key}:</span>
                      <span>{Array.isArray(value) ? value.join(', ') : value}</span>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 italic">Không có thông số kỹ thuật</div>
            )}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowSpecModal(false)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Modal xem video sản phẩm */}
      {showVideoModal && videoProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}>
          <div
            ref={videoModalRef}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-blue-700">Video sản phẩm</h3>
            {videoProduct.video && videoProduct.video.length > 0 && videoProduct.video[0] ? (
              <video
                width={320}
                height={180}
                controls
                autoPlay
                style={{ borderRadius: 8 }}
              >
                <source src={`http://localhost:3000/video/${videoProduct.video[0]}`} type="video/mp4" />
                Trình duyệt không hỗ trợ video.
              </video>
            ) : (
              <div className="text-gray-500 italic">Không có video</div>
            )}
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={() => setShowVideoModal(false)}
            >
              Đóng
            </button>
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