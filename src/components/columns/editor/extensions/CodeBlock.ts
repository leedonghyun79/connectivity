import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { common, createLowlight } from 'lowlight';
import { CodeBlockView } from './CodeBlockView';

const lowlight = createLowlight(common);

/**
 * 개발 블로그 스타일 코드 블록.
 * - lowlight(highlight.js) 문법 하이라이팅
 * - NodeView로 우측 상단 언어 선택 라벨 제공
 * 출력 HTML: <pre class="hljs"><code class="language-xxx">...
 * (하이라이팅 span은 에디터 뷰 전용 — 발행 페이지는 highlight.js 재실행 필요)
 */
export const CodeBlock = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: 'plaintext',
  HTMLAttributes: { class: 'hljs' },
}).extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});
