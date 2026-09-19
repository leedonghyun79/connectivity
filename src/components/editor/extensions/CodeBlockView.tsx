'use client';
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';

const LANGUAGES = [
  { value: 'plaintext', label: 'Plain' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'HTML/XML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' },
  { value: 'markdown', label: 'Markdown' },
];

export function CodeBlockView({ node, updateAttributes, extension }: NodeViewProps) {
  const current: string =
    node.attrs.language || extension.options.defaultLanguage || 'plaintext';

  return (
    <NodeViewWrapper className="relative my-5">
      <select
        contentEditable={false}
        value={current}
        onChange={(e) => updateAttributes({ language: e.target.value })}
        className="absolute right-2 top-2 z-10 h-6 rounded-md border border-white/20 bg-white/10 px-1.5 text-[11px] text-slate-300 focus:outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.value} value={l.value} className="text-slate-900">
            {l.label}
          </option>
        ))}
      </select>
      <pre className="m-0 overflow-x-auto rounded-[10px] bg-[#1a1a2e] px-[18px] pb-4 pt-10 text-[13px] text-[#f2f2f7]">
        <NodeViewContent<'code'>
          as="code"
          className={`hljs bg-transparent p-0 font-mono text-[13px] text-inherit language-${current}`}
        />
      </pre>
    </NodeViewWrapper>
  );
}
