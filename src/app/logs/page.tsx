'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getStatsByDate,
  getLogsByDate
} from '@/lib/actions';
import {
  Users,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Activity,
  Search
} from 'lucide-react';
import PageLoader from "@/components/common/PageLoader";
import Link from 'next/link';
import { Suspense } from 'react';

function LogsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 날짜 설정 (쿼리 파라미터가 있으면 사용, 없으면 오늘)
  // 한국 시간(KST) 기준으로 오늘 날짜 구하기 (YYYY-MM-DD)
  const getKSTToday = () => {
    const now = new Date();
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);
  };

  const initialDate = searchParams.get('date') || getKSTToday();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [stats, setStats] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [newStats, newLogs] = await Promise.all([
        getStatsByDate(selectedDate),
        getLogsByDate(selectedDate)
      ]);
      setStats(newStats);
      setLogs(newLogs);
      setIsLoading(false);
    }
    loadData();
  }, [selectedDate]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    // URL 파라미터 업데이트
    router.push(`/logs?date=${newDate}`);
  };

  const moveDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  if (isLoading && !stats) return <PageLoader title="일일 활동 내역" />;

  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 상단 네비게이션 및 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">일일 활동 내역</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Activity size={14} className="text-[#060606]" />
            하루 동안 진행된 업무와 기록을 확인합니다.
          </p>
        </div>

        {/* 날짜 컨트롤러 */}
        <div className="flex items-center bg-gray-50 p-2 rounded-[8px] border border-[#D1D5DB] shadow-sm">
          <button
            onClick={() => moveDate(-1)}
            className="p-3 hover:bg-white hover:shadow-md rounded-[8px] transition-all"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="px-6 flex flex-col items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent border-none font-black text-sm text-center focus:ring-0 cursor-pointer"
            />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">날짜 직접 선택</span>
          </div>

          <button
            onClick={() => moveDate(1)}
            className="p-3 hover:bg-white hover:shadow-md rounded-[8px] transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 최근 활동 내역 섹션 */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-10 rounded-[8px] border border-[#D1D5DB] min-h-[500px]">
          <div className="flex justify-end items-center mb-10">
            <div className="text-right">
              <span className="text-lg font-black text-[#060606] tracking-tighter">{logs.length}</span>
              <span className="text-[9px] font-black text-[#4B5563] uppercase ml-2">Total Events</span>
            </div>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-[8px] animate-pulse mb-3" />
              ))
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 text-[#D1D5DB]">
                <Search size={60} />
                <div className="text-center">
                  <p className="text-[#D1D5DB] text-xl font-black uppercase tracking-widest mb-1">데이터가 없습니다</p>
                  <p className="text-sm font-bold">해당 날짜에는 기록된 활동 내역이 존재하지 않습니다.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-[#D1D5DB]">
                      <th className="px-6 py-4 text-left font-black">시간</th>
                      <th className="px-6 py-4 text-left font-black">유형</th>
                      <th className="px-6 py-4 text-left font-black">메시지</th>
                      <th className="px-6 py-4 text-right font-black">수행자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D1D5DB]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-6 text-[11px] font-bold text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                            ${log.action === 'LOGIN' ? 'bg-black text-white border-black' :
                              'bg-white text-[#060606] border-[#D1D5DB]'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm font-bold text-gray-700 group-hover:text-[#060606] transition-colors">
                          {log.message}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-black text-[#060606] uppercase tracking-widest">{log.user || 'SYSTEM'}</span>
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users size={12} className="text-gray-400" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LogsPage() {
  return (
    <Suspense fallback={<PageLoader title="일일 활동 내역" />}>
      <LogsContent />
    </Suspense>
  );
}
