'use client';

import { useQuery } from '@tanstack/react-query';
import WorkStatusCards from "@/components/dashboard/WorkStatusCards";
import VisitorChart from "@/components/dashboard/VisitorChart";
import TrafficSource from "@/components/dashboard/TrafficSource";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import DailySummary from "@/components/dashboard/DailySummary";
import RecentWorkList from "@/components/dashboard/RecentWorkList";
import { AlertCircle, ArrowUpRight, LayoutDashboard, Zap } from "lucide-react";
import PageLoader from "@/components/common/PageLoader";

const fetchDashboardData = async () => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return {};
};

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
            <LayoutDashboard size={12} />
            시스템 제어 센터
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">운영 대시보드</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            < Zap size={14} className="text-black" />
            환영합니다, 관리자님. 시스템이 <span className="text-black uppercase">최적 상태</span>로 운영 중입니다.
          </p>
        </div>
        <div className="flex gap-4">
        </div>
      </div>

      {/* 시스템 알림 (미니멀) */}
      <div className="p-6 bg-black rounded-3xl flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/10 rounded-xl">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">지능형 알림</p>
            <p className="text-sm font-bold text-white">복구된 시스템이 정상 작동 중입니다. 모든 인프라 링크가 활성화되었습니다.</p>
          </div>
        </div>
        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
          상세 보기 <ArrowUpRight size={12} />
        </button>
      </div>

      <WorkStatusCards />

      {/* 메인 분석 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VisitorChart />
        <PerformanceMetrics />
      </div>

      {/* 하단 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TrafficSource />
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <DailySummary />
          <RecentWorkList />
        </div>
      </div>
    </div>
  );
}
