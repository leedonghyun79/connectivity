import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'success' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  type = 'info'
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle className="text-red-500" size={24} />,
          button: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100',
          bg: 'bg-red-50'
        };
      case 'success':
        return {
          icon: <CheckCircle className="text-green-500" size={24} />,
          button: 'bg-black hover:bg-gray-800 text-white shadow-lg shadow-gray-200',
          bg: 'bg-green-50'
        };
      default:
        return {
          icon: <HelpCircle className="text-blue-500" size={24} />,
          button: 'bg-black hover:bg-gray-800 text-white shadow-lg shadow-gray-200',
          bg: 'bg-blue-50'
        };
    }
  };

  const styles = getTypeStyles();

  // Portal을 사용하여 body 태그 바로 아래에 렌더링 (Stacking context 해결)
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        role="dialog"
        aria-modal="true"
        className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Optional Decorative) */}
        <div className={`h-2 ${styles.bg}`} />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-2xl ${styles.bg}`}>
              {styles.icon}
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-black tracking-tighter text-gray-900">
              {title}
            </h3>
            <p className="text-gray-500 font-bold leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all ${styles.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
