'use client';

import { useState, useEffect } from 'react';
import { getTransactions, getSalesStats } from '@/lib/actions';

export default function SalesMetricCards() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getTransactions(), getSalesStats()]).then(([txData, statData]) => {
      setTransactions(txData);
      setStats(statData);
    });
  }, []);

  // 데이터 도착 전에는 카드 모양의 스켈레톤 표시
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-[8px] border border-[#D1D5DB] p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-9 w-9 bg-gray-50 rounded-[8px]" />
            </div>
            <div className="h-7 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
    <h3 className="!mt-[24px] mb-[15px] text-[26px] font-black text-[#060606] uppercase tracking-tighter">매출 현황</h3>
    <div className="grid grid-cols-1 md:grid-cols-4 bg-white rounded-[8px] border border-[#D1D5DB] divide-y md:divide-y-0 md:divide-x divide-[#D1D5DB] overflow-hidden">
      <MetricCard
        title="총 매출액"
        tone="text-[#060606]"
        value={`${Number(stats.totalRevenue).toLocaleString()}`}
        unit="원"
      />
      <MetricCard
        title="정산 완료"
        tone="text-[#060606]"
        value={`${stats.completedCount}`}
        unit="건"
      />
      <MetricCard
        title="정산 대기"
        tone="text-[#060606]"
        value={`${stats.pendingCount}`}
        unit="건"
      />
      <MetricCard
        title="거래량"
        tone="text-[#060606]"
        value={`${transactions.length}`}
        unit="건"
      />
    </div>
    </>
  );
}

function MetricCard({ title, value, unit, tone }: any) {
  return (
    <div className="p-8 text-[#060606] transition-colors duration-500 group">

      <div className="flex justify-between items-start mb-6">
        <h4 className="text-[21px] font-black text-[#060606] uppercase tracking-tighter">
          {title}
        </h4>
      </div>

      <div className="flex items-end gap-2">
        <div className={`text-4xl font-black tracking-tighter ${tone}`}>{value}</div>
        <div className="text-[10px] font-bold mb-1.5 uppercase tracking-widest text-[#4B5563]">
          {unit}
        </div>
      </div>
    </div>
  );
}
