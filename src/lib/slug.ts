import prisma from '@/lib/prisma';

// 한글 제목을 그대로 살린 SEO 슬러그 생성 (로마자 변환 없음)
// 예: "홈페이지 기획 건너뛰면 생기는 문제" -> "홈페이지-기획-건너뛰면-생기는-문제"
function slugBase(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// title로부터 유니크한 슬러그를 생성한다. 충돌 시 -2, -3 ... 붙인다.
// excludeId: 자기 자신은 충돌 검사에서 제외 (재생성 시 사용)
export async function generateUniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugBase(title) || 'column';
  let candidate = base;
  let n = 2;
  while (
    await prisma.column.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
