'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

// 스켈레톤 막대 높이 — 서버/클라이언트 렌더 결과가 같아야 하므로 고정값 사용
const SKELETON_HEIGHTS = [45, 70, 55, 85, 60, 75];

// 데이터는 부모(매출 분석 페이지)에서 함께 불러와 넘김 → 카드 단독 로딩 스켈레톤이 생기지 않음
export default function StatChart({ data, isLoading = false }: { data: { name: string; amount: number }[]; isLoading?: boolean }) {

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white p-4 rounded-[8px] border border-[#D1D5DB] flex flex-col gap-6 h-full group">
      {/* 헤더 */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="my-[15px] text-[21px] font-black text-[#060606] tracking-tighter uppercase">
            월별 매출 통계
          </h4>
        </div>
      </div>

      {/* 총액 */}
      {!isLoading && (
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black tracking-tighter">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            총 원
          </span>
        </div>
      )}

      {/* 차트 영역 */}
      <div className="h-[220px]">
        {isLoading ? (
          // 스켈레톤
          <div className="h-full flex items-end justify-around pb-8">
            {SKELETON_HEIGHTS.map((height, i) => (
              <div
                key={i}
                className="w-20 bg-gray-100 rounded-t-[8px] animate-pulse"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 || total === 0 ? (
          // 빈 상태 — 막대 모양을 흐리게 두고 빈값 안내를 올림
          <div className="relative h-[180px]">
            <div className="h-full flex items-end gap-2 pb-4 blur-[5px] opacity-60">
              {SKELETON_HEIGHTS.map((height, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${height}%` }} />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#D1D5DB]">
              <TrendingUp size={32} />
              <p className="text-xs font-black uppercase tracking-[0.2em]">거래 데이터 없음</p>
            </div>
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
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value.toLocaleString()} ₩`, '매출']}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, marginBottom: '4px' }}
              />
              <Bar dataKey="amount" fill="#000000" radius={[8, 8, 0, 0]} barSize={80} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
