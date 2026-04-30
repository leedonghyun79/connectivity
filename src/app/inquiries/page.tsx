'use client';

import { useState, useEffect } from 'react';
import { Search, MessageCircle, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import { getInquiries, getInquiryStats } from '@/lib/actions';
import InquiryDetailModal from '@/components/modals/InquiryDetailModal';

type FilterTab = 'all' | 'pending' | 'answered';

export default function InquiriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const [data, statData] = await Promise.all([
      getInquiries(),
      getInquiryStats()
    ]);
    setInquiries(data);
    setStats(statData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 필터 + 검색 적용
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && inquiry.status === 'pending') ||
      (activeTab === 'answered' && inquiry.status === 'answered');

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      inquiry.title.toLowerCase().includes(term) ||
      (inquiry.authorName?.toLowerCase() || '').includes(term) ||
      (inquiry.customer?.name?.toLowerCase() || '').includes(term) ||
      (inquiry.content?.toLowerCase() || '').includes(term);

    return matchesTab && matchesSearch;
  });

  const handleRowClick = (inquiry: any) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-10 py-10">
      {/* 모달 */}
      <InquiryDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInquiry(null);
        }}
        inquiry={selectedInquiry}
        onSuccess={fetchData}
      />

      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">고객 커뮤니케이션</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">문의 게시판</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <MessageSquare size={14} className="text-black" />
            고객님들의 소중한 문의사항을 확인하고 관리합니다. <span className="text-black uppercase">지원 센터</span>
          </p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 group hover:bg-black hover:text-white transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-500">답변 대기 중</p>
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white/10 transition-colors">
              <AlertCircle size={20} className="text-gray-300 group-hover:text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tracking-tighter">
            {stats.pending}<span className="text-[10px] font-bold text-gray-300 ml-2 uppercase group-hover:text-gray-500 tracking-widest">건</span>
          </p>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-gray-100 group hover:bg-black hover:text-white transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-500">해결 완료</p>
            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white/10 transition-colors">
              <CheckCircle2 size={20} className="text-gray-300 group-hover:text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tracking-tighter">
            {stats.answered}<span className="text-[10px] font-bold text-gray-300 ml-2 uppercase group-hover:text-gray-500 tracking-widest">건 완료</span>
          </p>
        </div>

        <div className="bg-black p-8 rounded-[32px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">총 문의 건수</p>
            <MessageCircle size={20} className="text-gray-600" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-white tracking-tighter">{stats.total}</p>
            <div className="w-12 h-1 bg-white/20 rounded-full mb-3"></div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 탭 */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        {/* 필터 탭 */}
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {([
            { id: 'all', label: '전체 보기' },
            { id: 'pending', label: '답변 대기' },
            { id: 'answered', label: '해결 완료' },
          ] as { id: FilterTab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-100 text-gray-300 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 검색 */}
        <div className="relative w-full sm:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-all" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제목, 문의자 이름으로 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold transition-all"
          />
        </div>
      </div>

      {/* 문의 목록 테이블 */}
      <div className="bg-white border border-gray-100 rounded-[40px] overflow-hidden">
        <div className="min-h-[600px] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-24">번호</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 w-32 text-center">유형</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">문의 제목 및 내용</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-40">문의자</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-40">작성일</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center w-40">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry, index) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => handleRowClick(inquiry)}
                    className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                  >
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
                    <td className="px-10 py-8 text-center text-xs font-black text-black uppercase tracking-tight">
                      {inquiry.authorName || inquiry.customer?.name || '익명'}
                    </td>
                    <td className="px-10 py-8 text-center text-gray-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                      {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-10 py-8 text-center">
                      {inquiry.status === 'pending' ? (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-100 bg-orange-50 text-orange-600">
                          답변 대기
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black bg-black text-white">
                          해결 완료
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <MessageSquare size={64} />
                      <p className="text-sm font-black uppercase tracking-[0.3em]">
                        {searchTerm || activeTab !== 'all' ? '검색 결과가 없습니다.' : '등록된 문의 내역이 없습니다.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 푸터 */}
        <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            총 <span className="text-black">{filteredInquiries.length}개</span>의 문의 내역이 있습니다.
          </span>
        </div>
      </div>
    </div>
  );
}
