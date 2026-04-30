import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Trash2, MessageSquare, Send } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';
import { updateInquiryStatus, deleteInquiry, answerInquiry } from '@/lib/actions';
import { toast } from 'sonner';

interface InquiryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: any | null;
  onSuccess: () => void;
}

export default function InquiryDetailModal({
  isOpen,
  onClose,
  inquiry,
  onSuccess,
}: InquiryDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // 기존 답변이 있으면 로드
      if (inquiry?.answer) {
        setAnswer(inquiry.answer);
      } else {
        setAnswer('');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, inquiry]);

  if (!mounted || !isOpen || !inquiry) return null;

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) {
      toast.error('답변 내용을 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    const res = await answerInquiry(inquiry.id, answer);
    if (res.success) {
      toast.success('답변이 성공적으로 등록되었습니다.');
      onSuccess();
      onClose();
    } else {
      toast.error(res.error || '답변 등록 중 오류가 발생했습니다.');
    }
    setIsUpdating(false);
  };

  const handleMarkPending = async () => {
    setIsUpdating(true);
    const res = await updateInquiryStatus(inquiry.id, 'pending');
    if (res.success) {
      toast.success('대기 상태로 변경되었습니다.');
      onSuccess();
      onClose();
    } else {
      toast.error(res.error || '처리 중 오류가 발생했습니다.');
    }
    setIsUpdating(false);
  };

  const handleDelete = async () => {
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setIsConfirmOpen(false);
    setIsUpdating(true);
    const res = await deleteInquiry(inquiry.id);
    if (res.success) {
      toast.success('문의가 삭제되었습니다.');
      onSuccess();
      onClose();
    } else {
      toast.error(res.error || '삭제 중 오류가 발생했습니다.');
    }
    setIsUpdating(false);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="relative bg-white rounded-[40px] w-full max-w-2xl shadow-[0_60px_120px_rgba(0,0,0,0.25)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 헤더 */}
        <div className="px-10 pt-10 pb-6 border-b border-gray-50 flex-shrink-0">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-gray-50 text-gray-400 rounded-lg border border-gray-100">
                  {inquiry.type || '일반'}
                </span>
                <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                  inquiry.status === 'pending'
                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                    : 'bg-black text-white border-black'
                }`}>
                  {inquiry.status === 'pending'
                    ? <><AlertCircle size={10} />답변 대기</>
                    : <><CheckCircle2 size={10} />해결 완료</>}
                </span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tighter">
                {inquiry.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-300 hover:text-black hover:bg-gray-100 transition-all flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 본문 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">
          {/* 문의 정보 요약 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">문의자</div>
              <div className="text-sm font-black text-black">
                {inquiry.authorName || inquiry.customer?.name || '익명'}
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">접수 일시</div>
              <div className="text-sm font-black text-black font-mono">
                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* 문의 내용 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-4 bg-gray-200 rounded-full"></div>
              <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest">문의 상세 내용</div>
            </div>
            <div className="p-6 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-700 leading-relaxed whitespace-pre-wrap">
              {inquiry.content}
            </div>
          </div>

          {/* 답변 작성 영역 */}
          <div className="pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-black rounded-full"></div>
                <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest">관리자 답변</div>
              </div>
              {inquiry.answeredAt && (
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                  마지막 답변: {new Date(inquiry.answeredAt).toLocaleString('ko-KR')}
                </div>
              )}
            </div>
            <div className="relative group">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="고객님의 문의에 대한 답변을 입력해주세요..."
                className="w-full min-h-[160px] p-6 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-black/10 focus:ring-4 focus:ring-black/5 outline-none text-sm font-medium text-gray-800 transition-all resize-none leading-relaxed"
              />
              <div className="absolute bottom-4 right-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                {answer.length} characters
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="px-10 py-8 border-t border-gray-50 flex items-center justify-between gap-4 flex-shrink-0">
          <button
            onClick={handleDelete}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-widest text-red-500 border border-red-100 rounded-2xl hover:bg-red-50 transition-all disabled:opacity-50"
          >
            <Trash2 size={14} />
            삭제
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
            >
              닫기
            </button>

            {inquiry.status === 'pending' || answer !== inquiry.answer ? (
              <button
                onClick={handleAnswerSubmit}
                disabled={isUpdating || !answer.trim()}
                className="px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-30 flex items-center gap-2 shadow-xl shadow-black/10"
              >
                <Send size={14} />
                {isUpdating ? '등록 중...' : (inquiry.answer ? '답변 수정하기' : '답변 등록하기')}
              </button>
            ) : (
              <button
                onClick={handleMarkPending}
                disabled={isUpdating}
                className="px-6 py-3 bg-orange-50 text-orange-600 border border-orange-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <AlertCircle size={14} />
                답변 취소 (대기)
              </button>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="문의 삭제"
        message={`'${inquiry.title}' 문의를 삭제하시겠습니까?`}
        confirmText="삭제하기"
        type="danger"
      />
    </div>,
    document.body
  );
}
