"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface OrderStatusData {
  labels: string[];
  series: number[];
}

const ChartThree: React.FC = () => {
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData>({
    labels: ["Đã giao hàng", "Đã hủy", "Đang vận chuyển", "pending", "processing", "Tiếp nhận"],
    series: [25, 3, 12, 50, 2, 8]
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: [
      "#10B981", // Đã giao hàng - Green
      "#EF4444", // Đã hủy - Red
      "#3B82F6", // Đang vận chuyển - Blue
      "#F59E0B", // pending - Orange
      "#8B5CF6", // processing - Purple
      "#06B6D4"  // Tiếp nhận - Cyan
    ],
    labels: orderStatusData.labels,
    legend: {
      show: true,
      position: "bottom",
      fontFamily: "Satoshi, sans-serif",
      fontSize: "12px",
      fontWeight: 500,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: true,
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Satoshi, sans-serif',
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const label = w.globals.labels[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        const total = series[seriesIndex].reduce((a: number, b: number) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        
        return `
          <div class="custom-tooltip" style="
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 8px 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            font-size: 12px;
            font-family: 'Satoshi', sans-serif;
            color: #374151;
            max-width: 200px;
          ">
            <div style="font-weight: 600; margin-bottom: 4px; color: #111827;">
              ${label}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px;">
              <span style="color: #6b7280;">${value} đơn hàng</span>
              <span style="color: #ef4444; font-weight: 600;">${percentage}%</span>
            </div>
          </div>
        `;
      }
    },
  };

  // Fetch order status statistics
  const fetchOrderStatusStats = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/admin/statistics/order-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOrderStatusData(data);
      } else {
        console.error('Failed to fetch order status statistics');
      }
    } catch (error) {
      console.error('Error fetching order status statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatusStats();
  }, [token]);

  return (
    <div className="h-full rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-lg dark:border-gray-700 dark:bg-boxdark hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h5 className="text-xl font-bold text-gray-900 dark:text-white">
              Tỷ Lệ Trạng Thái Đơn Hàng
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Phân bố trạng thái đơn hàng
            </p>
          </div>
        </div>
        

      </div>

      {/* Chart Container */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 dark:bg-boxdark dark:bg-opacity-90 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-center items-center h-full">
          <div id="chartThree" className="w-full">
            <ReactApexChart 
              options={options} 
              series={orderStatusData.series} 
              type="donut" 
              height={280}
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Đã giao</p>
              <p className="text-lg font-bold text-green-900 dark:text-green-100">
                {(() => {
                  const deliveredIndex = orderStatusData.labels.findIndex(label => 
                    label === 'Đã giao hàng' || label === 'delivered'
                  );
                  return deliveredIndex !== -1 ? orderStatusData.series[deliveredIndex] : 0;
                })()} đơn
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 p-4 dark:from-orange-900/20 dark:to-amber-900/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Chờ xử lý</p>
              <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                {(() => {
                  const pendingIndex = orderStatusData.labels.findIndex(label => 
                    label === 'Chờ xử lý' || label === 'pending'
                  );
                  return pendingIndex !== -1 ? orderStatusData.series[pendingIndex] : 0;
                })()} đơn
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartThree;
