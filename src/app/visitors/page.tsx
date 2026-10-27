'use client';

import { Zap } from "lucide-react";
import PerformanceMetrics from "@/components/dashboard/PerformanceMetrics";

export default function VisitorsPage() {
  return (
    <div className="w-full animate-in fade-in duration-700 pt-0 pb-10 space-y-4">
      {/* 프리미엄 헤더 섹션 */}

      <div className="!mt-[30px]">
        <PerformanceMetrics initialDetail />
      </div>
    </div>
  );
}
