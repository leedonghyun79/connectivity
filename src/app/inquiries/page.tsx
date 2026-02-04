'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, MessageCircle, AlertCircle, CheckCircle2, MoreHorizontal, ArrowUpRight, MessageSquare } from 'lucide-react';
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
    <div className="space-y-10 py-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">커뮤니케이션 채널</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">문의 게시판</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <MessageSquare size={14} className="text-black" />
            고객의 목소리를 분석하고 관리합니다. <span className="text-black uppercase">활성 지원 데스크</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 flex items-center gap-2">
            시스템 설정
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group hover:bg-black hover:text-white transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-500">답변 대기 중</p>
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white/10 group-hover:text-white transition-colors">
              <AlertCircle size={20} className="text-gray-300 group-hover:text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.pending}<span className="text-[10px] font-bold text-gray-300 ml-2 uppercase group-hover:text-gray-500 tracking-widest">건</span></p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group hover:bg-black hover:text-white transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-500">해결된 아카이브</p>
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white/10 group-hover:text-white transition-colors">
              <CheckCircle2 size={20} className="text-gray-300 group-hover:text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.answered}<span className="text-[10px] font-bold text-gray-300 ml-2 uppercase group-hover:text-gray-500 tracking-widest">전체 해결</span></p>
        </div>

        <div className="bg-black p-8 rounded-[32px] shadow-2xl shadow-black/10 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">전체 통합 수량</p>
            <MessageCircle size={20} className="text-gray-600" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-white tracking-tighter">{stats.total}</p>
            <div className="w-12 h-1 bg-white/20 rounded-full mb-3"></div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 바 */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-black text-white shadow-lg shadow-black/10">전체 로그</button>
          <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-300 hover:text-black transition-all">답변 대기</button>
          <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white border border-gray-100 text-gray-300 hover:text-black transition-all">해결 완료</button>
        </div>
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-all" size={20} />
          <input
            type="text"
            placeholder="고객 이름 또는 제목으로 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold shadow-sm transition-all"
          />
        </div>
      </div>

      {/* 문의 목록 테이블 */}
      <div className="bg-white border border-gray-100 rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="min-h-[600px] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-24">CID</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 w-32 text-center">유형</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">문의 제목 및 내용</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-40">문의자</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-40">타임스탬프</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-40">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inquiries.map((inquiry, index) => (
                <tr key={inquiry.id} className="hover:bg-gray-50/50 transition-all cursor-pointer group">
                  <td className="px-10 py-8 text-center text-xs font-mono font-bold text-gray-300 group-hover:text-black transition-colors">{index + 1}</td>
                  <td className="px-10 py-8 text-center">
                    <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100">
                      {inquiry.type || '일반'}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-black text-gray-900 group-hover:translate-x-1 transition-transform mb-1">{inquiry.title}</div>
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-tight truncate max-w-sm">{inquiry.content}</div>
                  </td>
                  <td className="px-10 py-8 text-center text-xs font-black text-black uppercase tracking-tight">{inquiry.authorName}</td>
                  <td className="px-10 py-8 text-center text-gray-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                    {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-10 py-8 text-center">
                    {inquiry.status === 'pending' ? (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 bg-orange-50 text-orange-600">
                        답변 대기
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black bg-black text-white shadow-lg shadow-black/10">
                        해결 완료
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            지원 로그 아카이브: <span className="text-black">{inquiries.length} 개의 스레드</span> 탐지됨
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all">이전</button>
            <button className="px-5 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-black/10">1</button>
            <button className="px-5 py-2 bg-white border border-gray-100 text-gray-300 rounded-xl text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all">2</button>
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all">다음</button>
          </div>
        </div>
      </div>
    </div>
  );
}
