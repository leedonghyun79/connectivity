# 2026-04-20 하네스 인프라 적용

## Objective(목표)
templete 프로젝트의 Claude Harness 시스템을 connectivity 프로젝트에 적용한다.

## Acceptance Criteria(수용 기준)
- [x] `CLAUDE.md` 생성 (프로젝트 맞춤 작성)
- [x] `AGENTS.md` 생성 (작업 진입점 + 문서 맵)
- [x] `ARCHITECTURE.md` 생성 (기술 스택 + 디렉토리 구조 + 데이터 모델)
- [x] `docs/` 폴더 구조 생성 (index, QUALITY_SCORE, RELIABILITY, SECURITY, PLANS)
- [x] `docs/exec-plans/active/`, `completed/` 폴더 생성
- [x] `docs/design-docs/`, `product-specs/`, `operations/` 폴더 생성
- [x] `skills/lessons-learned.md` 생성 (교훈 5개 등록)
- [x] `package.json`에 `verify`, `type-check`, `preflight` 스크립트 추가

## Changes(변경 사항)
- 신규 파일 14개 생성
- `package.json` 스크립트 3개 추가

## Verification(검증)
- 모든 파일 생성 확인 완료

## Next Slice(다음 슬라이스)
→ Phase 2: 대시보드 스텁 컴포넌트 완성 (AnalyticsTable, RecentInquiryList, StatChart)
