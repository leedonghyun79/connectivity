'use client';

import { useQuery } from '@tanstack/react-query';
import WorkStatusCards from "@/components/dashboard/WorkStatusCards";
import VisitorChart from "@/components/dashboard/VisitorChart";
import TrafficSource from "@/components/dashboard/TrafficSource";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";
import DailySummary from "@/components/dashboard/DailySummary";
import RecentWorkList from "@/components/dashboard/RecentWorkList";
import { AlertCircle } from "lucide-react";
import PageLoader from "@/components/common/PageLoader";

const fetchDashboardData = async () => {
  // 실제 API 복구 전까지 더미 데이터 반환
  await new Promise(resolve => setTimeout(resolve, 800)); // 로딩 시뮬레이션
  return {};
};

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  if (isLoading) return <PageLoader />;

  if (error) return (
    <div className="p-8 text-center text-red-500 font-bold border border-red-100 bg-red-50 rounded-lg">
      데이터를 불러오는 데 실패했습니다.
    </div>
  );

  return (
    <div className="w-full animate-in fade-in duration-700 p-6">
      {/* 상단 Breadcrumb */}
      <div className="mb-6">
        <span className="text-sm font-medium text-gray-500">Dashboard</span>
      </div>

      {/* 웰컴 섹션 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          환영합니다, <span className="text-[#2271b1]">관리자님</span>!
        </h1>
      </div>

      {/* 시스템 알림 바 */}
      <div className="mb-8 p-4 bg-white border border-gray-200 rounded-lg flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <AlertCircle size={18} className="text-amber-500" />
          <span className="text-sm text-gray-600">
            <span className="font-bold">시스템 안내:</span> 복구된 시스템이 정상 작동 중입니다.
          </span>
        </div>
      </div>

      <WorkStatusCards />

      {/* 메인 분석 섹션 (차트 + 테이블) - 50:50 배치 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="lg:col-span-1 h-96"> {/* 높이 고정 */}
          <VisitorChart />
        </div>
        <div className="lg:col-span-1 h-96"> {/* 높이 고정 */}
          <PerformanceMetrics />
        </div>
      </div>

      {/* 하단 섹션: 유입 분석 및 활동 요약 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 유입 경로 분석 (1칸) */}
        <div className="lg:col-span-1">
          <TrafficSource />
        </div>

        {/* 우측 2칸: 일자별 요약, 최근 활동 등 */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <DailySummary />
          <RecentWorkList />
        </div>
      </div>
    </div>
  );
}
