'use client';

import { Users, CheckCircle2, MessageSquare, TrendingUp } from 'lucide-react';

export default function DailySummary() {
  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });

  const stats = [
    { label: '신규 가입', count: 12, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '작업 완료', count: 5, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '문의 접수', count: 8, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '매출 발생', count: 3, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">일자별 요약</h3>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{today}</span>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-gray-600 font-medium">{stat.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">{stat.count}</span>
              <span className="text-xs text-gray-400">건</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-[#2271b1] font-medium hover:bg-blue-50 rounded-lg transition-colors">
        전체 리포트 보기
      </button>
    </div>
  );
}
