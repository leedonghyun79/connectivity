'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Download, Activity, Calendar, ArrowUpRight, Filter, PieChart as PieIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import PageLoader from '@/components/common/PageLoader';
import { getTransactions, getSalesStats } from '@/lib/actions';
import TransactionModal from '@/components/modals/TransactionModal';
import { Plus } from 'lucide-react';

export default function SalesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const [txData, statData] = await Promise.all([
      getTransactions(),
      getSalesStats()
    ]);
    setTransactions(txData);
    setStats(statData);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !stats) return <PageLoader />;

  const COLORS = ['#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#E5E5E5'];
  
  // CSV 다운로드 기능
  const downloadCSV = () => {
    if (transactions.length === 0) {
      toast.error('내보낼 데이터가 없습니다.');
      return;
    }
    
    const headers = ['날짜', '고객사', '서비스', '금액', '상태'];
    const rows = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString('ko-KR'),
      tx.customer?.name || '알 수 없음',
      tx.serviceType || '-',
      tx.amount,
      tx.status === 'completed' ? '정산완료' : '입금대기'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `매출분석_리포트_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('리포트 다운로드가 시작되었습니다.');
  };

  return (
    <div className="space-y-10 py-10">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">금융 재무 분석</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">매출 통계 분석</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <TrendingUp size={14} className="text-black" />
            실시간 재무 지표 및 매출 흐름을 모니터링합니다. <span className="text-black uppercase">2026 회계연도 </span>
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={downloadCSV}
            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-black uppercase tracking-widest hover:bg-black hover:text-white transition-all flex items-center gap-2 active:scale-95">
            <Download size={16} />
            리포트 추출
          </button>
        </div>
      </div>

      {/* 핵심 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="총 매출액"
          value={`${Number(stats.totalRevenue).toLocaleString()}`}
          unit="원"
          trend="전체 누적 매출 흐름"
          icon={DollarSign}
          black
        />
        <MetricCard
          title="정산 완료"
          value={`${stats.completedCount}`}
          unit="건"
          trend="결제 승인 완료"
          icon={TrendingUp}
        />
        <MetricCard
          title="미결제 잔액"
          value={`${stats.pendingCount}`}
          unit="건"
          trend="입금 확인 대기 중"
          icon={CreditCard}
        />
        <MetricCard
          title="거래 활성량"
          value={`${transactions.length}`}
          unit="건"
          trend="전체 거래 로그 데이터"
          icon={Activity}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 월별 매출 그래프 */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] border border-gray-100 h-[480px] flex flex-col group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">기간별 성장</div>
              <h3 className="text-2xl font-black text-black uppercase tracking-tighter">월별 매출 흐름</h3>
            </div>
            <button className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black group-hover:bg-black group-hover:text-white transition-all">
              <ArrowUpRight size={20} />
            </button>
          </div>
          <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center">
            {!stats.monthlySales || stats.monthlySales.every((m: any) => m.amount === 0) ? (
              <div className="flex flex-col items-center gap-2 opacity-20">
                <Activity size={40} />
                <span className="text-[10px] font-black uppercase tracking-widest">수집된 성장 데이터가 없습니다</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                  <RechartsTooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: 'none', color: '#fff', padding: '12px' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
                    labelStyle={{ display: 'none' }}
                  />
                  <Bar dataKey="amount" fill="#000000" radius={[12, 12, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 서비스 비중 차트 */}
        <div className="bg-white p-10 rounded-[40px] border border-gray-100 h-[480px] flex flex-col group">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">자산 구성</div>
              <h3 className="text-2xl font-black text-black uppercase tracking-tighter">서비스 비중</h3>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl text-gray-300 group-hover:text-black transition-all">
              <PieIcon size={20} />
            </div>
          </div>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.serviceDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#000', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '10px' }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 최근 거래 목록 */}
      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden">
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-end">
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">거래 히스토리</div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tighter">전체 거래 내역</h3>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsTransactionModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95">
              <Plus size={16} /> 거래 등록
            </button>
            <button 
              onClick={() => {
                const next: Record<string, 'all' | 'completed' | 'pending'> = {
                  all: 'completed',
                  completed: 'pending',
                  pending: 'all'
                };
                setFilterStatus(next[filterStatus]);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
                ${filterStatus === 'all' ? 'bg-gray-50 text-gray-400' : 'bg-black text-white'}`}>
              <Filter size={16} /> 
              {filterStatus === 'all' ? '결과 필터링' : filterStatus === 'completed' ? '정산 완료만' : '대기 중만'}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">거래 참조 번호</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400">책임 당사자</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-right">거래 금액</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center">상태</th>
                <th className="px-10 py-6 uppercase tracking-[0.2em] text-[10px] font-black text-gray-400 text-center">프로토콜 날짜</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions && transactions.length > 0 ? (
                transactions
                  .filter(tx => filterStatus === 'all' || tx.status === filterStatus)
                  .map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-10 py-8 font-mono font-bold text-gray-300 group-hover:text-black transition-colors">
                      #{tx.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="px-10 py-8">
                      <div className="font-black text-gray-900 uppercase tracking-tight">{tx.customerName || tx.customer?.name}</div>
                    </td>
                    <td className="px-10 py-8 text-right font-black text-black text-lg">
                      {Number(tx.amount).toLocaleString()} <span className="text-xs text-gray-300">₩</span>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                        ${tx.status === 'completed' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                        {tx.status === 'completed' ? '정산 완료' : '대기 중'}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-center text-gray-400 font-mono text-xs font-bold">
                      {new Date(tx.date).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <CreditCard size={40} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">수집된 거래 데이터가 없습니다</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

// 보조 컴포넌트:MetricCard
function MetricCard({ title, value, unit, trend, icon: Icon, black, highlight }: any) {
  return (
    <div className={`p-8 rounded-[32px] border transition-all duration-500 relative overflow-hidden group
        ${black ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-100'}
        ${highlight ? 'border-l-4 border-l-black' : ''}`}>

      <div className="flex justify-between items-start mb-6">
        <div className={`text-[10px] font-black uppercase tracking-widest group-hover:tracking-[0.2em] transition-all ${black ? 'text-gray-500' : 'text-gray-300'}`}>
          {title}
        </div>
        <div className={`p-2 rounded-xl transition-colors ${black ? 'bg-white/10 text-white' : 'bg-gray-50 text-gray-300 group-hover:text-black'}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-3xl font-black tracking-tighter">{value}</div>
        <div className={`text-[10px] font-bold mb-1.5 uppercase tracking-widest ${black ? 'text-gray-500' : 'text-gray-300'}`}>
          {unit}
        </div>
      </div>
      <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${black ? 'text-gray-600' : 'text-gray-400'}`}>{trend}</p>
    </div>
  );
}
