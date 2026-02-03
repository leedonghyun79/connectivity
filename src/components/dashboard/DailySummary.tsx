'use client';

import { Users, CheckCircle2, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

export default function DailySummary() {
  const today = new Date().toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();

  const stats = [
    { label: 'New Entities', count: 12, icon: Users, color: 'text-black', bg: 'bg-gray-50' },
    { label: 'Completed Jobs', count: 5, icon: CheckCircle2, color: 'text-black', bg: 'bg-gray-50' },
    { label: 'System Inquiries', count: 8, icon: MessageSquare, color: 'text-black', bg: 'bg-gray-50' },
    { label: 'Revenue Flow', count: 3, icon: TrendingUp, color: 'text-black', bg: 'bg-gray-50' },
  ];

  return (
    <div className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Journal Entry</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Daily Sync</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-black uppercase tracking-widest mb-1 border-b border-black">{weekday}</div>
          <div className="text-xl font-black text-gray-300 tracking-tighter">{today}</div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl transition-all border border-transparent hover:border-gray-50 group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${stat.bg} ${stat.color} group-hover:bg-black group-hover:text-white`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[11px] text-gray-400 group-hover:text-black font-black uppercase tracking-widest transition-colors">{stat.label}</span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-black text-black tracking-tighter">{stat.count}</span>
              <span className="text-[10px] font-bold text-gray-300 uppercase mb-1">Items</span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-2xl hover:bg-black hover:text-white hover:border-black transition-all">
        Access Full Journal
      </button>
    </div>
  );
}
