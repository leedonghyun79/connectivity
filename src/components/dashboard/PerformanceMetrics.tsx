'use client';

import { useState, useEffect } from 'react';
import { getDailyStats, getMonthlyStats, syncAllStats } from '@/lib/actions';
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
import { toast } from 'sonner';

type DetailView = 'daily' | 'monthly';

export default function PerformanceMetrics() {
  const [stats, setStats] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDetail, setIsDetail] = useState(false);
  const [detailView, setDetailView] = useState<DetailView>('daily');

  const loadStats = async (detail: boolean, view: DetailView) => {
    let data;
    if (!detail || view === 'daily') data = await getDailyStats(7);
    else data = await getMonthlyStats(12);
    setStats(data);
  };

  useEffect(() => {
    loadStats(isDetail, detailView);
  }, [isDetail, detailView]);

  const handleSync = async () => {
    setIsSyncing(true);
    const result = await syncAllStats();
    await loadStats(isDetail, detailView);
    setIsSyncing(false);
    if (result.success) toast.success('GA4 데이터와 동기화되었습니다.');
    else toast.error(result.error);
  };

  const isMonthly = isDetail && detailView === 'monthly';

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
      revenue: acc.revenue + Number(row.revenue),
    }),
    { pageViews: 0, visitors: 0, signups: 0, inquiries: 0, revenue: 0 }
  );

  return (
    <div className="bg-white p-10 rounded-[8px] border border-gray-100 h-[480px] flex flex-col group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">트래픽 분석</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">방문자 통계</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDetail(v => !v)}
            className="px-3 py-2 rounded-[8px] text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
          >
            {isDetail ? '접기' : '자세히 보기'}
          </button>
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
      </div>

      {!isDetail && (
        <div className="flex-1 min-h-0 w-full flex flex-col">
          {stats.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
              <TrendingUp size={48} />
              <p className="text-sm font-black uppercase tracking-[0.3em]">데이터 분석 중</p>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold text-gray-400 mb-4">
                최근 7일 · 페이지뷰 <span className="text-black">{totals.pageViews.toLocaleString()}</span> · 순 방문자 <span className="text-black">{totals.visitors.toLocaleString()}</span>
              </p>
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
          <div className="flex gap-2 mb-6">
            {(['daily', 'monthly'] as DetailView[]).map(view => (
              <button
                key={view}
                onClick={() => setDetailView(view)}
                className={`px-3 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all ${detailView === view ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
              >
                {view === 'daily' ? '일별 (7일)' : '월별 (12개월)'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar pr-2">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
                <tr>
                  <th className="pb-4 uppercase tracking-widest text-[9px] font-black text-gray-400">{isMonthly ? '월' : '날짜'}</th>
                  <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">페이지 뷰</th>
                  <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">순 방문자수</th>
                  <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">가입</th>
                  <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">문의</th>
                  <th className="pb-4 text-right uppercase tracking-widest text-[9px] font-black text-gray-400">매출액 (KRW)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.length > 0 ? (
                  stats.map((row) => (
                    <tr key={isMonthly ? row.month : row.date.toString()} className="hover:bg-gray-50/50 transition-colors group/row">
                      <td className="py-5 text-xs font-black text-gray-400 group-hover/row:text-black transition-colors">
                        {isMonthly
                          ? row.month
                          : new Date(row.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                      </td>
                      <td className="py-5 text-center text-xs font-bold text-gray-900">{row.pageViews.toLocaleString()}</td>
                      <td className="py-5 text-center text-xs font-bold text-gray-900">{row.visitors.toLocaleString()}</td>
                      <td className="py-5 text-center text-xs font-black text-black">
                        <span className={row.signups > 0 ? 'bg-black text-white px-2 py-0.5 rounded-[8px]' : 'text-gray-300'}>{row.signups}</span>
                      </td>
                      <td className="py-5 text-center text-xs font-bold text-gray-400">{row.inquiries}</td>
                      <td className="py-5 text-right font-black text-black text-sm">
                        {Number(row.revenue).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-20">
                        <Database size={40} />
                        <span className="text-[10px] font-black uppercase tracking-widest">수집된 통계 데이터가 없습니다</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
              {!isMonthly && stats.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-black">
                    <td className="py-5 text-xs font-black text-black uppercase tracking-widest">최근 7일 합계</td>
                    <td className="py-5 text-center text-xs font-black text-black">{totals.pageViews.toLocaleString()}</td>
                    <td className="py-5 text-center text-xs font-black text-black">{totals.visitors.toLocaleString()}</td>
                    <td className="py-5 text-center text-xs font-black text-black">{totals.signups}</td>
                    <td className="py-5 text-center text-xs font-black text-black">{totals.inquiries}</td>
                    <td className="py-5 text-right font-black text-black text-sm">{totals.revenue.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
