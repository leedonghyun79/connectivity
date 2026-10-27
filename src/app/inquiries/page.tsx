'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MessageCircle, AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import Pagination, { PAGE_SIZE } from '@/components/common/Pagination';
import { getInquiries, getInquiryStats } from '@/lib/actions';
import InquiryDetailModal from '@/components/modals/InquiryDetailModal';
import { formatDot } from '@/lib/dateFormat';

type FilterTab = 'all' | 'pending' | 'answered';

export default function InquiriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, answered: 0 });
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // 필터 드롭메뉴 바깥을 누르면 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
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

  // 대시보드 최근 문의에서 ?id= 로 들어오면 해당 문의 상세 모달을 연다
  useEffect(() => {
    if (isLoading || inquiries.length === 0) return;
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    const target = inquiries.find(item => item.id === id);
    if (target) handleRowClick(target);
    window.history.replaceState({}, '', '/inquiries');
  }, [isLoading, inquiries]);

  // 검색·탭이 바뀌면 첫 페이지로
  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / PAGE_SIZE));
  const pageInquiries = filteredInquiries.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <PageLoader title="문의 게시판" variant="inquiries" />;

  return (
    <div className="space-y-4 pt-0 pb-10">
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

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-8 rounded-[8px] border border-[#D1D5DB] group hover:bg-black hover:text-white transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest group-hover:text-gray-500">답변 대기 중</p>
            <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white/10 transition-colors">
              <AlertCircle size={20} className="text-[#4B5563] group-hover:text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tracking-tighter">
            {stats.pending}<span className="text-[10px] font-bold text-[#4B5563] ml-2 uppercase group-hover:text-gray-500 tracking-widest">건</span>
          </p>
        </div>

        <div className="bg-white p-8 rounded-[8px] border border-[#D1D5DB] group hover:bg-black hover:text-white transition-all duration-500">
          <div className="flex justify-between items-start mb-6">
            <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest group-hover:text-gray-500">해결 완료</p>
            <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white/10 transition-colors">
              <CheckCircle2 size={20} className="text-[#4B5563] group-hover:text-white" />
            </div>
          </div>
          <p className="text-4xl font-black tracking-tighter">
            {stats.answered}<span className="text-[10px] font-bold text-[#4B5563] ml-2 uppercase group-hover:text-gray-500 tracking-widest">건 완료</span>
          </p>
        </div>

        <div className="bg-black p-8 rounded-[8px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">총 문의 건수</p>
            <MessageCircle size={20} className="text-gray-600" />
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-white tracking-tighter">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 탭 */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-start !mt-[30px]">
        {/* 검색 */}
        <div className="relative w-full sm:w-[480px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] group-focus-within:text-[#060606] transition-all" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="제목, 문의자 이름으로 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-[#D1D5DB] rounded-[8px] focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold transition-all"
          />
        </div>

        {/* 상태 필터 */}
        <div className="relative shrink-0" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[8px] text-[11px] font-black uppercase tracking-widest transition-all border
              ${isFilterOpen || activeTab !== 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-[#D1D5DB] hover:text-[#060606] hover:border-black'}`}
          >
            <Filter size={18} />
            {activeTab === 'all' ? '상세 검색 필터' : `필터: ${activeTab === 'pending' ? '답변 대기' : '해결 완료'}`}
          </button>

          {isFilterOpen && (
            <div className="absolute left-0 top-full mt-4 w-64 bg-white border border-[#D1D5DB] rounded-[8px] shadow-[0_40px_80px_rgba(0,0,0,0.12)] z-40 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest mb-4">상태별 보기</div>
              <div className="space-y-2">
                {([
                  { id: 'all', label: '전체 보기' },
                  { id: 'pending', label: '답변 대기' },
                  { id: 'answered', label: '해결 완료' },
                ] as { id: FilterTab; label: string }[]).map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setActiveTab(option.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest rounded-[8px] transition-colors ${
                      activeTab === option.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 문의 목록 테이블 */}
      <div className="bg-white border border-[#D1D5DB] rounded-[8px] overflow-hidden">
        <div className="min-h-[600px] overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#D1D5DB] h-[65px]">
                <th className="px-10 !py-0 align-middle uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-left w-24">번호</th>
                <th className="px-10 !py-0 align-middle uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 w-32 text-left">유형</th>
                <th className="px-10 !py-0 align-middle uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">문의 제목 및 내용</th>
                <th className="px-10 !py-0 align-middle uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-left w-40">문의자</th>
                <th className="px-10 !py-0 align-middle uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-left w-40">작성일</th>
                <th className="px-10 !py-0 align-middle uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-left w-40">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInquiries.length > 0 ? (
                pageInquiries.map((inquiry, index) => (
                  <tr
                    key={inquiry.id}
                    onClick={() => handleRowClick(inquiry)}
                    className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                  >
                    <td className="px-10 py-8 text-left text-xs font-mono font-bold text-[#4B5563] group-hover:text-[#060606] transition-colors">{index + 1}</td>
                    <td className="px-10 py-8 text-left">
                      <span className="text-base font-bold text-gray-900">
                        {inquiry.type || '일반'}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 group-hover:translate-x-1 transition-transform mb-1">{inquiry.title}</div>
                      <div className="text-gray-400 text-[10px] font-bold uppercase tracking-tight truncate max-w-sm">{inquiry.content}</div>
                    </td>
                    <td className="px-10 py-8 text-left text-xs font-black text-[#060606] uppercase tracking-tight">
                      {inquiry.authorName || inquiry.customer?.name || '익명'}
                    </td>
                    <td className="px-10 py-8 text-left text-gray-400 font-mono text-[10px] font-bold uppercase tracking-widest">
                      {formatDot(inquiry.createdAt)}
                    </td>
                    <td className="px-10 py-8 text-left">
                      {inquiry.status === 'pending' ? (
                        <span className="inline-flex items-center whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200 bg-gray-100 text-[#060606]">
                          답변 대기
                        </span>
                      ) : (
                        <span className="inline-flex items-center whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-black bg-black text-white">
                          해결 완료
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-left">
                    <div className="flex flex-col items-center gap-4 text-[#D1D5DB]">
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
        <div className="px-10 py-8 border-t border-[#D1D5DB] bg-gray-50/30 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            총 <span className="text-[#060606]">{filteredInquiries.length}개</span>의 문의 내역이 있습니다.
          </span>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
