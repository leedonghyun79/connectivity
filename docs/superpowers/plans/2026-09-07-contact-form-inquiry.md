# 문의 폼 → Inquiry + Turnstile 봇 방어 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pixelconnect `/contact` 폼 제출을 connectivity `Inquiry` 모델로 저장하고, Cloudflare Turnstile + 허니팟으로 봇/스팸을 차단한다.

**Architecture:** pixelconnect 폼(클라이언트) → connectivity `POST /api/public/inquiries` 로 cross-origin 직접 POST. connectivity가 CORS 허용 + Turnstile 토큰 서버 검증 + 허니팟/입력 검증 후 `prisma.inquiry.create`. 핵심 로직은 순수 함수 `processInquiry()`로 분리해 jest로 테스트하고, 라우트 파일은 얇은 HTTP 래퍼로 둔다.

**Tech Stack:** Next.js 16 (App Router, route handlers), Prisma + PostgreSQL(Neon), jest(jsdom, prisma 목), Cloudflare Turnstile(siteverify REST).

**두 레포에 걸침:**
- connectivity: `d:\작업실\study\projects\connectivity` — 스키마/API/어드민/테스트
- pixelconnect: `d:\작업실\study\projects\pixelconnect` — 폼 배선 (jest 없음 → `npx tsc --noEmit` + `npm run build` + 브라우저 확인)

---

## File Structure

**connectivity (생성)**
- `src/lib/turnstile.ts` — `verifyTurnstile(token, remoteip?)`: Cloudflare siteverify 호출. 유일 책임: 토큰 1개 검증 → boolean.
- `src/lib/inquiry-intake.ts` — `processInquiry(raw, ctx)` + `serviceLabel(v)`: 허니팟/검증/Turnstile/DB저장을 담은 순수 async 로직. HTTP 무관.
- `src/app/api/public/inquiries/route.ts` — `POST` / `OPTIONS` 핸들러 + `corsHeaders()`. body 파싱 + IP 추출 + `processInquiry` 호출 + `NextResponse` 반환만.
- `src/__tests__/lib/turnstile.test.ts`
- `src/__tests__/lib/inquiry-intake.test.ts`

**connectivity (수정)**
- `prisma/schema.prisma` — `Inquiry` 에 `authorEmail`, `authorPhone`
- `src/components/modals/InquiryDetailModal.tsx` — 이메일/연락처 표시 (약 200~215줄 정보 그리드)

**pixelconnect (생성)**
- `src/lib/inquiry.ts` — `submitInquiry(payload)`: connectivity API 로 fetch POST. 유일 책임: 전송 + 결과 정규화.
- `src/components/TurnstileWidget.tsx` — Turnstile 위젯 렌더/리셋 래퍼.

**pixelconnect (수정)**
- `src/app/contact/ContactForm.tsx` — 제어 컴포넌트로 전환 + 허니팟 + 위젯 + 제출 로직

---

## Task 1: Inquiry 스키마에 연락 필드 추가 + 마이그레이션

**Files:**
- Modify: `d:\작업실\study\projects\connectivity\prisma\schema.prisma` (model `Inquiry`)
- Create: `d:\작업실\study\projects\connectivity\prisma\migrations\<timestamp>_inquiry_contact_fields/migration.sql` (prisma가 생성)

- [ ] **Step 1: 스키마 수정**

`model Inquiry` 의 `authorName String?` 바로 아래 두 줄 추가:

