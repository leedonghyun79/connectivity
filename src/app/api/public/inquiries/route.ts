import { NextResponse } from 'next/server';
import { processInquiry } from '@/lib/inquiry-intake';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin':
      process.env.PUBLIC_SITE_ORIGIN || 'https://pixelconnect.co.kr',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: Request) {
  let raw: Record<string, unknown>;
  try {
    raw = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: '잘못된 요청입니다.' },
      { status: 400, headers: corsHeaders() },
    );
  }

  const xff = req.headers.get('x-forwarded-for') || '';
  const remoteip = xff.split(',')[0].trim() || undefined;

  const { status, body } = await processInquiry(raw, { remoteip });
  return NextResponse.json(body, { status, headers: corsHeaders() });
}
