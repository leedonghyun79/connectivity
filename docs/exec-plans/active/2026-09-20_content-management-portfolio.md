# 2026-09-20 콘텐츠 관리 메뉴 개편 + 작업물(포트폴리오) 관리

## Objective(목표)
사이드바 "칼럼 관리"를 "콘텐츠 관리" 상위 메뉴로 바꾸고, 하위에 "칼럼 관리" / "작업물 관리" 2개 메뉴를 둔다.
"작업물 관리"는 칼럼과 동일한 구조(등록/수정/삭제/발행)로 픽셀커넥트 공개 사이트 포트폴리오 페이지의 데이터 소스가 된다.

기반 문서: `docs/superpowers/specs/2026-09-07-portfolio-management-design.md` (승인 대기 상태였던 기존 설계).
이번 계획에서 네비게이션 구조만 스펙 대비 변경(하위 메뉴 2단 구조로), 나머지(모델/필드/API)는 스펙을 따른다.

## Acceptance Criteria(수용 기준)
- [x] 사이드바: "콘텐츠 관리"(상위) > "칼럼 관리" / "작업물 관리"(하위) 2단 메뉴로 표시
- [x] `Portfolio` Prisma 모델 추가 + 마이그레이션 적용
- [x] `/portfolios` 목록, `/portfolios/new`, `/portfolios/[id]/edit` 어드민 페이지 — 칼럼과 동일 UX(작성/임시저장/발행/발행취소/삭제)
- [x] `GET /api/public/portfolios`, `GET /api/public/portfolios/[id]` 공개 API (인증 없음, published만)
- [x] 에디터 폴더 `src/components/columns/editor` → `src/components/editor`로 이동, 칼럼/작업물 양쪽에서 공유
- [x] `npm run verify` 통과 (사전 존재하던 실패 3건 제외 — 아래 Risks 참고)

## Plan(계획)
1. **DB 스키마** — `prisma/schema.prisma`에 `Portfolio` 모델 추가 (스펙 그대로), `npx prisma migrate dev --name add_portfolio` (승인 후 실행 — 고위험)
2. **에디터 공유화** — `src/components/columns/editor/**` → `src/components/editor/**` 이동, `ColumnForm.tsx` import 경로 수정
3. **서버 액션** — `src/lib/portfolio-actions.ts` 신규 (칼럼 액션 패턴 복제): `getPortfolios/getPortfolio/createPortfolio/updatePortfolio/publishPortfolio/unpublishPortfolio/deletePortfolio`
4. **어드민 페이지** — `src/components/portfolio/PortfolioForm.tsx`, `src/app/portfolios/{page,new/page,[id]/edit/page}.tsx` (칼럼 페이지 복제 + 필드 추가: tags/result/client/projectType/websiteUrl)
5. **공개 API** — `src/app/api/public/portfolios/route.ts`, `src/app/api/public/portfolios/[id]/route.ts` (칼럼 라우트 패턴 복제, thumbnail 폴백/본문 중복 제거 로직 포함)
6. **사이드바 네비 개편** — `Sidebar.tsx`: "칼럼 관리" 단일 항목 → "콘텐츠 관리" 그룹(하위: 칼럼 관리 `/columns`, 작업물 관리 `/portfolios`). 기존 칼럼 관리 진입 경로(`/columns`)는 그대로 유지.
7. **테스트** — `src/__tests__/lib/portfolio-actions.test.ts` (actions.test.ts 패턴 미러)

