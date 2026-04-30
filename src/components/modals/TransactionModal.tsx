'use client';

import { useState, useEffect } from 'react';
import { createTransaction, getCustomers } from '@/lib/actions';
import { toast } from 'sonner';
import { X, DollarSign, User, Briefcase, Calendar, CheckCircle2 } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serviceType: '',
    amount: '',
    customerId: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'completed' as 'pending' | 'completed',
  });

  useEffect(() => {
    if (isOpen) {
      async function fetchCustomers() {
        const data = await getCustomers();
        setCustomers(data);
      }
      fetchCustomers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serviceType || !formData.amount) {
      toast.error('필수 항목을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const selectedCustomer = customers.find(c => c.id === formData.customerId);
      const res = await createTransaction({
        serviceType: formData.serviceType,
        amount: Number(formData.amount),
        customerId: formData.customerId || undefined,
        customerName: selectedCustomer ? selectedCustomer.name : formData.customerName,
        date: new Date(formData.date),
        status: formData.status,
      });

      if (res.success) {
        toast.success('거래 내역이 등록되었습니다.');
        onSuccess();
        onClose();
      } else {
        toast.error(res.error || '등록 중 오류가 발생했습니다.');
      }
    } catch (error) {
      toast.error('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        {/* 헤더 */}
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Financial Entry</div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tighter">새 거래 내역 등록</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all group">
            <X size={20} className="text-gray-300 group-hover:text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 서비스 유형 */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Briefcase size={12} /> 서비스 유형
              </label>
              <input
                type="text"
                required
                placeholder="예: 웹사이트 리뉴얼"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-black transition-all"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              />
            </div>

            {/* 거래 금액 */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> 거래 금액 (원)
              </label>
              <input
                type="number"
                required
                placeholder="0"
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-black transition-all"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

            {/* 고객 선택 */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> 고객 선택
              </label>
              <select
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-black transition-all appearance-none"
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value, customerName: '' })}
              >
                <option value="">고객 선택 (또는 직접 입력)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company || '개인'})</option>
                ))}
              </select>
            </div>

            {/* 직접 입력 (고객 선택 안했을 때) */}
            {!formData.customerId && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> 고객명 직접 입력
                </label>
                <input
                  type="text"
                  placeholder="비회원 고객명"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-black transition-all"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>
            )}

            {/* 거래 일자 */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> 거래 일자
              </label>
              <input
                type="date"
                required
                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-black transition-all"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            {/* 상태 선택 */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={12} /> 정산 상태
              </label>
              <div className="flex gap-2">
                {(['completed', 'pending'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all
                      ${formData.status === s 
                        ? 'bg-black text-white' 
                        : 'bg-gray-50 text-gray-300 hover:text-gray-500'}`}
                  >
                    {s === 'completed' ? '정산 완료' : '입금 대기'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-black text-white rounded-3xl text-[13px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? '저장 중...' : '거래 내역 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
