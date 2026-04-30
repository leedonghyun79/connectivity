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
    <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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

      {/* 헤더 섹션 - 데코 추가 */}
      <div className="relative group overflow-hidden bg-white p-10 rounded-[40px] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.02)]">
        <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none select-none">
          <div className="text-[120px] font-black italic tracking-tighter leading-none uppercase">IDENTITY</div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div>
            <Link
              href="/customers/page/1"
              className="inline-flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-all mb-6 group/back"
            >
              <ArrowLeft size={12} className="group-hover/back:-translate-x-1 transition-transform" />
              목록으로 복귀
            </Link>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-black rounded-full" />
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">고객 상세 프로파일</div>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none">{customer.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              {customer.company && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-[11px] font-bold text-gray-500">
                  <Building2 size={13} className="text-black" />
                  {customer.company}
                </div>
              )}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border shadow-sm ${statusStyle[customer.status] || ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${customer.status === 'processing' ? 'bg-white animate-pulse' : 'bg-current'}`} />
                {statusLabel[customer.status] || customer.status}
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 md:flex-none px-8 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95"
            >
              <Edit2 size={14} />
              프로필 수정
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-4 bg-white border border-red-100 rounded-2xl text-red-500 hover:bg-red-50 transition-all active:scale-95 group/del"
              title="삭제"
            >
              <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 정보 메트릭스 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 연락처 & 채널 */}
        <div className="md:col-span-1 bg-white p-10 rounded-[40px] border border-gray-100 relative overflow-hidden group">
          <Phone className="absolute -bottom-6 -right-6 text-gray-50 opacity-[0.05] group-hover:scale-110 transition-transform duration-700" size={140} />
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-8 border-b pb-4">커뮤니케이션 채널</h3>
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">대표 연락처</label>
              <div className="flex items-center gap-3 text-lg font-black text-black">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Phone size={14} />
                </div>
                {customer.phone || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">이메일 주소</label>
              <div className="flex items-center gap-3 text-sm font-black text-black truncate">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                  <Mail size={14} />
                </div>
                {customer.email || 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* 재무 요약 */}
        <div className="md:col-span-1 bg-black p-10 rounded-[40px] shadow-2xl shadow-black/20 relative overflow-hidden group">
          <Banknote className="absolute -bottom-6 -right-6 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-700" size={140} />
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">누적 비즈니스 가치</h3>
          <div className="relative z-10">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Revenue</div>
            <div className="text-5xl font-black text-white tracking-tighter leading-none mb-2">
              {(customer.transactions || []).reduce((sum: number, tx: any) => sum + Number(tx.amount), 0).toLocaleString()}
            </div>
            <div className="text-[11px] font-black text-gray-500 uppercase tracking-widest">KRW</div>
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end">
              <div>
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">거래 횟수</div>
                <div className="text-xl font-black text-white">{(customer.transactions || []).length}건</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">최근 거래</div>
                <div className="text-[11px] font-bold text-gray-400">
                  {customer.transactions?.[0] ? new Date(customer.transactions[0].date).toLocaleDateString() : '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 라이프사이클 */}
        <div className="md:col-span-1 bg-white p-10 rounded-[40px] border border-gray-100 relative overflow-hidden group">
          <Clock className="absolute -bottom-6 -right-6 text-gray-50 opacity-[0.05] group-hover:scale-110 transition-transform duration-700" size={140} />
          <h3 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-8 border-b pb-4">파트너십 타임라인</h3>
          <div className="space-y-6 relative z-10">
            <div>
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">최초 등록일</label>
              <div className="text-2xl font-black text-black font-mono tracking-tighter">
                {new Date(customer.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">협력 기간</div>
                <div className="text-sm font-black text-black">
                  {Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24))}일째
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">활동 점수</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 3 ? 'bg-black' : 'bg-gray-100'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 영역 (탭) */}
      <div className="space-y-6">
        <div className="flex items-center gap-8 border-b border-gray-100 px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-6 flex items-center gap-3 transition-all group
                  ${isActive ? 'text-black' : 'text-gray-300 hover:text-gray-500'}`}
              >
                <Icon size={16} className={isActive ? 'text-black' : 'text-gray-200 group-hover:text-gray-400'} />
                <span className="text-[12px] font-black uppercase tracking-widest">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full transition-colors
                    ${isActive ? 'bg-black text-white' : 'bg-gray-50 text-gray-300 group-hover:bg-gray-100'}`}>
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black animate-in fade-in slide-in-from-bottom-1" />
                )}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-[0_20px_60px_rgba(0,0,0,0.01)] min-h-[400px]">
          {/* 프로젝트 탭 */}
          {activeTab === 'projects' && (
            (customer.projects || []).length === 0 ? (
              <EmptyState icon={<FolderOpen size={48} />} message="연결된 프로젝트 데이터가 없습니다." />
            ) : (
              <div className="divide-y divide-gray-50 p-4">
                {(customer.projects || []).map((project: any) => (
                  <div key={project.id} className="p-8 flex items-center justify-between hover:bg-gray-50/80 rounded-[32px] transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <FolderOpen size={20} />
                      </div>
                      <div>
                        <div className="text-lg font-black text-gray-900">{project.title}</div>
                        {project.description && (
                          <div className="text-[11px] font-bold text-gray-400 mt-1">{project.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Clock size={12} className="text-gray-300" />
                          <span className="text-[10px] font-black text-gray-400 font-mono">
                            {project.startDate ? new Date(project.startDate).toLocaleDateString('ko-KR') : 'N/A'}
                            {project.endDate && ` — ${new Date(project.endDate).toLocaleDateString('ko-KR')}`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${projectStatusStyle[project.status] || ''}`}>
                        {projectStatusLabel[project.status] || project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* 견적서 탭 */}
          {activeTab === 'estimates' && (
            (customer.estimates || []).length === 0 ? (
              <EmptyState icon={<FileText size={48} />} message="발행된 견적서 자산이 없습니다." />
            ) : (
              <div className="divide-y divide-gray-50 p-4">
                {(customer.estimates || []).map((est: any) => (
                  <div key={est.id} className="p-8 flex items-center justify-between hover:bg-gray-50/80 rounded-[32px] transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="text-lg font-black text-gray-900">{est.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-gray-400 font-mono tracking-widest bg-gray-50 px-2 py-0.5 rounded">
                            {est.estimateNum || est.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {est.issueDate && new Date(est.issueDate).toLocaleDateString('ko-KR')} 발행
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Estimated Amount</div>
                        <div className="text-2xl font-black text-black tracking-tighter">
                          {Number(est.amount).toLocaleString()} <span className="text-xs text-gray-300 font-normal ml-1">₩</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                        est.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        est.status === 'approved' ? 'bg-black text-white border-black shadow-lg shadow-black/10' :
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
            (customer.transactions || []).length === 0 ? (
              <EmptyState icon={<Banknote size={48} />} message="확인된 거래 내역이 없습니다." />
            ) : (
              <div className="divide-y divide-gray-50 p-4">
                {(customer.transactions || []).map((tx: any) => (
                  <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-gray-50/80 rounded-[32px] transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                        <Banknote size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-400 font-mono tracking-widest mb-1">TX_{tx.id.substring(0, 8).toUpperCase()}</div>
                        <div className="text-lg font-black text-gray-900">{tx.serviceType || '일반 서비스 정산'}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-1">
                          {new Date(tx.date).toLocaleDateString('ko-KR')} · {new Date(tx.date).toLocaleTimeString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Settled Amount</div>
                        <div className="text-2xl font-black text-blue-600 tracking-tighter">
                          {Number(tx.amount).toLocaleString()} <span className="text-xs text-blue-300 font-normal ml-1">₩</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${
                        tx.status === 'completed' ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                        {tx.status === 'completed' ? '정산 완료' : '진행 중'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* 문의 탭 */}
          {activeTab === 'inquiries' && (
            (customer.inquiries || []).length === 0 ? (
              <EmptyState icon={<MessageSquare size={48} />} message="등록된 CS 인콰이어리가 없습니다." />
            ) : (
              <div className="divide-y divide-gray-50 p-4">
                {(customer.inquiries || []).map((inq: any) => (
                  <div key={inq.id} className="p-8 flex items-center justify-between hover:bg-gray-50/80 rounded-[32px] transition-all group">
                    <div className="flex-1 min-w-0 pr-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${inq.status === 'pending' ? 'bg-orange-400' : 'bg-black'}`} />
                        <div className="text-lg font-black text-gray-900 truncate">{inq.title}</div>
                      </div>
                      <div className="text-[11px] text-gray-400 font-bold line-clamp-1">{inq.content}</div>
                      <div className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-widest">
                        Received at {new Date(inq.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border flex-shrink-0 transition-all ${
                      inq.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-black text-white border-black shadow-lg shadow-black/10'
                    }`}>
                      {inq.status === 'pending' ? 'Action Required' : 'Solved'}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <CustomerModal
        key={`edit-${customer.id}-${isModalOpen}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={customer}
        onSuccess={fetchData}
      />

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="고객 삭제"
        message={`"${customer.name}" 고객 정보를 정말 삭제하시겠습니까? 관련 데이터가 모두 삭제됩니다.`}
        confirmText="삭제하기"
        type="danger"
      />
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-40 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center text-gray-200 mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-300">{message}</p>
    </div>
  );
}
