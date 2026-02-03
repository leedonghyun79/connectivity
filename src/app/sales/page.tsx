'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Download, Activity, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import PageLoader from '@/components/common/PageLoader';
import { getTransactions, getSalesStats } from '@/lib/actions';

export default function SalesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      const [txData, statData] = await Promise.all([
        getTransactions(),
        getSalesStats()
      ]);
      setTransactions(txData);
      setStats(statData);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading || !stats) return <PageLoader />;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const serviceShareData = [
    { name: '웹 개발', value: 45 },
    { name: '앱 개발', value: 25 },
    { name: '디자인', value: 15 },
    { name: '유지보수', value: 15 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매출 분석</h1>
          <p className="text-sm text-gray-500 mt-1">회사의 주요 재무 지표와 매출 현황을 분석합니다.</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Download size={16} />
          리포트 다운로드
        </button>
      </div>

      {/* 1. 핵심 지표 카드 - 실시간 데이터 연동 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="총 누적 매출"
          value={`${Number(stats.totalRevenue).toLocaleString()}원`}
          trend="누적 합계"
          trendUp={true}
          icon={DollarSign}
          color="blue"
        />
        <MetricCard
          title="결제 완료"
          value={`${stats.completedCount}건`}
          trend="현재 완료"
          trendUp={true}
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="결제 대기"
          value={`${stats.pendingCount}건`}
          trend="미결제건"
          trendUp={false}
          icon={CreditCard}
          color="orange"
        />
        <MetricCard
          title="최근 거래"
          value={`${transactions.length}건`}
          trend="전체 거래"
          trendUp={true}
          icon={Activity}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. 월별 매출 그래프 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">최근 매출 추이</h3>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <RechartsTooltip
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. 서비스 비중 차트 */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
          <h3 className="text-lg font-bold text-gray-900 mb-6">서비스별 비중</h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. 최근 거래 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">최근 거래 내역 (실시간)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-medium">거래 ID</th>
                <th className="px-6 py-4 font-medium">고객사</th>
                <th className="px-6 py-4 font-medium">금액</th>
                <th className="px-6 py-4 font-medium text-center">상태</th>
                <th className="px-6 py-4 font-medium text-center">거래일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-700">{tx.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 text-gray-600">{tx.customerName || tx.customer?.name}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{Number(tx.amount).toLocaleString()}원</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                      {tx.status === 'completed' ? '완료' : '대기'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-gray-500">
                    {new Date(tx.date).toLocaleDateString()}
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

// 보조 컴포넌트:MetricCard
function MetricCard({ title, value, trend, trendUp, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-2">{trend}</p>
      </div>
    </div>
  );
}
