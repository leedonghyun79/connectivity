'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, CheckCircle, Clock, Plus, MoreHorizontal } from 'lucide-react';
import PageLoader from '@/components/common/PageLoader';
import { getEstimates, getEstimateStats } from '@/lib/actions';
import EstimateModal from '@/components/modals/EstimateModal';
import EstimateDetailModal from '@/components/modals/EstimateDetailModal';

export default function EstimatesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalAmount: '0', pending: 0, approved: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
            className="px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} />
            신규 견적서 작성
          </button>
        </div>
      </div>

      <EstimateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      <EstimateDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        estimate={selectedEstimate}
      />

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">총 가치 평가</span>
            <FileText size={20} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">
            {Number(stats.totalAmount).toLocaleString()} <span className="text-[10px] text-gray-400">KRW</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">승인 대기</span>
            <Clock size={20} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.pending} <span className="text-[10px] text-gray-400">건</span></p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">최종 승인</span>
            <CheckCircle size={20} className="text-gray-300" />
          </div>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{stats.approved} <span className="text-[10px] text-gray-400">건</span></p>
        </div>
        <div className="bg-black p-8 rounded-[32px] shadow-2xl shadow-black/10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">전체 발행 수</span>
          </div>
          <p className="text-3xl font-black text-white tracking-tighter">{estimates.length} <span className="text-[10px] text-gray-500">전체</span></p>
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
            placeholder="견적서 번호, 고객명 또는 프로젝트명 검색..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none text-sm font-bold shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select className="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer hover:border-black transition-all shadow-sm">
            <option>전체 상태</option>
            <option>대기 중</option>
            <option>발송 완료</option>
            <option>승인됨</option>
            <option>거절됨</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-all shadow-sm">
            <Filter size={16} /> 필터링
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.03)] overflow-hidden mb-20">
        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">참조번호</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">프로젝트 / 고객사</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-right">금액</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center">상태</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center">발행일</th>
                <th className="px-10 py-6 text-center w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {estimates.map((estimate) => (
                <tr
                  key={estimate.id}
                  onClick={() => handleRowClick(estimate)}
                  className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                >
                  <td className="px-10 py-8 font-mono font-bold text-gray-400 group-hover:text-black transition-colors">{estimate.estimateNum || estimate.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-10 py-8">
                    <div className="font-black text-xl text-gray-900 mb-0.5 group-hover:translate-x-1 transition-transform">{estimate.title}</div>
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">
                      {estimate.customer?.name || estimate.customerName || '고객 정보 없음'}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right font-black text-gray-900 text-2xl tracking-tighter">
                    {Number(estimate.amount).toLocaleString()} <span className="text-sm text-gray-300">₩</span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                      ${estimate.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        estimate.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          estimate.status === 'approved' ? 'bg-black text-white border-black shadow-lg shadow-black/10' :
                            'bg-red-50 text-red-600 border-red-100'}`}>
                      {estimate.status === 'pending' ? '대기 중' :
                        estimate.status === 'sent' ? '발송됨' :
                          estimate.status === 'approved' ? '승인됨' : '거절됨'}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-center text-gray-400 font-mono text-xs font-bold">
                    {estimate.issueDate ? new Date(estimate.issueDate).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="px-10 py-8 text-center">
                    <button className="p-3 text-gray-300 hover:text-black rounded-2xl hover:bg-gray-100 transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
