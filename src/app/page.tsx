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
            System Control Center
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Operational Dashboard</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-black" />
            환영합니다, 관리자님. 시스템이 <span className="text-black uppercase">Optimal Condition</span>으로 운영 중입니다.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Server Status</span>
              <span className="text-[10px] font-black text-green-500 uppercase">Online</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 시스템 알림 (미니멀) */}
      <div className="p-6 bg-black rounded-3xl flex justify-between items-center shadow-2xl shadow-black/10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white/10 rounded-xl">
            <AlertCircle size={20} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Intelligence Notice</p>
            <p className="text-sm font-bold text-white">복구된 시스템이 정상 작동 중입니다. 모든 인프라 링크가 활성화되었습니다.</p>
          </div>
        </div>
        <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
          Details <ArrowUpRight size={12} />
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
