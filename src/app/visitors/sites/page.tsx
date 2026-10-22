'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getTopSources } from '@/lib/actions';
import PageLoader from '@/components/common/PageLoader';
import Pagination, { PAGE_SIZE } from '@/components/common/Pagination';

type SourceItem = { source: string; medium: string; sessions: number };

/** 한국 시간 기준 오늘 'YYYY-MM-DD' */
function kstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function shiftDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const MEDIUM_LABEL: Record<string, string> = {
  organic: '자연검색',
  referral: '링크 유입',
  cpc: '유료광고',
  paid: '유료광고',
  social: '소셜',
  email: '이메일',
};

/** GA4 source/medium을 사람이 읽는 라벨로 변환 */
function sourceLabel({ source, medium }: { source: string; medium: string }) {
  if (source === '(direct)' || medium === '(none)') return '직접 유입 (URL 입력 등)';
  const mediumText = MEDIUM_LABEL[medium] ?? medium;
  return `${source} (${mediumText})`;
}

export default function VisitorSitesPage() {
  const today = kstToday();
  const [items, setItems] = useState<SourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(() => shiftDays(today, -29));
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    let cancelled = false;
    setPage(1);
    getTopSources(startDate, endDate).then(data => {
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

  if (isLoading) return <PageLoader title="유입 경로 분석" variant="table" />;

  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">유입 경로 분석</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-[#060606]" />
            선택한 기간 동안 어느 사이트에서 방문했는지 도메인별 세션 수를 확인하세요.
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
        <div className="grid grid-cols-[1fr_120px] gap-4 px-8 py-4 bg-gray-50 border-b border-[#D1D5DB] text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>도메인 (URL)</span>
          <span className="text-right">세션</span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-400">유입 데이터가 없습니다.</div>
        ) : (
          pageItems.map((item) => (
            <div
              key={`${item.source}-${item.medium}`}
              className="grid grid-cols-[1fr_120px] gap-4 px-8 py-5 border-b border-[#D1D5DB] last:border-b-0 items-center"
            >
              <span className="text-sm font-bold text-[#060606] truncate">{sourceLabel(item)}</span>
              <span className="text-sm font-black text-[#060606] text-right tabular-nums">{item.sessions.toLocaleString()}</span>
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
