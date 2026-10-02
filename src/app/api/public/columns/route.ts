import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { excerptFromHtml } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // 캐시는 pixelconnect 쪽에서 하고, 어드민 저장 시 태그로 즉시 무효화한다.

// 본문 HTML에서 첫 이미지 추출 (대표 이미지 폴백)
function firstImageSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

// pixelconnect 공개 사이트가 칼럼 목록을 가져가는 공개 엔드포인트 (인증 없음)
export async function GET() {
  const rows = await prisma.column.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      description: true,
      thumbnail: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  // description/thumbnail이 비어있는 행만 본문 HTML을 추가로 가져와 폴백 계산
  const fallbackIds = rows.filter((r) => !r.description || !r.thumbnail).map((r) => r.id);
  const contentById = new Map<string, string>();
  if (fallbackIds.length > 0) {
    const withContent = await prisma.column.findMany({
      where: { id: { in: fallbackIds } },
      select: { id: true, contentHtml: true },
    });
    for (const c of withContent) contentById.set(c.id, c.contentHtml);
  }

  const data = rows.map((r) => {
    const html = contentById.get(r.id);
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      description: r.description || (html ? excerptFromHtml(html) : ''),
      thumbnail: r.thumbnail || (html ? firstImageSrc(html) : null),
      publishedAt: (r.publishedAt ?? new Date()).toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  });

  return NextResponse.json(data);
}
