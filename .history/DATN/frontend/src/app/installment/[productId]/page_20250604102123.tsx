"use client";
import React from "react";

const installmentPlans = [
	{
		company: "Home Credit",
		term: 6,
		interest: 3.99,
		upfront: 5000000,
		monthly: 2000000,
		total: 32000000,
		conditions: "CMND/CCCD, GPLX",
	},
	// ... các gói khác
];

export default function InstallmentPage() {
	// Màu theo công ty tài chính
	const companyColors = {
		"Home Credit": "bg-red-600 text-white border-red-600",
		"FE Credit": "bg-green-600 text-white border-green-600",
		"HD SAISON": "bg-yellow-400 text-black border-yellow-400",
		"Shinhan Finance": "bg-blue-600 text-white border-blue-600",
		// Thêm các công ty khác nếu có
	};

	return (
		<div className="flex flex-col min-h-screen bg-[#f5f6fa]">
			<div className="flex-1 flex flex-col items-center justify-start py-8">
				<div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 mt-4">
					<div className="flex items-center mb-6">
						<img
							src="/images/no-image.png"
							alt="product"
							className="w-16 h-16 rounded-lg object-contain mr-4 border"
						/>
						<div>
							<div className="text-lg font-semibold">iPhone 16 Pro Max 256GB</div>
							<div className="text-gray-500 text-sm">
								TRẢ GÓP QUA CÔNG TY TÀI CHÍNH
							</div>
						</div>
						<div className="ml-auto text-2xl font-bold text-blue-700">
							30.290.000₫
						</div>
					</div>
					<div className="font-bold text-base mb-2">Các gói trả góp nổi bật</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
						{installmentPlans.map((plan, idx) => (
							<div
								key={idx}
								className={`rounded-xl shadow border-2 p-4 flex flex-col items-center ${
									companyColors[plan.company] ||
									"bg-white text-black border-gray-200"
								}`}
							>
								<div className="font-bold text-base mb-1 uppercase tracking-wide">
									{plan.company}
								</div>
								<div className="text-xs mb-2">
									Kỳ hạn{" "}
									<span className="font-bold">{plan.term} tháng</span>
								</div>
								<div className="w-full text-sm mb-1 flex justify-between">
									<span>Giá trả góp:</span>{" "}
									<span className="font-bold">30.290.000₫</span>
								</div>
								<div className="w-full text-sm mb-1 flex justify-between">
									<span>Trả trước:</span>{" "}
									<span>{plan.upfront.toLocaleString()}₫</span>
								</div>
								<div className="w-full text-sm mb-1 flex justify-between">
									<span>Góp mỗi tháng:</span>{" "}
									<span className="font-bold text-blue-900">
										{plan.monthly.toLocaleString()}₫
									</span>
								</div>
								<div className="w-full text-sm mb-1 flex justify-between">
									<span>Lãi suất:</span> <span>{plan.interest}%</span>
								</div>
								<div className="w-full text-sm mb-1 flex justify-between">
									<span>Chênh lệch:</span> <span>0₫</span>
								</div>
								<div className="w-full text-sm mb-1 flex justify-between">
									<span>Giấy tờ:</span> <span>{plan.conditions}</span>
								</div>
								<div className="w-full text-sm mb-2 flex justify-between">
									<span>Tổng tiền:</span>{" "}
									<span className="font-bold">
										{plan.total.toLocaleString()}₫
									</span>
								</div>
								<button className="mt-2 w-full bg-white text-blue-600 border border-blue-600 rounded font-bold py-2 hover:bg-blue-50 transition">
									Đặt mua
								</button>
								<div className="text-xs text-center mt-1 text-white/80">
									Duyệt hồ sơ siêu nhanh
								</div>
							</div>
						))}
					</div>
					<div className="text-xs text-gray-500 mt-2">
						Lưu ý: Số tiền thực tế có thể chênh lệch đến 10.000đ/tháng
					</div>
				</div>
			</div>
			<footer className="w-full bg-[#222] text-white py-8 mt-8">
				<div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4">
					<div className="flex-1">
						<div className="font-bold mb-2">Tổng đài hỗ trợ</div>
						<div className="mb-1">
							Mua hàng:{" "}
							<span className="font-bold">1900.6626</span> (08:00 - 22:00)
						</div>
						<div>
							Bảo hành:{" "}
							<span className="font-bold">1900.8036</span> (08:30 - 20:00)
						</div>
					</div>
					<div className="flex-1">
						<div className="font-bold mb-2">Thông tin</div>
						<div className="text-sm">Newsfeed</div>
						<div className="text-sm">Check IMEI</div>
						<div className="text-sm">Phương thức thanh toán</div>
					</div>
					<div className="flex-1">
						<div className="font-bold mb-2">Chính sách</div>
						<div className="text-sm">Đổi trả & bảo hành</div>
						<div className="text-sm">Giao hàng</div>
						<div className="text-sm">Hướng dẫn thanh toán</div>
					</div>
					<div className="flex-1">
						<div className="font-bold mb-2">Địa chỉ & Liên hệ</div>
						<div className="text-sm">Tài khoản của tôi</div>
						<div className="text-sm">Đơn đặt hàng</div>
						<div className="text-sm">Tìm Store trên Google Map</div>
					</div>
				</div>
				<div className="text-center text-xs text-gray-400 mt-6">
					© 2025 PolySmart. All rights reserved.
				</div>
			</footer>
		</div>
	);
}