"use client";
import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus, FaHome, FaUser } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  TenKH: string;
  Email: string;
  Sdt?: string;
  Dia_chi?: string;
  Diem_tich_luy?: number;
  Vai_tro: string;
}

export default function UserAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    TenKH: "",
    Email: "",
    Sdt: "",
    Dia_chi: "",
    Diem_tich_luy: 0,
    Vai_tro: "user"
  });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

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
      Email: user.Email || "",
      Sdt: user.Sdt || "",
      Dia_chi: user.Dia_chi || "",
      Diem_tich_luy: user.Diem_tich_luy || 0,
      Vai_tro: user.Vai_tro || "user"
    });
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!newUser.TenKH || !newUser.Email) {
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
          setNewUser({ TenKH: "", Email: "", Sdt: "", Dia_chi: "", Diem_tich_luy: 0, Vai_tro: "user" });
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
          setNewUser({ TenKH: "", Email: "", Sdt: "", Dia_chi: "", Diem_tich_luy: 0, Vai_tro: "user" });
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

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-2 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <button
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full mr-4"
            title="Trang chủ"
            onClick={() => router.push("/")}
          >
            <FaHome className="text-2xl text-blue-600" />
          </button>
          <h1 className="text-3xl font-bold text-black flex-1">Quản lý người dùng</h1>
          <button
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition flex items-center gap-2"
            onClick={() => { setShowModal(true); setEditUser(null); }}
          >
            <FaPlus />  Thêm user
          </button>
        </div>
        {/* Modal thêm/sửa user */}
        {showModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-white/30 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative animate-slide-down text-black">
              <h2 className="text-xl font-bold mb-4 text-blue-700">{editUser ? "Sửa user" : "Thêm user mới"}</h2>
              <div className="flex flex-col gap-3">
                <input
                  className="border rounded px-3 py-2 text-black"
                  placeholder="Tên khách hàng"
                  value={newUser.TenKH}
                  onChange={e => setNewUser({ ...newUser, TenKH: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2 text-black"
                  placeholder="Email"
                  value={newUser.Email}
                  onChange={e => setNewUser({ ...newUser, Email: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2 text-black"
                  placeholder="Số điện thoại"
                  value={newUser.Sdt}
                  onChange={e => setNewUser({ ...newUser, Sdt: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2 text-black"
                  placeholder="Địa chỉ"
                  value={newUser.Dia_chi}
                  onChange={e => setNewUser({ ...newUser, Dia_chi: e.target.value })}
                />
                <input
                  className="border rounded px-3 py-2 text-black"
                  placeholder="Điểm tích lũy"
                  type="number"
                  value={newUser.Diem_tich_luy}
                  onChange={e => setNewUser({ ...newUser, Diem_tich_luy: Number(e.target.value) })}
                />
                <select
                  className="border rounded px-3 py-2 text-black"
                  value={newUser.Vai_tro}
                  onChange={e => setNewUser({ ...newUser, Vai_tro: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
                  onClick={() => { setShowModal(false); setEditUser(null); }}
                >Đóng</button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={handleSaveUser}
                  disabled={!newUser.TenKH || !newUser.Email}
                >Lưu</button>
              </div>
            </div>
          </div>
        )}
        {loading ? (
          <p className="text-center text-gray-500 py-8">Đang tải dữ liệu...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-lg overflow-hidden text-black">
              <thead>
                <tr className="bg-blue-100 text-black">
                  <th className="border px-4 py-2 text-left">Tên KH</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">SĐT</th>
                  <th className="border px-4 py-2 text-left">Địa chỉ</th>
                  <th className="border px-4 py-2 text-left">Điểm tích lũy</th>
                  <th className="border px-4 py-2 text-left">Vai trò</th>
                  <th className="border px-4 py-2 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-gray-400 py-8">Chưa có user nào.</td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-blue-50 transition text-black">
                      <td className="border px-4 py-2">{u.TenKH}</td>
                      <td className="border px-4 py-2">{u.Email}</td>
                      <td className="border px-4 py-2">{u.Sdt}</td>
                      <td className="border px-4 py-2">{u.Dia_chi}</td>
                      <td className="border px-4 py-2">{u.Diem_tich_luy}</td>
                      <td className="border px-4 py-2">{u.Vai_tro}</td>
                      <td className="border px-4 py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            title="Sửa"
                            className="p-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full shadow transition flex items-center justify-center"
                            onClick={() => openEditModal(u)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            title="Xóa"
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition flex items-center justify-center"
                            onClick={() => setDeleteId(u._id)}
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