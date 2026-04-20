'use client';

import { useState, useEffect } from 'react';
import { getRecentActivityFeed } from '@/lib/actions';
import { FileText, ArrowRight, Eye, Briefcase, Clock } from 'lucide-react';

export default function RecentWorkList() {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getRecentActivityFeed().then(data => {
      setActivities(data);
      setIsLoading(false);
    });
  }, []);

  const formatRelativeTime = (date: Date) => {
    const diff = new Date().getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className="bg-white p-10 rounded-[32px] border border-gray-100 h-full flex flex-col group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">운영 감사 로그</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">최근 활동 피드</h3>
        </div>
        <div className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black transition-all">
          <Eye size={20} />
        </div>
      </div>

      <div className="space-y-6 flex-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-4 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-[-24px] before:w-px before:bg-gray-100 last:before:hidden animate-pulse">
              <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-gray-50 border-2 border-white z-10" />
              <div className="flex-1 pb-6 border-b border-gray-50 flex justify-between items-end">
                <div className="space-y-1.5">
                  <div className="h-3 bg-gray-50 rounded w-48" />
                  <div className="h-2.5 bg-gray-50 rounded w-24" />
                </div>
                <div className="h-2 bg-gray-50 rounded w-10" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-20">
            <Clock size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-center">기록된 최근 활동이 없습니다</p>
          </div>
        ) : (
          activities.map((item) => (
            <div key={item.id} className="flex gap-4 relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-[-24px] before:w-px before:bg-gray-100 last:before:hidden">
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center z-10
                  ${item.type === 'ESTIMATE' ? 'bg-black' : item.type === 'CLIENT' ? 'bg-orange-400' : 'bg-gray-200'}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>

              <div className="flex-1 pb-6 border-b border-gray-50 flex justify-between items-end group/item">
                <div>
                  <div className="text-[11px] font-black text-black uppercase tracking-tight mb-0.5 group-hover/item:translate-x-0.5 transition-transform">{item.title}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.client}</div>
                </div>
                <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{formatRelativeTime(item.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-2xl hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center gap-2">
        상세 활동 내역 보기 <ArrowRight size={14} />
      </button>
    </div>
  );
}
