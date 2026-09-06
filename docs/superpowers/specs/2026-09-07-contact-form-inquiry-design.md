# 문의 폼 → Inquiry 저장 + Turnstile 봇 방어 설계

작성일: 2026-09-07
상태: 승인 대기 (사용자 리뷰)

## 배경 / 목표

pixelconnect 공개 사이트의 상담 문의 폼(`/contact` 페이지의 `src/app/contact/ContactForm.tsx`)은
현재 `onSubmit={e => e.preventDefault()}` 만 있어 **아무것도 저장되지 않는다.**

이 폼 제출을 connectivity의 기존 `Inquiry` 모델로 저장하고, 봇/스팸을 Cloudflare Turnstile +
허니팟으로 막는다. 저장된 문의는 기존 어드민 `/inquiries` 화면에 그대로 노출된다.

## 방식 결정 (사용자 선택: B안)

폼 → **connectivity 공개 쓰기 API로 직접 POST**. connectivity가 Turnstile 검증 + CORS 허용.

- Turnstile secret은 connectivity 서버 환경변수에만 둔다.
- connectivity에 최초의 "공개 쓰기" 엔드포인트가 생긴다 → Turnstile + 허니팟 + 입력 검증으로 보호.

## 비목표 (YAGNI)

- Cloudflare WAF / BotBase / Under Attack Mode — 이번 범위 제외 (Turnstile + 허니팟으로 충분). 나중에 필요 시 대시보드 설정으로 추가.
- 이메일 알림(Resend 등) 연동 — 어드민 화면 확인으로 충분. 추후.
- `FinalCTA.tsx` — 폼이 아니라 `/contact` 로 가는 링크라 변경 없음.
- 로그인/회원 연결 (`Inquiry.customerId`) — 비회원 문의로만 처리.

## 데이터 모델 (connectivity / Prisma)

`Inquiry` 모델에 연락 정보 2개 필드 추가 (어드민이 회신하려면 구조화가 필요):

```prisma
model Inquiry {
  // ... 기존 필드 유지 ...
  authorName  String?
  authorEmail String?   // 신규
  authorPhone String?   // 신규
  // ...
}
```

- 마이그레이션 1개 (`npx prisma migrate dev --name inquiry_contact_fields`).
- 필드 매핑:

| 폼 입력 | Inquiry 필드 |
|---|---|
| 이름 * | `authorName` |
| 이메일 * | `authorEmail` |
| 연락처 | `authorPhone` |
| 필요한 서비스 (select) | `type` — 한글 라벨로 저장 ("웹사이트 제작" 등), 미선택 시 `null` |
| 프로젝트 설명 | `content` |
| (자동) | `title` = `"[상담문의] {이름}님 - {서비스라벨 or '서비스 미선택'}"` |
| (자동) | `status` = `"pending"` |

## connectivity — 공개 API

### `POST /api/public/inquiries` (신규)

`src/app/api/public/inquiries/route.ts`, `runtime = 'nodejs'`.

**요청 본문 (JSON)**
```ts
{
  name: string;
  email: string;
  phone?: string;
  service?: string;      // 폼 select value (web|shop|landing|maintain|etc)
  message: string;
  turnstileToken: string;
  company?: string;       // 허니팟 — 반드시 빈 값이어야 통과
}
```

**처리 순서**
1. **CORS**: `OPTIONS` 프리플라이트 처리. 응답에 `Access-Control-Allow-Origin: <PUBLIC_SITE_ORIGIN>`, `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`. `PUBLIC_SITE_ORIGIN` 은 env (기본 `https://pixelconnect.co.kr`).
2. **허니팟**: `company` 가 비어있지 않으면 → 200 `{ ok: true }` 조용히 반환 (봇에게 성공처럼 보이게), DB 저장 안 함.
3. **입력 검증**: `name`·`email`·`message` 필수, `email` 형식, `message` 길이 1–5000, `name` 길이 1–100. 실패 → 400 `{ ok: false, error }`.
4. **Turnstile 검증**: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` (form-encoded) with `secret=TURNSTILE_SECRET_KEY`, `response=turnstileToken`, `remoteip=<x-forwarded-for 첫 IP>`. 응답 `success !== true` → 403 `{ ok: false, error: '봇 검증에 실패했습니다.' }`.
5. **저장**: `prisma.inquiry.create` (위 매핑). `service` value → 한글 라벨 매핑 테이블로 변환.
6. 성공 → 200 `{ ok: true }` (+ CORS 헤더).
7. 예외 → 500 `{ ok: false, error }`, `console.error`.

**서비스 value → 라벨 매핑** (폼과 동일 기준)
```
web: '웹사이트 제작', shop: '쇼핑몰 구축', landing: '랜딩페이지',
maintain: '유지보수·운영', etc: '기타'
```

### 환경변수 (connectivity, Vercel)
- `TURNSTILE_SECRET_KEY` — Turnstile secret (사용자가 직접 입력)
- `PUBLIC_SITE_ORIGIN` — `https://pixelconnect.co.kr` (CORS 허용 origin)

