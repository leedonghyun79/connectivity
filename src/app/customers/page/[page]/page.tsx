'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, MoreHorizontal, Download, Eye, Trash2, XCircle, Edit2, Users, ArrowUpRight, FileText } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import { getCustomers, deleteCustomer } from '@/lib/actions';
import { toast } from 'sonner';
import CustomerModal from '@/components/modals/CustomerModal';
import DataTable, { Column } from '@/components/common/DataTable';

export default function CustomersPage({ params }: { params: { page: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const fetchData = async () => {
    setIsLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setIsLoading(false);
  };

  // 메뉴 및 필터 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 1. 드롭다운 메뉴 닫기 로직
      if (activeMenuId && !(event.target as Element).closest('.action-menu')) {
        setActiveMenuId(null);
      }

      // 2. 필터 닫기 로직
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`'${name}' 고객 정보를 삭제하시겠습니까?`)) {
      const res = await deleteCustomer(id);
      if (res.success) {
        toast.success('삭제되었습니다.');
        fetchData();
      } else {
        toast.error(res.error || '삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsReadOnly(false);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleViewProfile = (customer: any) => {
    setEditingCustomer(customer);
    setIsReadOnly(true);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  if (isLoading) return <PageLoader />;
  if (!customers) return <div>데이터를 불러오지 못했습니다.</div>;

  return (
    <div className="space-y-10 py-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">고객 데이터베이스 관리</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">고객 디렉토리</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Users size={14} />
            현재 총 <span className="text-black">{filteredCustomers.length}</span>명의 핵심 고객이 데이터베이스에 등록되어 있습니다.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95">
            <Download size={16} />
            데이터 추출
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingCustomer(null);
              setIsReadOnly(false);
              setIsModalOpen(true);
            }}
            className="px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all active:scale-95 flex items-center gap-2"
          >
            + 신규 고객 등록
          </button>
        </div>
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={fetchData}
        customer={editingCustomer}
        isReadOnly={isReadOnly}
      />

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">활성 고객</div>
            <div className="p-2 bg-green-50 rounded-lg"><ArrowUpRight size={16} className="text-green-600" /></div>
          </div>
          <div className="text-4xl font-black text-black">84%</div>
          <div className="text-xs font-bold text-gray-400 mt-2">지난 달 기준 +12% 신장</div>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">성장 지표</div>
            <div className="p-2 bg-black rounded-lg text-white font-black text-[10px]">최고치</div>
          </div>
          <div className="text-4xl font-black text-black">A+++</div>
          <div className="text-xs font-bold text-gray-400 mt-2">프리미엄 고객 유지율 안정</div>
        </div>
        <div className="bg-black p-8 rounded-[32px]">
          <div className="flex justify-between items-start mb-6">
            <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">총 가치 평가</div>
            <FileText size={20} className="text-gray-600" />
          </div>
          <div className="text-4xl font-black text-white">4.2B</div>
          <div className="text-xs font-bold text-gray-500 mt-2">통합 프로젝트 수익 흐름</div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-between relative">
        <div className="relative w-full sm:w-[480px] group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={22} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="고객 이름, 회사명 또는 프로젝트 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold transition-all"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
            }}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border
              ${isFilterOpen || statusFilter !== 'all' ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:text-black hover:border-black'}`}
          >
            <Filter size={18} />
            {statusFilter === 'all' ? '상세 검색 필터' : `필터: ${statusFilter === 'pending' ? '대기' : statusFilter === 'processing' ? '진행' : '완료'}`}
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
                  { id: 'all', label: '전체 고객 보기' },
                  { id: 'pending', label: '대기 (Waiting)' },
                  { id: 'processing', label: '진행 (Active)' },
                  { id: 'closed', label: '완료 (Completed)' }
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

      {/* 테이블 */}
      {/* 테이블 */}
      <DataTable
        data={filteredCustomers}
        noDataIcon={<Search size={48} />}
        noDataMessage="일치하는 고객 정보가 없습니다."
        onRowClick={(customer) => {
          // 행 클릭 시 동작이 필요하다면 여기에 추가 (현재는 별도 동작 없음, 관리 버튼만 작동)
          // 기존 코드에서도 tr에 cursor-pointer는 있지만 onClick 핸들러는 없었음 (편집 버튼 등만 존재)
          // 확인해보니 tr에는 onClick이 없고, hover 효과만 있었음. 
          // 하지만 EstimatesPage는 handleRowClick이 있으므로, 여기서는 그냥 undefined로 두거나 빈 함수
        }}
        columns={[
          {
            header: '참조번호',
            className: 'px-10 py-8 font-mono font-bold text-gray-300 group-hover:text-black transition-colors',
            cell: (customer) => `#${customer.id.substring(0, 8).toUpperCase()}`
          },
          {
            header: '고객 정보',
            className: 'px-10 py-8',
            cell: (customer) => (
              <>
                <div className="font-black text-xl text-gray-900 group-hover:translate-x-1 transition-transform">{customer.name}</div>
                <div className="text-gray-400 text-xs font-bold mt-1 uppercase tracking-tight">{customer.email || '이메일 정보 없음'}</div>
              </>
            )
          },
          {
            header: '소속 및 아이덴티티',
            className: 'px-10 py-8',
            cell: (customer) => (
              <>
                <div className="text-gray-900 font-black text-sm uppercase tracking-tight">{customer.company || '개인 고객'}</div>
                <div className="text-gray-400 text-xs font-mono mt-1">{customer.phone}</div>
              </>
            )
          },
          {
            header: '상태 프로필',
            className: 'px-10 py-8 text-center',
            cell: (customer) => (
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border
                ${customer.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                  customer.status === 'processing' ? 'bg-black text-white border-black' :
                    'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {customer.status === 'pending' ? '대기' :
                  customer.status === 'processing' ? '진행' : '완료'}
              </span>
            )
          },
          {
            header: '관리',
            className: 'px-10 py-8 text-center relative action-menu w-24', // action-menu 클래스 유지
            cell: (customer) => (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === customer.id ? null : customer.id);
                  }}
                  className="p-3 text-gray-300 hover:text-black rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                >
                  <MoreHorizontal size={20} />
                </button>

                {/* 드롭다운 메뉴 */}
                {activeMenuId === customer.id && (
                  <div className="absolute right-10 top-20 w-48 bg-white border border-gray-100 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-30 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-2 space-y-1">
                      <button
                        className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-700 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleViewProfile(customer); }}
                      >
                        <Eye size={16} /> 프로필 확인
                      </button>
                      <button
                        className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-black hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleEdit(customer); }}
                      >
                        <Edit2 size={16} /> 정보 수정
                      </button>
                      <div className="h-px bg-gray-50 my-1"></div>
                      <button
                        className="w-full px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                          handleDelete(customer.id, customer.name);
                        }}
                      >
                        <Trash2 size={16} /> 데이터 삭제
                      </button>
                    </div>
                  </div>
                )}
              </>
            )
          }
        ]}
      >
        {/* 푸터 정보 (children으로 전달) */}
        <div className="px-10 py-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            데이터 매칭 결과: <span className="text-black">{filteredCustomers.length} 개의 항목</span>이 안전하게 보관 중입니다.
          </span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all">이전</button>
            <button className="px-5 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase">1</button>
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all">다음</button>
          </div>
        </div>
      </DataTable>
    </div>
  );
}
