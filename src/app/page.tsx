'use client';

import { useQuery } from '@tanstack/react-query';
import WorkStatusCards from "@/components/dashboard/WorkStatusCards";
import VisitorChart from "@/components/dashboard/VisitorChart";
import TrafficSource from "@/components/dashboard/TrafficSource";
import DailySummary from "@/components/dashboard/DailySummary";
import RecentWorkList from "@/components/dashboard/RecentWorkList";
import AnalyticsTable from "@/components/dashboard/AnalyticsTable";
import RecentInquiryList from "@/components/dashboard/RecentInquiryList";
import StatChart from "@/components/dashboard/StatChart";
import { AlertCircle, ArrowUpRight, Zap } from "lucide-react";
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
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">대시보드</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-black" />
            오늘의 현황을 한눈에 확인하세요.
          </p>
        </div>
        <div className="flex gap-4">
        </div>
      </div>


      <WorkStatusCards />

      {/* 메인 분석 섹션 */}
      <div className="w-full">
        <VisitorChart />
      </div>

      {/* 매출 차트 + 최근 문의 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StatChart />
        <RecentInquiryList />
      </div>

      {/* 하단 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TrafficSource />
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <DailySummary />
          <RecentWorkList />
        </div>
      </div>

      {/* 운영 현황 테이블 */}
      <AnalyticsTable />
    </div>
  );
}
