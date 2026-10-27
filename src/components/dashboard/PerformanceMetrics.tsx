'use client';

import { useState, useEffect } from 'react';
import { getDailyStats, getDailyStatsRange, getMonthlyStatsRange, syncAllStats } from '@/lib/actions';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { RefreshCcw, Database, TrendingUp } from 'lucide-react';
import Pagination, { PAGE_SIZE } from '@/components/common/Pagination';
import { toast } from 'sonner';

type DetailView = 'daily' | 'monthly';


/** 한국 시간 기준 오늘 'YYYY-MM-DD' */
function kstToday() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function shiftDays(ymd: string, days: number) {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function shiftMonths(ym: string, months: number) {
  const d = new Date(`${ym}-01T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 7);
}

export default function PerformanceMetrics({ initialDetail = false }: { initialDetail?: boolean }) {
  const today = kstToday();
  const thisMonth = today.slice(0, 7);

  const [stats, setStats] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDetail, setIsDetail] = useState(initialDetail);
  const [detailView, setDetailView] = useState<DetailView>('daily');
  const [page, setPage] = useState(1);
  const [dailyStart, setDailyStart] = useState(() => shiftDays(today, -29));
  const [dailyEnd, setDailyEnd] = useState(today);
  const [monthStart, setMonthStart] = useState(() => shiftMonths(thisMonth, -11));
  const [monthEnd, setMonthEnd] = useState(thisMonth);
  // 현재 stats가 월별 데이터인지 (탭을 바꾼 직후 옛 데이터로 렌더링되는 것 방지)
  const [dataMonthly, setDataMonthly] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const loadStats = async () => {
    setIsLoaded(false);
    let data;
    if (!isDetail) data = await getDailyStats(7);
    else if (detailView === 'daily') data = await getDailyStatsRange(dailyStart, dailyEnd);
    else data = await getMonthlyStatsRange(monthStart, monthEnd);
    setStats(data);
    setDataMonthly(isDetail && detailView === 'monthly');
    setIsLoaded(true);
  };

  useEffect(() => {
    setPage(1);
    loadStats();
  }, [isDetail, detailView, dailyStart, dailyEnd, monthStart, monthEnd]);

  const handleDailyChange = (key: 'start' | 'end', value: string) => {
    if (!value) return;
    const nextStart = key === 'start' ? value : dailyStart;
    const nextEnd = key === 'end' ? value : dailyEnd;
    if (nextStart > nextEnd) {
      toast.error('시작일은 종료일보다 늦을 수 없어요.');
      return;
    }
    setDailyStart(nextStart);
    setDailyEnd(nextEnd);
  };

  const handleMonthChange = (key: 'start' | 'end', value: string) => {
    if (!value) return;
    const nextStart = key === 'start' ? value : monthStart;
    const nextEnd = key === 'end' ? value : monthEnd;
    if (nextStart > nextEnd) {
      toast.error('시작월은 종료월보다 늦을 수 없어요.');
      return;
    }
    setMonthStart(nextStart);
    setMonthEnd(nextEnd);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncAllStats();
    await loadStats();
    setIsSyncing(false);
    if (result.success) toast.success('GA4 데이터와 동기화되었습니다.');
    else toast.error(result.error);
  };

  const isMonthly = dataMonthly;

  // 차트 (기본 화면, 최근 7일) — 시간순으로 뒤집어서 표시
  const chartData = [...stats].reverse().map(s => ({
    date: isMonthly ? s.month : new Date(s.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
    pv: s.pageViews,
    visitor: s.visitors,
  }));

  const totals = stats.reduce(
    (acc, row) => ({
      pageViews: acc.pageViews + row.pageViews,
      visitors: acc.visitors + row.visitors,
      signups: acc.signups + row.signups,
      inquiries: acc.inquiries + row.inquiries,
    }),
    { pageViews: 0, visitors: 0, signups: 0, inquiries: 0 }
  );

  const totalPages = Math.max(1, Math.ceil(stats.length / PAGE_SIZE));
  const pageRows = stats.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 일별/월별 탭과 기간 선택은 카드 밖(위)에 둔다
  const detailControls = (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex gap-2">
        {(['daily', 'monthly'] as DetailView[]).map(view => (
          <button
            key={view}
            onClick={() => setDetailView(view)}
            className={`px-3 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all ${detailView === view ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-[#060606]'}`}
          >
            {view === 'daily' ? '일별' : '월별'}
            <span className="ml-1 text-[8px] normal-case tracking-normal font-bold opacity-70">
              {view === 'daily' ? '(30일 기준)' : '(12개월 기준)'}
            </span>
          </button>
        ))}
      </div>

      {detailView === 'daily' ? (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dailyStart}
            max={dailyEnd}
            onChange={e => handleDailyChange('start', e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-gray-50 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-black"
          />
          <span className="text-xs font-black text-[#4B5563]">~</span>
          <input
            type="date"
            value={dailyEnd}
            min={dailyStart}
            max={today}
            onChange={e => handleDailyChange('end', e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-gray-50 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={monthStart}
            max={monthEnd}
            onChange={e => handleMonthChange('start', e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-gray-50 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-black"
          />
          <span className="text-xs font-black text-[#4B5563]">~</span>
          <input
            type="month"
            value={monthEnd}
            min={monthStart}
            max={thisMonth}
            onChange={e => handleMonthChange('end', e.target.value)}
            className="px-3 py-1.5 rounded-[8px] bg-gray-50 text-xs font-bold text-gray-600 outline-none focus:ring-1 focus:ring-black"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
    <div className="flex justify-start items-center mb-3">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`p-3 rounded-[8px] transition-all flex items-center gap-2 group/btn ${isSyncing ? 'bg-black text-white' : 'bg-gray-50 text-gray-200 group-hover:bg-black group-hover:text-white'}`}
        title="원격 DB 동기화"
      >
        <RefreshCcw size={20} className={isSyncing ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'} />
        {isSyncing && <span className="text-[10px] font-black uppercase tracking-widest">동기화 중</span>}
      </button>
    </div>
    {isDetail && detailControls}
    <div className="bg-white p-4 rounded-[8px] border border-[#D1D5DB] h-[650px] flex flex-col group">

      {!isDetail && (
        <div className="flex-1 min-h-0 w-full flex flex-col">
          {!isLoaded ? (
            <div className="h-full w-full bg-gray-50 rounded-[8px] animate-pulse" />
          ) : stats.length === 0 ? (
            <div className="relative h-full w-full">
              <div className="absolute inset-0 blur-[5px] opacity-60">
                <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-px w-full bg-gray-100" />
                  ))}
                </div>
                <svg className="absolute inset-x-0 top-0 w-full h-[calc(100%-32px)]" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35 L100,100 L0,100 Z" fill="#F3F4F6" />
                  <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35" fill="none" stroke="#D1D5DB" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-[#D1D5DB]">
                <TrendingUp size={48} />
                <p className="text-sm font-black uppercase tracking-[0.3em]">데이터 분석 중</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-400 mb-2">
                페이지뷰 <span className="text-[#060606]">{totals.pageViews.toLocaleString()}</span> · 순 방문자 <span className="text-[#060606]">{totals.visitors.toLocaleString()}</span> (최근 7일)              </p>
              <div className="flex-1 min-h-0 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#000" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVisitor" x1="0" y1="0" x2="0" y2="1">
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
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b', fontWeight: 700 }}
                      axisLine={false}
                      tickLine={false}
                      tickCount={5}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#000',
                        borderRadius: '16px',
                        border: 'none',
                        color: '#fff',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                        padding: '12px'
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
                      dataKey="pv"
                      name="페이지뷰"
                      stroke="#94a3b8"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorPv)"
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#000' }}
                    />
                    <Area
                      isAnimationActive={false}
                      type="monotone"
                      dataKey="visitor"
                      name="방문자"
                      stroke="#000"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVisitor)"
                      activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff', fill: '#000' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {isDetail && (
        <>
          <div className="flex-1 min-h-0 -mx-4">
            <table className="w-full text-left">
              <thead>
                <tr className="h-[65px] border-b border-[#D1D5DB] text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 !py-0 align-middle text-left">{isMonthly ? '월' : '날짜'}</th>
                  <th className="px-6 !py-0 align-middle text-left">페이지 뷰</th>
                  <th className="px-6 !py-0 align-middle text-left">순 방문자수</th>
                  <th className="px-6 !py-0 align-middle text-left">가입</th>
                  <th className="px-6 !py-0 align-middle text-left">리드</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!isLoaded ? (
                  <tr>
                    <td colSpan={5} className="py-6">
                      <div className="space-y-3 animate-pulse">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 bg-gray-50 rounded-[8px]" />
                        ))}
                      </div>
                    </td>
                  </tr>
                ) : pageRows.length > 0 ? (
                  pageRows.map((row) => (
                    <tr key={isMonthly ? row.month : row.date.toString()} className="hover:bg-gray-50/50 transition-colors group/row">
                      <td className="px-6 py-5 text-base font-bold text-gray-900">
                        {isMonthly
                          ? row.month
                          : new Date(row.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="px-6 py-5 text-left text-base font-bold text-gray-900">{row.pageViews.toLocaleString()}</td>
                      <td className="px-6 py-5 text-left text-base font-bold text-gray-900">{row.visitors.toLocaleString()}</td>
                      <td className="px-6 py-5 text-left text-base font-bold text-gray-900">
                        <span className={row.signups > 0 ? 'bg-black text-white px-2 py-0.5 rounded-[8px]' : 'text-[#4B5563]'}>{row.signups}</span>
                      </td>
                      <td className="px-6 py-5 text-left text-base font-bold text-gray-900">{row.inquiries}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-left">
                      <div className="flex flex-col items-center gap-2 text-[#D1D5DB]">
                        <Database size={40} />
                        <span className="text-[#D1D5DB] text-[10px] font-black uppercase tracking-widest">수집된 통계 데이터가 없습니다</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {stats.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-black">
                    <td className="py-3 text-xs font-black text-[#060606] uppercase tracking-widest">
                      {isMonthly ? '기간 합계 (월)' : '기간 합계 (일)'}
                    </td>
                    <td className="px-6 py-5 text-left text-base font-black text-[#060606]">{totals.pageViews.toLocaleString()}</td>
                    <td className="px-6 py-5 text-left text-base font-black text-[#060606]">{totals.visitors.toLocaleString()}</td>
                    <td className="px-6 py-5 text-left text-base font-black text-[#060606]">{totals.signups}</td>
                    <td className="px-6 py-5 text-left text-base font-black text-[#060606]">{totals.inquiries}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {stats.length > PAGE_SIZE && (
            <div className="border-t border-[#D1D5DB]">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
    </>
  );
}
