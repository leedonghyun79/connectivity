'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { getTopKeywords } from '@/lib/actions';
import PageLoader from '@/components/common/PageLoader';

type KeywordItem = { keyword: string; sessions: number };

export default function VisitorKeywordsPage() {
  const [items, setItems] = useState<KeywordItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTopKeywords(30).then(data => {
      setItems(data.items);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <PageLoader title="유입 검색어 분석" variant="table" />;

  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">유입 검색어 분석</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-[#060606]" />
            최근 30일 동안 방문자가 검색한 검색어를 확인하세요.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#D1D5DB] overflow-hidden">
        <div className="grid grid-cols-[1fr_120px] gap-4 px-8 py-4 bg-gray-50 border-b border-[#D1D5DB] text-[10px] font-black uppercase tracking-widest text-gray-400">
          <span>검색 키워드</span>
          <span className="text-right">클릭수</span>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center text-sm font-bold text-gray-400">유입 검색어 데이터가 없습니다.</div>
        ) : (
          items.map((item, index) => (
            <div
              key={`${item.keyword}-${index}`}
              className="grid grid-cols-[1fr_120px] gap-4 px-8 py-5 border-b border-[#D1D5DB] last:border-b-0 items-center"
            >
              <span className="text-sm font-bold text-[#060606] truncate">{item.keyword}</span>
              <span className="text-sm font-black text-[#060606] text-right tabular-nums">{item.sessions.toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
