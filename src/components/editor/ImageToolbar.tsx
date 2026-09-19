'use client';
import { useState, useRef, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import {
  RefreshCw, AlignLeft, AlignCenter, AlignRight, Trash2,
  Link as LinkIcon, FileText, AlignJustify, X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ImageAlign } from './image/ResizableImage';
import { uploadImage } from './uploadImage';

interface Props {
  editor: Editor;
  getPos: () => number | undefined;
  image: HTMLImageElement;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  attrs: { alt: string; href: string; align: ImageAlign };
  onUpdate: (attrs: Record<string, unknown>) => void;
  onDelete: () => void;
}

const btn =
  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white';

export default function ImageToolbar({ image, wrapperRef, attrs, onUpdate, onDelete }: Props) {
  const [activeMenu, setActiveMenu] = useState<'align' | 'alt' | 'link' | null>(null);
  const [altText, setAltText] = useState(attrs.alt);
  const [linkUrl, setLinkUrl] = useState(attrs.href);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!image || !wrapperRef.current) return;
    const imgRect = image.getBoundingClientRect();
    const wrapRect = wrapperRef.current.getBoundingClientRect();
    setPos({
      top: imgRect.top - wrapRect.top - 52,
      left: imgRect.left - wrapRect.left + imgRect.width / 2,
    });
  }, [image, wrapperRef, attrs.align]);

  const handleReplace = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onUpdate({ src: url });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '이미지 교체 실패');
    } finally {
      setBusy(false);
    }
  };

  const handleAlign = (align: ImageAlign) => {
    onUpdate({ align });
    setActiveMenu(null);
  };
  const handleAltSave = () => {
    onUpdate({ alt: altText });
    setActiveMenu(null);
  };
  const handleLinkSave = () => {
    onUpdate({ href: linkUrl || null });
    setActiveMenu(null);
  };
  const toggle = (menu: 'align' | 'alt' | 'link') =>
    setActiveMenu((prev) => (prev === menu ? null : menu));

  return (
    <div
      ref={toolbarRef}
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}
      className="absolute z-[1000] flex -translate-x-1/2 items-center gap-0.5 whitespace-nowrap rounded-[10px] bg-[#1a1a2e] px-2 py-1.5 shadow-xl"
    >
      <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      <button className={btn} onClick={handleReplace} disabled={busy} title="이미지 교체">
        <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
        <span>교체</span>
      </button>

      <span className="mx-0.5 h-[18px] w-px bg-white/15" />

      <div className="relative">
        <button
          className={`${btn} ${activeMenu === 'align' ? 'bg-indigo-500/30 text-indigo-300' : ''}`}
          onClick={() => toggle('align')}
          title="정렬"
        >
          <AlignJustify size={14} />
          <span>정렬</span>
        </button>
        {activeMenu === 'align' && (
          <div className="absolute left-1/2 top-[calc(100%+10px)] z-[1001] min-w-[120px] -translate-x-1/2 rounded-[10px] border border-slate-200 bg-white p-1.5 shadow-xl">
            {([['left', AlignLeft, '왼쪽'], ['center', AlignCenter, '가운데'], ['right', AlignRight, '오른쪽']] as const).map(
              ([val, Icon, label]) => (
                <button
                  key={val}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium text-slate-900 hover:bg-slate-100"
                  onClick={() => handleAlign(val)}
                >
                  <Icon size={13} /> {label}
                </button>
              )
            )}
          </div>
        )}
      </div>

      <span className="mx-0.5 h-[18px] w-px bg-white/15" />

      <button className={`${btn} text-red-300 hover:bg-red-400/15 hover:text-red-200`} onClick={() => onDelete()} title="삭제">
        <Trash2 size={14} />
        <span>삭제</span>
      </button>

      <span className="mx-0.5 h-[18px] w-px bg-white/15" />

      <div className="relative">
        <button
          className={`${btn} ${activeMenu === 'alt' ? 'bg-indigo-500/30 text-indigo-300' : ''}`}
          onClick={() => toggle('alt')}
          title="대체 텍스트"
        >
          <FileText size={14} />
          <span>Alt</span>
        </button>
        {activeMenu === 'alt' && (
          <div className="absolute left-1/2 top-[calc(100%+10px)] z-[1001] min-w-[260px] -translate-x-1/2 rounded-[10px] border border-slate-200 bg-white p-3.5 shadow-xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">대체 텍스트 (Alt)</p>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-indigo-500"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="이미지 설명"
              onKeyDown={(e) => e.key === 'Enter' && handleAltSave()}
              autoFocus
            />
            <div className="mt-2.5 flex justify-end gap-2">
              <button className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-500" onClick={() => setActiveMenu(null)}>취소</button>
              <button className="rounded-md bg-[#2d2dc9] px-3.5 py-1.5 text-xs font-semibold text-white" onClick={handleAltSave}>저장</button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          className={`${btn} ${activeMenu === 'link' ? 'bg-indigo-500/30 text-indigo-300' : ''}`}
          onClick={() => toggle('link')}
          title="링크 추가"
        >
          <LinkIcon size={14} />
          <span>링크</span>
        </button>
        {activeMenu === 'link' && (
          <div className="absolute left-1/2 top-[calc(100%+10px)] z-[1001] min-w-[260px] -translate-x-1/2 rounded-[10px] border border-slate-200 bg-white p-3.5 shadow-xl">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">이미지 링크</p>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] outline-none focus:border-indigo-500"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
              onKeyDown={(e) => e.key === 'Enter' && handleLinkSave()}
              autoFocus
            />
            {linkUrl && (
              <button className="mt-1.5 text-xs font-medium text-red-500" onClick={() => setLinkUrl('')}>링크 제거</button>
            )}
            <div className="mt-2.5 flex justify-end gap-2">
              <button className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-500" onClick={() => setActiveMenu(null)}>취소</button>
              <button className="rounded-md bg-[#2d2dc9] px-3.5 py-1.5 text-xs font-semibold text-white" onClick={handleLinkSave}>저장</button>
            </div>
          </div>
        )}
      </div>

      <span className="mx-0.5 h-[18px] w-px bg-white/15" />

      <button
        className={btn}
        onClick={() => {
          (document.activeElement as HTMLElement | null)?.blur();
          setActiveMenu(null);
        }}
        title="닫기"
      >
        <X size={14} />
      </button>
    </div>
  );
}
