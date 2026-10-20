'use client';

import { useState, useEffect } from 'react';
import { getDailyStats } from '@/lib/actions';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useChartSize } from '@/hooks/useChartSize';

export default function VisitorTrendCard() {
  const [stats, setStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const chart = useChartSize();

  useEffect(() => {
    getDailyStats(7).then(data => {
      setStats(data);
      setIsLoading(false);
    });
  }, []);

  // 시간순으로 뒤집어서 표시
  const chartData = [...stats].reverse().map(s => ({
    date: new Date(s.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }),
    pv: s.pageViews,
    visitor: s.visitors,
  }));

  const totalPv = stats.reduce((acc, row) => acc + row.pageViews, 0);
  const totalVisitor = stats.reduce((acc, row) => acc + row.visitors, 0);

  // 스켈레톤은 데이터 로딩 + 영역 크기 측정이 끝날 때까지 유지
  const showSkeleton = isLoading || !chart.ready;
  // 최근 7일 방문이 전부 0이면 차트를 흐리게 두고 빈값 안내를 올림
  const isEmpty = totalPv === 0 && totalVisitor === 0;

  return (
    <div className="bg-white p-10 rounded-[8px] border border-[#D1D5DB] h-[420px] flex flex-col group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-1">트래픽 분석</div>
          <h3 className="text-2xl font-black text-[#060606] uppercase tracking-tighter">방문자 분석</h3>
        </div>
        <Link
          href="/visitors"
          className="p-3 bg-gray-50 rounded-[8px] text-[#D1D5DB] group-hover:bg-black group-hover:text-white transition-all duration-300"
        >
          <ArrowUpRight size={20} />
        </Link>
      </div>

      {!isLoading && stats.length > 0 && (
        <p className="text-sm font-bold text-gray-400 mb-2">
          페이지뷰 <span className="text-[#060606]">{totalPv.toLocaleString()}</span> · 방문자 <span className="text-[#060606]">{totalVisitor.toLocaleString()}</span> (최근 7일)
        </p>
      )}

      {/* 차트 영역 — 항상 렌더링해서 크기를 재고, 준비되기 전에는 스켈레톤 */}
      <div ref={chart.ref} className="flex-1 min-h-0 w-full relative">
        {showSkeleton ? (
          <div className="h-full w-full relative animate-pulse">
            <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-px w-full bg-gray-100" />
              ))}
            </div>
            <svg className="absolute inset-x-0 top-0 w-full h-[calc(100%-32px)]" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35 L100,100 L0,100 Z" fill="#F3F4F6" />
              <path d="M0,70 C15,40 25,85 40,55 S65,20 80,45 S95,30 100,35" fill="none" stroke="#D1D5DB" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        ) : stats.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-[#D1D5DB]">
            <TrendingUp size={48} />
            <p className="text-sm font-black uppercase tracking-[0.3em]">데이터 분석 중</p>
          </div>
        ) : (
          <div className="relative h-full w-full">
            <div className={isEmpty ? 'h-full w-full blur-[5px] opacity-60' : 'h-full w-full'}>
          <AreaChart width={chart.width} height={chart.height} data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="dashColorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#000" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashColorVisitor" x1="0" y1="0" x2="0" y2="1">
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
              tickFormatter={(v: number) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))}k` : String(v))}
            />
            <Tooltip
              cursor={{ stroke: '#000', strokeWidth: 1, strokeDasharray: '4 4' }}
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
              fill="none"
              activeDot={{ r: 4, strokeWidth: 0, fill: '#000' }}
            />
            <Area
              isAnimationActive={false}
              type="monotone"
              dataKey="visitor"
              name="방문자"
              stroke="#000"
              strokeWidth={3}
              fill="none"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#000' }}
            />
          </AreaChart>
            </div>
            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#D1D5DB]">
                <TrendingUp size={32} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">방문 데이터 없음</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