## pixelconnect — 폼 배선

### 공통 유틸/컴포넌트 (신규)
- `src/lib/inquiry.ts` — `submitInquiry(payload): Promise<{ ok: boolean; error?: string }>`. `NEXT_PUBLIC_CONNECTIVITY_API_URL` + `/api/public/inquiries` 로 `fetch` POST. 네트워크 예외 시 `{ ok: false, error }`.
- `src/components/TurnstileWidget.tsx` — Cloudflare Turnstile 위젯 래퍼.
  - `https://challenges.cloudflare.com/turnstile/v0/api.js` 스크립트 1회 로드 (중복 방지)
  - `render` 콜백으로 토큰을 부모에 전달, `expired`/`error` 시 토큰 초기화
  - sitekey = `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### `src/app/contact/ContactForm.tsx` 수정 (한 곳만)

> `src/components/Contact.tsx` 는 어디에도 import 되지 않는 죽은 코드라 이번 범위에서 제외.
> `FinalCTA.tsx` 는 `/contact` 로 가는 링크라 변경 없음.

- `useState` 로 name/email/phone/service/message + `company`(허니팟) + `turnstileToken` + `status`('idle'|'sending'|'ok'|'error') + `errorMsg`
- 허니팟: 화면에 안 보이는 `<input name="company" tabIndex={-1} autoComplete="off">` (CSS로 `position:absolute; left:-9999px`)
- `<TurnstileWidget onVerify={setTurnstileToken} />` 를 제출 버튼 위에 배치
- `onSubmit`:
  1. `preventDefault`
  2. 클라 검증 (name/email/message 필수, `turnstileToken` 존재)
  3. `status='sending'` → `submitInquiry(...)` 
  4. 성공 → `status='ok'`, 폼 리셋, "문의가 접수되었습니다. 24시간 이내 회신드립니다." 표시
  5. 실패 → `status='error'`, `errorMsg` 표시, Turnstile 위젯 리셋
- 결과 메시지는 폼 내부 인라인 텍스트 (별도 토스트 라이브러리 도입 안 함)
- 제출 버튼: `status==='sending'` 이면 비활성 + "전송 중..."

### 환경변수 (pixelconnect, Vercel)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — Turnstile site key (공개용)
- `NEXT_PUBLIC_CONNECTIVITY_API_URL` — 기존 서버 전용 `CONNECTIVITY_API_URL` 과 **같은 값**을 클라이언트용으로 하나 더 등록 (클라이언트 폼에서 cross-origin POST 하므로 `NEXT_PUBLIC_` 접두사 필요)

### CSP 확인
pixelconnect에 CSP 헤더가 있으면 `challenges.cloudflare.com` 을 `script-src` / `frame-src` 에 허용해야 함. (현재 없을 가능성 높음 — 구현 시 확인)

## 어드민 (connectivity)

`/inquiries` 목록·상세에 `authorEmail` / `authorPhone` 표시 추가 (기존 `authorName` 옆). 그 외 기존 답변/상태 플로우 그대로.

## 에러 처리

- 공개 API: 허니팟 걸림 → 조용히 200. 검증 실패 → 400/403. 예외 → 500 + 서버 로그.
- pixelconnect 폼: 모든 실패를 인라인 메시지로. 크래시 없음. Turnstile 미로드 시 제출 버튼 비활성 + 안내.

## 테스트

`src/__tests__/` 에 `api-public-inquiries.test.ts` (신규) — route handler 직접 호출:
- 허니팟(`company` 채워짐) → 200 `{ ok: true }`, `prisma.inquiry.create` 미호출
- `turnstileToken` 없음 / siteverify mock `success:false` → 403, 미저장
- 필수값 누락 → 400
- siteverify mock `success:true` + 정상 입력 → `inquiry.create` 가 매핑된 값으로 1회 호출, 200
- `OPTIONS` → CORS 헤더 포함 204/200

수동 E2E: `/contact` 에서 작성 → Turnstile 통과 → 제출 → 어드민 `/inquiries` 에 `pending` 으로 뜨는지 + 이메일/연락처 보이는지.

## 영향 범위 요약

**connectivity**
- `prisma/schema.prisma` (+`authorEmail`, `authorPhone`), 마이그레이션 1개
- `src/app/api/public/inquiries/route.ts` (신규)
- `src/app/inquiries/*` — 이메일/연락처 표시 추가
- `src/__tests__/api-public-inquiries.test.ts` (신규)
- env: `TURNSTILE_SECRET_KEY`, `PUBLIC_SITE_ORIGIN`

**pixelconnect**
- `src/lib/inquiry.ts` (신규)
- `src/components/TurnstileWidget.tsx` (신규)
- `src/app/contact/ContactForm.tsx` (배선)
- env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CONNECTIVITY_API_URL`

**사용자 수동 작업**
- Vercel connectivity 에 `TURNSTILE_SECRET_KEY`, `PUBLIC_SITE_ORIGIN` 추가
- Vercel pixelconnect 에 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CONNECTIVITY_API_URL` 추가
- 양쪽 redeploy
