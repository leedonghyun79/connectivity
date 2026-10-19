'use client';

import React from 'react';

export interface Column<T> {
  header: string;
  className?: string; // 헤더 셀 클래스 (text-right, text-center, w-24 등)
  cell: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  noDataMessage?: string;
  noDataIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  noDataMessage = '데이터가 없습니다.',
  noDataIcon,
  children,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-[8px] border border-[#D1D5DB] overflow-hidden mb-20">
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 border-b border-[#D1D5DB] h-[84px]">
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`px-10 !py-0 align-middle !text-left uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 font-poppins ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D1D5DB]">
            {data.length > 0 ? (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-gray-50/50 transition-all group ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col, index) => (
                    <td key={index} className={`!text-left ${col.className || ""}`}>
                      {col.cell(item)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-10 py-32 text-center">
                  <div className="flex flex-col items-center gap-4 text-[#D1D5DB]">
                    {noDataIcon}
                    <p className="text-sm font-black uppercase tracking-[0.3em]">{noDataMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {children}
    </div>
  );
}
