"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaHome, FaUser } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  TenKH: string;
  email: string;
  Sdt?: string;
  dia_chi?: string;
  gioi_tinh?: string;
  sinh_nhat?: string;
  role: string;
  active?: boolean;
  ngay_tao?: string;
}

export default function UserAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    TenKH: "",
    email: "",
    Sdt: "",
    dia_chi: "",
    gioi_tinh: "",
    sinh_nhat: "",
    active: true,
    role: "user"
  });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setIsClient(true);
    fetch("http://localhost:3000/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu user");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const openEditModal = (user: User) => {
    setEditUser(user);
    setNewUser({
      TenKH: user.TenKH || "",
      email: user.email || "",
      Sdt: user.Sdt || "",
      dia_chi: user.dia_chi || "",
      gioi_tinh: user.gioi_tinh || "",
      sinh_nhat: user.sinh_nhat || "",
      active: user.active !== undefined ? user.active : true,
      role: user.role || "user"
    });
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!newUser.TenKH || !newUser.email) {
      toast.error("Vui lòng nhập tên và email!");
      return;
    }
    if (editUser) {
      // Sửa user
      fetch(`http://localhost:3000/api/users/${editUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })
        .then(res => {
          if (!res.ok) throw new Error("Lỗi khi cập nhật user");
          return res.json();
        })
        .then(data => {
          setUsers(prev => prev.map(u => u._id === data._id ? data : u));
          setShowModal(false);
          setEditUser(null);
          setNewUser({ TenKH: "", email: "", Sdt: "", dia_chi: "", gioi_tinh: "", sinh_nhat: "", active: true, role: "user" });
          toast.success('Đã cập nhật user thành công!');
        })
        .catch(err => toast.error(err.message));
    } else {
      // Thêm user
      fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      })
        .then(res => {
          if (!res.ok) throw new Error("Lỗi khi thêm user");
          return res.json();
        })
        .then(data => {
          setUsers([data, ...users]);
          setShowModal(false);
          setNewUser({ TenKH: "", email: "", Sdt: "", dia_chi: "", gioi_tinh: "", sinh_nhat: "", active: true, role: "user" });
          toast.success('Đã thêm user thành công!');
        })
        .catch(err => {
          toast.error(err.message);
        });
    }
  };

  const handleDeleteUser = () => {
    if (!deleteId) return;
    fetch(`http://localhost:3000/api/users/${deleteId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (!res.ok) throw new Error('Lỗi khi xóa user');
        setUsers(prev => prev.filter(u => u._id !== deleteId));
        toast.success('Đã xóa user thành công!');
        setDeleteId(null);
      })
      .catch(err => {
        toast.error(err.message);
        setDeleteId(null);
      });
  };

  // Sắp xếp user mới nhất lên đầu (ưu tiên theo ngày tạo, fallback theo _id)
  const sortedUsers = [...users].sort((a, b) => {
    if (a.ngay_tao && b.ngay_tao) {
      return new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime();
    }
    return b._id.localeCompare(a._id);
  });
  const filteredUsers = sortedUsers.filter(u =>
    u.TenKH.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-4x4 bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full mr-4"
            title="Trang chủ"
            onClick={() => router.push("/")}
          >
            <FaHome className="text-2xl text-blue-600" />
          </button>
          <h1 className="text-3xl font-bold text-black flex-1">Quản lý người dùng</h1>
          <input
            className="border rounded-lg px-4 py-2 mr-4 w-64"
            placeholder="Tìm kiếm tên hoặc email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition flex items-center gap-2"
            onClick={() => { setShowModal(true); setEditUser(null); }}
          >
            <FaPlus />  Thêm user
          </button>
        </div>
        {/* Modal thêm/sửa user */}
        {showModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-20 w-full max-w-3xl relative animate-slide-down">
              <h2 className="text-2xl font-bold mb-8 text-blue-700 text-center">{editUser ? "Sửa user" : "Thêm user mới"}</h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Tên khách hàng</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    placeholder="Tên khách hàng"
                    value={newUser.TenKH}
                    onChange={e => setNewUser({ ...newUser, TenKH: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Email</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Số điện thoại</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    placeholder="Số điện thoại"
                    value={newUser.Sdt}
                    onChange={e => setNewUser({ ...newUser, Sdt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Địa chỉ</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    placeholder="Địa chỉ"
                    value={newUser.dia_chi}
                    onChange={e => setNewUser({ ...newUser, dia_chi: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    value={newUser.active ? "active" : "inactive"}
                    onChange={e => setNewUser({ ...newUser, active: e.target.value === "active" })}
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngừng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Giới tính</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    value={newUser.gioi_tinh || ""}
                    onChange={e => setNewUser({ ...newUser, gioi_tinh: e.target.value })}
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">Ngày sinh</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base"
                    value={newUser.sinh_nhat || ""}
                    onChange={e => setNewUser({ ...newUser, sinh_nhat: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 mt-8">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold transition"
                    onClick={() => { setShowModal(false); setEditUser(null); }}
                  >Đóng</button>
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                    onClick={handleSaveUser}
                    disabled={!newUser.TenKH || !newUser.email}
                  >Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b">STT</th>
                  <th className="px-4 py-2 border-b">Tên KH</th>
                  <th className="px-4 py-2 border-b">Email</th>
                  <th className="px-4 py-2 border-b">SĐT</th>
                  <th className="px-4 py-2 border-b">Địa chỉ</th>
                  <th className="px-4 py-2 border-b">Giới tính</th>
                  <th className="px-4 py-2 border-b">Ngày sinh</th>
                  <th className="px-4 py-2 border-b text-center">Trạng thái</th>
                  <th className="px-4 py-2 border-b">Vai trò</th>
                  <th className="px-4 py-2 border-b">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center text-gray-400 py-8">Chưa có user nào.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user, idx) => (
                    <tr key={user._id}>
                      <td className="px-4 py-2 border-b text-center">{idx + 1}</td>
                      <td className="px-4 py-2 border-b">{user.TenKH}</td>
                      <td className="px-4 py-2 border-b">{user.email}</td>
                      <td className="px-4 py-2 border-b">{user.Sdt}</td>
                      <td className="px-4 py-2 border-b">{user.dia_chi}</td>
                      <td className="px-4 py-2 border-b">{user.gioi_tinh || '-'}</td>
                      <td className="px-4 py-2 border-b">{user.sinh_nhat ? new Date(user.sinh_nhat).toLocaleDateString('vi-VN') : '-'}</td>
                      <td className="px-4 py-2 border-b text-center">
                        {user.active ? (
                          <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Hoạt động</span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-500 text-sm font-medium">Ngừng</span>
                        )}
                      </td>
                      <td className="px-4 py-2 border-b">{user.role}</td>
                      <td className="px-4 py-2 border-b flex gap-2 justify-center">
                        <button className="p-2 bg-blue-400 hover:bg-blue-500 rounded-full" onClick={() => openEditModal(user)}>
                          <FaEdit className="text-white" />
                        </button>
                        <button className="p-2 bg-red-400 hover:bg-red-500 rounded-full" onClick={() => setDeleteId(user._id)}>
                          <FaTrash className="text-white" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Toaster position="top-right" />
      {/* Modal xác nhận xóa */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center animate-slide-down">
            <h3 className="text-xl font-bold mb-4 text-red-600">Xác nhận xóa user</h3>
            <p className="mb-6 text-black">Bạn có chắc chắn muốn xóa user này không?</p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
                onClick={() => setDeleteId(null)}
              >Hủy</button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={handleDeleteUser}
              >Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 