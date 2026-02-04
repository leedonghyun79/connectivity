import { useState, useEffect } from 'react';
import { getDashboardStats } from '@/lib/actions';
import { Users, MessageSquare, FileText, Banknote } from 'lucide-react';

export default function WorkStatusCards() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  if (!stats) return null;

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
    <div className={`p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group
            ${black ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100'}
            ${highlight ? 'border-l-4 border-l-black' : ''}`}>

      <div className="flex justify-between items-start mb-6">
        <div className={`text-[10px] font-black uppercase tracking-widest ${black ? 'text-gray-500' : 'text-gray-300'}`}>
          {label}
        </div>
        <div className={`p-2 rounded-xl transition-colors ${black ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-300 group-hover:text-black'}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-4xl font-black tracking-tighter">{value}</div>
        <div className={`text-[10px] font-bold mb-1.5 uppercase tracking-widest ${black ? 'text-gray-500' : 'text-gray-300'}`}>
          {unit}
        </div>
      </div>

      {/* Deco background */}
      <Icon size={120} className={`absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none ${black ? 'text-white' : 'text-black'}`} />
    </div>
  )
}
