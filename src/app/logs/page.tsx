'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  getStatsByDate, 
  getLogsByDate 
} from '@/lib/actions';
import { 
  Calendar as CalendarIcon, 
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

  const formatFullDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00+09:00`);
    return d.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long',
      timeZone: 'Asia/Seoul'
    });
  };

  if (isLoading && !stats) return <PageLoader />;

  const statCards = [
    { label: '신규 가입자', count: stats?.newCustomers || 0, icon: Users },
    { label: '완료된 작업', count: stats?.closedProjects || 0, icon: CheckCircle2 },
    { label: '시스템 문의', count: stats?.newInquiries || 0, icon: MessageSquare },
    { label: '매출 발생건', count: stats?.newTransactions || 0, icon: TrendingUp },
  ];

  return (
    <div className="w-full animate-in fade-in duration-700 py-10 space-y-10">
      {/* 상단 네비게이션 및 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <Link href="/" className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3 flex items-center gap-2 hover:text-black transition-colors">
            <ArrowLeft size={12} />
            대시보드로 돌아가기
          </Link>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">전체 브리핑 로그</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <CalendarIcon size={14} className="text-black" />
            {formatFullDate(selectedDate)}의 상세 운영 기록입니다.
          </p>
        </div>

        {/* 날짜 컨트롤러 */}
        <div className="flex items-center bg-gray-50 p-2 rounded-[24px] border border-gray-100 shadow-sm">
          <button 
            onClick={() => moveDate(-1)}
            className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all"
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
            className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 통계 요약 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden">
            {/* 배경 아이콘 효과 */}
            <div className={`absolute -right-4 -bottom-6 text-gray-100 group-hover:text-gray-200 opacity-20 group-hover:opacity-40 transition-all duration-500 group-hover:scale-110`}>
              <stat.icon size={120} strokeWidth={1} />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 bg-gray-50 text-gray-300 group-hover:bg-black group-hover:text-white`}>
                  <stat.icon size={24} />
                </div>
                <div className="text-[10px] font-black text-gray-200 uppercase tracking-widest group-hover:text-black transition-colors">SUMMARY</div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest group-hover:text-black transition-colors">{stat.label}</p>
                <h4 className="text-4xl font-black text-black tracking-tighter">
                  {stat.count}
                  <span className="text-sm ml-1 text-gray-300 uppercase">건</span>
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 상세 활동 로그 섹션 */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 min-h-[500px]">
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                <Activity size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-black uppercase tracking-tighter">상세 활동 내역</h3>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Operational Audit Logs</p>
              </div>
            </div>
            <div className="text-right">
               <span className="text-2xl font-black text-black tracking-tighter">{logs.length}</span>
               <span className="text-[10px] font-black text-gray-300 uppercase ml-2">Total Events</span>
            </div>
          </div>

          <div className="space-y-2">
            {isLoading ? (
               Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse mb-3" />
              ))
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-20">
                <Search size={60} />
                <div className="text-center">
                  <p className="text-xl font-black uppercase tracking-widest mb-1">데이터가 없습니다</p>
                  <p className="text-sm font-bold">해당 날짜에는 기록된 활동 내역이 존재하지 않습니다.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="px-6 py-4 text-left font-black">시간</th>
                      <th className="px-6 py-4 text-left font-black">유형</th>
                      <th className="px-6 py-4 text-left font-black">메시지</th>
                      <th className="px-6 py-4 text-right font-black">수행자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-6 text-[11px] font-bold text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border
                            ${log.action === 'LOGIN' ? 'bg-black text-white border-black' : 
                              'bg-white text-black border-gray-200'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-sm font-bold text-gray-700 group-hover:text-black transition-colors">
                          {log.message}
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[11px] font-black text-black uppercase tracking-widest">{log.user || 'SYSTEM'}</span>
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
    <Suspense fallback={<PageLoader />}>
      <LogsContent />
    </Suspense>
  );
}
