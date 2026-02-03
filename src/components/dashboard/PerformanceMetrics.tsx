'use client';

import { useState, useEffect } from 'react';
import { getDailyStats, syncAllStats } from '@/lib/actions';
import { RefreshCcw } from 'lucide-react';

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
    alert('DB 동기화가 완료되었습니다!');
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">기간별 분석</h3>
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors flex items-center gap-2 text-sm"
          title="GA4 및 내부 DB 동기화"
        >
          <RefreshCcw size={16} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? '동기화 중...' : '데이터 동기화'}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-center">
          <thead className="sticky top-0 bg-white border-b border-gray-100 text-gray-500 font-medium">
            <tr>
              <th className="pb-3 text-left">날짜</th>
              <th className="pb-3">페이지뷰</th>
              <th className="pb-3">방문자 수</th>
              <th className="pb-3">신규 가입</th>
              <th className="pb-3">문의</th>
              <th className="pb-3 text-right">매출액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {stats.length > 0 ? (
              stats.map((row) => (
                <tr key={row.date.toString()} className="hover:bg-gray-50">
                  <td className="py-3 text-left font-medium text-gray-700">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-gray-600">{row.pageViews.toLocaleString()}</td>
                  <td className="py-3 text-gray-600">{row.visitors.toLocaleString()}</td>
                  <td className="py-3 font-semibold text-blue-600">{row.signups}</td>
                  <td className="py-3 text-gray-600">{row.inquiries}</td>
                  <td className="py-3 text-right font-bold text-gray-900">
                    {Number(row.revenue).toLocaleString()}원
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-gray-400">
                  데이터가 없습니다. [데이터 동기화]를 눌러주세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
