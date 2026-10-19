'use client';

import WorkStatusCards from "@/components/dashboard/WorkStatusCards";
import TrafficSource from "@/components/dashboard/TrafficSource";
import DailySummary from "@/components/dashboard/DailySummary";
import VisitorTrendCard from "@/components/dashboard/VisitorTrendCard";
import RecentInquiryList from "@/components/dashboard/RecentInquiryList";
import StatChart from "@/components/dashboard/StatChart";
import { AlertCircle, ArrowUpRight, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">대시보드</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-[#060606]" />
            오늘의 현황을 한눈에 확인하세요.
          </p>
        </div>
        <div className="flex gap-4">
        </div>
      </div>


      <WorkStatusCards />

      {/* 방문자 분석 (7일) */}
      <VisitorTrendCard />

      {/* 오늘 요약 + 유입 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <DailySummary />
        <TrafficSource />
      </div>

      {/* 매출 */}
      <StatChart />

      {/* 문의 */}
      <RecentInquiryList />

    </div>
  );
}
