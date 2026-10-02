import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { excerptFromHtml } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function firstImageSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// 본문 첫 <img> 태그를 통째로 제거 (썸네일로 대체 사용된 경우 본문 중복 노출 방지)
function stripFirstImage(html: string): string {
  return html.replace(/<img[^>]*>/i, '');
}

// pixelconnect 공개 사이트가 칼럼 상세를 가져가는 공개 엔드포인트 (인증 없음)
// params.id는 slug 또는 (구 URL 호환용) cuid 둘 다 받는다.
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const row = await prisma.column.findFirst({
    where: { OR: [{ slug: params.id }, { id: params.id }] },
  });

  if (!row || row.status !== 'published') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const usingFallbackThumbnail = !row.thumbnail;
  const thumbnail = row.thumbnail || firstImageSrc(row.contentHtml);
  const contentHtml = usingFallbackThumbnail
    ? stripFirstImage(row.contentHtml)
    : row.contentHtml;

  const response = NextResponse.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description || excerptFromHtml(row.contentHtml),
    thumbnail,
    contentHtml,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });

  // 엣지 캐시 없음: 캐시는 pixelconnect 쪽에서 하고, 어드민 저장 시 태그로 즉시 무효화한다.
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
