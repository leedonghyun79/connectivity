'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE = 6;

/**
 * 페이지 번호 목록 생성. 페이지가 많으면 가운데를 줄여서 '…'로 표시.
 * 예) 1 2 3 4 5 … 10
 */
export function getPageItems(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | '...')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push('...');
  for (let n = start; n <= end; n++) items.push(n);
  if (end < total - 1) items.push('...');
  items.push(total);
  return items;
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** 숫자 페이지네이션 (이전/다음 화살표 + 페이지 번호) */
export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-gray-50 text-gray-400 hover:text-[#060606] disabled:opacity-30 transition-all"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={14} />
      </button>
      {getPageItems(page, totalPages).map((item, idx) =>
        item === '...' ? (
          <span key={`dots-${idx}`} className="w-8 text-center text-xs font-black text-[#4B5563]">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-8 h-8 rounded-[8px] text-xs font-black tabular-nums transition-all ${page === item ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-[#060606]'}`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-[8px] bg-gray-50 text-gray-400 hover:text-[#060606] disabled:opacity-30 transition-all"
        aria-label="다음 페이지"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
