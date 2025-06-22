'use client';

import React, { useState, useEffect } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

interface GiftVoucher {
  _id: string;
  name: string;
  phone: string;
  email: string;
  voucherCode: string;
  selectedGift: number;
  isUsed: boolean;
  emailSent: boolean;
  emailSentAt: string;
  createdAt: string;
  expiresAt: string;
}

const GiftVouchersPage = () => {
  const [vouchers, setVouchers] = useState<GiftVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/gift-vouchers');
      const data = await response.json();
      
      if (data.success) {
        setVouchers(data.data);
      } else {
        setError('Không thể tải danh sách voucher');
      }
    } catch (error) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async (email: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/gift-vouchers/resend-email/${email}`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        alert('Email đã được gửi lại thành công!');
        fetchVouchers(); // Refresh data
      } else {
        alert('Gửi email thất bại: ' + data.message);
      }
    } catch (error) {
      alert('Lỗi khi gửi email');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Đang tải...</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Quản lý Gift Vouchers" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Thông tin khách hàng
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Mã voucher
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Quà đã chọn
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Trạng thái
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Email
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Ngày tạo
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((voucher) => (
                <tr key={voucher._id}>
                  <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                    <div>
                      <h5 className="font-medium text-black dark:text-white">
                        {voucher.name}
                      </h5>
                      <p className="text-sm text-gray-600">{voucher.phone}</p>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {voucher.voucherCode}
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span className="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium bg-primary text-primary">
                      Quà {voucher.selectedGift}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        voucher.isUsed 
                          ? 'bg-success text-success' 
                          : 'bg-warning text-warning'
                      }`}>
                        {voucher.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}
                      </span>
                      <span className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                        voucher.emailSent 
                          ? 'bg-success text-success' 
                          : 'bg-danger text-danger'
                      }`}>
                        {voucher.emailSent ? 'Đã gửi email' : 'Chưa gửi email'}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="text-sm">
                      <p>{voucher.email}</p>
                      {voucher.emailSentAt && (
                        <p className="text-xs text-gray-500">
                          Gửi: {formatDate(voucher.emailSentAt)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="text-sm">
                      <p>{formatDate(voucher.createdAt)}</p>
                      <p className="text-xs text-gray-500">
                        Hết hạn: {formatDate(voucher.expiresAt)}
                      </p>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center space-x-3.5">
                      {!voucher.emailSent && (
                        <button
                          className="hover:text-primary"
                          onClick={() => resendEmail(voucher.email)}
                          title="Gửi lại email"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.8754 11.6719C16.5379 11.6719 16.2285 11.9531 16.2285 12.3187V14.8219C16.2285 15.075 16.0316 15.2719 15.7785 15.2719H1.22227C0.969141 15.2719 0.772266 15.075 0.772266 14.8219V12.3187C0.772266 11.9666 0.478516 11.6719 0.126391 11.6719C-0.226734 11.6719 -0.520484 11.9531 -0.520484 12.3187V14.8219C0.519141 16.075 1.77852 16.875 3.17852 16.875H13.7785C15.1785 16.875 16.4379 16.075 16.4779 14.8219V12.3187C16.4779 11.9531 16.2129 11.6719 16.8754 11.6719ZM8.55074 12.3469C8.66324 12.4594 8.83199 12.5156 9.00074 12.5156C9.16949 12.5156 9.33824 12.4594 9.45074 12.3469L13.4726 8.43752C13.7257 8.18439 13.7257 7.79064 13.4726 7.53752C13.2195 7.28439 12.8257 7.28439 12.5726 7.53752L9.64762 10.4063V1.77189C9.64762 1.41977 9.35387 1.12502 9.00174 1.12502C8.64962 1.12502 8.35587 1.41977 8.35587 1.77189V10.4063L5.43087 7.53752C5.17774 7.28439 4.78399 7.28439 4.53087 7.53752C4.27774 7.79064 4.27774 8.18439 4.53087 8.43752L8.55074 12.3469Z" fill=""/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {vouchers.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              Chưa có voucher nào được tạo
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default GiftVouchersPage; 