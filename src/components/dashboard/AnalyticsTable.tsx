'use client';

import { useState, useEffect } from 'react';
import { getCustomerStats, getEstimateStats } from '@/lib/actions';
import { Users, FileText, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsTable() {
  const [customerStats, setCustomerStats] = useState<{
    total: number; pending: number; processing: number; closed: number;
  } | null>(null);
  const [estimateStats, setEstimateStats] = useState<{
    totalAmount: string; pending: number; approved: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCustomerStats(), getEstimateStats()]).then(([cs, es]) => {
      setCustomerStats(cs);
      setEstimateStats(es);
      setIsLoading(false);
    });
  }, []);

  const rows = [
    {
      label: '대기 고객',
      value: customerStats?.pending ?? '-',
      sub: `전체 ${customerStats?.total ?? '-'}명 중`,
      href: '/customers/page/1',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: '진행 중 고객',
      value: customerStats?.processing ?? '-',
      sub: '활성 프로젝트 운영 중',
      href: '/customers/page/1',
      color: 'text-black',
      bg: 'bg-gray-50',
    },
    {
      label: '완료 고객',
      value: customerStats?.closed ?? '-',
      sub: '프로젝트 종료',
      href: '/customers/page/1',
      color: 'text-gray-400',
      bg: 'bg-gray-50',
    },
    {
      label: '대기 견적서',
      value: estimateStats?.pending ?? '-',
      sub: '승인 확인 필요',
      href: '/estimates',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      label: '승인된 견적서',
      value: estimateStats?.approved ?? '-',
      sub: `총액 ${Number(estimateStats?.totalAmount ?? 0).toLocaleString()} ₩`,
      href: '/estimates',
      color: 'text-black',
      bg: 'bg-gray-50',
    },
  ];

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
      {/* 헤더 */}
      <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">
            운영 현황 요약
          </div>
          <h3 className="text-lg font-black text-black tracking-tighter uppercase">
            상세 분석
          </h3>
        </div>
        <div className="flex gap-2">
          <Link href="/customers/page/1" className="p-2 bg-gray-50 rounded-xl text-gray-300 hover:text-black transition-all">
            <Users size={14} />
          </Link>
          <Link href="/estimates" className="p-2 bg-gray-50 rounded-xl text-gray-300 hover:text-black transition-all">
            <FileText size={14} />
          </Link>
        </div>
      </div>

      {/* 테이블 */}
      <div className="divide-y divide-gray-50">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-8 py-5 flex items-center justify-between animate-pulse">
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-2.5 bg-gray-50 rounded w-16" />
              </div>
              <div className="h-7 bg-gray-100 rounded w-12" />
            </div>
          ))
        ) : (
          rows.map((row) => (
            <Link
              key={row.label}
              href={row.href}
              className="px-8 py-5 flex items-center justify-between hover:bg-gray-50/80 transition-all group"
            >
              <div>
                <div className="text-[11px] font-black text-gray-700 uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
                  {row.label}
                </div>
                <div className="text-[10px] font-bold text-gray-400 mt-0.5">{row.sub}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-black tracking-tighter ${row.color}`}>
                  {row.value}
                </span>
                <ArrowUpRight size={14} className="text-gray-200 group-hover:text-black transition-colors" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
