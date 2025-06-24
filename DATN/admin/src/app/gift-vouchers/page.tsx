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
  percent?: number;
  isDisabled: boolean;
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

  const handleDisableVoucher = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn vô hiệu hóa voucher này?')) return;
    try {
      await fetch(`http://localhost:3000/api/gift-vouchers/${id}/disable`, { method: 'PATCH' });
      fetchVouchers();
    } catch (err) {
      alert('Vô hiệu hóa voucher thất bại!');
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

  // Sắp xếp voucher mới nhất lên đầu
  const sortedVouchers = [...vouchers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
              <tr className=" text-left dark:bg-meta-4">
                <th className="w-12 py-4 px-2 font-medium text-black dark:text-white text-center rounded-tl-lg">STT</th>
                <th className="min-w-[180px] py-4 px-4 font-medium text-black dark:text-white">Thông tin khách hàng</th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Mã voucher</th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white text-center">% Giảm giá</th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white text-center">Trạng thái</th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Email</th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">Ngày tạo</th>
                <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white rounded-tr-lg">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedVouchers.map((voucher, idx) => (
                <tr key={voucher._id} className={`${voucher.isDisabled ? 'opacity-60' : ''}`}>
                  <td className="text-center text-400">{idx + 1}</td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <div>
                      <h5 className="font-medium text-black dark:text-white">{voucher.name}</h5>
                      <p className="text-sm text-gray-600">{voucher.phone}</p>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <div className="font-mono text-sm bg-gray-100 p-2 rounded-lg text-center">{voucher.voucherCode}</div>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark text-center">
                    <span className={`inline-flex rounded-full py-1 px-3 text-sm font-bold ${voucher.percent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{voucher.percent ? voucher.percent + '%' : '-'}</span>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark text-center">
                    <div className="flex flex-col gap-1 items-center">
                      <span className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${voucher.isUsed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{voucher.isUsed ? 'Đã sử dụng' : 'Chưa sử dụng'}</span>
                      <span className={`inline-flex rounded-full py-1 px-3 text-xs font-medium ${voucher.emailSent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{voucher.emailSent ? 'Đã gửi email' : 'Chưa gửi email'}</span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <div className="text-sm">
                      <p>{voucher.email}</p>
                      {voucher.emailSentAt && (
                        <p className="text-xs text-gray-500">Gửi: {formatDate(voucher.emailSentAt)}</p>
                      )}
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark">
                    <div className="text-sm">
                      <p>{formatDate(voucher.createdAt)}</p>
                      <p className="text-xs text-gray-500">Hết hạn: {voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleDateString('vi-VN') : '-'}</p>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-4 px-4 dark:border-strokedark text-center">
                    <div className="flex items-center justify-center space-x-3.5">
                      {!voucher.isDisabled && !voucher.emailSent && (
                        <button className="hover:text-primary" onClick={() => resendEmail(voucher.email)} title="Gửi lại email">
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.8754 11.6719C16.5379 11.6719 16.2285 11.9531 16.2285 12.3187V14.8219C16.2285 15.075 16.0316 15.2719 15.7785 15.2719H1.22227C0.969141 15.2719 0.772266 15.075 0.772266 14.8219V12.3187C0.772266 11.9666 0.478516 11.6719 0.126391 11.6719C-0.226734 11.6719 -0.520484 11.9531 -0.520484 12.3187V14.8219C0.519141 16.075 1.77852 16.875 3.17852 16.875H13.7785C15.1785 16.875 16.4379 16.075 16.4779 14.8219V12.3187C16.4779 11.9531 16.2129 11.6719 16.8754 11.6719ZM8.55074 12.3469C8.66324 12.4594 8.83199 12.5156 9.00074 12.5156C9.16949 12.5156 9.33824 12.4594 9.45074 12.3469L13.4726 8.43752C13.7257 8.18439 13.7257 7.79064 13.4726 7.53752C13.2195 7.28439 12.8257 7.28439 12.5726 7.53752L9.64762 10.4063V1.77189C9.64762 1.41977 9.35387 1.12502 9.00174 1.12502C8.64962 1.12502 8.35587 1.41977 8.35587 1.77189V10.4063L5.43087 7.53752C5.17774 7.28439 4.78399 7.28439 4.53087 7.53752C4.27774 7.79064 4.27774 8.18439 4.53087 8.43752L8.55074 12.3469Z" fill=""/>
                          </svg>
                        </button>
                      )}
                      {!voucher.isDisabled && (
                        <button className="hover:text-yellow-600" onClick={() => handleDisableVoucher(voucher._id)} title="Vô hiệu hóa voucher">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                        </button>
                      )}
                      {voucher.isDisabled && (
                        <span className="text-xs text-gray-400 italic">Đã vô hiệu hóa</span>
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