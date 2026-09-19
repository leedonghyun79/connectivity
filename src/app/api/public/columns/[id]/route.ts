import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const row = await prisma.column.findUnique({ where: { id: params.id } });

  if (!row || row.status !== 'published') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const usingFallbackThumbnail = !row.thumbnail;
  const thumbnail = row.thumbnail || firstImageSrc(row.contentHtml);
  const contentHtml = usingFallbackThumbnail
    ? stripFirstImage(row.contentHtml)
    : row.contentHtml;

  return NextResponse.json({
    id: row.id,
    title: row.title,
    category: row.category,
    thumbnail,
    contentHtml,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
  });
}
