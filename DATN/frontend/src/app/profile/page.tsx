'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { fetchApi, API_ENDPOINTS, getImageUrl } from '@/config/api';
import { setUser } from '../../store/userSlice';
import { useRouter, useSearchParams } from "next/navigation";

const PROFILE_TABS = [
  { key: "info", label: "Thông tin tài khoản" },
  { key: "address", label: "Địa chỉ nhận hàng" },
  { key: "orders", label: "Đơn đặt hàng" },
  { key: "voucher", label: "Voucher" },
  { key: "password", label: "Đổi mật khẩu" },
  { key: "avatar", label: "Ảnh đại diện" },
  { key: "reviews", label: "Lịch sử đánh giá sản phẩm" },
];

// --- Đơn đặt hàng Shopee style ---
const ORDER_TABS = [
  { key: 'all', label: 'Tất cả', count: 3 },
  { key: 'pending', label: 'Chờ thanh toán', count: 1 },
  { key: 'shipping', label: 'Vận chuyển', count: 0 },
  { key: 'waiting', label: 'Chờ giao hàng', count: 1 },
  { key: 'completed', label: 'Hoàn thành', count: 1 },
  { key: 'cancelled', label: 'Đã hủy', count: 0 },
  { key: 'returned', label: 'Trả hàng/Hoàn tiền', count: 0 },
];
const mockOrders = [
  {
    id: '1',
    shop: 'Shopee Choice Việt Nam',
    productImg: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lk1w7w7w7w7w7w_tn.jpg',
    productName: 'Tai Nghe Nhét Tai Có Dây WEKOME YC08 Choice EL1-0741-7 Tích Hợp Micro, Cản Tiếng',
    productType: 'YC08 - TypeC',
    qty: 1,
    price: 113724,
    oldPrice: 168000,
    status: 'waiting',
    statusText: 'CHỜ GIAO HÀNG',
    statusColor: 'text-[#ee4d2d]',
    delivered: true,
    note: 'Vui lòng chỉ nhấn "Đã nhận được hàng" khi đơn hàng đã được giao đến bạn và sản phẩm nhận được không có vấn đề nào.',
    isChoice: true,
  },
  {
    id: '2',
    shop: 'Shopee Choice Việt Nam',
    productImg: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lk1w7w7w7w7w7w_tn.jpg',
    productName: 'Tai Nghe Bluetooth',
    productType: 'Bluetooth',
    qty: 2,
    price: 200000,
    oldPrice: 250000,
    status: 'completed',
    statusText: 'HOÀN THÀNH',
    statusColor: 'text-green-600',
    delivered: true,
    note: '',
    isChoice: true,
  },
  {
    id: '3',
    shop: 'Shopee Choice Việt Nam',
    productImg: 'https://cf.shopee.vn/file/sg-11134201-7rbk2-lk1w7w7w7w7w7w_tn.jpg',
    productName: 'Ốp lưng điện thoại',
    productType: 'iPhone 14',
    qty: 1,
    price: 50000,
    oldPrice: 70000,
    status: 'pending',
    statusText: 'CHỜ THANH TOÁN',
    statusColor: 'text-yellow-500',
    delivered: false,
    note: '',
    isChoice: false,
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabQuery || "info");

  // Đơn đặt hàng: tab con
  const orderTypeQuery = searchParams.get("type");
  const [orderTab, setOrderTab] = useState(orderTypeQuery || "all");

  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  console.log("ProfilePage: Current user from Redux", user);

  const [formData, setFormData] = useState({
    name: user?.TenKH || '',
    email: user?.email || '',
    phoneNumber: user?.Sdt || '',
    gender: user?.gioi_tinh || '',
    dateOfBirth: user?.sinh_nhat || '',
    address: user?.dia_chi || '',
    avatar: user?.avatar || '',
  });
  console.log("ProfilePage: Initial formData", formData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State for password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState('');
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');

  // Thêm state cho ngày, tháng, năm
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');

  useEffect(() => {
    if (user) {
      console.log("ProfilePage: user updated in useEffect, setting formData", user);
      let day = '', month = '', year = '';
      if (user.sinh_nhat) {
        const [y, m, d] = user.sinh_nhat.split('-');
        day = d;
        month = m;
        year = y;
      }
      setDobDay(day);
      setDobMonth(month);
      setDobYear(year);
      setFormData({
        name: user.TenKH || '',
        email: user.email || '',
        phoneNumber: user.Sdt || '',
        gender: user.gioi_tinh || '',
        dateOfBirth: user.sinh_nhat || '',
        address: user.dia_chi || '',
        avatar: '', // Reset avatar to empty string when user changes
      });
      setAvatarFile(null); // Reset avatar file
    }
  }, [user]);

  // Đồng bộ tab với URL query
  useEffect(() => {
    setActiveTab(tabQuery || "info");
  }, [tabQuery]);
  useEffect(() => {
    setOrderTab(orderTypeQuery || "all");
  }, [orderTypeQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, gender: e.target.value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'day' | 'month' | 'year') => {
    let newDay = dobDay, newMonth = dobMonth, newYear = dobYear;
    if (type === 'day') newDay = e.target.value;
    if (type === 'month') newMonth = e.target.value;
    if (type === 'year') newYear = e.target.value;
    setDobDay(newDay);
    setDobMonth(newMonth);
    setDobYear(newYear);
    if (newDay && newMonth && newYear) {
      setFormData(prev => ({
        ...prev,
        dateOfBirth: `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveInfo = async () => {
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const formPayload = new FormData();
      formPayload.append('TenKH', formData.name);
      formPayload.append('Sdt', formData.phoneNumber);
      formPayload.append('gioi_tinh', formData.gender);
      formPayload.append('sinh_nhat', formData.dateOfBirth);
      formPayload.append('dia_chi', formData.address);
      if (avatarFile) {
        formPayload.append('avatar', avatarFile);
      }

      const response = await fetchApi(API_ENDPOINTS.UPDATE_USER, {
        method: 'PUT',
        body: formPayload,
      });

      if (response && response.user) {
        dispatch(setUser(response.user));
        localStorage.setItem('user', JSON.stringify(response.user));
        setSuccessMessage('Cập nhật thông tin thành công!');
      } else {
        setErrorMessage(response.message || 'Cập nhật thông tin thất bại.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: string) => {
    switch (field) {
      case 'currentPassword':
        setShowCurrentPassword(prev => !prev);
        break;
      case 'newPassword':
        setShowNewPassword(prev => !prev);
        break;
      case 'confirmNewPassword':
        setShowConfirmNewPassword(prev => !prev);
        break;
      default:
        break;
    }
  };

  const handleChangePassword = async () => {
    setPasswordSuccessMessage('');
    setPasswordErrorMessage('');

    const { currentPassword, newPassword, confirmNewPassword } = passwordForm;

    if (newPassword.length < 8) {
      setPasswordErrorMessage('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordErrorMessage('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      const response = await fetchApi(API_ENDPOINTS.CHANGE_PASSWORD, {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response && response.message) {
        setPasswordSuccessMessage(response.message);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        setPasswordErrorMessage(response.message || 'Đổi mật khẩu thất bại.');
      }
    } catch (err: any) {
      setPasswordErrorMessage(err.message || 'Có lỗi xảy ra khi đổi mật khẩu.');
    }
  };

  // Đổi tab chính
  const handleTabChange = (key: string) => {
    router.push(`?tab=${key}`);
  };
  // Đổi tab đơn hàng
  const handleOrderTabChange = (key: string) => {
    router.push(`?tab=orders&type=${key}`);
  };

  // --- Render nội dung từng tab ---
  const renderContent = () => {
    if (activeTab === "orders") {
      // Đơn đặt hàng 
      const filteredOrders = orderTab === 'all'
        ? mockOrders
        : mockOrders.filter(order => order.status === orderTab);
      return (
        <div className="sm:px-0">
          <div className="max-w-[70.5rem] mx-auto">
            {/* Tabs đơn hàng */}
            <div className="max-w-[70.5rem] mx-auto flex gap-10 sm:gap-3 border-b border-[#f2f2f2] bg-white pt-2 flex-wrap">
              {ORDER_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`relative flex items-center justify-center min-w-[80px] py-2 px-1 sm:px-2 text-sm font-medium transition border-b-2 outline-none focus:outline-none text-center whitespace-nowrap ${
                    orderTab === tab.key
                      ? 'border-[#ee4d2d] text-[#ee4d2d] bg-white'
                      : 'border-transparent text-gray-700 hover:text-[#ee4d2d] bg-white'
                  }`}
                  onClick={() => handleOrderTabChange(tab.key)}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="ml-2 inline-block min-w-[20px] px-1 text-xs rounded-full bg-[#ee4d2d] text-white font-bold align-middle">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {/* Search */}
            <div className="bg-white py-4 border-b border-[#f2f2f2]">
              <input
                type="text"
                placeholder="Bạn có thể tìm kiếm theo tên Shop, ID đơn hàng hoặc Tên Sản phẩm"
                className="w-full border border-[#e5e5e5] rounded text-base px-5 py-3 focus:outline-none focus:border-[#ee4d2d] bg-[#fafafa]"
              />
            </div>
          </div>
          {/* Danh sách đơn hàng */}
          <div className="flex flex-col gap-6 mt-6">
            {filteredOrders.length === 0 && (
              <div className="text-center text-gray-400 py-8 bg-white rounded">Không có đơn hàng nào.</div>
            )}
            {filteredOrders.map(order => (
              <div key={order.id} className="bg-white rounded shadow-sm border border-[#f2f2f2] p-0 w-full">
                {/* Shop + trạng thái */}
                <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b border-[#f2f2f2]">
                  <div className="flex items-center gap-2">
                    {order.isChoice && (
                      <span className="bg-[#ee4d2d] text-white font-bold px-2 py-1 rounded text-xs mr-1">✔ Choice</span>
                    )}
                    <span className="text-base font-semibold text-gray-800">{order.shop}</span>
                    <button className="ml-2 px-3 py-1 border border-[#ee4d2d] text-[#ee4d2d] rounded text-xs font-semibold hover:bg-[#fff0ea]">Chat</button>
                    <button className="ml-2 px-3 py-1 border border-[#ee4d2d] text-[#ee4d2d] rounded text-xs font-semibold hover:bg-[#fff0ea]">Xem Shop</button>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.delivered && (
                      <span className="flex items-center text-green-600 text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" /></svg>
                        Giao hàng thành công
                      </span>
                    )}
                    <span className={`${order.statusColor} text-sm font-bold uppercase`}>{order.statusText}</span>
                  </div>
                </div>
                {/* Sản phẩm - chiều ngang */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-[#f2f2f2]">
                  <img src={order.productImg} alt="product" className="w-20 h-20 object-contain border rounded bg-white" />
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="font-medium text-base truncate text-gray-900">{order.productName}</div>
                    <div className="text-xs text-gray-500 mt-1">Phân loại hàng: {order.productType}</div>
                    <div className="text-xs text-gray-500">x{order.qty}</div>
                  </div>
                  <div className="text-right min-w-[120px] flex flex-col items-end justify-center">
                    <span className="line-through text-gray-400 text-sm mr-2">₫{order.oldPrice.toLocaleString()}</span>
                    <span className="text-[#ee4d2d] font-bold text-lg">₫{order.price.toLocaleString()}</span>
                  </div>
                </div>
                {/* Chú thích nhỏ */}
                {order.note && (
                  <div className="px-6 py-2 text-xs text-gray-500 bg-[#fff8f6] border-b border-[#f2f2f2]">
                    {order.note}
                  </div>
                )}
                {/* Tổng tiền + nút thao tác dưới cùng */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-base">Thành tiền:</span>
                    <span className="text-[#ee4d2d] font-bold text-2xl">₫{order.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button className="bg-[#ee4d2d] text-white px-7 py-2 rounded font-bold text-base hover:bg-[#d9441c] transition">Đã Nhận Hàng</button>
                    <button className="border border-[#ee4d2d] text-[#ee4d2d] px-7 py-2 rounded font-bold text-base hover:bg-[#fff0ea] transition">Yêu Cầu Trả Hàng/Hoàn Tiền</button>
                    <button className="border border-gray-300 text-gray-700 px-7 py-2 rounded font-bold text-base hover:bg-gray-100 transition">Liên Hệ Người Bán</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (activeTab === "info") {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tên, Họ:</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" name="name" value={formData.name} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail:</label>
              <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" name="email" value={formData.email} onChange={handleChange} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Điện thoại:</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Giới tính:</label>
              <div className="mt-1 flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleGenderChange} /> Nam
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" className="form-radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleGenderChange} /> Nữ
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ngày sinh:</label>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <select className="border border-gray-300 rounded-md shadow-sm p-2" value={dobDay} onChange={e => handleDateChange(e, 'day')}>
                  <option value="">Ngày</option>
                  {[...Array(31)].map((_, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>)}
                </select>
                <select className="border border-gray-300 rounded-md shadow-sm p-2" value={dobMonth} onChange={e => handleDateChange(e, 'month')}>
                  <option value="">Tháng</option>
                  {[...Array(12)].map((_, i) => <option key={i + 1} value={String(i + 1).padStart(2, '0')}>Tháng {i + 1}</option>)}
                </select>
                <select className="border border-gray-300 rounded-md shadow-sm p-2" value={dobYear} onChange={e => handleDateChange(e, 'year')}>
                  <option value="">Năm</option>
                  {[...Array(100)].map((_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ:</label>
              <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" name="address" value={formData.address} onChange={handleChange} />
            </div>
          </div>
          {successMessage && <div className="mt-4 text-green-600 text-center">{successMessage}</div>}
          {errorMessage && <div className="mt-4 text-red-600 text-center">{errorMessage}</div>}
          <div className="mt-6 text-center">
            <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700" onClick={handleSaveInfo}>Lưu lại</button>
          </div>
        </div>
      );
    }
    if (activeTab === "address") {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            Địa chỉ
            <div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2">Sửa</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Xóa</button>
            </div>
          </h2>
          <div className="border border-gray-200 p-4 rounded-md">
            <p><strong>Tên:</strong> {user?.TenKH || ''}</p>
            <p><strong>Email:</strong> {user?.email || ''}</p>
            <p><strong>Số điện thoại:</strong> {user?.Sdt || ''}</p>
            <p><strong>Địa chỉ:</strong> {user?.dia_chi || ''}</p>
          </div>
          <div className="mt-6 text-center">
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Thêm mới</button>
          </div>
        </div>
      );
    }
    if (activeTab === "password") {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-sm text-yellow-700">
            Lưu ý: Mật khẩu phải có tối thiểu 8 ký tự bao gồm chữ, số và các ký tự đặc biệt
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ:</label>
              <div className="relative">
                <input type={showCurrentPassword ? 'text' : 'password'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10" name="currentPassword" value={passwordForm.currentPassword} onChange={handlePasswordChange} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" onClick={() => togglePasswordVisibility('currentPassword')}>
                  {showCurrentPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.5-.241.85-1.041 1.595-1.743 2.115M17.25 12L20.25 12" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu mới:</label>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" onClick={() => togglePasswordVisibility('newPassword')}>
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.5-.241.85-1.041 1.595-1.743 2.115M17.25 12L20.25 12" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu:</label>
              <div className="relative">
                <input type={showConfirmNewPassword ? 'text' : 'password'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10" name="confirmNewPassword" value={passwordForm.confirmNewPassword} onChange={handlePasswordChange} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" onClick={() => togglePasswordVisibility('confirmNewPassword')}>
                  {showConfirmNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.5-.241.85-1.041 1.595-1.743 2.115M17.25 12L20.25 12" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          {passwordSuccessMessage && <div className="mt-4 text-green-600 text-center">{passwordSuccessMessage}</div>}
          {passwordErrorMessage && <div className="mt-4 text-red-600 text-center">{passwordErrorMessage}</div>}
          <div className="mt-6 text-center">
            <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700" onClick={handleChangePassword}>Đổi mật khẩu</button>
          </div>
        </div>
      );
    }
    if (activeTab === "avatar") {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Ảnh đại diện</h2>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 text-sm text-blue-700">
            Hình đại diện phải ở định dạng GIF hoặc JPEG có kích thước tối đa là 20 KB
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
              {formData.avatar ? (
                <img src={getImageUrl(formData.avatar)} alt="Avatar" className="object-cover w-full h-full" />
              ) : (
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M10 14v4m-4 0h8m-1 0H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V17a2 2 0 01-2 2H7a2 2 0 01-2-2z"></path></svg>
              )}
            </div>
            <input type="file" accept="image/jpeg,image/gif" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleAvatarChange} />
            <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={handleSaveInfo}>Tải lên</button>
          </div>
          {successMessage && <div className="mt-4 text-green-600 text-center">{successMessage}</div>}
          {errorMessage && <div className="mt-4 text-red-600 text-center">{errorMessage}</div>}
        </div>
      );
    }
    if (activeTab === "voucher") {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Voucher</h2>
          <p>Nội dung điểm thưởng...</p>
        </div>
      );
    }
    if (activeTab === "reviews") {
      return (
        <div>
          <h2 className="text-xl font-bold mb-4">Lịch sử đánh giá sản phẩm</h2>
          <p>Nội dung lịch sử đánh giá...</p>
        </div>
      );
    }
    // fallback
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <nav className="space-y-4">
          {PROFILE_TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === tab.key ? 'bg-orange-100 text-[#ee4d2d] font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 px-0 sm:px-12 py-6">
        <div className="bg-white shadow-md rounded-lg p-0 sm:p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
} 