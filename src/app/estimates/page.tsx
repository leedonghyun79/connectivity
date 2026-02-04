'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, FileText, CheckCircle, Clock, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import { getEstimates, getEstimateStats, deleteEstimate } from '@/lib/actions';
import EstimateModal from '@/components/modals/EstimateModal';
import EstimateDetailModal from '@/components/modals/EstimateDetailModal';
import { toast } from 'sonner';
import DataTable from '@/components/common/DataTable';

export default function EstimatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAmount: '0', pending: 0, approved: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingEstimate, setEditingEstimate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // 메뉴 및 필터 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId && !(event.target as Element).closest('.action-menu')) {
        setActiveMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const filteredEstimates = estimates.filter(estimate => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (estimate.title?.toLowerCase() || '').includes(term) ||
      (estimate.customer?.name?.toLowerCase() || '').includes(term) ||
      (estimate.estimateNum?.toLowerCase() || '').includes(term) ||
      (estimate.id?.toLowerCase() || '').includes(term);

    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchData = async () => {
    setIsLoading(true);
    const [data, statData] = await Promise.all([
      getEstimates(),
      getEstimateStats()
    ]);
    setEstimates(data);
    setStats(statData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (estimate: any) => {
    setSelectedEstimate(estimate);
    setIsDetailOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('정말로 이 견적서를 삭제하시겠습니까?')) return;

    setActiveMenuId(null);
    const result = await deleteEstimate(id);
    if (result.success) {
      toast.success('견적서가 삭제되었습니다.');
      fetchData();
    } else {
      toast.error(result.error);
    }
  };

  const handleEdit = (e: React.MouseEvent, estimate: any) => {
    e.stopPropagation();
    setActiveMenuId(null);
    setEditingEstimate(estimate);
    setIsModalOpen(true);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  if (isLoading) return <PageLoader />;
  if (!estimates) return <div>데이터를 불러오지 못했습니다.</div>;

  return (
    <div className="space-y-10 py-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">문서 관리 시스템</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">견적서 관리</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <FileText size={14} />
            발행된 견적서를 관리하고 새로운 견적서를 작성합니다.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} />
            신규 견적서 작성
          </button>
        </div>
      </div>

      <EstimateModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEstimate(null);
        }}
        onSuccess={fetchData}
        editData={editingEstimate}
      />

      <EstimateDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        estimate={selectedEstimate}
      />

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">총 가치 평가</span>
            <FileText size={20} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">
            {Number(stats.totalAmount).toLocaleString()} <span className="text-[10px] text-gray-400">KRW</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">승인 대기</span>
            <Clock size={20} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.pending} <span className="text-[10px] text-gray-400">건</span></p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">최종 승인</span>
            <CheckCircle size={20} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.approved} <span className="text-[10px] text-gray-400">건</span></p>
        </div>
        <div className="bg-black p-8 rounded-[32px]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">전체 발행 수</span>
          </div>
          <p className="text-3xl font-black text-white tracking-tighter">{filteredEstimates.length} <span className="text-[10px] text-gray-500">
            {statusFilter === 'all' ? '전체' : '검색됨'}
          </span></p>
          <div className="mt-3 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/3"></div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between">
        <div className="relative w-full sm:w-[480px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-all" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="견적서 번호, 고객명 또는 프로젝트명 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold transition-all"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border
              ${isFilterOpen || statusFilter !== 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:text-black hover:border-black'}`}
          >
            <Filter size={18} />
            {statusFilter === 'all' ? '상세 검색 필터' :
              statusFilter === 'pending' ? '필터: 대기 중' :
                statusFilter === 'sent' ? '필터: 발송됨' :
                  statusFilter === 'approved' ? '필터: 승인됨' :
                    statusFilter === 'rejected' ? '필터: 거절됨' : '상세 검색 필터'}
          </button>

          {/* 필터 드롭다운 */}
          {isFilterOpen && (
            <div
              className="absolute right-0 top-full mt-4 w-64 bg-white border border-gray-100 rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.12)] z-40 p-6 animate-in fade-in slide-in-from-top-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">상태별 보기</div>
              <div className="space-y-2">
                {[
                  { id: 'all', label: '전체 견적서 보기' },
                  { id: 'pending', label: '대기 중 (Pending)' },
                  { id: 'sent', label: '발송됨 (Sent)' },
                  { id: 'approved', label: '승인됨 (Approved)' },
                  { id: 'rejected', label: '거절됨 (Rejected)' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setStatusFilter(option.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full px-5 py-3 text-left rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
                      ${statusFilter === option.id ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-black'}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-50 my-6"></div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setIsFilterOpen(false);
                }}
                className="w-full py-3 text-center text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                필터 초기화
              </button>
            </div>
          )}
        </div>
      </div>

      <DataTable
        data={filteredEstimates}
        noDataIcon={<FileText size={64} />}
        noDataMessage="등록된 견적서가 없습니다."
        onRowClick={handleRowClick}
        columns={[
          {
            header: '참조번호',
            className: 'px-10 py-8 font-mono font-bold text-gray-400 group-hover:text-black transition-colors',
            cell: (estimate) => estimate.estimateNum || estimate.id.substring(0, 8).toUpperCase()
          },
          {
            header: '프로젝트 / 고객사',
            className: 'px-10 py-8',
            cell: (estimate) => (
              <>
                <div className="font-black text-xl text-gray-900 mb-0.5 group-hover:translate-x-1 transition-transform">{estimate.title}</div>
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">
                  {estimate.customer?.name || estimate.customerName || '고객 정보 없음'}
                </div>
              </>
            )
          },
          {
            header: '금액',
            className: 'px-10 py-8 text-right font-black text-gray-900 text-2xl tracking-tighter',
            cell: (estimate) => (
              <>
                {Number(estimate.amount).toLocaleString()} <span className="text-sm text-gray-300">₩</span>
              </>
            )
          },
          {
            header: '상태',
            className: 'px-10 py-8 text-center',
            cell: (estimate) => (
              <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                ${estimate.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                  estimate.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    estimate.status === 'approved' ? 'bg-black text-white border-black' :
                      'bg-red-50 text-red-600 border-red-100'}`}>
                {estimate.status === 'pending' ? '대기 중' :
                  estimate.status === 'sent' ? '발송됨' :
                    estimate.status === 'approved' ? '승인됨' : '거절됨'}
              </span>
            )
          },
          {
            header: '발행일',
            className: 'px-10 py-8 text-center text-gray-400 font-mono text-xs font-bold',
            cell: (estimate) => estimate.issueDate ? new Date(estimate.issueDate).toLocaleDateString('ko-KR') : '-'
          },
          {
            header: '',
            className: 'px-10 py-8 text-center relative action-menu w-24',
            cell: (estimate) => (
              <>
                <button
                  onClick={(e) => toggleMenu(e, estimate.id)}
                  className={`p-3 rounded-2xl transition-all ${activeMenuId === estimate.id ? 'bg-black text-white' : 'text-gray-300 hover:text-black hover:bg-gray-100'}`}
                >
                  <MoreHorizontal size={20} />
                </button>

                {activeMenuId === estimate.id && (
                  <div className="absolute right-10 top-16 w-36 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={(e) => handleEdit(e, estimate)}
                      className="w-full px-4 py-3 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black flex items-center gap-2"
                    >
                      <Edit size={14} /> 수정하기
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, estimate.id)}
                      className="w-full px-4 py-3 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> 삭제하기
                    </button>
                  </div>
                )}
              </>
            )
          }
        ]}
      />
    </div>
  );
}
