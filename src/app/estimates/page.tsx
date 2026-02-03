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
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      {/* ... (No changes here) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">견적서 관리</h1>
          <p className="text-sm text-gray-500 mt-1">발행된 견적서를 관리하고 새로운 견적서를 작성합니다.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95 flex items-center gap-2"
        >
          <Plus size={16} />
          견적서 작성
        </button>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-black">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Valuation</span>
            <FileText size={18} className="text-gray-300" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {Number(stats.totalAmount).toLocaleString()} <span className="text-xs text-gray-400">KRW</span>
          </p>
        </div>
        {/* ... (Other cards updated to match black theme) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending</span>
            <Clock size={18} className="text-gray-300" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.pending} <span className="text-xs text-gray-400">CASES</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Approved</span>
            <CheckCircle size={18} className="text-gray-300" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.approved} <span className="text-xs text-gray-400">CASES</span></p>
        </div>
        <div className="bg-black p-6 rounded-2xl shadow-xl shadow-black/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Published</span>
          </div>
          <p className="text-2xl font-black text-white">{estimates.length} <span className="text-xs text-gray-500">TOTAL</span></p>
          <div className="mt-2 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/3"></div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="견적서 번호, 고객명 검색"
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-black/5 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-gray-100 rounded-xl text-sm bg-white font-bold outline-none cursor-pointer hover:bg-gray-50">
            <option>All Status</option>
            <option>Pending</option>
            <option>Sent</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#fafafa] text-gray-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-8 py-4 uppercase tracking-widest text-[10px]">Reference</th>
                <th className="px-8 py-4 uppercase tracking-widest text-[10px]">Project / Client</th>
                <th className="px-8 py-4 uppercase tracking-widest text-[10px] text-right">Amount</th>
                <th className="px-8 py-4 uppercase tracking-widest text-[10px] text-center">Status</th>
                <th className="px-8 py-4 uppercase tracking-widest text-[10px] text-center">Issued</th>
                <th className="px-8 py-4 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {estimates.map((estimate) => (
                <tr
                  key={estimate.id}
                  onClick={() => handleRowClick(estimate)}
                  className="hover:bg-gray-50/50 transition-all cursor-pointer group"
                >
                  <td className="px-8 py-6 font-mono font-bold text-gray-400 group-hover:text-black transition-colors">{estimate.estimateNum || estimate.id.substring(0, 8).toUpperCase()}</td>
                  <td className="px-8 py-6">
                    <div className="font-black text-gray-900 mb-0.5">{estimate.title}</div>
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">
                      {estimate.customer?.name || estimate.customerName || 'UNKNOWN CLIENT'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-black text-gray-900 text-lg">
                    {Number(estimate.amount).toLocaleString()} <span className="text-[10px] text-gray-300">₩</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                      ${estimate.status === 'pending' ? 'bg-gray-50 text-gray-400 border-gray-200' :
                        estimate.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          estimate.status === 'approved' ? 'bg-black text-white border-black' :
                            'bg-red-50 text-red-600 border-red-100'}`}>
                      {estimate.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center text-gray-400 font-mono text-xs">
                    {estimate.issueDate ? new Date(estimate.issueDate).toLocaleDateString('ko-KR') : '-'}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <button className="p-2 text-gray-300 hover:text-black transition-colors">
                      <MoreHorizontal size={16} />
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
