'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';

const AddVoucherPage = () => {
    const [formData, setFormData] = useState({
        ma_voucher: '',
        mo_ta: '',
        phan_tram_giam_gia: 0,
        giam_toi_da: 0,
        don_hang_toi_thieu: 0,
        so_luong: 100,
        ngay_bat_dau: '',
        ngay_ket_thuc: '',
        trang_thai: 'active',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const generateVoucherCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'POLY';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, ma_voucher: result });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (new Date(formData.ngay_bat_dau) >= new Date(formData.ngay_ket_thuc)) {
            setError('Ngày bắt đầu phải trước ngày kết thúc.');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/vouchers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    phan_tram_giam_gia: Number(formData.phan_tram_giam_gia),
                    giam_toi_da: Number(formData.giam_toi_da),
                    don_hang_toi_thieu: Number(formData.don_hang_toi_thieu),
                    so_luong: Number(formData.so_luong),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Thêm voucher thành công! Đang chuyển hướng...');
                setTimeout(() => {
                    router.push('/vouchers');
                }, 2000);
            } else {
                setError(data.message || 'Thêm voucher thất bại.');
            }
        } catch (err) {
            setError('Lỗi kết nối server.');
        }
    };

    return (
        <DefaultLayout>
            <Breadcrumb pageName="Thêm Voucher Mới" />

            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                    <h3 className="font-medium text-black dark:text-white">Form Thêm Voucher</h3>
                </div>
                <form onSubmit={handleSubmit} className="p-6.5">
                    {error && <div className="mb-4 text-red-500 bg-red-100 border border-red-400 p-3 rounded">{error}</div>}
                    {success && <div className="mb-4 text-green-500 bg-green-100 border border-green-400 p-3 rounded">{success}</div>}

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">Mã Voucher</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                name="ma_voucher"
                                value={formData.ma_voucher}
                                onChange={handleChange}
                                placeholder="POLYSMART123"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                required
                            />
                            <button type="button" onClick={generateVoucherCode} className="whitespace-nowrap bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600">
                                Tạo mã ngẫu nhiên
                            </button>
                        </div>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">Mô tả</label>
                        <input
                            type="text"
                            name="mo_ta"
                            value={formData.mo_ta}
                            onChange={handleChange}
                            placeholder="Voucher giảm giá cho khách hàng mới"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">Phần trăm giảm giá (%)</label>
                            <input
                                type="number"
                                name="phan_tram_giam_gia"
                                value={formData.phan_tram_giam_gia}
                                onChange={handleChange}
                                placeholder="10"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                                min="0" max="100"
                            />
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">Giảm tối đa (VNĐ)</label>
                            <input
                                type="number"
                                name="giam_toi_da"
                                value={formData.giam_toi_da}
                                onChange={handleChange}
                                placeholder="50000"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                                min="0"
                            />
                        </div>

                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">Đơn hàng tối thiểu (VNĐ)</label>
                            <input
                                type="number"
                                name="don_hang_toi_thieu"
                                value={formData.don_hang_toi_thieu}
                                onChange={handleChange}
                                placeholder="100000"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                                min="0"
                            />
                        </div>
                    </div>
                     <div className="mb-4.5">
                        <label className="mb-2.5 block text-black dark:text-white">Số lượng</label>
                        <input
                            type="number"
                            name="so_luong"
                            value={formData.so_luong}
                            onChange={handleChange}
                            placeholder="100"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                            min="1"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">Ngày bắt đầu</label>
                            <input
                                type="date"
                                name="ngay_bat_dau"
                                value={formData.ngay_bat_dau}
                                onChange={handleChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                                required
                            />
                        </div>
                        <div className="mb-4.5">
                            <label className="mb-2.5 block text-black dark:text-white">Ngày kết thúc</label>
                            <input
                                type="date"
                                name="ngay_ket_thuc"
                                value={formData.ngay_ket_thuc}
                                onChange={handleChange}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4.5">
                         <label className="mb-2.5 block text-black dark:text-white">Trạng thái</label>
                        <select
                            name="trang_thai"
                            value={formData.trang_thai}
                            onChange={handleChange}
                             className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary"
                        >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Ngừng</option>
                        </select>
                    </div>

                    <button type="submit" className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                        Thêm Voucher
                    </button>
                </form>
            </div>
        </DefaultLayout>
    );
};

export default AddVoucherPage; 