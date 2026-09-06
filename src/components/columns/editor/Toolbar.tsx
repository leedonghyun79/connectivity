'use client';
import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  Bold, Italic, Underline, Strikethrough, Code, Code2,
  List, ListOrdered, Quote, Minus, Link as LinkIcon, Unlink,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, RemoveFormatting, Type, FileCode2,
} from 'lucide-react';
import { toast } from 'sonner';
import { FONT_SIZES } from './extensions';
import { uploadImage } from './uploadImage';

interface Props {
  editor: Editor;
  mode: 'wysiwyg' | 'source';
  onToggleSource: () => void;
}

export default function Toolbar({ editor, mode, onToggleSource }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const sourceMode = mode === 'source';

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      codeBlock: e.isActive('codeBlock'),
      bulletList: e.isActive('bulletList'),
      orderedList: e.isActive('orderedList'),
      blockquote: e.isActive('blockquote'),
      link: e.isActive('link'),
      h2: e.isActive('heading', { level: 2 }),
      h3: e.isActive('heading', { level: 3 }),
      alignLeft: e.isActive({ textAlign: 'left' }),
      alignCenter: e.isActive({ textAlign: 'center' }),
      alignRight: e.isActive({ textAlign: 'right' }),
      alignJustify: e.isActive({ textAlign: 'justify' }),
      fontSize: (e.getAttributes('textStyle').fontSize as string | undefined) ?? '',
      color: (e.getAttributes('textStyle').color as string | undefined) ?? '#1a1a2e',
      bg: (e.getAttributes('textStyle').backgroundColor as string | undefined) ?? '#ffffff',
    }),
  });

  const chain = () => editor.chain().focus();

  const setBlock = (value: string) => {
    if (value === 'p') chain().setParagraph().run();
    else if (value === 'h2') chain().toggleHeading({ level: 2 }).run();
    else if (value === 'h3') chain().toggleHeading({ level: 3 }).run();
  };
  const setSize = (value: string) => {
    if (!value) chain().unsetFontSize().run();
    else chain().setFontSize(value).run();
  };
  const applyLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('링크 URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    chain().extendMarkRange('link').setLink({ href: url }).run();
  };
  const pickImage = () => fileInputRef.current?.click();
  const onImageFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      chain().setImage({ src: url }).run();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '이미지 업로드 실패');
    } finally {
      setUploading(false);
    }
  };

  const blockValue = state.h2 ? 'h2' : state.h3 ? 'h3' : 'p';
  const btn = (active: boolean) =>
    `inline-flex h-[30px] w-[30px] items-center justify-center rounded-md border border-transparent transition ${
      active ? 'border-[#2d2dc9]/25 bg-[#2d2dc9]/10 text-[#2d2dc9]' : 'text-gray-800 hover:bg-gray-100'
    }`;
  const selectCls =
    'h-[30px] rounded-md border border-gray-200 bg-white px-2 text-[13px] text-gray-800';
  const sep = <span className="mx-1.5 h-5 w-px bg-gray-200" />;

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-xl border border-b-0 border-gray-200 bg-[#fcfcfd] px-3 py-2.5">
      <div
        aria-hidden={sourceMode}
        className={`flex flex-wrap items-center gap-0.5 transition-opacity ${
          sourceMode ? 'pointer-events-none opacity-40' : ''
        }`}
      >
        <select className={selectCls} value={blockValue} onChange={(e) => setBlock(e.target.value)} title="문단 형식">
          <option value="p">본문</option>
          <option value="h2">제목 1</option>
          <option value="h3">제목 2</option>
        </select>
        <select className={selectCls} value={state.fontSize} onChange={(e) => setSize(e.target.value)} title="글자 크기">
          <option value="">크기</option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>{s.replace('px', '')}</option>
          ))}
        </select>

        {sep}
        <button type="button" className={btn(state.bold)} onClick={() => chain().toggleBold().run()} title="굵게"><Bold size={16} /></button>
        <button type="button" className={btn(state.italic)} onClick={() => chain().toggleItalic().run()} title="기울임"><Italic size={16} /></button>
        <button type="button" className={btn(state.underline)} onClick={() => chain().toggleUnderline().run()} title="밑줄"><Underline size={16} /></button>
        <button type="button" className={btn(state.strike)} onClick={() => chain().toggleStrike().run()} title="취소선"><Strikethrough size={16} /></button>

        {sep}
        <label className="relative inline-flex h-[30px] w-[30px] cursor-pointer flex-col items-center justify-center gap-px overflow-hidden rounded-md hover:bg-gray-100" title="글자색">
          <Type size={16} />
          <span className="h-[3px] w-4 rounded" style={{ background: state.color }} />
          <input type="color" value={state.color} onChange={(e) => chain().setColor(e.target.value).run()} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <label className="relative inline-flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-md hover:bg-gray-100" title="배경색">
          <span className="h-4 w-4 rounded border border-gray-200" style={{ background: state.bg }} />
          <input type="color" value={state.bg} onChange={(e) => chain().setBackgroundColor(e.target.value).run()} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>

        {sep}
        <button type="button" className={btn(state.bulletList)} onClick={() => chain().toggleBulletList().run()} title="글머리 기호"><List size={16} /></button>
        <button type="button" className={btn(state.orderedList)} onClick={() => chain().toggleOrderedList().run()} title="번호 매기기"><ListOrdered size={16} /></button>

        {sep}
        <button type="button" className={btn(state.alignLeft)} onClick={() => chain().setTextAlign('left').run()} title="왼쪽 정렬"><AlignLeft size={16} /></button>
        <button type="button" className={btn(state.alignCenter)} onClick={() => chain().setTextAlign('center').run()} title="가운데 정렬"><AlignCenter size={16} /></button>
        <button type="button" className={btn(state.alignRight)} onClick={() => chain().setTextAlign('right').run()} title="오른쪽 정렬"><AlignRight size={16} /></button>
        <button type="button" className={btn(state.alignJustify)} onClick={() => chain().setTextAlign('justify').run()} title="양쪽 정렬"><AlignJustify size={16} /></button>

        {sep}
        <button type="button" className={btn(state.blockquote)} onClick={() => chain().toggleBlockquote().run()} title="인용문"><Quote size={16} /></button>
        <button type="button" className={btn(false)} onClick={() => chain().setHorizontalRule().run()} title="구분선"><Minus size={16} /></button>
        <button type="button" className={btn(state.code)} onClick={() => chain().toggleCode().run()} title="인라인 코드"><Code size={16} /></button>
        <button type="button" className={btn(state.codeBlock)} onClick={() => chain().toggleCodeBlock().run()} title="코드 블록"><Code2 size={16} /></button>

        {sep}
        <button type="button" className={btn(state.link)} onClick={applyLink} title="링크"><LinkIcon size={16} /></button>
        <button type="button" className={btn(false)} onClick={() => chain().unsetLink().run()} title="링크 제거"><Unlink size={16} /></button>
        <button type="button" className={btn(false)} onClick={pickImage} disabled={uploading} title="이미지">
          <ImageIcon size={16} className={uploading ? 'animate-pulse' : ''} />
        </button>

        {sep}
        <button type="button" className={btn(false)} onClick={() => chain().unsetAllMarks().clearNodes().run()} title="서식 지우기"><RemoveFormatting size={16} /></button>

        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onImageFile} />
      </div>

      <span className="ml-auto" />
      <button
        type="button"
        className={btn(sourceMode)}
        onClick={onToggleSource}
        title={sourceMode ? 'WYSIWYG 편집기로 전환' : 'HTML 소스 편집'}
      >
        <FileCode2 size={16} />
      </button>
    </div>
  );
}
