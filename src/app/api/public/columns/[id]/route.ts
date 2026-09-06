import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function firstImageSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
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

  return NextResponse.json({
    id: row.id,
    title: row.title,
    category: row.category,
    thumbnail: row.thumbnail || firstImageSrc(row.contentHtml),
    contentHtml: row.contentHtml,
    publishedAt: (row.publishedAt ?? new Date()).toISOString(),
  });
}
