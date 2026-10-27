'use client';

import WorkStatusCards from "@/components/dashboard/WorkStatusCards";
import TrafficSource from "@/components/dashboard/TrafficSource";
import DailySummary from "@/components/dashboard/DailySummary";
import VisitorTrendCard from "@/components/dashboard/VisitorTrendCard";
import RecentInquiryList from "@/components/dashboard/RecentInquiryList";
import SalesMetricCards from "@/components/dashboard/SalesMetricCards";
import { AlertCircle, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="w-full animate-in fade-in duration-700 pt-0 pb-10 space-y-4">
      {/* 프리미엄 헤더 섹션 */}


      <WorkStatusCards />

      {/* 방문자 분석 (7일) + 유입 경로 */}
      <h3 className="!mt-[30px] mb-[15px] text-[28px] font-black text-[#060606] uppercase tracking-tighter">방문자 통계</h3>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* 대기 중인 견적 카드 중간선까지 (4열 그리드 기준 2.5칸) */}
        <div className="lg:w-[calc(62.5%+2px)]">
          <VisitorTrendCard />
        </div>
        <div className="flex-1">
          <TrafficSource />
        </div>
      </div>

      {/* 매출 지표 */}
      <SalesMetricCards />

      {/* 오늘 요약 + 문의 */}
      <h3 className="!mt-[24px] mb-[15px] text-[26px] font-black text-[#060606] uppercase tracking-tighter">업무 현황</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailySummary />
        <RecentInquiryList />
      </div>

    </div>
  );
}
