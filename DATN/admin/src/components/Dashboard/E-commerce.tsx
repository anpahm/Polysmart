"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import ChartOne from "../Charts/ChartOne";
import ChartTwo from "../Charts/ChartTwo";
import CardDataStats from "../CardDataStats";
import StatisticsCards from "./StatisticsCards";

import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "../../config/api";

const ChartThree = dynamic(() => import("@/components/Charts/ChartThree"), {
  ssr: false,
});

interface OverallStats {
  totalUsers: number;
  totalAllOrders: number;
  totalProductsInDb: number;
  viewCount: string;
  growthRates: {
    users: string;
    orders: string;
    products: string;
    views: string;
  };
}

const ECommerce: React.FC = () => {
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalUsers: 0,
    totalAllOrders: 0,
    totalProductsInDb: 0,
    viewCount: "0",
    growthRates: {
      users: "0",
      orders: "0",
      products: "0",
      views: "0"
    }
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // Fetch overall statistics
  const fetchOverallStats = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('admin/statistics?period=week'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOverallStats(data.overall);
      }
    } catch (error) {
      console.error('Error fetching overall statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverallStats();
  }, [token]);

  const getGrowthIcon = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate > 0) return true; // levelUp
    if (numRate < 0) return false; // levelDown
    return true; // default to levelUp
  };

  const getGrowthRate = (rate: string) => {
    const numRate = parseFloat(rate);
    return `${numRate > 0 ? '+' : ''}${rate}%`;
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Tổng quan về hiệu suất kinh doanh và thống kê cửa hàng
        </p>
      </div>



      {/* Statistics Cards - Thống kê thật từ đơn hàng */}
      <StatisticsCards />

      {/* Overall Statistics Cards - Thống kê tổng quan */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats 
          title="Tổng lượt xem" 
          total={loading ? "..." : overallStats.viewCount} 
          rate={getGrowthRate(overallStats.growthRates.views)} 
          levelUp={getGrowthIcon(overallStats.growthRates.views)}
        >
          <svg
            className="fill-white"
            width="22"
            height="16"
            viewBox="0 0 22 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"
              fill=""
            />
            <path
              d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"
              fill=""
            />
          </svg>
        </CardDataStats>

        <CardDataStats 
          title="Tổng sản phẩm" 
          total={loading ? "..." : overallStats.totalProductsInDb.toString()} 
          rate={getGrowthRate(overallStats.growthRates.products)} 
          levelUp={getGrowthIcon(overallStats.growthRates.products)}
        >
          <svg
            className="fill-white"
            width="20"
            height="22"
            viewBox="0 0 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.7531 16.4312C10.3781 16.4312 9.27808 17.5312 9.27808 18.9062C9.27808 20.2812 10.3781 21.3812 11.7531 21.3812C13.1281 21.3812 14.2281 20.2812 14.2281 18.9062C14.2281 17.5656 13.1281 16.4312 11.7531 16.4312ZM11.7531 19.8687C11.2375 19.8687 10.825 19.4562 10.825 18.9406C10.825 18.425 11.2375 18.0125 11.7531 18.0125C12.2687 18.0125 12.6812 18.425 12.6812 18.9406C12.6812 19.4562 12.2343 19.8687 11.7531 19.8687Z"
              fill=""
            />
            <path
              d="M5.22183 16.4312C3.84683 16.4312 2.74683 17.5312 2.74683 18.9062C2.74683 20.2812 3.84683 21.3812 5.22183 21.3812C6.59683 21.3812 7.69683 20.2812 7.69683 18.9062C7.69683 17.5656 6.59683 16.4312 5.22183 16.4312ZM5.22183 19.8687C4.70621 19.8687 4.29371 19.4562 4.29371 18.9406C4.29371 18.425 4.70621 18.0125 5.22183 18.0125C5.73746 18.0125 6.14996 18.425 6.14996 18.9406C6.14996 19.4562 5.73746 19.8687 5.22183 19.8687Z"
              fill=""
            />
            <path
              d="M19.0062 0.618744H17.15C16.325 0.618744 15.6031 1.23749 15.5 2.06249L14.95 6.01562H1.37185C1.0281 6.01562 0.684353 6.18749 0.443728 6.46249C0.237478 6.73749 0.134353 7.11562 0.237478 7.45937L2.36873 13.9562C2.50623 14.4375 2.9531 14.7812 3.46873 14.7812H12.9562C14.2281 14.7812 15.3281 13.8187 15.5 12.5469L16.9437 2.26874C16.9437 2.19374 17.0156 2.16249 17.0875 2.16249H19.0062C19.3844 2.16249 19.7281 1.81874 19.7281 1.44062C19.7281 1.0625 19.4187 0.618744 19.0062 0.618744ZM14.0219 12.3062C13.9156 12.8219 13.4687 13.2 12.9187 13.2H3.7781L2.06873 7.56249H14.7094L14.0219 12.3062Z"
              fill=""
            />
          </svg>
        </CardDataStats>

        <CardDataStats 
          title="Tổng người dùng" 
          total={loading ? "..." : overallStats.totalUsers.toLocaleString('vi-VN')} 
          rate={getGrowthRate(overallStats.growthRates.users)} 
          levelUp={getGrowthIcon(overallStats.growthRates.users)}
        >
          <svg
            className="fill-white"
            width="22"
            height="18"
            viewBox="0 0 22 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.18418 8.03751C9.31543 8.03751 11.0686 6.35313 11.0686 4.25626C11.0686 2.15938 9.31543 0.475006 7.18418 0.475006C5.05293 0.475006 3.2998 2.15938 3.2998 4.25626C3.2998 6.35313 5.05293 8.03751 7.18418 8.03751ZM7.18418 2.05626C8.45605 2.05626 9.52168 3.05313 9.52168 4.29063C9.52168 5.52813 8.49043 6.52501 7.18418 6.52501C5.87793 6.52501 4.84668 5.52813 4.84668 4.29063C4.84668 3.05313 5.9123 2.05626 7.18418 2.05626Z"
              fill=""
            />
            <path
              d="M15.8124 9.6875C17.6687 9.6875 19.1468 8.24375 19.1468 6.42188C19.1468 4.6 17.6343 3.15625 15.8124 3.15625C13.9905 3.15625 12.478 4.6 12.478 6.42188C12.478 8.24375 13.9905 9.6875 15.8124 9.6875ZM15.8124 4.7375C16.8093 4.7375 17.5999 5.49375 17.5999 6.45625C17.5999 7.41875 16.8093 8.175 15.8124 8.175C14.8155 8.175 14.0249 7.41875 14.0249 6.45625C14.0249 5.49375 14.8155 4.7375 15.8124 4.7375Z"
              fill=""
            />
            <path
              d="M15.9843 10.0313H15.6749C14.6437 10.0313 13.6468 10.3406 12.7781 10.8563C11.2312 9.32812 9.20623 8.475 7.2124 8.475C3.42803 8.475 0.478027 11.5219 0.478027 15.2531C0.478027 15.6313 0.799902 15.9531 1.13115 15.9531H13.2468C13.5781 15.9531 13.8999 15.6313 13.8999 15.2531C13.8999 14.2875 14.2312 13.3875 14.8218 12.6469C15.0374 12.4313 15.2874 12.2156 15.5718 12.0344C16.3749 11.5188 17.3718 11.2094 18.4374 11.2094C18.7687 11.2094 19.0905 10.8875 19.0905 10.5563C19.0905 10.2906 18.8405 10.0313 15.9843 10.0313ZM2.05928 14.4188C2.4749 12.0344 4.58115 10.0906 7.19053 10.0906C8.83115 10.0906 10.3124 10.7844 11.2437 11.9844C10.7968 12.8531 10.5124 13.8188 10.4437 14.8531H2.05928V14.4188Z"
              fill=""
            />
            <path
              d="M18.4025 12.0375C17.4712 12.0375 16.5743 12.3469 15.8431 12.9V15.2531C15.8431 15.6313 16.1649 15.9531 16.4962 15.9531H20.4987C20.8299 15.9531 21.1518 15.6313 21.1518 15.2531C21.1518 13.5 19.9768 12.0375 18.4025 12.0375Z"
              fill=""
            />
          </svg>
        </CardDataStats>

        <CardDataStats 
          title="Tổng đơn hàng" 
          total={loading ? "..." : overallStats.totalAllOrders.toLocaleString('vi-VN')} 
          rate={getGrowthRate(overallStats.growthRates.orders)} 
          levelUp={getGrowthIcon(overallStats.growthRates.orders)}
        >
          <svg
            className="fill-white"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.1063 18.0469L19.3875 3.23126C19.2157 1.71876 17.9438 0.584381 16.3969 0.584381H5.56878C4.05628 0.584381 2.78441 1.71876 2.57816 3.23126L0.859406 18.0469C0.756281 18.9063 1.03128 19.7313 1.61566 20.3844C2.20003 21.0375 2.99066 21.3813 3.85003 21.3813H18.1157C18.975 21.3813 19.8 21.0031 20.35 20.3844C20.9344 19.7313 21.2094 18.9063 21.1063 18.0469ZM19.2157 19.3531C18.9407 19.6625 18.5625 19.8344 18.15 19.8344H3.85003C3.43753 19.8344 3.05941 19.6625 2.78441 19.3531C2.50941 19.0438 2.37191 18.6313 2.44066 18.2188L4.12503 3.43751C4.19378 2.71563 4.81253 2.16563 5.56878 2.16563H16.4313C17.1875 2.16563 17.8063 2.71563 17.875 3.43751L19.5594 18.2188C19.6281 18.6313 19.4906 19.0438 19.2157 19.3531Z"
              fill=""
            />
            <path
              d="M14.3344 5.29375C13.9906 5.29375 13.7156 5.56875 13.7156 5.9125V7.53125C13.7156 9.0375 12.4781 10.275 10.9719 10.275C9.46562 10.275 8.22812 9.0375 8.22812 7.53125V5.9125C8.22812 5.56875 7.95312 5.29375 7.60937 5.29375C7.26562 5.29375 6.99062 5.56875 6.99062 5.9125V7.53125C6.99062 9.725 8.77812 11.5125 10.9719 11.5125C13.1656 11.5125 14.9531 9.725 14.9531 7.53125V5.9125C14.9531 5.56875 14.6781 5.29375 14.3344 5.29375Z"
              fill=""
            />
          </svg>
        </CardDataStats>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-12 gap-6 2xl:gap-7.5">
        {/* Revenue Chart */}
        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-boxdark">
            <ChartOne />
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-12 gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6 h-[500px]">
          <ChartTwo />
        </div>
        
        <div className="col-span-12 xl:col-span-6 h-[500px]">
          <ChartThree />
        </div>
      </div>

    </div>
  );
};

export default ECommerce;

