'use client';

import { Zap } from "lucide-react";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";

export default function VisitorsPage() {
  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 프리미엄 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">방문자 분석</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Zap size={14} className="text-[#060606]" />
            사이트 방문 추이를 일별·월별로 확인하세요.
          </p>
        </div>
      </div>

      <PerformanceMetrics initialDetail />
    </div>
  );
}
