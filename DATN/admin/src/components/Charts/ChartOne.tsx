"use client";

import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const options: ApexOptions = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  colors: ["#3C50E0", "#80CAEE"],
  chart: {
    fontFamily: "Satoshi, sans-serif",
    height: 335,
    type: "area",
    dropShadow: {
      enabled: true,
      color: "#623CEA14",
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: "straight",
  },
  // labels: {
  //   show: false,
  //   position: "top",
  // },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val: number) {
      return val.toLocaleString('vi-VN') + '₫';
    },
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
    },
  },
  markers: {
    size: 4,
    colors: "#fff",
    strokeColors: ["#3056D3", "#80CAEE"],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: "category",
    categories: [
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: "0px",
      },
    },
    min: 0,
  },
};

interface ChartOneState {
  series: {
    name: string;
    data: number[];
  }[];
}

const ChartOne: React.FC = () => {
  const [type, setType] = useState<'day' | 'week' | 'month'>('day');
  const [series, setSeries] = useState<any[]>([{ name: 'Doanh thu', data: [] }]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/orders/revenue?type=${type}`)
      .then(res => res.json())
      .then(data => {
        const cat = data.map((item: any) => {
          if (type === 'month') return `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`;
          if (type === 'week') return `${item._id.year}-W${item._id.week.toString().padStart(2, '0')}`;
          return `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
        });
        setCategories(cat);
        setSeries([{ name: 'Doanh thu', data: data.map((item: any) => item.totalRevenue) }]);
      })
      .catch(() => {
        setCategories([]);
        setSeries([{ name: 'Doanh thu', data: [] }]);
      });
  }, [type]);

  const chartOptions = {
    ...options,
    xaxis: {
      ...options.xaxis,
      categories,
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Doanh thu</p>
              <p className="text-sm font-medium">Theo {type === 'day' ? 'ngày' : type === 'week' ? 'tuần' : 'tháng'}</p>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button onClick={() => setType('day')} className={`rounded px-3 py-1 text-xs font-medium ${type==='day' ? 'bg-white text-black shadow-card dark:bg-boxdark dark:text-white' : 'text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'}`}>Day</button>
            <button onClick={() => setType('week')} className={`rounded px-3 py-1 text-xs font-medium ${type==='week' ? 'bg-white text-black shadow-card dark:bg-boxdark dark:text-white' : 'text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark'}`}>Week</button>
            <button onClick={() => setType('month')} className={`rounded px-3 py-1 text-xs font-medium ${type==='month' ? 'bg-white text-black shadow-card dark:bg-boxdark dark:text-white' : 'text-black hover:bg-white hover:shadow-card dark:hover:bg-boxdark'}`}>Month</button>
          </div>
        </div>
      </div>
      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="area"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;
