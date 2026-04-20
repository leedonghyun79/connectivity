'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerById, deleteCustomer } from '@/lib/actions';
import PageLoader from '@/components/common/PageLoader';
import CustomerModal from '@/components/modals/CustomerModal';
import { toast } from 'sonner';
import {
  ArrowLeft, Users, Edit2, Trash2, FileText,
  Banknote, MessageSquare, FolderOpen, Phone,
  Mail, Building2, MapPin, CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ConfirmModal from '@/components/common/ConfirmModal';

const statusLabel: Record<string, string> = {
  pending: '대기', processing: '진행 중', closed: '완료',
};
const statusStyle: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-600 border-orange-100',
  processing: 'bg-black text-white border-black',
  closed: 'bg-gray-50 text-gray-400 border-gray-200',
};
const projectStatusLabel: Record<string, string> = {
  PENDING: '대기', PROGRESS: '진행', REST: '일시정지', COMPLETED: '완료',
};
const projectStatusStyle: Record<string, string> = {
  PENDING: 'bg-orange-50 text-orange-600 border-orange-100',
  PROGRESS: 'bg-black text-white border-black',
  REST: 'bg-gray-50 text-gray-400 border-gray-200',
  COMPLETED: 'bg-gray-100 text-gray-500 border-gray-200',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'estimates' | 'transactions' | 'inquiries'>('projects');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const data = await getCustomerById(id);
    if (!data) {
      toast.error('고객 정보를 찾을 수 없습니다.');
      router.push('/customers/page/1');
      return;
    }
    setCustomer(data);
    setIsLoading(false);
  }, [id, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    const res = await deleteCustomer(id);
    if (res.success) {
      toast.success('고객이 삭제되었습니다.');
      router.push('/customers/page/1');
    } else {
      toast.error(res.error || '삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) return <PageLoader />;
  if (!customer) return null;

  const tabs = [
    { id: 'projects', label: '프로젝트', count: customer.projects.length, icon: FolderOpen },
    { id: 'estimates', label: '견적서', count: customer.estimates.length, icon: FileText },
    { id: 'transactions', label: '거래 내역', count: customer.transactions.length, icon: Banknote },
    { id: 'inquiries', label: '문의', count: customer.inquiries.length, icon: MessageSquare },
  ] as const;

  return (
    <div className="space-y-10 py-10 animate-in fade-in duration-700">
      {/* 편집 모달 */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        customer={customer}
        isReadOnly={false}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="고객 정보 삭제"
        message={`'${customer?.name}' 고객 정보를 삭제하시겠습니까?\n연관된 프로젝트, 견적서, 거래 내역이 모두 함께 영구 삭제됩니다.`}
        confirmText="삭제하기"
        type="danger"
      />

      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <Link
            href="/customers/page/1"
            className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors mb-4"
          >
            <ArrowLeft size={12} />
            고객 목록으로 돌아가기
          </Link>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">고객 상세 프로파일</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">{customer.name}</h1>
          {customer.company && (
            <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
              <Building2 size={14} className="text-black" />
              {customer.company}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[11px] font-black text-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 active:scale-95"
          >
            <Edit2 size={14} />
            정보 수정
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-white border border-red-100 rounded-2xl text-[11px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 transition-all flex items-center gap-2 active:scale-95"
          >
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>

      {/* 기본 정보 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 상태 */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">고객 상태</div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border ${statusStyle[customer.status] || ''}`}>
            {statusLabel[customer.status] || customer.status}
          </span>
        </div>

        {/* 연락처 */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">연락처</div>
          <div className="space-y-2">
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                <Phone size={13} className="text-gray-400" />
                {customer.phone}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 truncate">
                <Mail size={13} className="text-gray-400" />
                {customer.email}
              </div>
            )}
            {!customer.phone && !customer.email && (
              <div className="text-sm font-bold text-gray-300">정보 없음</div>
            )}
          </div>
        </div>

        {/* 총 매출 */}
        <div className="bg-black p-8 rounded-[32px]">
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">총 거래 금액</div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {customer.transactions.reduce((sum: number, tx: any) => sum + Number(tx.amount), 0).toLocaleString()}
          </div>
          <div className="text-[10px] font-bold text-gray-600 mt-1 uppercase tracking-widest">KRW</div>
        </div>

        {/* 등록일 */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100">
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">등록일</div>
          <div className="text-lg font-black text-black font-mono">
            {new Date(customer.createdAt).toLocaleDateString('ko-KR')}
          </div>
          <div className="text-[10px] font-bold text-gray-400 mt-1">
            {Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))}일 경과
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-gray-100 pb-0 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-400 hover:text-black'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                activeTab === tab.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden">
        {/* 프로젝트 탭 */}
        {activeTab === 'projects' && (
          customer.projects.length === 0 ? (
            <EmptyState icon={<FolderOpen size={48} />} message="연결된 프로젝트가 없습니다." />
          ) : (
            <div className="divide-y divide-gray-50">
              {customer.projects.map((project: any) => (
                <div key={project.id} className="px-10 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-all group">
                  <div>
                    <div className="font-black text-gray-900 group-hover:translate-x-0.5 transition-transform">{project.title}</div>
                    {project.description && (
                      <div className="text-[11px] font-bold text-gray-400 mt-1">{project.description}</div>
                    )}
                    <div className="text-[10px] font-mono text-gray-300 mt-1">
                      {project.startDate && new Date(project.startDate).toLocaleDateString('ko-KR')}
                      {project.endDate && ` → ${new Date(project.endDate).toLocaleDateString('ko-KR')}`}
                    </div>
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${projectStatusStyle[project.status] || ''}`}>
                    {projectStatusLabel[project.status] || project.status}
                  </span>
                </div>
              ))}
            </div>
          )
        )}

        {/* 견적서 탭 */}
        {activeTab === 'estimates' && (
          customer.estimates.length === 0 ? (
            <EmptyState icon={<FileText size={48} />} message="발행된 견적서가 없습니다." />
          ) : (
            <div className="divide-y divide-gray-50">
              {customer.estimates.map((est: any) => (
                <div key={est.id} className="px-10 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                  <div>
                    <div className="font-black text-gray-900">{est.title}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      {est.estimateNum || est.id.substring(0, 8).toUpperCase()} · {est.issueDate && new Date(est.issueDate).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black text-black tracking-tighter">
                      {Number(est.amount).toLocaleString()} <span className="text-xs text-gray-300">₩</span>
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                      est.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      est.status === 'approved' ? 'bg-black text-white border-black' :
                      est.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {est.status === 'pending' ? '대기' : est.status === 'approved' ? '승인' : est.status === 'sent' ? '발송' : '거절'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 거래 내역 탭 */}
        {activeTab === 'transactions' && (
          customer.transactions.length === 0 ? (
            <EmptyState icon={<Banknote size={48} />} message="거래 내역이 없습니다." />
          ) : (
            <div className="divide-y divide-gray-50">
              {customer.transactions.map((tx: any) => (
                <div key={tx.id} className="px-10 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                  <div>
                    <div className="font-black text-gray-900 font-mono text-sm">#{tx.id.substring(0, 8).toUpperCase()}</div>
                    <div className="text-[10px] text-gray-400 font-bold mt-1">
                      {tx.serviceType || '서비스 미분류'} · {new Date(tx.date).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black text-black tracking-tighter">
                      {Number(tx.amount).toLocaleString()} <span className="text-xs text-gray-300">₩</span>
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                      tx.status === 'completed' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-200'
                    }`}>
                      {tx.status === 'completed' ? '정산 완료' : '대기 중'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* 문의 탭 */}
        {activeTab === 'inquiries' && (
          customer.inquiries.length === 0 ? (
            <EmptyState icon={<MessageSquare size={48} />} message="등록된 문의가 없습니다." />
          ) : (
            <div className="divide-y divide-gray-50">
              {customer.inquiries.map((inq: any) => (
                <div key={inq.id} className="px-10 py-6 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-gray-900 truncate">{inq.title}</div>
                    <div className="text-[11px] text-gray-400 font-bold mt-1 truncate">{inq.content}</div>
                    <div className="text-[10px] font-mono text-gray-300 mt-1">
                      {new Date(inq.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                  <span className={`ml-4 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border flex-shrink-0 ${
                    inq.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-black text-white border-black'
                  }`}>
                    {inq.status === 'pending' ? '답변 대기' : '해결 완료'}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="py-32 flex flex-col items-center gap-4 opacity-10">
      {icon}
      <p className="text-sm font-black uppercase tracking-[0.2em]">{message}</p>
    </div>
  );
}
