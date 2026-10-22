'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getTopSearchQueries } from '@/lib/actions';
import PageLoader from '@/components/common/PageLoader';
import Pagination, { PAGE_SIZE } from '@/components/common/Pagination';

type QueryItem = { query: string; clicks: number; impressions: number; ctr: number; position: number };

/** 한국 시간 기준 오늘 'YYYY-MM-DD' */
function kstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function shiftDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function VisitorKeywordsPage() {
  const today = kstToday();
  const [items, setItems] = useState<QueryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(() => shiftDays(today, -29));
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    let cancelled = false;
    setPage(1);
    getTopSearchQueries(startDate, endDate).then(data => {
      if (cancelled) return;
      setItems(data.items);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  const handleDateChange = (key: 'start' | 'end', value: string) => {
    if (!value) return;
    const nextStart = key === 'start' ? value : startDate;
    const nextEnd = key === 'end' ? value : endDate;
    if (nextStart > nextEnd) {
      toast.error('시작일은 종료일보다 늦을 수 없어요.');
      return;
    }
    setStartDate(nextStart);
    setEndDate(nextEnd);
  };

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <PageLoader title="유입 검색어 분석" variant="table" />;

  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">유입 검색어 분석</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-[#060606]" />
            선택한 기간 동안 구글 자연검색으로 들어온 검색어를 확인하세요. (서치 콘솔 기준, 2~3일 늦게 반영)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={e => handleDateChange('start', e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-gray-50 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-black"
          />
          <span className="text-xs font-black text-[#4B5563]">~</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={today}
            onChange={e => handleDateChange('end', e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-gray-50 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#D1D5DB] overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_80px_100px] gap-4 px-8 py-4 bg-gray-50 border-b border-[#D1D5DB] text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>검색어</span>
          <span className="text-right">클릭수</span>
          <span className="text-right">노출수</span>
          <span className="text-right">CTR</span>
          <span className="text-right">평균 순위</span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-400">유입 검색어 데이터가 없습니다.</div>
        ) : (
          pageItems.map((item, index) => (
            <div
              key={`${item.query}-${index}`}
              className="grid grid-cols-[1fr_100px_100px_80px_100px] gap-4 px-8 py-5 border-b border-[#D1D5DB] last:border-b-0 items-center"
            >
              <span className="text-sm font-bold text-[#060606] truncate">{item.query}</span>
              <span className="text-sm font-black text-[#060606] text-right tabular-nums">{item.clicks.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-500 text-right tabular-nums">{item.impressions.toLocaleString()}</span>
              <span className="text-sm font-bold text-gray-500 text-right tabular-nums">{(item.ctr * 100).toFixed(1)}%</span>
              <span className="text-sm font-bold text-gray-500 text-right tabular-nums">{item.position.toFixed(1)}</span>
            </div>
          ))
        )}
        {totalPages > 1 && (
          <div className="px-8 py-6 border-t border-[#D1D5DB]">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
