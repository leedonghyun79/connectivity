'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';

interface SignaturePadProps {
  onApply: (dataUrl: string) => void;
  onClose: () => void;
}

const WIDTH = 480;
const HEIGHT = 200;

// 펜 모양 커서 (펜촉이 좌하단 → 핫스팟 2,22)
const PEN_PATH = "<path d='M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z'/><path d='m15 5 4 4'/>";
const PEN_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'>" +
  `<g stroke='white' stroke-width='4'>${PEN_PATH}</g><g stroke='black' stroke-width='2'>${PEN_PATH}</g></svg>`;
const PEN_CURSOR = `url("data:image/svg+xml;utf8,${encodeURIComponent(PEN_SVG)}") 2 22, crosshair`;

export default function SignaturePad({ onApply, onClose }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handleDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const { x, y } = getPoint(e);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x, y);
    // 점만 찍어도 보이도록
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
    setIsEmpty(false);
  };

  const handleMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleUp = () => {
    drawingRef.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const handleApply = () => {
    if (!canvasRef.current || isEmpty) return;
    onApply(canvasRef.current.toDataURL('image/png'));
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[8px] shadow-2xl border border-gray-200 w-full max-w-lg text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-base font-black tracking-tight">직접 서명하기</h4>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400 hover:text-gray-900"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            onPointerDown={handleDown}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
            onPointerCancel={handleUp}
            style={{ cursor: PEN_CURSOR }}
            className="w-full bg-gray-50 border-b-2 border-gray-200 rounded-[8px] touch-none"
          />
          <p className="text-[15px] text-gray-700 mt-3">위 칸에 마우스나 터치로 서명해주세요.</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-black transition-all"
          >
            지우기
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-200 rounded-[8px] text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isEmpty}
              className="px-6 py-2 bg-black text-white rounded-[8px] text-sm font-black hover:bg-gray-800 transition-all disabled:opacity-30"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
