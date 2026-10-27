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
import DataTable from '@/components/common/DataTable';
import { PAGE_SIZE } from '@/components/common/Pagination';
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
  const [page, setPage] = useState(1);

  // 날짜가 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [selectedDate]);

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

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const pageLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading && !stats) return <PageLoader title="일일 활동 내역" toolbar="nav" />;

  return (
    <div className="w-full animate-in fade-in duration-700 pt-0 pb-10 space-y-4">
      {/* 상단 네비게이션 및 헤더 */}
      <div className="flex flex-col sm:flex-row justify-end items-end gap-6 !mt-[30px]">

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
      {isLoading ? (
        <div className="overflow-hidden rounded-[8px] border border-[#D1D5DB] bg-white shadow-sm min-h-[500px]">
          <div className="p-8 space-y-5 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-gray-100 rounded" />
                  <div className="h-2.5 w-1/5 bg-gray-50 rounded" />
                </div>
                <div className="h-6 w-16 bg-gray-100 rounded-[8px]" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <DataTable
          data={pageLogs}
          pagination={{ page, totalPages, onPageChange: setPage }}
          noDataIcon={<Search size={60} />}
          noDataMessage="해당 날짜에는 기록된 활동 내역이 존재하지 않습니다."
          columns={[
            {
              header: '시간',
              className: 'px-10 py-8',
              cell: (log) => (
                <span className="text-[11px] font-bold text-gray-400">
                  {new Date(log.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </span>
              ),
            },
            {
              header: '유형',
              className: 'px-10 py-8',
              cell: (log) => (
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.action === 'LOGIN' ? 'bg-black text-white border-black' : 'bg-white text-[#060606] border-[#D1D5DB]'}`}>
                  {log.action}
                </span>
              ),
            },
            {
              header: '메시지',
              className: 'px-10 py-8',
              cell: (log) => <span className="text-sm font-bold text-gray-700">{log.message}</span>,
            },
            {
              header: '사용자',
              className: 'px-10 py-8 text-left',
              cell: (log) => (
                <div className="flex items-center justify-start gap-2">
                  <span className="text-[11px] font-black text-[#060606] tracking-widest">{log.user || 'SYSTEM'}</span>
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users size={12} className="text-gray-400" />
                  </div>
                </div>
              ),
            },
          ]}
        />
      )}
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