```prisma
model Inquiry {
  id         String    @id @default(cuid())
  title      String
  content    String
  authorName String?
  authorEmail String?  // 신규: 상담 폼 이메일
  authorPhone String?  // 신규: 상담 폼 연락처
  type       String? // 기술지원, 일반문의, 결제/환불
  status     String    @default("pending") // pending, answered, closed
  answer     String?   // 답변 내용
  answeredAt DateTime? // 답변 일시
  customerId String?
  customer   Customer? @relation(fields: [customerId], references: [id])
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

- [ ] **Step 2: 마이그레이션 생성 + 적용**

Run: `cd "d:\작업실\study\projects\connectivity" && npx prisma migrate dev --name inquiry_contact_fields`
Expected: `prisma/migrations/<ts>_inquiry_contact_fields/` 생성, "Your database is now in sync", Prisma Client 재생성.

- [ ] **Step 3: 커밋**

```bash
cd "d:\작업실\study\projects\connectivity"
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(inquiry): authorEmail/authorPhone 필드 추가"
```

---

## Task 2: `verifyTurnstile` 헬퍼

**Files:**
- Create: `d:\작업실\study\projects\connectivity\src\lib\turnstile.ts`
- Test: `d:\작업실\study\projects\connectivity\src\__tests__\lib\turnstile.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`src/__tests__/lib/turnstile.test.ts`:

```ts
import { verifyTurnstile } from '@/lib/turnstile';

describe('verifyTurnstile', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    global.fetch = jest.fn();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('secret 미설정이면 fetch 없이 false', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const ok = await verifyTurnstile('tok');
    expect(ok).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('siteverify success:true 면 true', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true }),
    });
    const ok = await verifyTurnstile('tok', '1.2.3.4');
    expect(ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('siteverify success:false 면 false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    expect(await verifyTurnstile('tok')).toBe(false);
  });

  it('fetch 예외 시 false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));
    expect(await verifyTurnstile('tok')).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd "d:\작업실\study\projects\connectivity" && npx jest src/__tests__/lib/turnstile.test.ts`
Expected: FAIL — `Cannot find module '@/lib/turnstile'`.

- [ ] **Step 3: 구현**

`src/lib/turnstile.ts`:

```ts
const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Cloudflare Turnstile 토큰을 서버측에서 검증한다.
 * secret 미설정/네트워크 오류/검증 실패는 모두 false.
 */
export async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY 미설정');
    return false;
  }
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (remoteip) form.set('remoteip', remoteip);
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[turnstile] siteverify 실패', err);
    return false;
  }
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd "d:\작업실\study\projects\connectivity" && npx jest src/__tests__/lib/turnstile.test.ts`
Expected: PASS (4개).

- [ ] **Step 5: 커밋**

```bash
cd "d:\작업실\study\projects\connectivity"
git add src/lib/turnstile.ts src/__tests__/lib/turnstile.test.ts
git commit -m "feat(inquiry): Turnstile siteverify 헬퍼"
```

---

## Task 3: `processInquiry` 인테이크 로직

**Files:**
- Create: `d:\작업실\study\projects\connectivity\src\lib\inquiry-intake.ts`
- Test: `d:\작업실\study\projects\connectivity\src\__tests__\lib\inquiry-intake.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

`src/__tests__/lib/inquiry-intake.test.ts`:

```ts
import { processInquiry, serviceLabel } from '@/lib/inquiry-intake';
import prisma from '@/lib/prisma';
import { verifyTurnstile } from '@/lib/turnstile';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { inquiry: { create: jest.fn() } },
}));
jest.mock('@/lib/turnstile', () => ({
  __esModule: true,
  verifyTurnstile: jest.fn(),
}));

const create = prisma.inquiry.create as jest.Mock;
const verify = verifyTurnstile as jest.Mock;

const base = {
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  service: 'web',
  message: '홈페이지 제작 문의합니다.',
  turnstileToken: 'tok',
};

beforeEach(() => {
  jest.clearAllMocks();
  verify.mockResolvedValue(true);
  create.mockResolvedValue({ id: 'inq_1' });
});

describe('serviceLabel', () => {
  it('알려진 값 → 한글 라벨', () => {
    expect(serviceLabel('web')).toBe('웹사이트 제작');
    expect(serviceLabel('maintain')).toBe('유지보수·운영');
  });
  it('빈 값/미지의 값 → null', () => {
    expect(serviceLabel(undefined)).toBeNull();
    expect(serviceLabel('')).toBeNull();
    expect(serviceLabel('xxx')).toBeNull();
  });
});

