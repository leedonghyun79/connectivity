# 2026-09-20 환경설정 "지역 설정" 실제 기능화 + 언어/통화 제거

## Objective(목표)
설정 페이지의 "지역 및 언어 설정"이 DB에는 저장되지만 실제로 아무 데도 반영 안 되던 것을 확인.
언어(한국어 고정)/통화(KRW 고정)는 필드 자체를 제거하고, 타임존/날짜 형식만 실제로 앱 전체 날짜 표시에 반영되게 만든다.

## Acceptance Criteria(수용 기준)
- [x] `SystemConfig`에서 `language`, `currency` 컬럼 제거 (DB 스키마 변경, 승인 받음)
- [x] 설정 화면에서 "시스템 언어", "통화 단위" 필드 제거, 타임존 옵션에서 America/New_York 제거
- [x] 타임존/날짜 형식이 실제로 대시보드·고객·견적서·매출·문의·칼럼·작업물 등 주요 날짜 표시에 반영됨
- [x] `npm run type-check` / `npm run build` / `npm run test` 통과 (기존 실패 3건 제외)

## Changes(변경 사항)
- `prisma/schema.prisma` — `SystemConfig.language`, `SystemConfig.currency` 컬럼 제거
- `prisma/migrations/20260920010000_drop_systemconfig_language_currency/` 신규 (DROP COLUMN 2개), `db push --accept-data-loss`로 적용 후 `migrate resolve --applied`로 히스토리 정리
- `src/app/settings/page.tsx` — "지역 및 언어 설정" → "지역 설정"으로 개명, 시스템 언어/통화 단위 select 제거, 타임존에서 America/New_York 옵션 제거(Asia/Seoul, UTC만 유지)
- `src/lib/format.ts` 신규 — `formatDate(date, { timezone, dateFormat, withTime })` 순수 유틸(YYYY.MM.DD / DD/MM/YYYY / MM/DD/YYYY 지원)
- `src/lib/SystemConfigContext.tsx` 신규 — `SystemConfigProvider` + `useSystemConfig()` + `useFormatDate()` 훅. 마운트 시 `getSystemConfig()` 1회 fetch
- `src/components/layout/AppLayout.tsx` — `SystemConfigProvider`로 전체 감싸기
- 날짜 표시를 `useFormatDate()` 기반으로 교체한 파일: `columns/page.tsx`, `portfolios/page.tsx`, `customers/[id]/page.tsx`, `estimates/page.tsx`, `inquiries/page.tsx`, `sales/page.tsx`, `dashboard/RecentInquiryList.tsx`, `modals/InquiryDetailModal.tsx`

## 의도적으로 제외한 부분 (Scope 경계)
- **로그(`/logs`) 페이지, `DailySummary.tsx`의 "오늘" 표시** — "긴 형식"(요일 포함) + `getTodayStats` 등 서버 통계 집계가 KST 자정 기준으로 하드코딩되어 있어, 표시 타임존만 따로 바꾸면 통계 경계와 어긋남. 그대로 Asia/Seoul 유지.
- **`PerformanceMetrics.tsx`, `VisitorChart.tsx`의 차트 축 라벨(월/일만 표시)** — 컴팩트한 차트 틱 레이블이라 전체 날짜 형식(YYYY.MM.DD 등)을 넣으면 레이아웃이 깨짐. 원래 디자인 유지.
- **`EstimateDetailModal.tsx`, `EstimateModal.tsx`의 견적서 발행일(긴 한국어 날짜 "2026년 9월 20일")** — 인쇄용 공식 문서 스타일이라 그대로 유지.
- **`src/lib/actions.ts`의 이메일 발송 템플릿, `src/lib/sync.ts`의 콘솔 로그** — 서버 전용/비UI 컨텍스트라 훅 사용 불가, 사용자에게 노출 안 됨.
- **통화(₩/KRW) 표시 전반** — 통화 설정 자체를 제거했으므로 기존 하드코딩 그대로 유지(변경 없음).

## Verification(검증)
- `npm run type-check` — 통과
- `npm run build` — 통과, 전 페이지 정상 프리렌더
- `npm run test` — 27개 중 23 통과, 기존부터 실패하던 3개 스위트(`actions.test.ts`, `login/page.test.tsx`, `e2e/modal.spec.ts`)는 이번 변경과 무관(수정 전부터 실패)

## Risks & Mitigations(리스크 및 대응)
- **DB 컬럼 삭제(고위험)** — 사용자 승인 받고 진행. `SystemConfig`는 단일 행(id=1) 설정 테이블이라 데이터 손실 영향 없음(ko/KRW 고정값 삭제일 뿐).
- **마이그레이션 히스토리** — 새 컬럼 삭제 마이그레이션을 별도 파일로 추가하고 `migrate resolve --applied`로 마킹, 기존 baseline 파일은 건드리지 않아 체크섬 정합성 유지.

## Next Slice(다음 슬라이스)
없음 — 요청 범위 완료. 필요 시 위 "의도적으로 제외한 부분"을 추가로 반영할지는 별도 논의.
