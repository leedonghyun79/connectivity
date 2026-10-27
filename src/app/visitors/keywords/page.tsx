'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Zap, X } from 'lucide-react';
import { toast } from 'sonner';
import { getSearchConsoleDaily, getTopSearchQueries } from '@/lib/actions';
import PageLoader from '@/components/common/PageLoader';
import Pagination, { PAGE_SIZE } from '@/components/common/Pagination';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type QueryItem = { query: string; clicks: number; impressions: number; ctr: number; position: number };
type DailyItem = { date: string; clicks: number; impressions: number };

const CHART_HEIGHT = 320;

/** 한국 시간 기준 오늘 'YYYY-MM-DD' */
function kstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function shiftDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 기간 안의 모든 날짜를 채워서 데이터가 없는 날은 0으로 */
function fillDays(start: string, end: string, rows: DailyItem[]) {
  const byDate = new Map(rows.map(r => [r.date, r]));
  const filled: DailyItem[] = [];
  for (let day = start; day <= end; day = shiftDays(day, 1)) {
    filled.push(byDate.get(day) ?? { date: day, clicks: 0, impressions: 0 });
  }
  return filled;
}

export default function VisitorKeywordsPage() {
  const today = kstToday();
  const [items, setItems] = useState<QueryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 기간을 바꿔서 다시 불러오는 중인지 (표만 스켈레톤으로 바꾸고 헤더·날짜는 유지)
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState(() => shiftDays(today, -29));
  const [endDate, setEndDate] = useState(today);
  // 모달에서 보고 있는 검색어 (null이면 모달 닫힘)
  const [selected, setSelected] = useState<QueryItem | null>(null);
  const [daily, setDaily] = useState<DailyItem[] | null>(null);
  // 모달 차트 영역의 실제 너비 (너비를 알아야 차트를 바로 그릴 수 있음)
  const chartBoxRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPage(1);
    setIsFetching(true);
    getTopSearchQueries(startDate, endDate).then(data => {
      if (cancelled) return;
      setItems(data.items);
      setIsLoading(false);
      setIsFetching(false);
    });
    return () => {
      cancelled = true;
    };
  }, [startDate, endDate]);

  // 모달이 열려 있을 때만 그 검색어의 일별 데이터를 가져온다
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setDaily(null);
    getSearchConsoleDaily(startDate, endDate, selected.query).then(dailyData => {
      if (cancelled) return;
      setDaily(fillDays(startDate, endDate, dailyData.items));
    });
    return () => {
      cancelled = true;
    };
  }, [selected, startDate, endDate]);

  // 모달 차트 영역 너비 측정 (창 크기가 바뀌면 다시 잰다)
  useEffect(() => {
    const el = chartBoxRef.current;
    if (!selected || !el) return;
    const observer = new ResizeObserver(([entry]) => setChartWidth(Math.floor(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, [selected]);

  // Esc로 모달 닫기
  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

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

  const chartData = (daily ?? []).map(d => ({
    date: new Date(`${d.date}T00:00:00Z`).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', timeZone: 'UTC' }),
    clicks: d.clicks,
    impressions: d.impressions,
  }));

  // 데이터와 차트 너비가 둘 다 준비돼야 차트를 그린다. 그 전까지는 스켈레톤.
  const isChartReady = daily !== null && chartWidth > 0;

  if (isLoading) return <PageLoader title="유입 검색어 분석" variant="table" toolbar="dates" />;

  return (
    <div className="w-full animate-in fade-in duration-700 pt-0 pb-10 space-y-4">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-end items-end gap-6 !mt-[30px]">

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
        <div className="grid grid-cols-[1fr_100px_100px_80px_100px] gap-4 px-8 h-[65px] items-center bg-white border-b border-[#D1D5DB] text-[11px] font-bold uppercase tracking-wider text-gray-400">
          <span>검색어</span>
          <span className="text-right">클릭수</span>
          <span className="text-right">노출수</span>
          <span className="text-right">CTR</span>
          <span className="text-right">평균 순위</span>
        </div>

        {isFetching ? (
          <div className="p-8 space-y-5 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                  <div className="h-2.5 w-1/5 bg-gray-50 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-100 rounded-[8px]" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-400">유입 검색어 데이터가 없습니다.</div>
        ) : (
          pageItems.map((item, index) => (
            <div
              key={`${item.query}-${index}`}
              onClick={() => {
                setDaily(null);
                setChartWidth(0);
                setSelected(item);
              }}
              className="grid grid-cols-[1fr_100px_100px_80px_100px] gap-4 px-8 py-5 border-b border-gray-200 last:border-b-0 items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
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

      {selected && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-4xl p-10 rounded-[8px] border border-[#D1D5DB] flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="my-[15px] text-[21px] font-black text-[#060606] tracking-tighter break-all">{selected.query}</h4>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-[8px] hover:bg-gray-50 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '클릭수', value: selected.clicks.toLocaleString() },
                { label: '노출수', value: selected.impressions.toLocaleString() },
                { label: 'CTR', value: `${(selected.ctr * 100).toFixed(1)}%` },
                { label: '평균 순위', value: selected.position.toFixed(1) },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-[8px] px-4 py-3">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-lg font-black text-[#060606] tabular-nums">{stat.value}</div>
                </div>
              ))}
            </div>

            <div ref={chartBoxRef} className="w-full" style={{ height: CHART_HEIGHT }}>
              {!isChartReady ? (
                <div className="relative h-full w-full animate-pulse">
                  {/* 가로 격자선 */}
                  <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-px w-full bg-gray-100" />
                    ))}
                  </div>
                  {/* 차트 곡선 자리 */}
                  <svg className="absolute inset-x-0 top-0 w-full h-[calc(100%-32px)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35 L100,100 L0,100 Z" fill="#F3F4F6" />
                    <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35" fill="none" stroke="#D1D5DB" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                  {/* 날짜 라벨 자리 */}
                  <div className="absolute inset-x-0 bottom-0 h-6 flex justify-between items-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-2.5 w-10 rounded-full bg-gray-100" />
                    ))}
                  </div>
                </div>
              ) : (
                <AreaChart width={chartWidth} height={CHART_HEIGHT} data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#060606" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#060606" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={15}
                    minTickGap={20}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={5}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#000',
                      borderRadius: '16px',
                      border: 'none',
                      color: '#fff',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                      padding: '12px',
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: '#fff' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', fontWeight: 700 }}
                  />
                  <Legend
                    iconType="rect"
                    wrapperStyle={{ fontSize: '12px', fontWeight: 900, paddingTop: '20px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    align="right"
                    verticalAlign="top"
                    height={36}
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="impressions"
                    name="노출수"
                    stroke="#060606"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorImpressions)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#060606' }}
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    dataKey="clicks"
                    name="클릭수"
                    stroke="#000"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorClicks)"
                    activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#000' }}
                  />
                </AreaChart>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