describe('processInquiry', () => {
  it('허니팟(company 채워짐) → 200 ok, DB 저장 안 함', async () => {
    const r = await processInquiry({ ...base, company: 'bot' }, {});
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it('이름 없음 → 400', async () => {
    const r = await processInquiry({ ...base, name: '  ' }, {});
    expect(r.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('이메일 형식 오류 → 400', async () => {
    const r = await processInquiry({ ...base, email: 'not-an-email' }, {});
    expect(r.status).toBe(400);
  });

  it('메시지 없음 → 400', async () => {
    const r = await processInquiry({ ...base, message: '' }, {});
    expect(r.status).toBe(400);
  });

  it('turnstileToken 없음 → 403, DB 저장 안 함', async () => {
    const r = await processInquiry({ ...base, turnstileToken: '' }, {});
    expect(r.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
  });

  it('verifyTurnstile false → 403', async () => {
    verify.mockResolvedValue(false);
    const r = await processInquiry(base, { remoteip: '1.2.3.4' });
    expect(r.status).toBe(403);
    expect(verify).toHaveBeenCalledWith('tok', '1.2.3.4');
    expect(create).not.toHaveBeenCalled();
  });

  it('정상 → 200, 매핑된 값으로 create 1회', async () => {
    const r = await processInquiry(base, {});
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        title: '[상담문의] 홍길동님 - 웹사이트 제작',
        content: '홈페이지 제작 문의합니다.',
        authorName: '홍길동',
        authorEmail: 'hong@example.com',
        authorPhone: '010-1234-5678',
        type: '웹사이트 제작',
        status: 'pending',
      },
    });
  });

  it('service 미선택 → type null, 제목에 "서비스 미선택"', async () => {
    await processInquiry({ ...base, service: undefined }, {});
    const arg = create.mock.calls[0][0].data;
    expect(arg.type).toBeNull();
    expect(arg.title).toBe('[상담문의] 홍길동님 - 서비스 미선택');
  });

  it('phone 빈 값 → authorPhone null', async () => {
    await processInquiry({ ...base, phone: '' }, {});
    expect(create.mock.calls[0][0].data.authorPhone).toBeNull();
  });

  it('prisma.create 예외 → 500', async () => {
    create.mockRejectedValue(new Error('db down'));
    const r = await processInquiry(base, {});
    expect(r.status).toBe(500);
    expect(r.body).toMatchObject({ ok: false });
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `cd "d:\작업실\study\projects\connectivity" && npx jest src/__tests__/lib/inquiry-intake.test.ts`
Expected: FAIL — `Cannot find module '@/lib/inquiry-intake'`.

- [ ] **Step 3: 구현**

`src/lib/inquiry-intake.ts`:

```ts
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
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `cd "d:\작업실\study\projects\connectivity" && npx jest src/__tests__/lib/inquiry-intake.test.ts`
Expected: PASS (12개).

- [ ] **Step 5: 전체 테스트 회귀 확인**

Run: `cd "d:\작업실\study\projects\connectivity" && npm test`
Expected: 기존 테스트 포함 전부 PASS.

- [ ] **Step 6: 커밋**

```bash
cd "d:\작업실\study\projects\connectivity"
git add src/lib/inquiry-intake.ts src/__tests__/lib/inquiry-intake.test.ts
git commit -m "feat(inquiry): 공개 문의 인테이크 로직(검증+허니팟+Turnstile+저장)"
```

---

## Task 4: 공개 라우트 `POST /api/public/inquiries`

**Files:**
- Create: `d:\작업실\study\projects\connectivity\src\app\api\public\inquiries\route.ts`

테스트: 라우트는 얇은 래퍼라 유닛테스트 없이 Step 4의 수동 curl 로 검증한다 (Request/Response 글로벌이 jsdom 테스트 환경에서 불안정).

- [ ] **Step 1: 구현**

`src/app/api/public/inquiries/route.ts`:

```ts
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
```

- [ ] **Step 2: 타입체크**

Run: `cd "d:\작업실\study\projects\connectivity" && npm run type-check`
Expected: 에러 없음.

- [ ] **Step 3: 로컬 dev 서버로 수동 검증**

`.env` 에 임시로 `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` (Cloudflare 공식 "always passes" 테스트 secret) 추가 후:

Run: `cd "d:\작업실\study\projects\connectivity" && npm run dev`

다른 터미널에서:
```bash
# 정상 (테스트 secret은 어떤 토큰이든 통과)
curl -i -X POST http://localhost:3000/api/public/inquiries \
  -H 'Content-Type: application/json' \
  -d '{"name":"테스트","email":"t@t.com","message":"수동 테스트","turnstileToken":"x"}'
# 기대: HTTP/1.1 200, {"ok":true}, 응답에 Access-Control-Allow-Origin 헤더

# 허니팟
curl -i -X POST http://localhost:3000/api/public/inquiries \
  -H 'Content-Type: application/json' \
  -d '{"name":"봇","email":"b@b.com","message":"x","turnstileToken":"x","company":"filled"}'
# 기대: 200 {"ok":true} — 하지만 DB엔 없음

# 검증 실패
curl -i -X POST http://localhost:3000/api/public/inquiries \
  -H 'Content-Type: application/json' -d '{"name":"","email":"bad","message":""}'
# 기대: 400

# 프리플라이트
curl -i -X OPTIONS http://localhost:3000/api/public/inquiries
# 기대: 204 + CORS 헤더
```

Prisma Studio(`npx prisma studio`)나 어드민 `/inquiries` 에서 "테스트" 문의 1건만 생성됐는지 확인.
확인 후 `.env` 의 임시 `TURNSTILE_SECRET_KEY` 는 **실제 값으로 교체하거나 제거**.

- [ ] **Step 4: 커밋**

```bash
cd "d:\작업실\study\projects\connectivity"
git add src/app/api/public/inquiries/route.ts
git commit -m "feat(inquiry): 공개 POST /api/public/inquiries 라우트 (CORS+Turnstile)"
```

---

## Task 5: 어드민 문의 상세에 이메일/연락처 표시

**Files:**
- Modify: `d:\작업실\study\projects\connectivity\src\components\modals\InquiryDetailModal.tsx`

`getInquiries()` 는 이미 전체 row 를 반환하므로 액션 변경은 불필요. 모달의 "문의자 / 접수 일시" 그리드에 행 2개 추가.

- [ ] **Step 1: 정보 그리드 수정**

`InquiryDetailModal.tsx` 에서 아래 블록을 찾는다:

```tsx
          {/* 문의 정보 요약 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">문의자</div>
              <div className="text-sm font-black text-black">
                {inquiry.authorName || inquiry.customer?.name || '익명'}
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">접수 일시</div>
              <div className="text-sm font-black text-black font-mono">
                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>
```

아래로 교체 (이메일/연락처 행 추가, 값 있을 때만):

```tsx
          {/* 문의 정보 요약 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">문의자</div>
              <div className="text-sm font-black text-black">
                {inquiry.authorName || inquiry.customer?.name || '익명'}
              </div>
            </div>
            <div className="p-5 bg-gray-50 rounded-2xl">
              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">접수 일시</div>
              <div className="text-sm font-black text-black font-mono">
                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
              </div>
            </div>
            {inquiry.authorEmail && (
              <div className="p-5 bg-gray-50 rounded-2xl">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">이메일</div>
                <a
                  href={`mailto:${inquiry.authorEmail}`}
                  className="text-sm font-black text-black underline break-all"
                >
                  {inquiry.authorEmail}
                </a>
              </div>
            )}
            {inquiry.authorPhone && (
              <div className="p-5 bg-gray-50 rounded-2xl">
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">연락처</div>
                <div className="text-sm font-black text-black font-mono">
                  {inquiry.authorPhone}
                </div>
              </div>
            )}
          </div>
```

- [ ] **Step 2: 타입체크**

Run: `cd "d:\작업실\study\projects\connectivity" && npm run type-check`
Expected: 에러 없음 (`inquiry` 는 `any`).

- [ ] **Step 3: 커밋**

```bash
cd "d:\작업실\study\projects\connectivity"
git add src/components/modals/InquiryDetailModal.tsx
git commit -m "feat(inquiry): 어드민 문의 상세에 이메일/연락처 표시"
```

---

## Task 6: pixelconnect `submitInquiry` 라이브러리

**Files:**
- Create: `d:\작업실\study\projects\pixelconnect\src\lib\inquiry.ts`

pixelconnect 에는 jest 가 없으므로 `npx tsc --noEmit` 로 검증.

- [ ] **Step 1: 구현**

`src/lib/inquiry.ts`:

```ts
// 상담 폼 제출을 connectivity 공개 API 로 보낸다. (클라이언트에서 호출 → NEXT_PUBLIC_ 필요)

const API = (process.env.NEXT_PUBLIC_CONNECTIVITY_API_URL || '').replace(/\/$/, '');

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  service?: string;
  message: string;
  turnstileToken: string;
  company?: string; // 허니팟
}

export async function submitInquiry(
  payload: InquiryPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${API}/api/public/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || '문의 전송에 실패했습니다.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: '네트워크 오류로 전송하지 못했습니다.' };
  }
}
```

- [ ] **Step 2: 타입체크**

Run: `cd "d:\작업실\study\projects\pixelconnect" && npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
cd "d:\작업실\study\projects\pixelconnect"
git add src/lib/inquiry.ts
git commit -m "feat(inquiry): connectivity 문의 API 호출 유틸"
```

---

## Task 7: pixelconnect `TurnstileWidget` 컴포넌트

**Files:**
- Create: `d:\작업실\study\projects\pixelconnect\src\components\TurnstileWidget.tsx`

- [ ] **Step 1: 구현**

`src/components/TurnstileWidget.tsx`:

```tsx
'use client';
import { useEffect, useRef } from 'react';

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

interface Props {
  /** 검증 토큰. 만료/오류 시 '' 로 호출됨. 부모는 useCallback 으로 감쌀 것. */
  onToken: (token: string) => void;
}

export default function TurnstileWidget({ onToken }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = () => {
      if (cancelled || !boxRef.current || !window.turnstile || idRef.current) return;
      idRef.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onToken(token),
        'expired-callback': () => onToken(''),
        'error-callback': () => onToken(''),
      });
    };

    if (window.turnstile) {
      render();
      return () => {
        cancelled = true;
      };
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    return () => {
      cancelled = true;
      script?.removeEventListener('load', render);
    };
  }, [onToken]);

  return <div ref={boxRef} />;
}
```

- [ ] **Step 2: 타입체크**

Run: `cd "d:\작업실\study\projects\pixelconnect" && npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
cd "d:\작업실\study\projects\pixelconnect"
git add src/components/TurnstileWidget.tsx
git commit -m "feat(inquiry): Turnstile 위젯 래퍼 컴포넌트"
```

---

## Task 8: `ContactForm.tsx` 배선

**Files:**
- Modify: `d:\작업실\study\projects\pixelconnect\src\app\contact\ContactForm.tsx`

폼 오른쪽 블록(`{/* Right: Form */}` 안의 `<div className={styles.formWrap}>`)을 제어 컴포넌트로 전환. 왼쪽 정보 블록은 그대로.

- [ ] **Step 1: 파일 상단 import/‘use client’ 유지 + 훅 추가**

`ContactForm.tsx` 를 아래 전체 내용으로 교체:

```tsx
'use client';
import { useCallback, useState } from 'react';
import styles from './contact.module.css';
import TurnstileWidget from '@/components/TurnstileWidget';
import { submitInquiry } from '@/lib/inquiry';

type Status = 'idle' | 'sending' | 'ok' | 'error';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [message, setMessage] = useState('');
  const [company, setCompany] = useState(''); // 허니팟
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onToken = useCallback((t: string) => setToken(t), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus('error');
      setErrorMsg('이름, 이메일, 프로젝트 설명을 입력해주세요.');
      return;
    }
    if (!token) {
      setStatus('error');
      setErrorMsg('잠시 후 다시 시도해주세요. (봇 확인 로딩 중)');
      return;
    }

    setStatus('sending');
    const res = await submitInquiry({
      name, email, phone, service, message, company, turnstileToken: token,
    });

    if (res.ok) {
      setStatus('ok');
      setName(''); setEmail(''); setPhone(''); setService(''); setMessage('');
      setToken('');
    } else {
      setStatus('error');
      setErrorMsg(res.error || '문의 전송에 실패했습니다.');
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left: Info */}
          <div className={styles.info}>
            <h3 className={styles.infoTitle}>상담 프로세스</h3>
            <div className={styles.steps}>
              {[
                { num: '01', title: '문의 접수', desc: '아래 양식 또는 카카오톡으로 문의해주세요.' },
                { num: '02', title: '무료 상담', desc: '요구사항과 목표를 파악하고 맞춤 제안을 드립니다.' },
                { num: '03', title: '견적 확정', desc: '투명한 견적을 안내드리며, 추가 비용은 없습니다.' },
              ].map((step, i) => (
                <div key={i} className={styles.step}>
                  <span className={styles.stepNum}>{step.num}</span>
                  <div>
                    <h4 className={styles.stepTitle}>{step.title}</h4>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.contactMethods}>
              <div className={styles.method}>
                <span className={styles.methodLabel}>이메일</span>
                <a href="mailto:hello@pixelconnect.co.kr" className={styles.methodValue}>
                  hello@pixelconnect.co.kr
                </a>
              </div>
              <div className={styles.method}>
                <span className={styles.methodLabel}>전화</span>
                <span className={styles.methodValue}>010-0000-0000</span>
              </div>
              <div className={styles.method}>
                <span className={styles.methodLabel}>카카오톡</span>
                <a href="#" className={styles.methodValue}>
                  카카오 채널 문의하기 →
                </a>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className={styles.formWrap}>
            <form className={styles.form} onSubmit={handleSubmit}>
              {/* 허니팟: 사람 눈에 안 보임 */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
                aria-hidden="true"
              />

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>이름 *</label>
                  <input
                    type="text" placeholder="홍길동" className={styles.input}
                    value={name} onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>이메일 *</label>
                  <input
                    type="email" placeholder="example@email.com" className={styles.input}
                    value={email} onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>연락처</label>
                  <input
                    type="tel" placeholder="010-0000-0000" className={styles.input}
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>필요한 서비스</label>
                  <select
                    className={styles.select}
                    value={service} onChange={(e) => setService(e.target.value)}
                  >
                    <option value="">선택해주세요</option>
                    <option value="web">웹사이트 제작</option>
                    <option value="shop">쇼핑몰 구축</option>
                    <option value="landing">랜딩페이지</option>
                    <option value="maintain">유지보수·운영</option>
                    <option value="etc">기타</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>프로젝트 설명</label>
                <textarea
                  placeholder="프로젝트에 대해 자유롭게 설명해주세요. 참고 사이트, 원하는 기능, 예산 등 어떤 내용이든 괜찮습니다."
                  className={styles.textarea}
                  rows={6}
                  value={message} onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <TurnstileWidget onToken={onToken} />

              <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
                {status === 'sending' ? '전송 중...' : '무료 상담 신청하기 →'}
              </button>

              {status === 'ok' && (
                <p className={styles.note} style={{ color: '#1a7f37' }}>
                  문의가 접수되었습니다. 영업일 기준 24시간 이내 회신드립니다.
                </p>
              )}
              {status === 'error' && (
                <p className={styles.note} style={{ color: '#c0392b' }}>{errorMsg}</p>
              )}
              {status !== 'ok' && status !== 'error' && (
                <p className={styles.note}>
                  * 상담은 무료이며, 영업일 기준 24시간 이내 회신드립니다.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: 타입체크**

Run: `cd "d:\작업실\study\projects\pixelconnect" && npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 빌드**

Run: `cd "d:\작업실\study\projects\pixelconnect" && npm run build`
Expected: 빌드 성공.

- [ ] **Step 4: 커밋**

```bash
cd "d:\작업실\study\projects\pixelconnect"
git add src/app/contact/ContactForm.tsx
git commit -m "feat(inquiry): /contact 폼을 connectivity Inquiry API 에 연결 + Turnstile"
```

---

## Task 9: 환경변수 등록 + 통합 E2E

코드 아님 — 배포 전 체크리스트.

- [ ] **Step 1: connectivity 환경변수**

`.env` (로컬) 및 Vercel connectivity 프로젝트(Production)에 추가:
- `TURNSTILE_SECRET_KEY` = Cloudflare Turnstile 위젯의 Secret (사용자 보관 값)
- `PUBLIC_SITE_ORIGIN` = `https://pixelconnect.co.kr`

- [ ] **Step 2: pixelconnect 환경변수**

`.env.local` (로컬) 및 Vercel pixelconnect 프로젝트(Production)에 추가:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = Turnstile Site key (`0x4AAAAAAA...` 공개값)
- `NEXT_PUBLIC_CONNECTIVITY_API_URL` = 기존 `CONNECTIVITY_API_URL` 과 동일 값 (예: `https://admin.pixelconnect.co.kr`)

- [ ] **Step 3: 양쪽 배포**

connectivity 먼저 배포(마이그레이션 반영: 배포 파이프라인에 `prisma migrate deploy` 없으면 수동 실행) → pixelconnect 배포.

- [ ] **Step 4: 프로덕션 E2E**

1. `https://pixelconnect.co.kr/contact` 접속 → Turnstile 위젯이 렌더되는지
2. 폼 작성 후 제출 → "문의가 접수되었습니다" 표시
3. connectivity 어드민 `/inquiries` → 방금 문의가 `답변 대기` 로 뜨는지, 상세 모달에 이메일/연락처 보이는지
4. 개발자도구로 허니팟 `company` 필드에 값 강제 주입 후 제출 → 화면은 성공처럼 보이되 어드민엔 안 들어오는지
5. CSP 확인: 콘솔에 `challenges.cloudflare.com` 관련 CSP 차단 에러가 없는지. 있으면 pixelconnect 응답 헤더/`next.config` 의 CSP 에 `script-src`·`frame-src` 로 `https://challenges.cloudflare.com` 추가.

- [ ] **Step 5: 스펙 문서 상태 갱신 + 커밋**

`docs/superpowers/specs/2026-09-07-contact-form-inquiry-design.md` 상단 상태를 `구현 완료`로 변경 후 커밋.

---

## Self-Review (작성자 체크 완료)

- **스펙 커버리지**: 스키마 필드(T1) · Turnstile 검증(T2) · 허니팟/검증/매핑/저장(T3) · CORS+라우트(T4) · 어드민 표시(T5) · 폼 유틸(T6) · 위젯(T7) · 폼 배선(T8) · env+E2E(T9). 스펙의 "비목표"(WAF/이메일알림/Contact.tsx)는 태스크 없음이 정상.
- **플레이스홀더**: 없음. 모든 코드 스텝에 전체 코드 포함.
- **타입 일관성**: `processInquiry(raw, ctx) → { status, body }` (T3=T4), `serviceLabel` 반환 `string|null` (T3 내부), `submitInquiry(payload) → { ok, error? }` (T6=T8), `TurnstileWidget` prop 이름 `onToken` (T7=T8), 폼 select value `web|shop|landing|maintain|etc` 가 `SERVICE_LABELS` 키와 일치 (T3=T8).
