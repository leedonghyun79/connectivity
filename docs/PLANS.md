# 로드맵 및 기술 부채 (PLANS)

> 구현 예정 기능 및 해결해야 할 기술 부채 목록

## 구현 로드맵

### Phase 2 — 대시보드 스텁 컴포넌트 완성
- [x] `AnalyticsTable.tsx` — 고객/견적 현황 테이블 실데이터 연동
- [x] `RecentInquiryList.tsx` — 최근 문의 DB 연동
- [x] `StatChart.tsx` — 월별 매출 통계 차트

### Phase 3 — 문의 게시판 기능 완성
- [x] 필터 탭 상태 연결 (전체/답변대기/해결완료)
- [x] 검색 input 데이터 연동 (`value` 상태 바인딩)
- [x] `InquiryDetailModal.tsx` 구현
- [x] 답변 처리 Server Action (`updateInquiryStatus`)

### Phase 4 — 고객 상세 페이지
- [x] `/customers/[id]/page.tsx` — 고객 상세 페이지
- [x] 해당 고객의 프로젝트, 견적서, 거래 내역 표시
- [ ] 실제 동작하는 페이지네이션 (현재 하드코딩)

### Phase 5 — 설정 페이지 완성 ✅
- [x] 설정 탭 네비게이션 상태 연결 (DB 연동 완료)
- [x] 보안 탭: 비밀번호 변경 기능 연동
- [x] 알림 탭: 알림 설정 DB 영구 저장
- [x] 지역 및 언어 설정 탭: 시스템 전역 설정 연동
- [x] 스토리지 탭: 실시간 DB 용량 및 시스템 로그

### Phase 6 — 외부 연동 및 마케팅 분석
- [ ] 외부 서비스(채널톡, 카카오톡) 웹훅 연동 API 개발
- [ ] `Inquiry` 모델 확장: `source`(유입 경로) 필드 추가
- [ ] 문의 관리 UI: 유입 경로별 필터링 및 통계 시각화

## 기술 부채

| 항목 | 심각도 | 설명 |
|------|--------|------|
| `any` 타입 남용 | 중간 | customers, estimates 페이지 state 전부 `any[]` |
| 페이지네이션 미동작 | 높음 | URL은 `/page/[page]`지만 실제로는 전체 조회 |
| `serviceShareData` 하드코딩 | 낮음 | sales 페이지 파이차트 데이터 |
| GA4 연동 없음 | 낮음 | `DailyStat` 자동 수집 없음, 수동만 가능 |
| `syncAllStats()` 미구현 | 낮음 | revalidatePath만 호출 |
