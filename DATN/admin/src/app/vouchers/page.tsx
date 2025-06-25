'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import Link from 'next/link';

interface Voucher {
    _id: string;
    ma_voucher: string;
    mo_ta: string;
    phan_tram_giam_gia: number;
    giam_toi_da: number;
    don_hang_toi_thieu: number;
    so_luong: number;
    da_su_dung: number;
    ngay_bat_dau: string;
    ngay_ket_thuc: string;
    trang_thai: 'active' | 'inactive' | 'expired';
}

const VouchersPage = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/vouchers');
            const data = await response.json();
            if (data.success) {
                setVouchers(data.data);
            } else {
                setError('Không thể tải danh sách voucher');
            }
        } catch (err) {
            setError('Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/vouchers/${id}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (data.success) {
                    alert('Xóa voucher thành công');
                    fetchVouchers(); // Refresh list
                } else {
                    alert('Xóa voucher thất bại: ' + data.message);
                }
            } catch (err) {
                alert('Lỗi khi xóa voucher');
            }
        }
    };

    const formatCurrency = (num: number | undefined | null) =>
      typeof num === 'number' && !isNaN(num) ? num.toLocaleString('vi-VN') + 'đ' : '0đ';
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

    const getStatusChip = (status: 'active' | 'inactive' | 'expired') => {
        switch (status) {
            case 'active':
                return <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">Hoạt động</span>;
            case 'inactive':
                return <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">Ngừng</span>;
            case 'expired':
                return <span className="inline-flex rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700">Hết hạn</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return <DefaultLayout><div className="flex justify-center items-center h-64">Đang tải...</div></DefaultLayout>;
    }

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Quản lý Voucher Công Khai" />

            <div className="flex justify-end mb-4">
                <Link href="/vouchers/add">
                    <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Thêm Voucher Mới
                    </button>
                </Link>
            </div>

            <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
                <div className="max-w-full overflow-x-auto">
                    {error && <div className="mb-4 text-red-500">{error}</div>}
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Mã Voucher</th>
                                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">Mô tả</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Giảm giá</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Số lượng</th>
                                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">Thời gian hiệu lực</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Trạng thái</th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vouchers.map((voucher) => (
                                <tr key={voucher._id}>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="font-mono text-black dark:text-white">{voucher.ma_voucher}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-black dark:text-white">{voucher.mo_ta}</p>
                                        <p className="text-sm text-gray-500">Đơn tối thiểu: {formatCurrency(voucher.don_hang_toi_thieu)}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-green-600 font-semibold">{voucher.phan_tram_giam_gia}%</p>
                                        <p className="text-sm text-gray-500">Tối đa: {formatCurrency(voucher.giam_toi_da)}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-black dark:text-white">{voucher.so_luong - voucher.da_su_dung} / {voucher.so_luong}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <p className="text-sm">Từ: {formatDate(voucher.ngay_bat_dau)}</p>
                                        <p className="text-sm">Đến: {formatDate(voucher.ngay_ket_thuc)}</p>
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        {getStatusChip(voucher.trang_thai)}
                                    </td>
                                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                                        <div className="flex items-center space-x-3.5">
                                            <button className="hover:text-primary" onClick={() => router.push(`/vouchers/edit/${voucher._id}`)}>Sửa</button>
                                            <button className="hover:text-red-500" onClick={() => handleDelete(voucher._id)}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {vouchers.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500">Chưa có voucher công khai nào.</div>
                    )}
                </div>
            </div>
        </DefaultLayout>
    );
};

export default VouchersPage; 