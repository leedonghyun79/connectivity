'use client';

import { useState, useEffect } from 'react';
import { getDailyStats, syncAllStats } from '@/lib/actions';
import { RefreshCcw, Database, ArrowUpRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PerformanceMetrics() {
  const [stats, setStats] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = async () => {
    const data = await getDailyStats();
    setStats(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncAllStats();
    await fetchData();
    setIsSyncing(false);
    toast.success('시스템 인프라가 실시간 데이터베이스와 동기화되었습니다.');
  };

  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 h-[480px] flex flex-col group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">인프라 KPI</div>
          <h3 className="text-2xl font-black text-black uppercase tracking-tighter">운영 성과 매트릭스</h3>
        </div>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className={`p-3 rounded-2xl transition-all flex items-center gap-2 group/btn ${isSyncing ? 'bg-black text-white' : 'bg-gray-50 text-gray-300 hover:bg-black hover:text-white'}`}
          title="원격 DB 동기화"
        >
          <RefreshCcw size={20} className={isSyncing ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'} />
          {isSyncing && <span className="text-[10px] font-black uppercase tracking-widest">동기화 중</span>}
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pr-2">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-white border-b border-gray-100 z-10">
            <tr>
              <th className="pb-4 uppercase tracking-widest text-[9px] font-black text-gray-400">날짜 로그</th>
              <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">PV</th>
              <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">UV</th>
              <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">가입</th>
              <th className="pb-4 text-center uppercase tracking-widest text-[9px] font-black text-gray-400">문의</th>
              <th className="pb-4 text-right uppercase tracking-widest text-[9px] font-black text-gray-400">매출액 (KRW)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stats.length > 0 ? (
              stats.map((row) => (
                <tr key={row.date.toString()} className="hover:bg-gray-50/50 transition-colors group/row">
                  <td className="py-5 text-xs font-black text-gray-400 group-hover/row:text-black transition-colors">
                    {new Date(row.date).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                  </td>
                  <td className="py-5 text-center text-xs font-bold text-gray-900">{row.pageViews.toLocaleString()}</td>
                  <td className="py-5 text-center text-xs font-bold text-gray-900">{row.visitors.toLocaleString()}</td>
                  <td className="py-5 text-center text-xs font-black text-black">
                    <span className={row.signups > 0 ? 'bg-black text-white px-2 py-0.5 rounded-md' : 'text-gray-300'}>{row.signups}</span>
                  </td>
                  <td className="py-5 text-center text-xs font-bold text-gray-400">{row.inquiries}</td>
                  <td className="py-5 text-right font-black text-black text-sm">
                    {Number(row.revenue).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Database size={40} />
                    <span className="text-[10px] font-black uppercase tracking-widest">로그 데이터가 탐지되지 않았습니다</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
