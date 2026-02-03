'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Building2, Phone, Briefcase } from 'lucide-react';
import { createCustomer, updateCustomer } from '@/lib/actions';
import { toast } from 'sonner';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: CustomerModalProps) {
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
        newErrors.phone = '올바른 연락처 형식명이 아닙니다.';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 border border-gray-100 flex flex-col md:flex-row">

        {/* 사이드 정보 패널 */}
        <div className="w-full md:w-64 bg-black p-10 text-white flex flex-col justify-between overflow-hidden relative">
          <div className="z-10">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-10 border border-white/10">
              {customer ? <Briefcase className="text-white" size={24} /> : <User className="text-white" size={24} />}
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-4">
              {customer ? 'Update Client' : 'Register New Entity'}
            </h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Professional identity mapping and database registration for enterprise synchronization.
            </p>
          </div>

          <div className="mt-10 opacity-20 z-10 select-none">
            <div className="text-6xl font-black italic tracking-tighter uppercase leading-none">VIP</div>
            <div className="text-6xl font-black italic tracking-tighter uppercase leading-none -mt-4 ml-6">CORE</div>
          </div>

          {/* 백그라운드 워터마크 아이콘 */}
          <User className="absolute -bottom-10 -right-10 text-white/5 w-64 h-64" />
        </div>

        {/* 폼 영역 */}
        <div className="flex-1 p-12 bg-[#fcfcfc]">
          <div className="flex justify-between items-center mb-10">
            <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Data Entry Form</div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="group">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">Identity Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold placeholder:text-gray-200"
                    placeholder="고객 성함을 입력하세요"
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">Secure Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    className={`w-full pl-12 pr-6 py-4 bg-white border rounded-2xl outline-none transition-all font-bold placeholder:text-gray-200 ${errors.email ? 'border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:ring-4 focus:ring-black/5'
                      }`}
                    placeholder="example@vault.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">Corporation</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-200 group-focus-within:text-black transition-colors" size={18} />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold placeholder:text-gray-200"
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">Contact No.</label>
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
                      className={`w-full pl-12 pr-6 py-4 bg-white border rounded-2xl outline-none transition-all font-bold placeholder:text-gray-200 ${errors.phone ? 'border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:ring-4 focus:ring-black/5'
                        }`}
                      placeholder="숫자만 입력"
                    />
                  </div>
                  {errors.phone && <p className="mt-2 text-[10px] text-red-500 font-black uppercase tracking-widest ml-1">{errors.phone}</p>}
                </div>
              </div>

              {customer && (
                <div className="group">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block mb-2 px-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold appearance-none cursor-pointer"
                  >
                    <option value="pending">Waiting (대기)</option>
                    <option value="processing">Active (진행)</option>
                    <option value="closed">Completed (종료)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="pt-8 flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-8 py-4 border border-gray-200 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-all active:scale-95"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] px-8 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (customer ? 'Confirm Updates' : 'Sync Identity')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
