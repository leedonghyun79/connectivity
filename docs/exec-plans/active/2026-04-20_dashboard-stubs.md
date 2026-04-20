# 2026-04-20 대시보드 스텁 컴포넌트 완성 (Phase 2)

## Objective(목표)
껍데기만 있는 대시보드 컴포넌트 3개를 실데이터 연동으로 완성한다.

## Acceptance Criteria(수용 기준)
- [ ] `AnalyticsTable.tsx` — 고객/견적 현황 실데이터 테이블 표시
- [ ] `RecentInquiryList.tsx` — DB에서 최근 문의 목록 실데이터 표시
- [ ] `StatChart.tsx` — 월별 매출 통계 바 차트 표시

## Plan(계획)
1. `getRecentInquiries()` Server Action 추가 (actions.ts)
2. `RecentInquiryList.tsx` 구현
3. `StatChart.tsx` 구현 (Recharts BarChart, monthlySales 데이터)
4. `AnalyticsTable.tsx` 구현 (고객 상태별 현황)

## Risks & Mitigations(리스크)
- Recharts import 방식 → 기존 sales 페이지 패턴 동일하게 적용
- 데이터 없을 때 Empty State UI 필수

## Next Slice(다음 슬라이스)
→ Phase 3: 문의 게시판 기능 완성
