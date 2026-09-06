import { NextRequest, NextResponse } from 'next/server';
import { dbImageStore } from '@/lib/storage';

export const runtime = 'nodejs';

// 레거시 이미지 서빙 — DB(ColumnImage)에 저장된 과거 이미지 전용.
// 신규 업로드가 R2로 가더라도 이미 발행된 글의 이미지는 계속 여기서 서빙된다.
// (R2 이미지는 커스텀 도메인에서 직접 로드되므로 이 경로로 오지 않음)
// middleware 매처에서 api/images 를 제외한다.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const img = await dbImageStore.get(params.id);
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
