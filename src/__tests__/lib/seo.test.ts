import { excerptFromHtml } from '@/lib/seo';

describe('excerptFromHtml', () => {
  it('HTML 태그를 제거하고 텍스트만 남겨야 함', () => {
    expect(excerptFromHtml('<p>안녕하세요 <b>픽셀커넥트</b>입니다.</p>')).toBe('안녕하세요 픽셀커넥트입니다.');
  });

  it('연속 공백/줄바꿈을 하나의 공백으로 정리해야 함', () => {
    expect(excerptFromHtml('<p>첫줄</p>\n<p>둘째줄</p>')).toBe('첫줄 둘째줄');
  });

  it('기본 155자를 넘으면 자르고 말줄임표를 붙여야 함', () => {
    const long = '가'.repeat(200);
    const result = excerptFromHtml(`<p>${long}</p>`);
    expect(result.length).toBe(156); // 155자 + '…'
    expect(result.endsWith('…')).toBe(true);
  });

  it('max 인자로 잘리는 길이를 조절할 수 있어야 함', () => {
    const long = '나'.repeat(50);
    const result = excerptFromHtml(`<p>${long}</p>`, 10);
    expect(result).toBe('나'.repeat(10) + '…');
  });

  it('짧은 텍스트는 그대로 반환해야 함', () => {
    expect(excerptFromHtml('<p>짧은 문장</p>')).toBe('짧은 문장');
  });

  it('빈 HTML이면 빈 문자열을 반환해야 함', () => {
    expect(excerptFromHtml('')).toBe('');
    expect(excerptFromHtml('<p></p>')).toBe('');
  });

  it('img 등 self-closing 태그도 제거해야 함', () => {
    expect(excerptFromHtml('<p><img src="x.png"/>본문</p>')).toBe('본문');
  });
});
