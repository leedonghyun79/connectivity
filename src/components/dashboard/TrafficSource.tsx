'use client';

import { useState, useEffect } from 'react';
import { getTrafficSources } from '@/lib/actions';
import { PieChart } from 'lucide-react';

const STYLE: Record<string, { color: string; bg: string }> = {
  '구글 검색': { color: '#000000', bg: 'bg-black' },
  '네이버 검색': { color: '#444444', bg: 'bg-gray-700' },
  '소셜 미디어': { color: '#888888', bg: 'bg-gray-400' },
  '직접 유입': { color: '#CCCCCC', bg: 'bg-gray-300' },
  '참조 링크': { color: '#EEEEEE', bg: 'bg-gray-100' },
  '기타': { color: '#F7F7F7', bg: 'bg-gray-50' },
};

export default function TrafficSource() {
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<{ label: string; value: number }[] | null>(null);

  useEffect(() => {
    getTrafficSources(30).then(data => {
      setTotal(data.total);
      setItems(data.items);
      setIsLoading(false);
    });
  }, []);

  const data = (items ?? []).map(item => ({ ...item, ...STYLE[item.label] }));

  let currentPercent = 0;
  const gradientParts = data.map(item => {
    const start = currentPercent;
    currentPercent += item.value;
    return `${item.color} ${start}% ${currentPercent}%`;
  });
  const gradientString = (total ?? 0) > 0 ? `conic-gradient(${gradientParts.join(', ')})` : '#f8fafc';

  const shownTotal = total ?? 0;
  // 유입 기록이 전부 0이면 빈값 안내
  const isEmpty = shownTotal === 0;
  const totalLabel = shownTotal >= 1000 ? `${(shownTotal / 1000).toFixed(1)}K` : shownTotal.toLocaleString();

  // 데이터 도착 전에는 도넛과 막대 모양의 스켈레톤 표시
  if (isLoading) {
    return (
      <div className="bg-white p-10 rounded-[8px] border border-[#D1D5DB] h-full flex flex-col animate-pulse">
        <div className="space-y-2 mb-10">
          <div className="h-2.5 w-20 bg-gray-50 rounded" />
          <div className="h-6 w-40 bg-gray-100 rounded" />
        </div>
        <div className="flex flex-col items-center gap-10">
          <div className="w-48 h-48 rounded-full border-[24px] border-gray-100" />
          <div className="w-full space-y-5 px-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="h-1 w-20 bg-gray-50 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-[8px] border border-[#D1D5DB] h-full flex flex-col group">
      <div className="flex justify-between items-start mb-10">
        <div>
          <div className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-1">유입 로그</div>
          <h3 className="text-2xl font-black text-[#060606] uppercase tracking-tighter">유입 경로 분석</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-[8px] text-[#4B5563] group-hover:text-[#060606] transition-all">
          <PieChart size={20} />
        </div>
      </div>

      <div className="relative flex-1">
      {/* 방문 기록이 없으면 흐리게 보여주고 빈값 안내를 올림 */}
      <div className={isEmpty ? 'blur-[5px] opacity-60' : ''}>
      <div className="flex flex-col items-center gap-10">
        <div className="relative w-48 h-48 rounded-full flex-shrink-0" style={{ background: gradientString }}>
          <div className="absolute inset-5 bg-white rounded-full flex items-center justify-center flex-col border border-[#D1D5DB]">
            <span className="text-[10px] text-[#4B5563] font-black uppercase tracking-widest mb-1">전체 방문</span>
            <span className="text-3xl font-black text-[#060606] tracking-tighter">{totalLabel}</span>
          </div>
        </div>

        <div className="w-full space-y-5 px-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center justify-between group/item">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.bg}`}></span>
                <span className="text-[11px] text-gray-400 group-hover/item:text-[#060606] font-black uppercase tracking-wider transition-colors">{item.label}</span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="w-20 h-1 bg-gray-50 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${item.bg}`} style={{ width: `${item.value}%` }}></div>
                </div>
                <span className="text-sm font-black text-[#060606] min-w-[2rem] whitespace-nowrap text-right tabular-nums tracking-tighter">{item.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[#D1D5DB]">
          <PieChart size={32} />
          <p className="text-xs font-black uppercase tracking-[0.2em]">유입 데이터 없음</p>
        </div>
      )}
      </div>
    </div>
  );
}
