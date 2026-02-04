'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, User, Mail, Building2, Phone, Briefcase, ChevronDown, Check } from 'lucide-react';
import { createCustomer, updateCustomer } from '@/lib/actions';
import { toast } from 'sonner';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any;
  isReadOnly?: boolean;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer, isReadOnly = false }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    status: 'pending',
  });
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        company: customer.company || '',
        phone: customer.phone || '',
        status: customer.status || 'pending',
      });
    } else if (!customer && isOpen) {
      setFormData({ name: '', email: '', company: '', phone: '', status: 'pending' });
    }
    setErrors({ email: '', phone: '' });
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', phone: '' };

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
      isValid = false;
    }

    if (formData.phone) {
      const phoneDigits = formData.phone.replace(/[^0-9]/g, '');
      if (!/^01[016789][0-9]{7,8}$/.test(phoneDigits)) {
        newErrors.phone = '올바른 연락처 형식이 아닙니다.';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    let result;
    if (customer) {
      result = await updateCustomer(customer.id, formData);
    } else {
      result = await createCustomer(formData);
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(customer ? '고객 정보가 수정되었습니다.' : '고객이 등록되었습니다.');
      onSuccess();
      onClose();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 border border-gray-100 flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 사이드 정보 패널 */}
        <div className="w-full md:w-64 bg-black p-10 text-white flex flex-col justify-between overflow-hidden relative">
          <div className="z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/10">
              {customer ? <Briefcase className="text-white" size={24} /> : <User className="text-white" size={24} />}
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4">
              {isReadOnly ? '고객 상세 프로필' : customer ? '정보 수정' : '신규 고객 등록'}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              전문적인 고객 아이덴티티 매핑 및 데이터베이스 동기화를 진행합니다.
            </p>
          </div>

          <div className="mt-10 opacity-20 z-10 select-none">
            <div className="text-6xl font-black italic tracking-tighter uppercase leading-none">VIP</div>
            <div className="text-6xl font-black italic tracking-tighter uppercase leading-none -mt-4 ml-6">CORE</div>
          </div>

          <User className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64" />
        </div>

        {/* 폼 영역 */}
        <div className="flex-1 p-12 bg-[#fcfcfc]">
          <div className="flex justify-between items-center mb-10">
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">데이터 입력 폼</div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="group">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">고객 성함 *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    required
                    readOnly={isReadOnly}
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold placeholder:text-gray-200 ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-default' : ''}`}
                    placeholder="고객 성함을 입력하세요"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">보안 이메일</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full pl-12 pr-6 py-4 bg-white border rounded-2xl outline-none transition-all font-bold placeholder:text-gray-200 ${errors.email ? 'border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:ring-4 focus:ring-black/5'} ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-default' : ''}`}
                    placeholder="example@vault.com"
                    readOnly={isReadOnly}
                  />
                </div>
                {errors.email && <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">소속 회사</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className={`w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold placeholder:text-gray-200 ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-default' : ''}`}
                      placeholder="회사명을 입력하세요"
                      readOnly={isReadOnly}
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">연락처</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, phone: val });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      className={`w-full pl-12 pr-6 py-4 bg-white border rounded-2xl outline-none transition-all font-bold placeholder:text-gray-200 ${errors.phone ? 'border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:ring-4 focus:ring-black/5'} ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-default' : ''}`}
                      placeholder="숫자만 입력"
                      readOnly={isReadOnly}
                    />
                  </div>
                  {errors.phone && <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">{errors.phone}</p>}
                </div>
              </div>

              {customer && (
                <div className="group" ref={statusRef}>
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">프로젝트 상태</label>
                  <div className="relative">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => !isReadOnly && setIsStatusOpen(!isStatusOpen)}
                      className={`w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold text-left flex items-center justify-between ${isReadOnly ? 'bg-gray-50 text-gray-500 cursor-default' : 'group-hover:border-gray-200'}`}
                    >
                      <span>
                        {formData.status === 'pending' ? '대기 (Waiting)' :
                          formData.status === 'processing' ? '진행 (Active)' : '완료 (Completed)'}
                      </span>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStatusOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {[
                          { value: 'pending', label: '대기 (Waiting)' },
                          { value: 'processing', label: '진행 (Active)' },
                          { value: 'closed', label: '완료 (Completed)' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, status: option.value });
                              setIsStatusOpen(false);
                            }}
                            className={`w-full px-6 py-3 text-left text-sm font-bold flex items-center justify-between hover:bg-gray-50 transition-colors
                              ${formData.status === option.value ? 'bg-black/5 text-black' : 'text-gray-500'}`}
                          >
                            {option.label}
                            {formData.status === option.value && <Check size={14} className="text-black" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-8 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-8 py-4 border border-gray-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all active:scale-95 ${isReadOnly ? 'w-full' : ''}`}
              >
                {isReadOnly ? '닫기' : '취소'}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-8 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      처리 중...
                    </>
                  ) : (customer ? '변경 완료' : '고객 등록')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
