import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/actions';
import { Users, MessageSquare, FileText, Banknote } from 'lucide-react';

export default function WorkStatusCards() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  // 데이터 도착 전에는 카드 모양의 스켈레톤 표시
  if (!stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-[8px] border border-[#D1D5DB] p-8 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-3 w-24 bg-gray-100 rounded" />
              <div className="h-9 w-9 bg-gray-50 rounded-[8px]" />
            </div>
            <div className="h-7 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label="일간 방문자"
        value={stats.todayVisitors.toLocaleString()}
        unit="명"
        icon={Users}
      />
      <StatCard
        label="대기 중인 문의"
        value={stats.pendingInquiries.toLocaleString()}
        unit="건"
        icon={MessageSquare}
      />
      <StatCard
        label="대기 중인 견적"
        value={stats.pendingEstimates.toLocaleString()}
        unit="건"
        icon={FileText}
      />
      <StatCard
        label="전체 누적 매출"
        value={Number(stats.totalRevenue).toLocaleString()}
        unit="원"
        icon={Banknote}
        black
      />
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon, highlight, black }: any) {
  return (
    <div className={`p-8 rounded-[8px] border transition-all duration-500 relative overflow-hidden group
            ${black ? 'bg-black text-white border-black' : 'bg-white text-[#060606] border-[#D1D5DB] hover:border-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)]'}
            ${highlight ? 'border-l-4 border-l-black' : ''}`}>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`text-[10px] font-black uppercase tracking-widest transition-colors ${black ? 'text-white' : 'text-[#4B5563] group-hover:text-[#060606]'}`}>
          {label}
        </div>
        <div className={`p-2 rounded-[8px] transition-all duration-300 ${black ? 'bg-white/10 text-white' : 'bg-gray-50 text-[#4B5563] group-hover:bg-black group-hover:text-white'}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-end gap-2 relative z-10">
        <div className="text-4xl font-black tracking-tighter transition-colors">{value}</div>
        <div className={`text-[10px] font-bold mb-1.5 uppercase tracking-widest transition-colors ${black ? 'text-white' : 'text-[#4B5563] group-hover:text-[#060606]'}`}>
          {unit}
        </div>
      </div>

      {/* Deco background */}
      <Icon size={120} className={`absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 group-hover:scale-110 pointer-events-none ${black ? 'text-white' : 'text-[#060606]'}`} />
    </div>
  )
}
