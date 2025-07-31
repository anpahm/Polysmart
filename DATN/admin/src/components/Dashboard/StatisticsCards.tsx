"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface StatisticsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalProducts: number;
  period: string;
  growthRates: {
    orders: string;
    revenue: string;
    products: string;
  };
}



const StatisticsCards: React.FC = () => {
  const [stats, setStats] = useState<StatisticsSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalProducts: 0,
    period: 'Tuần này',
    growthRates: {
      orders: '0',
      revenue: '0',
      products: '0'
    }
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const fetchStatistics = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/admin/statistics?period=week', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.summary);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [token]);



  const cards = [
    {
      title: 'Đơn hàng hoàn thành',
      value: stats.totalOrders,
      icon: (
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
                   suffix: 'đơn hàng'
    },
    {
      title: 'Doanh thu thực tế',
      value: stats.totalRevenue,
      icon: (
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
      ),
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
      borderColor: 'border-green-200',
      suffix: 'triệu VNĐ'
    },
    {
      title: 'Lợi nhuận ước tính',
      value: stats.totalProfit,
      icon: (
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      suffix: 'triệu VNĐ'
    },
    {
      title: 'Sản phẩm đã bán',
      value: stats.totalProducts,
      icon: (
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      suffix: 'sản phẩm'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded"></div>
                <div className="w-16 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-20 h-8 bg-gray-300 rounded mb-2"></div>
              <div className="w-24 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div key={index} className={`relative overflow-hidden rounded-2xl border ${card.borderColor} ${card.bgColor} p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 group`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                {card.icon}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stats.period}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-gray-700 transition-colors">
                  {card.value.toLocaleString('vi-VN')}
                </h3>
                                 <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                   {card.title}
                 </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                  {card.suffix}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
  );
};

export default StatisticsCards; 