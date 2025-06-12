import React from "react";

export interface NewsItem {
  _id: string;
  tieu_de: string;
  mo_ta: string;
  hinh: string;
  ngay: string;
  id_danh_muc?: { ten_danh_muc: string };
}

export default function NewsCard({ item }: { item: NewsItem }) {
  return (
    <div className="flex bg-white rounded-xl shadow p-3 gap-4 items-center">
      <img src={item.hinh} alt={item.tieu_de} className="w-36 h-24 object-cover rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center text-gray-400 text-xs mb-1">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {new Date(item.ngay).toLocaleDateString()}
        </div>
        <h3 className="font-semibold text-lg mb-1 truncate">{item.tieu_de}</h3>
        <div className="text-gray-500 text-sm line-clamp-2">{item.mo_ta}</div>
        <div className="text-xs text-blue-500 mt-1">{item.id_danh_muc?.ten_danh_muc}</div>
      </div>
    </div>
  );
} 