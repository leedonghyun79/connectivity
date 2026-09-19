# 2026-09-20 콘텐츠 관리 메뉴 개편 + 작업물(포트폴리오) 관리

## Objective(목표)
사이드바 "칼럼 관리"를 "콘텐츠 관리" 상위 메뉴로 바꾸고, 하위에 "칼럼 관리" / "작업물 관리" 2개 메뉴를 둔다.
"작업물 관리"는 칼럼과 동일한 구조(등록/수정/삭제/발행)로 픽셀커넥트 공개 사이트 포트폴리오 페이지의 데이터 소스가 된다.

기반 문서: `docs/superpowers/specs/2026-09-07-portfolio-management-design.md` (승인 대기 상태였던 기존 설계).
이번 계획에서 네비게이션 구조만 스펙 대비 변경(하위 메뉴 2단 구조로), 나머지(모델/필드/API)는 스펙을 따른다.

## Acceptance Criteria(수용 기준)
- [ ] 사이드바: "콘텐츠 관리"(상위) > "칼럼 관리" / "작업물 관리"(하위) 2단 메뉴로 표시
- [ ] `Portfolio` Prisma 모델 추가 + 마이그레이션 적용
- [ ] `/portfolios` 목록, `/portfolios/new`, `/portfolios/[id]/edit` 어드민 페이지 — 칼럼과 동일 UX(작성/임시저장/발행/발행취소/삭제)
- [ ] `GET /api/public/portfolios`, `GET /api/public/portfolios/[id]` 공개 API (인증 없음, published만)
- [ ] 에디터 폴더 `src/components/columns/editor` → `src/components/editor`로 이동, 칼럼/작업물 양쪽에서 공유
- [ ] `npm run verify` 통과

## Plan(계획)
1. **DB 스키마** — `prisma/schema.prisma`에 `Portfolio` 모델 추가 (스펙 그대로), `npx prisma migrate dev --name add_portfolio` (승인 후 실행 — 고위험)
2. **에디터 공유화** — `src/components/columns/editor/**` → `src/components/editor/**` 이동, `ColumnForm.tsx` import 경로 수정
3. **서버 액션** — `src/lib/portfolio-actions.ts` 신규 (칼럼 액션 패턴 복제): `getPortfolios/getPortfolio/createPortfolio/updatePortfolio/publishPortfolio/unpublishPortfolio/deletePortfolio`
4. **어드민 페이지** — `src/components/portfolio/PortfolioForm.tsx`, `src/app/portfolios/{page,new/page,[id]/edit/page}.tsx` (칼럼 페이지 복제 + 필드 추가: tags/result/client/projectType/websiteUrl)
5. **공개 API** — `src/app/api/public/portfolios/route.ts`, `src/app/api/public/portfolios/[id]/route.ts` (칼럼 라우트 패턴 복제, thumbnail 폴백/본문 중복 제거 로직 포함)
6. **사이드바 네비 개편** — `Sidebar.tsx`: "칼럼 관리" 단일 항목 → "콘텐츠 관리" 그룹(하위: 칼럼 관리 `/columns`, 작업물 관리 `/portfolios`). 기존 칼럼 관리 진입 경로(`/columns`)는 그대로 유지.
7. **테스트** — `src/__tests__/lib/portfolio-actions.test.ts` (actions.test.ts 패턴 미러)

## Changes(변경 사항)
(구현 진행하며 채움)

## Verification(검증)
- `npm run verify`
- 수동: 어드민에서 작업물 생성 → 이미지 업로드 → 저장 → 발행 → `GET /api/public/portfolios`(list), `GET /api/public/portfolios/[id]`(detail) 응답 확인
- 사이드바 메뉴 2단 구조 육안 확인

## Risks & Mitigations(리스크 및 대응)
- **DB 마이그레이션(고위험)** — 신규 테이블 추가만 있고 기존 테이블 변경 없음 → 되돌리기 쉬움. 실행 전 최종 승인 필요.
- **에디터 폴더 이동** — import 경로 누락 위험 → 이동 후 `npm run build`로 타입/빌드 에러 전수 확인.
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
