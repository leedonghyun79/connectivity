import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { excerptFromHtml } from '@/lib/seo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
      title: true,
      category: true,
      description: true,
      thumbnail: true,
      contentHtml: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    description: r.description || excerptFromHtml(r.contentHtml),
    thumbnail: r.thumbnail || firstImageSrc(r.contentHtml),
    publishedAt: (r.publishedAt ?? new Date()).toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return NextResponse.json(data);
}
