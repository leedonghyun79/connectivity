'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import { getInquiries, getInquiryStats } from '@/lib/actions';

export default function InquiriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [inquiries, setInquiries] = useState<any[]>([]);

  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [data, statData] = await Promise.all([
        getInquiries(),
        getInquiryStats()
      ]);
      setInquiries(data);
      setStats(statData);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">문의 게시판</h1>
          <p className="text-sm text-gray-500 mt-1">접수된 고객 문의를 확인하고 답변할 수 있습니다.</p>
        </div>
      </div>

      {/* 필터 및 요약 카드 (상단) - 실시간 연동 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">대기중인 문의</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}건</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <AlertCircle size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">답변 완료</p>
            <p className="text-2xl font-bold text-green-600">{stats.answered}건</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 size={20} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">전체 문의</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}건</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <MessageCircle size={20} />
          </div>
        </div>
      </div>

      {/* 검색 및 필터 바 */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-900 text-white whitespace-nowrap">전체</button>
          <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap">답변 대기</button>
          <button className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 whitespace-nowrap">답변 완료</button>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="제목, 작성자 검색"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* 문의 목록 테이블 */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 w-20 text-center">번호</th>
              <th className="px-6 py-3 w-32 text-center">유형</th>
              <th className="px-6 py-3">제목</th>
              <th className="px-6 py-3 w-32 text-center">작성자</th>
              <th className="px-6 py-3 w-32 text-center">날짜</th>
              <th className="px-6 py-3 w-32 text-center">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inquiries.map((inquiry, index) => (
              <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 text-center text-gray-500">{index + 1}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                    {inquiry.type || '일반'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 mb-0.5">{inquiry.title}</div>
                  <div className="text-gray-400 text-xs truncate max-w-md">{inquiry.content}</div>
                </td>
                <td className="px-6 py-4 text-center text-gray-700">{inquiry.authorName}</td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-center">
                  {inquiry.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> 대기중
                    </span>
                  ) : inquiry.status === 'answered' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> 답변완료
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      종료됨
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
          <div className="flex gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-50 text-gray-500 text-xs">«</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-[#2271b1] text-white text-xs font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-50 text-gray-700 text-xs">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-50 text-gray-700 text-xs">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-50 text-gray-500 text-xs">»</button>
          </div>
        </div>
      </div>
    </div>
  );
}
