# 신뢰성 요구사항 (RELIABILITY)

## 서비스 가용성 목표
| 항목 | 목표 |
|------|------|
| 가용성 | 99% (내부 어드민 도구 수준) |
| 응답 시간 (p95) | 2초 이하 |
| 데이터 손실 | 0 (삭제 전 confirm 필수) |

## 에러 처리 원칙
1. **Server Action**: 모든 함수에 `try/catch` 감싸고 `{ success, error }` 반환
2. **Client Component**: 에러 시 `toast.error()` 필수 표시
3. **빈 상태**: 데이터 없을 때 빈 화면 대신 Empty State UI 표시
4. **로딩 상태**: 데이터 fetching 중 `PageLoader` 또는 스켈레톤 표시

## 데이터 무결성
- 삭제 작업은 반드시 `confirm()` 또는 확인 모달 후 실행
- Prisma `onDelete: Cascade` 설정된 관계 주의 (Customer 삭제 시 연관 데이터 전체 삭제)
- 견적서 항목(`EstimateItem`) 수정 시 기존 항목 삭제 후 재생성 패턴 사용 중

## 알려진 위험 요소
| 위험 | 영향 | 대응 |
|------|------|------|
| Customer 삭제 | 관련 Estimate, Transaction, Inquiry 전체 삭제 (Cascade) | 삭제 전 경고 UI 강화 |
| DB 마이그레이션 실패 | 서비스 중단 | 배포 전 백업 필수 |
| Resend API 키 만료 | 이메일 발송 실패 | 에러 메시지로 폴백 |
