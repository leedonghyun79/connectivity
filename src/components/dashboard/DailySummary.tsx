'use client';

import { useState, useEffect } from 'react';
import { getTodayStats } from '@/lib/actions';
import { Users, CheckCircle2, MessageSquare, TrendingUp, Calendar } from 'lucide-react';

export default function DailySummary() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const now = new Date();
  const dateParts = new Intl.DateTimeFormat('ko-KR', { month: '2-digit', day: '2-digit', weekday: 'short', timeZone: 'Asia/Seoul' }).formatToParts(now);
  const pick = (type: string) => dateParts.find(p => p.type === type)?.value ?? '';
  const today = `${pick('month')}.${pick('day')} (${pick('weekday')})`;

  useEffect(() => {
    getTodayStats().then(data => {
      setStats([
        { label: '신규 가입자', count: data.newCustomers, icon: Users, color: 'text-[#060606]', bg: 'bg-gray-50' },
        { label: '완료된 작업', count: data.closedProjects, icon: CheckCircle2, color: 'text-[#060606]', bg: 'bg-gray-50' },
        { label: '고객 문의', count: data.newInquiries, icon: MessageSquare, color: 'text-[#060606]', bg: 'bg-gray-50' },
        { label: '매출 발생건', count: data.newTransactions, icon: TrendingUp, color: 'text-[#060606]', bg: 'bg-gray-50' },
      ]);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="bg-white p-10 rounded-[8px] border border-[#D1D5DB] h-full flex flex-col">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-1">업무 현황</div>
          <h3 className="text-2xl font-black text-[#060606] uppercase tracking-tighter">오늘 작업 요약</h3>
        </div>
        <div className="p-3 text-right">
          <div className="text-xl font-black text-[#4B5563] tracking-tighter leading-none">{today}</div>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-50 rounded-[8px]" />
                <div className="h-3 bg-gray-50 rounded w-20" />
              </div>
              <div className="h-6 bg-gray-50 rounded w-8" />
            </div>
          ))
        ) : stats?.map((stat: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-[8px] transition-all border border-transparent hover:border-[#D1D5DB] group">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-[8px] flex items-center justify-center transition-colors ${stat.bg} ${stat.color} group-hover:bg-black group-hover:text-white`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[11px] text-gray-400 group-hover:text-[#060606] font-black uppercase tracking-widest transition-colors">{stat.label}</span>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-black text-[#060606] tracking-tighter">{stat.count}</span>
              <span className="text-[10px] font-bold text-[#4B5563] uppercase mb-1">건</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
