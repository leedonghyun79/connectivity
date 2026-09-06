import prisma from './prisma';
import { verifyTurnstile } from './turnstile';

export interface IntakeCtx {
  remoteip?: string;
}

export interface IntakeResult {
  status: number;
  body: Record<string, unknown>;
}

const SERVICE_LABELS: Record<string, string> = {
  web: '웹사이트 제작',
  shop: '쇼핑몰 구축',
  landing: '랜딩페이지',
  maintain: '유지보수·운영',
  etc: '기타',
};

export function serviceLabel(value: string | undefined | null): string | null {
  if (!value) return null;
  return SERVICE_LABELS[value] ?? null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

/**
 * 공개 문의 폼 입력을 검증·봇차단 후 Inquiry 로 저장한다.
 * HTTP 무관 순수 로직. 반환값을 그대로 응답 status/body 로 쓴다.
 */
export async function processInquiry(
  raw: Record<string, unknown>,
  ctx: IntakeCtx,
): Promise<IntakeResult> {
  // 1. 허니팟: 봇에게는 성공처럼 보이게 하고 저장은 안 함
  if (str(raw.company).trim() !== '') {
    return { status: 200, body: { ok: true } };
  }

  // 2. 입력 검증
  const name = str(raw.name).trim();
  const email = str(raw.email).trim();
  const phone = str(raw.phone).trim();
  const service = str(raw.service).trim();
  const message = str(raw.message).trim();
  const token = str(raw.turnstileToken).trim();

  if (
    name.length < 1 || name.length > 100 ||
    !EMAIL_RE.test(email) ||
    message.length < 1 || message.length > 5000
  ) {
    return { status: 400, body: { ok: false, error: '입력값을 확인해주세요.' } };
  }

  // 3. Turnstile
  if (!token || !(await verifyTurnstile(token, ctx.remoteip))) {
    return { status: 403, body: { ok: false, error: '봇 검증에 실패했습니다.' } };
  }

  // 4. 저장
  try {
    const label = serviceLabel(service);
    await prisma.inquiry.create({
      data: {
        title: `[상담문의] ${name}님 - ${label ?? '서비스 미선택'}`,
        content: message,
        authorName: name,
        authorEmail: email,
        authorPhone: phone || null,
        type: label,
        status: 'pending',
      },
    });
    return { status: 200, body: { ok: true } };
  } catch (err) {
    console.error('[inquiry-intake] 저장 실패', err);
    return { status: 500, body: { ok: false, error: '문의 접수 중 오류가 발생했습니다.' } };
  }
}
