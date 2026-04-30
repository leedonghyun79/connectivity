# 보안 체크리스트 (SECURITY)

## 환경 변수 관리
- [ ] `.env` 파일 절대 Git 커밋 금지 (`.gitignore` 확인)
- [ ] `.env.example`에 키 이름만 명시 (값 없이)
- [ ] `RESEND_API_KEY` 프로덕션 환경에서만 사용

## 현재 보안 설정

### 인증/인가
- ⚠️ **현재 인증 없음** — 어드민 페이지 전체가 공개 상태
- 미래 구현 예정: NextAuth.js 또는 Clerk 도입

### 데이터 보호
- Prisma ORM 사용 → SQL Injection 방어
- Server Actions에서 입력값 직접 Prisma에 전달 → 타입 검증 필요
- 브라우저 `confirm()` 삭제 확인 → CSRF 보호 없음 (향후 개선 필요)

### API 보안
- Server Actions는 Next.js 내부 처리 → 외부 직접 호출 불가
- Resend 이메일: `onboarding@resend.dev` 사용 중 → 프로덕션 전 도메인 변경 필요

## 주의사항
| 항목 | 현재 상태 | 조치 필요 |
|------|-----------|-----------|
| 어드민 인증 | ❌ 없음 | NextAuth 도입 필요 |
| 입력 유효성 검사 | ⚠️ 부분 | Zod 스키마 추가 권장 |
| CORS | N/A | Server Actions 전용 |
| Rate Limiting | ❌ 없음 | Vercel Edge 설정 예정 |
