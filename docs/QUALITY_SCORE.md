# 품질 기준 (QUALITY_SCORE)

> 모든 코드 변경은 이 기준을 충족해야 한다.

## 필수 게이트 (MUST PASS)
- [ ] `npm run lint` — ESLint 에러 0
- [ ] `npm run type-check` — TypeScript 에러 0
- [ ] `npm run test` — 테스트 전체 통과
- [ ] `npm run build` — 빌드 성공

## 코드 품질 기준
| 항목 | 기준 |
|------|------|
| 테스트 커버리지 | 핵심 Server Actions 70% 이상 |
| TypeScript any 사용 | 최소화 (불가피한 경우 주석 필수) |
| 컴포넌트 파일 크기 | 300줄 이하 권장 |
| Server Action 에러 처리 | try/catch + 사용자 메시지 필수 |

## UI/UX 기준 (디자인 시스템)
- Pixel Connect 디자인 가이드 준수 (`.agents/skills/pixel-connect-design/SKILL.md`)
- 모바일 반응형 (sm 브레이크포인트 기준)
- 로딩 상태: PageLoader 또는 스켈레톤 UI 필수
- 에러 상태: toast.error() 메시지 필수
- 빈 상태(Empty State): 아이콘 + 메시지 필수

## 현재 품질 스코어 (2026-04-20 기준)
| 영역 | 점수 | 비고 |
|------|------|------|
| 하네스 인프라 | 100 | ✅ 완성 |
| 대시보드 | 60 | 스텁 컴포넌트 3개 |
| 고객 관리 | 70 | 페이지네이션 미완성 |
| 문의 게시판 | 40 | 필터/검색/모달 미연결 |
| 견적서 관리 | 90 | 거의 완성 |
| 매출 분석 | 60 | 하드코딩 데이터 |
| 설정 | 30 | 탭 1개만 동작 |
