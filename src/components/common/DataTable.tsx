'use client';

import React from 'react';
import Pagination from './Pagination';

export interface Column<T> {
  header: string;
  className?: string; // 헤더 셀 클래스 (w-24 등)
  cell: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  noDataMessage?: string;
  noDataIcon?: React.ReactNode;
  // 숫자 페이지네이션 — 부모가 data를 페이지 단위로 잘라서 넘긴다
  pagination?: { page: number; totalPages: number; onPageChange: (page: number) => void };
  children?: React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  noDataMessage = '데이터가 없습니다.',
  noDataIcon,
  pagination,
  children,
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-[8px] border border-[#D1D5DB] overflow-hidden mb-20">
      <div className="overflow-x-auto min-h-[500px]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#D1D5DB] h-[65px]">
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
          <tbody className="divide-y divide-gray-200">
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
      {pagination && (
        <div className="px-10 py-6 border-t border-[#D1D5DB]">
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={pagination.onPageChange} />
        </div>
      )}
      {children}
    </div>
  );
}
