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
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Trả góp qua công ty tài chính</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {installmentPlans.map((plan, idx) => (
          <div key={idx} className="rounded-xl shadow p-4 border">
            <div className="font-bold text-lg">{plan.company}</div>
            <div>Kỳ hạn: {plan.term} tháng</div>
            <div>Lãi suất: {plan.interest}%</div>
            <div>Trả trước: {plan.upfront.toLocaleString()}₫</div>
            <div>Góp/tháng: {plan.monthly.toLocaleString()}₫</div>
            <div>Tổng tiền: {plan.total.toLocaleString()}₫</div>
            <div>Điều kiện: {plan.conditions}</div>
            <button className="mt-3 w-full bg-blue-600 text-white rounded py-2 font-bold">Đặt mua</button>
          </div>
        ))}
      </div>
      <div className="mt-6 text-sm text-gray-500">Lưu ý: Số tiền thực tế có thể chênh lệch đến 10.000đ/tháng</div>
    </div>
  );
}