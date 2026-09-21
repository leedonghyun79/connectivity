# 2026-09-21 칼럼/작업물 SEO meta description 필드 추가

## Objective(목표)
`Column`/`Portfolio`에 SEO용 `description`(요약) 필드를 추가해 작성자가 직접 입력하게 하고,
공개 API가 이 값을 내려줘서 pixelconnect 공개 사이트가 `<meta name="description">`을
콘텐츠별로 정확하게 세팅할 수 있게 한다. 네이버처럼 본문 앞줄을 자동으로 긁어 쓰는 방식은
쓰지 않는다(사용자 요청).

## Acceptance Criteria(수용 기준)
- [x] `Column`/`Portfolio` 모델에 `description String?` 필드 추가 + 마이그레이션 적용
- [x] `ColumnForm`/`PortfolioForm`에 "SEO 요약" textarea 추가 — 150~160자 권장 글자수 카운터 표시
- [x] `createColumn/updateColumn`, `createPortfolio/updatePortfolio` 서버 액션이 `description`을 저장
- [x] 공개 API(목록+상세, columns/portfolios 4개 라우트)가 `description`을 응답에 포함
  - 값이 비어있으면 본문(`contentHtml`) 태그 제거 후 155자 truncate한 값을 fallback으로 내려줌
- [x] `npm run verify` 통과 (기존에 존재하던 무관한 실패 3건 제외)

## Plan(계획)
1. **DB 스키마** — `prisma/schema.prisma`의 `Column`, `Portfolio`에 `description String?` 추가.
   `npx prisma migrate dev --name add_seo_description` (승인 후 실행 — 고위험, 사용자 승인 완료)
2. **공용 유틸** — `src/lib/seo.ts` 신규: `excerptFromHtml(html, max=155)` (태그 제거 + 공백 정리 + truncate).
   단위 테스트 `src/__tests__/lib/seo.test.ts` 먼저 작성 (RED) → 구현 (GREEN)
3. **서버 액션** — `src/lib/actions.ts`(`ColumnInput`/create/updateColumn), `src/lib/portfolio-actions.ts`
   (`PortfolioInput`/create/updatePortfolio)에 `description?: string | null` 추가
4. **어드민 폼** — `ColumnForm.tsx`, `PortfolioForm.tsx`에 "SEO 요약" textarea + 글자수 카운터
   (150~160자 권장, 200자 초과 시 경고 색상). `snapshotOf`/`payload`/`validate`에 반영
5. **공개 API** — 4개 라우트(`api/public/columns/route.ts`, `[id]/route.ts`,
   `api/public/portfolios/route.ts`, `[id]/route.ts`)에서 `description ?? excerptFromHtml(contentHtml)` 응답
6. **테스트** — `seo.test.ts`(신규), `actions.test.ts`/`portfolio-actions.test.ts`에
   description 저장 케이스 추가

## Verification(검증)
- `npm run type-check` — 통과
- `npm run lint` — 통과 (경고 2건은 기존 `EstimateDetailModal.tsx` `<img>` 경고, 무관)
- `npm run test` — 신규 테스트 17개(`seo.test.ts` 7, `column-actions.test.ts` 4, `portfolio-actions.test.ts` 6) 전부 통과.
  기존 실패 3개(`actions.test.ts`/`login/page.test.tsx`/`e2e/modal.spec.ts`)는 이번 변경 파일 아님(git diff 없음 확인) — 이전 세션부터 존재하던 무관 실패
- `npm run build` — 통과, `/api/public/columns`·`/api/public/portfolios` 라우트 정상 생성
- 수동 curl 검증: `npm run start` 후 `GET /api/public/columns` 응답에 `description` 필드가
  본문 fallback 요약으로 정상 노출됨 확인

## Risks & Mitigations(리스크 및 대응)
- **DB 마이그레이션(고위험)** — 신규 nullable 컬럼 추가만, 기존 데이터 무영향. 사용자 승인 완료.
- **공개 API 응답 스키마 변경** — 필드 추가만(기존 필드 유지)이라 하위 호환. pixelconnect 공개 사이트
  쪽에서 새 필드를 실제로 쓰려면 별도 레포 작업 필요(이번 범위 아님).

## Artifacts Updated(갱신된 산출물)
- `prisma/schema.prisma`, 마이그레이션 파일
- `src/lib/seo.ts`(신규), `src/lib/actions.ts`, `src/lib/portfolio-actions.ts`
- `src/components/columns/ColumnForm.tsx`, `src/components/portfolio/PortfolioForm.tsx`
- `src/app/api/public/{columns,portfolios}/{route,[id]/route}.ts`
- `src/__tests__/lib/seo.test.ts`(신규), `actions.test.ts`, `portfolio-actions.test.ts`

## Next Slice(다음 슬라이스)
→ pixelconnect 공개 사이트 쪽 `generateMetadata`가 새 `description` 필드를 실제로 사용하도록 연동(별도 레포)
