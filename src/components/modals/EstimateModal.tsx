'use client';

import { useState, useEffect } from 'react';
import { X, Search, Loader2, Plus, Trash2, Printer } from 'lucide-react';
import { createEstimate, updateEstimate, getCustomers } from '@/lib/actions';
import { toast } from 'sonner';

interface EstimateItem {
  id: string;
  itemName: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  supplyValue: number;
  vat: number;
}

interface EstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: any;
}

export default function EstimateModal({ isOpen, onClose, onSuccess, editData }: EstimateModalProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultBizInfo = {
    bizNumber: '123-45-67890',
    bizName: '커넥티비티(Connectivity)',
    bizCEO: '홍길동',
    bizAddress: '서울시 강남구 테헤란로 123',
    bizPhone: '02-1234-5678',
    bizEmail: 'contact@connectivity.com',
  };

  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    ...defaultBizInfo
  });

  const [items, setItems] = useState<EstimateItem[]>([
    { id: '1', itemName: '', spec: '', quantity: 1, unitPrice: 0, supplyValue: 0, vat: 0 }
  ]);

  useEffect(() => {
    if (isOpen) {
      getCustomers().then(setCustomers);

      if (editData) {
        setFormData({
          title: editData.title,
          customerId: editData.customerId,
          issueDate: new Date(editData.issueDate).toISOString().split('T')[0],
          bizNumber: editData.bizNumber || defaultBizInfo.bizNumber,
          bizName: editData.bizName || defaultBizInfo.bizName,
          bizCEO: editData.bizCEO || defaultBizInfo.bizCEO,
          bizAddress: editData.bizAddress || defaultBizInfo.bizAddress,
          bizPhone: editData.bizPhone || defaultBizInfo.bizPhone,
          bizEmail: editData.bizEmail || defaultBizInfo.bizEmail,
        });

        if (editData.items && editData.items.length > 0) {
          setItems(editData.items.map((item: any) => ({
            id: item.id || Math.random().toString(),
            itemName: item.itemName,
            spec: item.spec || '',
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            supplyValue: Number(item.supplyValue),
            vat: Number(item.vat)
          })));
        }
      } else {
        // Reset form for create mode
        setFormData({
          title: '',
          customerId: '',
          issueDate: new Date().toISOString().split('T')[0],
          ...defaultBizInfo
        });
        setItems([{ id: '1', itemName: '', spec: '', quantity: 1, unitPrice: 0, supplyValue: 0, vat: 0 }]);
      }
    }
  }, [isOpen, editData]);

  const calculateItemValues = (quantity: number, unitPrice: number) => {
    const supplyValue = quantity * unitPrice;
    const vat = Math.floor(supplyValue * 0.1);
    return { supplyValue, vat };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const up = field === 'unitPrice' ? Number(value) : item.unitPrice;
      const { supplyValue, vat } = calculateItemValues(q, up);
      item.supplyValue = supplyValue;
      item.vat = vat;
    } else if (field === 'supplyValue') {
      const sv = Number(value);
      item.supplyValue = sv;
      item.vat = Math.floor(sv * 0.1);
      // 수량이 있는 경우 단가 역산
      if (item.quantity > 0) {
        item.unitPrice = Math.floor(sv / item.quantity);
      }
    }

    newItems[index] = item;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), itemName: '', spec: '', quantity: 1, unitPrice: 0, supplyValue: 0, vat: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalSupplyValue = items.reduce((acc, item) => acc + item.supplyValue, 0);
  const totalVat = items.reduce((acc, item) => acc + item.vat, 0);
  const grandTotal = totalSupplyValue + totalVat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) return toast.error('고객을 선택해 주세요.');
    if (items.some(item => !item.itemName)) return toast.error('품목 이름을 입력해 주세요.');

    setIsSubmitting(true);
    let result;

    if (editData) {
      result = await updateEstimate(editData.id, {
        ...formData,
        issueDate: new Date(formData.issueDate),
        items: items.map(({ id, ...rest }) => rest)
      });
    } else {
      result = await createEstimate({
        ...formData,
        items: items.map(({ id, ...rest }) => rest)
      });
    }

    setIsSubmitting(false);

    if (result.success) {
      toast.success(editData ? '견적서가 수정되었습니다.' : '견적서가 저장되었습니다.');
      onSuccess();
      onClose();
      // Reset is handled by useEffect when modal re-opens or mode changes
    } else {
      toast.error(result.error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#fcfcfc] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl">C</div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{editData ? '견적서 수정' : '신규 견적서 작성'}</h3>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-gray-200">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <form id="estimate-form" onSubmit={handleSubmit} className="space-y-12 max-w-4xl mx-auto bg-white p-12 shadow-[0_0_50px_rgba(0,0,0,0.02)] border border-gray-100 rounded-2xl">

            {/* 상단 섹션: 견적서 제목 및 날짜 */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-black text-gray-900 mb-6 uppercase tracking-tighter">견적서 (ESTIMATE)</h1>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="견적 명칭을 입력하세요"
                  className="text-2xl font-bold bg-transparent border-b-2 border-gray-200 focus:border-black outline-none pb-2 w-full transition-all placeholder:text-gray-200"
                />
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">발행일 (DATE)</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="text-lg font-bold bg-gray-50 px-3 py-1 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">참조 번호 (REF NO.)</label>
                  <div className="text-lg font-mono text-gray-400"># 자동 생성됨</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-20">
              {/* 고객 정보 섹션 */}
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black text-black uppercase tracking-[0.2em] block mb-4 border-b border-black pb-2">수신인 (BILL TO)</label>
                  <div className="space-y-4">
                    <select
                      required
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      className="w-full text-xl font-bold bg-transparent hover:bg-gray-50 px-2 py-1 -ml-2 rounded transition-colors outline-none cursor-pointer"
                    >
                      <option value="">고객을 선택하세요 ▾</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.company || '회사명 없음'})
                        </option>
                      ))}
                    </select>
                    <div className="text-gray-500 space-y-2">
                      {formData.customerId && (
                        <>
                          <p className="font-medium text-gray-800">{customers.find(c => c.id === formData.customerId)?.company}</p>
                          <p className="text-sm">{customers.find(c => c.id === formData.customerId)?.address || '주소 정보 없음'}</p>
                          <p className="text-sm">{customers.find(c => c.id === formData.customerId)?.phone}</p>
                          <p className="text-sm">{customers.find(c => c.id === formData.customerId)?.email}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 공급자 정보 섹션 */}
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black text-black uppercase tracking-[0.2em] block mb-4 border-b border-black pb-2">공급자 (FROM)</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <span className="text-gray-400 font-bold">사업자번호</span>
                      <input
                        className="col-span-2 font-bold outline-none border-b border-transparent focus:border-gray-200"
                        value={formData.bizNumber}
                        onChange={(e) => setFormData({ ...formData, bizNumber: e.target.value })}
                      />
                      <span className="text-gray-400 font-bold">상호 / 대표</span>
                      <div className="col-span-2 flex gap-2">
                        <input
                          className="flex-1 font-bold outline-none border-b border-transparent focus:border-gray-200"
                          value={formData.bizName}
                          onChange={(e) => setFormData({ ...formData, bizName: e.target.value })}
                        />
                        <input
                          className="w-16 font-bold outline-none border-b border-transparent focus:border-gray-200"
                          value={formData.bizCEO}
                          onChange={(e) => setFormData({ ...formData, bizCEO: e.target.value })}
                        />
                      </div>
                      <span className="text-gray-400 font-bold">주소</span>
                      <input
                        className="col-span-2 font-bold outline-none border-b border-transparent focus:border-gray-200"
                        value={formData.bizAddress}
                        onChange={(e) => setFormData({ ...formData, bizAddress: e.target.value })}
                      />
                      <span className="text-gray-400 font-bold">연락처</span>
                      <input
                        className="col-span-2 font-bold outline-none border-b border-transparent focus:border-gray-200"
                        value={formData.bizPhone}
                        onChange={(e) => setFormData({ ...formData, bizPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 품목 리스트 테이블 */}
            <div className="mt-12">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-[10px] font-black uppercase text-left py-4 tracking-widest w-1/3">품목 내용 (Description)</th>
                    <th className="text-[10px] font-black uppercase text-left py-4 tracking-widest">규격 (Detail)</th>
                    <th className="text-[10px] font-black uppercase text-center py-4 tracking-widest w-16">수량</th>
                    <th className="text-[10px] font-black uppercase text-right py-4 tracking-widest">단가</th>
                    <th className="text-[10px] font-black uppercase text-right py-4 tracking-widest w-32">공급가액</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="group">
                      <td className="py-4 pr-4">
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                          placeholder="품명"
                          className="w-full bg-transparent font-bold outline-none placeholder:text-gray-200"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="text"
                          value={item.spec}
                          onChange={(e) => handleItemChange(index, 'spec', e.target.value)}
                          placeholder="세부항목"
                          className="w-full bg-transparent text-sm text-gray-500 outline-none placeholder:text-gray-200"
                        />
                      </td>
                      <td className="py-4 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          onFocus={(e) => e.target.select()}
                          className="w-full bg-transparent text-center font-mono outline-none"
                        />
                      </td>
                      <td className="py-4 text-right pr-4">
                        <input
                          type="text"
                          value={item.unitPrice === 0 ? '' : item.unitPrice.toLocaleString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            handleItemChange(index, 'unitPrice', Number(val));
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full bg-transparent text-right font-mono outline-none placeholder:text-gray-200"
                        />
                      </td>
                      <td className="py-4 text-right pr-4 font-mono font-bold text-gray-900">
                        <input
                          type="text"
                          value={item.supplyValue === 0 ? '' : item.supplyValue.toLocaleString()}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            handleItemChange(index, 'supplyValue', Number(val));
                          }}
                          onFocus={(e) => e.target.select()}
                          placeholder="0"
                          className="w-full bg-transparent text-right outline-none placeholder:text-gray-200"
                        />
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t border-gray-200">
                    <td colSpan={6} className="py-6">
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all active:scale-95"
                      >
                        <Plus size={14} /> 품목 추가
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 하단 집계 섹션 */}
            <div className="flex justify-end pt-12">
              <div className="w-80 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">소계 (Subtotal)</span>
                  <span className="font-mono font-bold">{totalSupplyValue.toLocaleString()} KRW</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-100">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">부가세 (VAT 10%)</span>
                  <span className="font-mono font-bold">{totalVat.toLocaleString()} KRW</span>
                </div>
                <div className="flex justify-between items-center bg-black text-white p-6 rounded-2xl shadow-xl shadow-black/10">
                  <span className="font-black uppercase tracking-widest text-xs">최종 합계액</span>
                  <span className="text-2xl font-black font-mono">{grandTotal.toLocaleString()} KRW</span>
                </div>
              </div>
            </div>

            <div className="pt-20 text-center space-y-8">
              <p className="text-gray-900 font-medium">위와 같이 견적 내용을 제출합니다.</p>
              <div className="flex justify-center items-center gap-10">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold">서명 :</span>
                  <div className="w-32 h-10 bg-gray-50 rounded-lg border-b-2 border-gray-200 flex items-center justify-center italic text-gray-300 text-sm">(인)</div>
                </div>
                <div className="text-gray-400 font-mono text-sm">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>
          </form>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-between items-center">
          <div className="text-gray-400 text-xs flex items-center gap-2">
            <Printer size={14} />
            <span>작성 완료 후 바로 출력하거나 PDF로 저장할 수 있습니다.</span>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-200 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            >
              취소
            </button>
            <button
              form="estimate-form"
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-2.5 bg-black text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  저장 중...
                </>
              ) : (editData ? '견적서 수정' : '견적서 저장')}
            </button>
          </div>
        </div>
      </div>
    </div >
  );
}
