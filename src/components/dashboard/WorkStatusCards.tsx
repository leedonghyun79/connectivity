import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/actions';

export default function WorkStatusCards() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm mb-1">오늘 방문자</div>
        <div className="text-2xl font-bold text-blue-600">{stats.todayVisitors.toLocaleString()}명</div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm mb-1">대기중인 문의</div>
        <div className="text-2xl font-bold text-orange-500">{stats.pendingInquiries}건</div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm mb-1">대기중인 견적</div>
        <div className="text-2xl font-bold text-amber-500">{stats.pendingEstimates}건</div>
      </div>
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm mb-1">총 누적 매출</div>
        <div className="text-2xl font-bold text-green-600">{Number(stats.totalRevenue).toLocaleString()}원</div>
      </div>
    </div>
  );
}
