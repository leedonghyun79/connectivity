import StarterKit from '@tiptap/starter-kit';
import { TextStyle, Color, FontSize, BackgroundColor } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import { ResizableImage } from '../image/ResizableImage';
import { CodeBlock } from './CodeBlock';

// 폰트 크기 프리셋 — pixelconnect 에디터와 동일
export const FONT_SIZES = [
  '10px', '12px', '14px', '16px', '18px',
  '20px', '24px', '28px', '32px', '36px', '48px',
];

interface BuildExtensionsOptions {
  placeholder?: string;
}

export function buildExtensions({ placeholder }: BuildExtensionsOptions = {}) {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] }, // H1은 글 제목과 충돌하므로 제외
      codeBlock: false, // lowlight 하이라이팅 버전으로 대체
      link: {
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      },
    }),
    TextStyle,
    Color,
    FontSize,
    BackgroundColor,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    CodeBlock,
    ResizableImage,
    Placeholder.configure({
      placeholder: placeholder ?? '여기에 칼럼 내용을 작성해주세요...',
    }),
  ];
}
