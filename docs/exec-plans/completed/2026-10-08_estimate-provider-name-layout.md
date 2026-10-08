# 2026-10-08 견적서 공급자 상호·대표 배치 수정

## Objective(목표)
견적서 작성/수정 모달의 공급자 정보에서 대표자 입력을 상호 아래 별도 행으로 표시한다.

## Acceptance Criteria(수용 기준)
- [x] 공급자 정보가 `상호`와 `대표`라는 개별 레이블을 사용한다.
- [x] 상호 입력 다음 줄에 대표 입력이 표시된다.
- [x] 기존 필드 값과 입력 동작, 나머지 정보 레이아웃은 유지한다.

## Plan(계획)
1. 공급자 정보 영역의 구조와 관련 검증 방법을 확인했다.
2. 상호/대표 입력이 분리된 행임을 확인하는 테스트를 추가했다.
3. 공급자 그리드만 변경하고 관련 검증을 실행했다.

## 사용자 영향 · 호환성 · 롤백
- 사용자 영향: 견적 작성/수정 모달에서 대표자 입력 위치가 상호 아래로 이동한다.
- 호환성: 저장 필드(`bizName`, `bizCEO`)와 데이터 형식은 바꾸지 않는다.
- 롤백: 이 레이아웃 변경만 되돌리면 기존 배치로 복원된다.
- 미해결 리스크: 없음.

## Verification(검증)
- 통과: `npm test -- --runInBand src/components/modals/EstimateModal.test.tsx`
- 통과: 변경 파일 대상 ESLint, `npm run type-check`, `git diff --check`
- 전체 `npm run verify`는 테스트 4개 스위트가 실패해 중단됐다(로그: Prisma mock 관련 `actions`/`column-actions`, 기존 로그인 assertion, Jest가 Playwright `e2e/modal.spec.ts`를 수집).
- 별도 `npm run build`는 컴파일과 lint/type 검사를 통과했으나, page-data 수집 중 `/_document`를 찾지 못해 실패했다.

## Review · Compound · 완료
- 계획과 변경 사항을 대조했다. 관련 코드 변경 외 새 교훈은 없어 `skills/lessons-learned.md`는 변경하지 않았다.
- 전체 게이트 실패 사유를 기록하고 계획을 완료 폴더로 이동했다.
