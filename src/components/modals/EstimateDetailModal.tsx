import { useState, useRef } from 'react';
import { X, Printer, Download, Mail, CheckCircle, XCircle, Loader2, Send, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { sendEstimateEmail } from '@/lib/actions';
import { toast } from 'sonner';

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

  const [customerStamp, setCustomerStamp] = useState<string | null>(null);
  const [providerStamp, setProviderStamp] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [targetEmail, setTargetEmail] = useState(estimate.customer?.email || '');

  const customerFileRef = useRef<HTMLInputElement>(null);
  const providerFileRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          return '';
        }
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>견적서_${estimate.title}</title>
          <style>
            ${styles}
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; background: white !important; }
            .no-print { display: none !important; }
            #estimate-sheet { 
              box-shadow: none !important; 
              border: none !important; 
              width: 100% !important; 
              max-width: 100% !important;
              padding: 60px !important;
              min-height: auto !important;
            }
          </style>
        </head>
        <body>
          <div id="estimate-sheet">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);

    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // 첫 페이지
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 추가 페이지 루프
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // 위치 조정
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`견적서_${estimate.title}.pdf`);
      toast.success('PDF 다운로드가 완료되었습니다.');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('PDF 생성에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!targetEmail) {
      toast.error('이메일 주소를 입력해주세요.');
      return;
    }

    if (!printRef.current) return;

    setIsEmailing(true);
    let pdfBase64 = undefined;

    try {
      // PDF 생성
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // JPEG 포맷으로 변경하고 품질을 0.8로 설정하여 용량 최적화
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      const pdf = new jsPDF('p', 'mm', 'a4');

      // 첫 페이지
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // 추가 페이지 루프
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdfBase64 = pdf.output('datauristring');

    } catch (error) {
      console.error('PDF generation for email failed:', error);
      toast.error('PDF 첨부 파일 생성에 실패했습니다. 메일만 발송합니다.');
    }

    const result = await sendEstimateEmail(estimate.id, targetEmail, pdfBase64);
    setIsEmailing(false);

    if (result.success) {
      toast.success('이메일(PDF 첨부)이 성공적으로 발송되었습니다.');
      setShowEmailInput(false);
    } else {
      toast.error(result.error || '이메일 발송에 실패했습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'customer' | 'provider') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'customer') setCustomerStamp(reader.result as string);
        else setProviderStamp(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#fcfcfc] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* 상단 컨트롤 바 */}
        <div className="px-8 py-4 border-b border-gray-100 flex items-center justify-between bg-white text-sm">
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold"
            >
              <Printer size={16} /> 인쇄하기
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? '생성 중...' : 'PDF 다운로드'}
            </button>
            {showEmailInput ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="수신 이메일 주소"
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-black transition-all text-xs w-60 font-bold"
                  autoFocus
                />
                <button
                  onClick={handleSendEmail}
                  disabled={isEmailing}
                  className="p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                  title="전송"
                >
                  {isEmailing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
                <button
                  onClick={() => setShowEmailInput(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                  title="취소"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowEmailInput(true)}
                className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold"
              >
                <Mail size={16} /> 이메일 발송
              </button>
            )}
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

        <div className="flex-1 overflow-y-auto p-12 bg-gray-100 flex justify-center custom-scrollbar">
          <div
            ref={printRef}
            className="bg-white w-full max-w-[800px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] p-[80px] pb-[120px] min-h-[1280px] relative font-sans text-gray-900 border border-gray-100 rounded-sm flex flex-col"
          >

            {/* 워터마크 배경 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] select-none pointer-events-none rotate-[-30deg]">
              <h1 className="text-[120px] font-black italic">CONNECTIVITY</h1>
            </div>

            <div className="relative z-10 flex flex-col flex-1">
              {/* 헤더 섹션 */}
              <div className="flex justify-between items-start mb-20">
                <div>
                  <h1 className="text-5xl font-black tracking-tighter mb-4 text-black">견적서</h1>
                  <div className="text-2xl font-bold text-gray-800 tracking-tight">{estimate.title}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-black text-gray-300 tracking-[0.3em] uppercase mb-2">작성 일자</div>
                  <div className="text-xl font-bold">{new Date(estimate.issueDate).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>

              {/* 정보 그리드 */}
              <div className="grid grid-cols-2 gap-20 mb-20">
                <div>
                  <div className="text-[13px] font-black text-black tracking-[0.2em] uppercase mb-6 border-b border-black pb-2">수신인 정보</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">사업자번호</span>
                      <span className="font-bold">{estimate.customer?.bizNumber || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">상호</span>
                      <span className="font-bold">{estimate.customer?.company || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">성함 / 귀하</span>
                      <span className="font-bold">{estimate.customer?.name || estimate.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px] shrink-0 w-20">주소</span>
                      <span className="font-bold text-right">{estimate.customer?.address || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">연락처</span>
                      <span className="font-bold">{estimate.customer?.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">이메일</span>
                      <span className="font-bold">{estimate.customer?.email || '-'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-[13px] font-black text-black tracking-[0.2em] uppercase mb-6 border-b border-black pb-2">공급자 정보</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">사업자번호</span>
                      <span className="font-bold">{estimate.bizNumber || '123-45-67890'}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">상호</span>
                      <span className="font-bold">{estimate.bizName}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">대표</span>
                      <span className="font-bold">{estimate.bizCEO}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px] shrink-0 w-20">사업장 주소</span>
                      <span className="font-bold text-right">{estimate.bizAddress}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">연락처</span>
                      <span className="font-bold">{estimate.bizPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                      <span className="text-gray-400 font-bold text-[13px]">이메일</span>
                      <span className="font-bold">{estimate.bizEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 품목 테이블 */}
              <div className="mb-20">
                <table className="w-full border-collapse table-fixed">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-[13px] font-black uppercase text-left py-4 tracking-widest w-[240px]">품목 정보</th>
                      <th className="text-[13px] font-black uppercase text-left py-4 tracking-widest w-[200px]">세부 규격</th>
                      <th className="text-[13px] font-black uppercase text-center py-4 tracking-widest w-[60px]">수량</th>
                      <th className="text-[13px] font-black uppercase text-right py-4 tracking-widest w-[140px]">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {estimate.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="py-8 pr-4 align-top">
                          <div className="font-black text-gray-900 border-l-4 border-black pl-3 break-keep leading-snug">{item.itemName}</div>
                        </td>
                        <td className="py-8 pr-4 text-xs font-bold text-gray-400 uppercase tracking-tight break-keep leading-relaxed align-top">
                          {item.spec}
                        </td>
                        <td className="py-8 text-center font-mono font-black text-black align-top">
                          {item.quantity}
                        </td>
                        <td className="py-8 text-right font-mono font-black text-black align-top">
                          <span className="text-lg">{Number(item.supplyValue).toLocaleString()}</span>
                          <span className="text-[13px] text-gray-300 ml-1.5 font-sans">KRW</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 집계 센션 */}
              <div className="flex justify-end mb-24">
                <div className="w-72 space-y-4">
                  <div className="flex justify-between items-center text-[13px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>합계 소계</span>
                    <span className="font-mono">{totalSupplyValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[13px] font-bold text-gray-400 uppercase tracking-widest pb-4 border-b border-gray-100">
                    <span>부가가치세 (VAT 10%)</span>
                    <span className="font-mono">{totalVat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-l font-black text-black">총 금액</span>
                    <span className="text-3xl font-black font-mono">{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 푸터 (서명 영역) - 우측 하단 고정 */}
              <div className="mt-auto pb-20 flex flex-col items-end">
                <div className="flex items-center gap-12 mb-10 uppercase">
                  {/* 의뢰인 섹션 */}
                  <div className="flex items-center gap-4 relative">
                    <span className="text-xl font-bold">의뢰인</span>
                    <div className="border-b-2 border-black px-6 min-w-[140px] text-center text-xl font-black pb-2">
                      {estimate.customer?.name || estimate.customerName}
                    </div>
                    {/* 의뢰인 도장 자리 (원형) */}
                    <div
                      onClick={() => customerFileRef.current?.click()}
                      className="relative w-12 h-12 flex items-center justify-center cursor-pointer"
                    >
                      <input
                        type="file"
                        ref={customerFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'customer')}
                      />
                      {customerStamp ? (
                        <img src={customerStamp} alt="의뢰인 도장" className="absolute inset-0 w-full h-full object-contain z-20" />
                      ) : (
                        <>
                          <span className="text-sm font-bold text-gray-400 absolute bottom-0 right-0 z-0 opacity-20">(STAMP)</span>
                          <div className="w-12 h-12 border-2 border-red-500/30 rounded-full flex items-center justify-center rotate-[-15deg] select-none scale-110">
                            <span className="text-[12px] font-black text-red-500/40 leading-none text-center">
                              {(estimate.customer?.name || estimate.customerName || '의뢰인').substring(0, 3)}<br />인
                            </span>
                          </div>
                          <span className="text-xl font-bold z-10 absolute">(인)</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 공급자 섹션 */}
                  <div className="flex items-center gap-4 relative">
                    <span className="text-xl font-bold">공급자</span>
                    <div className="border-b-2 border-black px-6 min-w-[140px] text-center text-xl font-black pb-2">
                      {estimate.bizCEO}
                    </div>
                    {/* 공급자 도장 (사각) */}
                    <div
                      onClick={() => providerFileRef.current?.click()}
                      className="relative w-14 h-14 flex items-center justify-center ml-2 cursor-pointer"
                    >
                      <input
                        type="file"
                        ref={providerFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'provider')}
                      />
                      {providerStamp ? (
                        <img src={providerStamp} alt="공급자 도장" className="absolute inset-0 w-full h-full object-contain z-20 rotate-6" />
                      ) : (
                        <div className="absolute inset-0 border-4 border-red-500/80 rounded flex items-center justify-center p-1 rotate-6 select-none shadow-[2px_2px_0_rgba(239,68,68,0.1)] bg-white/50 scale-110">
                          <div className="text-[11px] font-black text-red-500/80 leading-tight text-center transform -rotate-6">
                            {(estimate.bizName || '공급자').substring(0, 2)}<br />
                            {(estimate.bizName || '공급자').length > 2 ? (estimate.bizName || '공급자').substring(2, 4) : '인'}<br />
                            {(estimate.bizName || '공급자').length > 4 ? '인' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 발행 일자 */}
                <div className="text-xl font-bold tracking-tight text-black mr-4">
                  {(() => {
                    const d = new Date(estimate.issueDate);
                    return `${d.getFullYear()}년 ${String(d.getMonth() + 1).padStart(2, '0')}월 ${String(d.getDate()).padStart(2, '0')}일`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
