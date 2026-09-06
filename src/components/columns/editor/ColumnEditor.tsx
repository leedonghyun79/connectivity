'use client';
import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import 'highlight.js/styles/atom-one-dark.css';
import { buildExtensions } from './extensions';
import Toolbar from './Toolbar';
import SourceView from './SourceView';
import styles from './ColumnEditor.module.css';

export interface ColumnEditorProps {
  value: string;
  onChange: (html: string, json: JSONContent) => void;
  placeholder?: string;
}

type Mode = 'wysiwyg' | 'source';

export default function ColumnEditor({ value, onChange, placeholder }: ColumnEditorProps) {
  const [mode, setMode] = useState<Mode>('wysiwyg');
  const [source, setSource] = useState('');

  const editor = useEditor({
    immediatelyRender: false, // Next SSR 하이드레이션 불일치 방지
    extensions: buildExtensions({ placeholder }),
    content: value,
    editorProps: { attributes: { class: styles.prose } },
    onUpdate: ({ editor: e }) => onChange(e.getHTML(), e.getJSON()),
  });

  // 외부에서 value가 리셋될 때만 반영. 소스 편집 중엔 건드리지 않음.
  useEffect(() => {
    if (!editor || mode === 'source') return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  const toggleMode = useCallback(() => {
    if (!editor) return;
    if (mode === 'wysiwyg') {
      setSource(editor.getHTML());
      setMode('source');
    } else {
      editor.commands.setContent(source, { emitUpdate: true });
      setMode('wysiwyg');
    }
  }, [editor, mode, source]);

  const handleSourceChange = useCallback(
    (next: string) => {
      setSource(next);
      // 소스 편집 내용을 실시간으로 상위 폼과 동기화 (json은 빈 값으로 — 저장 시 재계산됨)
      onChange(next, {} as JSONContent);
    },
    [onChange]
  );

  return (
    <div className="mt-2">
      {editor && <Toolbar editor={editor} mode={mode} onToggleSource={toggleMode} />}
      {mode === 'source' ? (
        <SourceView value={source} onChange={handleSourceChange} />
      ) : (
        <EditorContent
          editor={editor}
          className="rounded-b-xl border border-t-0 border-gray-200 bg-white"
        />
      )}
    </div>
  );
}
