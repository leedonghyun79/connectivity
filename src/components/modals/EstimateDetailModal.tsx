'use client';

import { X, Printer, Download, Mail, CheckCircle, XCircle } from 'lucide-react';

interface EstimateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  estimate: any;
}

export default function EstimateDetailModal({ isOpen, onClose, estimate }: EstimateDetailModalProps) {
  if (!isOpen || !estimate) return null;

  const totalSupplyValue = estimate.items?.reduce((acc: number, item: any) => acc + Number(item.supplyValue), 0) || 0;
  const totalVat = estimate.items?.reduce((acc: number, item: any) => acc + Number(item.vat), 0) || 0;
  const grandTotal = totalSupplyValue + totalVat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#fcfcfc] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200">

        {/* 상단 컨트롤 바 */}
        <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white text-sm">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold">
              <Printer size={16} /> 인쇄하기
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold">
              <Download size={16} /> PDF 다운로드
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold">
              <Mail size={16} /> 이메일 발송
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold hover:bg-green-100 transition-all">
              <CheckCircle size={16} /> 승인 처리
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold hover:bg-red-100 transition-all">
              <XCircle size={16} /> 거절 처리
            </button>
            <div className="w-px h-6 bg-gray-200 mx-2"></div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 견적서 본문 (A4 감성) */}
        <div className="flex-1 overflow-y-auto p-12 bg-gray-100 flex justify-center custom-scrollbar">
          <div className="bg-white w-full max-w-[800px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] p-[60px] min-h-[1120px] relative font-sans text-gray-900 border border-gray-100 rounded-sm">

            {/* 워터마크 표시 (상태에 따라) */}
            <div className="absolute top-10 right-10 opacity-[0.03] select-none pointer-events-none">
              <h1 className="text-9xl font-black italic">CONNECTIVITY</h1>
            </div>

            {/* 헤더 */}
            <div className="flex justify-between items-start mb-20">
              <div>
                <h1 className="text-6xl font-black tracking-tighter mb-4 text-black">견적서 (ESTIMATE)</h1>
                <div className="text-2xl font-bold text-gray-800 tracking-tight">{estimate.title}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase mb-2">발행 일정 (Issue Date)</div>
                <div className="text-xl font-bold">{new Date(estimate.issueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            </div>

            {/* 정보 섹션 */}
            <div className="grid grid-cols-2 gap-20 mb-20">
              <div>
                <div className="text-[10px] font-black text-black tracking-[0.2em] uppercase mb-6 border-b border-black pb-2">수신인 정보 (BILL TO)</div>
                <div className="space-y-4">
                  <div className="text-3xl font-black text-black">
                    {estimate.customer?.name || estimate.customerName} <span className="text-sm font-bold text-gray-400 ml-2">귀하</span>
                  </div>
                  <div className="text-gray-500 space-y-1 text-sm leading-relaxed">
                    <p className="font-bold text-gray-800">{estimate.customer?.company}</p>
                    <p>{estimate.customer?.address || estimate.bizAddress}</p>
                    <p>{estimate.customer?.phone || estimate.bizPhone}</p>
                    <p>{estimate.customer?.email || estimate.bizEmail}</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-black tracking-[0.2em] uppercase mb-6 border-b border-black pb-2">공급자 정보 (FROM)</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-400 font-bold text-[10px]">사업자번호</span>
                    <span className="font-bold">{estimate.bizNumber || '123-45-67890'}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-400 font-bold text-[10px]">상호 / 대표</span>
                    <span className="font-bold">{estimate.bizName} / {estimate.bizCEO}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1 text-right">
                    <span className="text-gray-400 font-bold text-[10px] text-left shrink-0 w-20">사업장 주소</span>
                    <span className="font-bold">{estimate.bizAddress}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-400 font-bold text-[10px]">연락처</span>
                    <span className="font-bold">{estimate.bizPhone}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-1">
                    <span className="text-gray-400 font-bold text-[10px]">이메일</span>
                    <span className="font-bold">{estimate.bizEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 품목 테이블 */}
            <div className="mb-20">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-[10px] font-black uppercase text-left py-4 tracking-widest w-[40%] text-black">품목 정보 (Description)</th>
                    <th className="text-[10px] font-black uppercase text-left py-4 tracking-widest text-black">세부 규격 (Specs)</th>
                    <th className="text-[10px] font-black uppercase text-center py-4 tracking-widest w-16 text-black">수량</th>
                    <th className="text-[10px] font-black uppercase text-right py-4 tracking-widest text-black">금액 (Amount)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {estimate.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-6 pr-4">
                        <div className="font-black text-gray-900 border-l-4 border-black pl-3">{item.itemName}</div>
                      </td>
                      <td className="py-6 pr-4 text-xs font-medium text-gray-400 uppercase tracking-tight">
                        {item.spec}
                      </td>
                      <td className="py-6 text-center font-mono font-bold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="py-6 text-right font-mono font-black text-black">
                        {Number(item.supplyValue).toLocaleString()} <span className="text-[10px] text-gray-300">₩</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 집계 */}
            <div className="flex justify-end mb-20">
              <div className="w-72 space-y-4">
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>합계 소계 (Subtotal)</span>
                  <span className="font-mono text-gray-600">{totalSupplyValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-bold text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-100">
                  <span>부가가치세 (VAT 10%)</span>
                  <span className="font-mono text-gray-600">{totalVat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-black">최종 결제 합계액</span>
                  <span className="text-3xl font-black font-mono text-black">{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 푸터 및 서명 */}
            <div className="mt-auto pt-20 text-center">
              <div className="mb-10 text-gray-500 font-medium tracking-tight">본 견적서의 내역 및 금액을 수락하였음을 확인합니다.</div>

              <div className="flex justify-center items-center gap-20">
                <div className="flex items-center gap-6">
                  <span className="text-sm font-black uppercase tracking-widest">고객 측 서명란 (Client)</span>
                  <div className="w-40 h-px bg-gray-200 relative">
                    <span className="absolute -top-3 right-0 text-[10px] text-gray-300 italic">(인)</span>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm font-black uppercase tracking-widest">발행자 확인란 (Authorized)</span>
                  <div className="w-40 h-px bg-gray-200 relative flex justify-center">
                    <div className="absolute -top-10 w-12 h-12 rounded-full border border-red-200 flex items-center justify-center text-[10px] font-bold text-red-300 border-dashed animate-pulse">
                      공식 인감 (Seal)
                    </div>
                    <span className="absolute -top-3 right-0 text-[10px] text-gray-300 italic">(서명)</span>
                  </div>
                </div>
              </div>

              <div className="mt-20 text-[10px] font-mono text-gray-300 tracking-[0.5em] uppercase">
                견적 유효기간 : 발행일로부터 30일 이내 (Validity Period : 30 Days)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
