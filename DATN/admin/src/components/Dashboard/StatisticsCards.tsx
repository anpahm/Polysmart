"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface StatisticsSummary {
  totalOrders: number;
  totalRevenue: number;
  totalProfit: number;
  totalProducts: number;
  period: string;
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg z-10 whitespace-nowrap max-w-xs">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const StatisticsCards: React.FC = () => {
  const [stats, setStats] = useState<StatisticsSummary>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalProducts: 0,
    period: 'Tuần này'
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
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: 'đơn hàng',
      tooltip: 'Số đơn hàng đã thanh toán thành công trong tuần này'
    },
    {
      title: 'Doanh thu thực tế',
      value: stats.totalRevenue,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      suffix: 'triệu VNĐ',
      tooltip: 'Tổng tiền thu được từ đơn hàng đã thanh toán (chưa trừ chi phí)'
    },
    {
      title: 'Lợi nhuận ước tính',
      value: stats.totalProfit,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      suffix: 'triệu VNĐ',
      tooltip: 'Lợi nhuận ước tính (30% doanh thu) - chưa tính chi phí vận hành thực tế'
    },
    {
      title: 'Sản phẩm đã bán',
      value: stats.totalProducts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      suffix: 'sản phẩm',
      tooltip: 'Tổng số lượng sản phẩm đã bán trong tuần này'
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
    <>
      {/* Ghi chú giải thích */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Ghi chú:</strong> Doanh thu là tổng tiền từ đơn hàng đã thanh toán. 
              Lợi nhuận là ước tính (30% doanh thu) - cần tính thêm chi phí thực tế.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-6 transition-transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${card.bgColor} ${card.color}`}>
                {card.icon}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stats.period}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value.toLocaleString('vi-VN')}
              </h3>
              <Tooltip content={card.tooltip}>
                <p className="text-sm text-gray-600 dark:text-gray-400 border-b border-dashed border-gray-400 inline-block">
                  {card.title}
                </p>
              </Tooltip>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {card.suffix}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StatisticsCards; 