'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'address', 'orders', etc.

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
            {/* Content for Thông tin tài khoản */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên, Họ:</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="Phạm Nguyễn Thái An" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail:</label>
                <input type="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="anpahm292@gmail.com" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Điện thoại:</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="0977122574" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Giới tính:</label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="inline-flex items-center"><input type="radio" className="form-radio" name="gender" value="male" checked readOnly /> Nam</label>
                  <label className="inline-flex items-center"><input type="radio" className="form-radio" name="gender" value="female" readOnly /> Nữ</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày sinh:</label>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  <select className="border border-gray-300 rounded-md shadow-sm p-2"><option>29</option></select>
                  <select className="border border-gray-300 rounded-md shadow-sm p-2"><option>Tháng 2</option></select>
                  <select className="border border-gray-300 rounded-md shadow-sm p-2"><option>2004</option></select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username:</label>
                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value="Anpahm292" readOnly />
              </div>
            </div>
            <div className="mt-6 text-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Lưu lại</button>
            </div>
          </div>
        );
      case 'address':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
              Địa chỉ
              <div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 mr-2">Sửa</button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Xóa</button>
              </div>
            </h2>
            {/* Content for Địa chỉ nhận hàng */}
            <div className="border border-gray-200 p-4 rounded-md">
              <p><strong>Tên:</strong> an</p>
              <p><strong>Email:</strong> anpahm292@gmail.com</p>
              <p><strong>Số điện thoại:</strong> 0977122574</p>
              <p><strong>Địa chỉ:</strong> 39 Đông Hưng Thuận, Thuận,Vietnam</p>
            </div>
            <div className="mt-6 text-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Thêm mới</button>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Đơn đặt hàng</h2>
            <p>Nội dung đơn đặt hàng...</p>
          </div>
        );
      case 'system':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Hệ thống</h2>
            <p>Nội dung hệ thống...</p>
          </div>
        );
      case 'points':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Điểm thưởng</h2>
            <p>Nội dung điểm thưởng...</p>
          </div>
        );
      case 'password':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Đổi mật khẩu</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 text-sm text-yellow-700">
              Lưu ý: Mật khẩu phải có tối thiểu 8 ký tự bao gồm chữ, số và các ký tự đặc biệt
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu cũ:</label>
                <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mật khẩu mới:</label>
                <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu:</label>
                <input type="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
            <div className="mt-6 text-center">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">Đổi mật khẩu</button>
            </div>
          </div>
        );
      case 'avatar':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Ảnh đại diện</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 text-sm text-blue-700">
              Hình đại diện phải ở định dạng GIF hoặc JPEG có kích thước tối đa là 20 KB
            </div>
            <div className="flex items-center space-x-4">
              <input type="file" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Tải lên</button>
            </div>
          </div>
        );
      case 'reviews':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">Lịch sử đánh giá sản phẩm</h2>
            <p>Nội dung lịch sử đánh giá...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6">
        <nav className="space-y-4">
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'info' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('info')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            Thông tin tài khoản
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'address' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('address')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657m10.607-2.121a8.001 8.001 0 00-11.314 0m11.314 0l.001.001h-.001zm-11.314 0L3.414 14.5a1.998 1.998 0 01-2.828 0L.343 12.343"></path></svg>
            Địa chỉ nhận hàng
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'orders' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M17 12h.01"></path></svg>
            Đơn đặt hàng
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'system' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('system')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Hệ thống
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'points' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('points')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.977 2.889a1 1 0 00-.364 1.118l1.519 4.674c.3.921-.755 1.688-1.539 1.118l-3.977-2.889a1 1 0 00-1.176 0l-3.977 2.889c-.784.57-1.839-.197-1.539-1.118l1.519-4.674a1 1 0 00-.364-1.118L2.927 9.5c-.783-.57-.381-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"></path></svg>
            Điểm thưởng
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'password' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('password')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Đổi mật khẩu
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'avatar' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('avatar')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            Ảnh đại diện
          </button>
          <button
            className={`flex items-center w-full p-3 rounded-lg text-left ${activeTab === 'reviews' ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('reviews')}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Lịch sử đánh giá sản phẩm
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-12 py-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
} 