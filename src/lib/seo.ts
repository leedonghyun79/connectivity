/**
 * SEO 메타 설명(description) 생성 유틸.
 * 작성자가 직접 입력한 description이 없을 때, 본문 HTML에서 태그를 걷어내고
 * 검색결과 스니펫 길이(기본 155자)에 맞춰 잘라내는 fallback으로 사용한다.
 */
export function excerptFromHtml(html: string, max = 155): string {
  const text = html
    .replace(/<[^>]*>/g, '') // 태그(자기닫힘 포함) 제거
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}