## Changes(변경 사항)
- `prisma/schema.prisma` — `Portfolio` 모델 추가
- **마이그레이션 히스토리 재정리(예정에 없던 추가 작업)** — `migrate dev` 실행 중 기존 히스토리 드리프트 발견(`000_init`이 빈 파일이라 Customer/Inquiry/Estimate 등 초기 스키마가 마이그레이션 파일로 기록된 적이 없었음). 기존 4개 마이그레이션 폴더를 삭제하고 현재 스키마 기준 통합 baseline(`20260920000000_baseline`) 1개로 재생성, `_prisma_migrations` 기록 테이블 초기화 후 재마킹. 실제 DB 스키마/데이터 변경 없음.
- `src/components/columns/editor/**` → `src/components/editor/**` 이동 (git mv), `ColumnForm.tsx` import 경로 `./editor/*` → `../editor/*` 수정
- `src/lib/portfolio-actions.ts` 신규 — `getPortfolios/getPortfolio/createPortfolio/updatePortfolio/publishPortfolio/unpublishPortfolio/deletePortfolio`. `PORTFOLIO_CATEGORIES`는 export하지 않음(`'use server'` 파일에서 배열 상수를 export하면 서버 액션 번들링 때문에 클라이언트에서 `.map is not a function` 런타임 에러 발생 — 빌드 중 실제로 재현/확인함)
- `src/components/portfolio/PortfolioForm.tsx` 신규 — `PORTFOLIO_CATEGORIES`를 로컬 상수로 재정의(칼럼 `ColumnForm.tsx`와 동일 패턴)
- `src/app/portfolios/{page,new/page,[id]/edit/page}.tsx` 신규
- `src/app/api/public/portfolios/{route,[id]/route}.ts` 신규
- `src/components/layout/Sidebar.tsx` — `children` 있는 메뉴 항목(그룹) 렌더링 지원 추가, "콘텐츠 관리" 그룹(칼럼 관리/작업물 관리 하위) 반영
- `src/__tests__/lib/portfolio-actions.test.ts` 신규 (5 tests, pass)

## Verification(검증)
- `npm run type-check` — 통과
- `npm run lint` — 통과 (경고 2건은 기존 `EstimateDetailModal.tsx`의 `<img>` 경고, 이번 작업과 무관)
- `npm run build` — 통과 (portfolios 관련 페이지 전부 정상 프리렌더)
- `npm run test` — portfolio-actions.test.ts 5/5 통과. 기존 실패 3개(`actions.test.ts`의 `updateEstimateStatus` mock 누락, `login/page.test.tsx`, `e2e/modal.spec.ts`의 Jest/Playwright 설정 충돌)는 이번 작업 이전부터 존재하던 실패로 무관함 확인(해당 파일 git diff 없음)
- 수동 E2E(어드민 생성 → 발행 → 공개 API 확인)와 사이드바 육안 확인은 사용자가 직접 브라우저에서 확인 필요

## Risks & Mitigations(리스크 및 대응)
- **DB 마이그레이션(고위험)** — 신규 테이블 추가만 있고 기존 테이블 변경 없음 → 되돌리기 쉬움. 사용자 승인 후 진행.
- **마이그레이션 히스토리 재정리(추가 고위험, 승인받고 진행)** — 운영 DB(Neon)의 `_prisma_migrations` 기록 테이블을 초기화했음. 실제 스키마/데이터는 무영향이나, 이후 다른 환경(예: 배포 파이프라인)에서 구 마이그레이션 히스토리를 참조하고 있었다면 `prisma migrate deploy` 시 재확인 필요.
- **에디터 폴더 이동** — import 경로 누락 위험 → 빌드로 확인 완료, 문제 없음.
- **pixelconnect(공개 사이트) 연동** — 별도 레포. 이번 작업 범위는 connectivity(어드민) + 공개 API까지. 사이트 쪽 `/portfolio` 페이지 연동은 별도 세션/작업.

## Artifacts Updated(갱신된 산출물)
- `prisma/schema.prisma`, 마이그레이션 파일
- `src/lib/portfolio-actions.ts`
- `src/components/editor/**` (이동)
- `src/components/portfolio/PortfolioForm.tsx`
- `src/app/portfolios/**`
- `src/app/api/public/portfolios/**`
- `src/components/layout/Sidebar.tsx`
- `src/__tests__/lib/portfolio-actions.test.ts`

## Next Slice(다음 슬라이스)
→ pixelconnect 공개 사이트 `/portfolio` 페이지 DB 연동 (별도 레포 작업)
