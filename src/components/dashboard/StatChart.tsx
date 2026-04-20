'use client';

import { useState, useEffect } from 'react';
import { getMonthlySalesStats } from '@/lib/actions';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function StatChart() {
  const [data, setData] = useState<{ name: string; amount: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMonthlySalesStats().then(result => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex flex-col gap-6 h-full">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
            월별 수익 흐름
          </div>
          <h3 className="text-xl font-black text-black tracking-tighter uppercase">
            매출 통계
          </h3>
        </div>
        <Link
          href="/sales"
          className="p-2 bg-gray-50 rounded-xl text-gray-300 hover:bg-black hover:text-white transition-all"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* 총액 */}
      {!isLoading && (
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black tracking-tighter">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            KRW 누적
          </span>
        </div>
      )}

      {/* 차트 영역 */}
      <div className="flex-1 min-h-[180px]">
        {isLoading ? (
          // 스켈레톤
          <div className="h-full flex items-end gap-2 pb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-100 rounded-t-lg animate-pulse"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          // 빈 상태
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20">
            <TrendingUp size={32} />
            <p className="text-xs font-black uppercase tracking-[0.2em]">
              거래 데이터 없음
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 700 }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#cbd5e1', fontSize: 9, fontWeight: 700 }}
                tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${(v / 1000).toFixed(0)}K`}
              />
              <RechartsTooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{
                  backgroundColor: '#000',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 14px',
                  fontSize: '10px',
                  fontWeight: 900,
                }}
                formatter={(value: number) => [`${value.toLocaleString()} ₩`, '매출']}
                labelStyle={{ display: 'none' }}
              />
              <Bar dataKey="amount" fill="#000000" radius={[8, 8, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
