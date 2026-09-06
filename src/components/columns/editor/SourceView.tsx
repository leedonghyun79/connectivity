'use client';
import { useMemo } from 'react';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';

interface Props {
  value: string;
  onChange: (next: string) => void;
}

export default function SourceView({ value, onChange }: Props) {
  const extensions = useMemo(
    () => [
      html(),
      EditorView.lineWrapping,
      EditorView.theme({
        '&': { fontSize: '13px', backgroundColor: '#fff' },
        '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
        '.cm-gutters': { backgroundColor: '#fafafc', borderRight: '1px solid #ececf2' },
        '&.cm-focused': { outline: 'none' },
      }),
    ],
    []
  );

  return (
    <div className="overflow-hidden rounded-b-xl border border-t-0 border-gray-200 bg-white">
      <CodeMirror
        value={value}
        extensions={extensions}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          autocompletion: false,
        }}
        minHeight="400px"
      />
    </div>
  );
}
