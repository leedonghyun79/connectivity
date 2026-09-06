import { NextRequest, NextResponse } from 'next/server';
import { imageStore } from '@/lib/storage';

export const runtime = 'nodejs';

// 이미지 서빙 — 공개 (pixelconnect 공개 사이트에서도 직접 로드).
// middleware 매처에서 api/images 를 제외한다.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const img = await imageStore.get(params.id);
  if (!img) {
    return new NextResponse('Not found', { status: 404 });
  }
  return new NextResponse(new Uint8Array(img.data), {
    status: 200,
    headers: {
      'Content-Type': img.mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
