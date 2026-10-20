# 2026-10-07 보안 하드닝 1차 (시크릿 폴백 제거 + 의존성 패치)

## Objective(목표)
`docs/security-audit.md`의 #1(의존성 취약점), #2(NEXTAUTH_SECRET 기본값 폴백)를 해결한다.

## Acceptance Criteria(수용 기준)
- [ ] `src/lib/auth.ts`에서 하드코딩 시크릿 폴백 제거. 개발 환경(NODE_ENV=development)에서만 개발용 키 허용
- [ ] 프로덕션에서 `NEXTAUTH_SECRET` 없으면 인증이 동작하지 않음 (기본 키로 JWT 서명 불가)
- [ ] `npm audit fix`로 해결 가능한 취약점 패치 (`--force`가 필요한 `next`는 별도 승인)
- [ ] `npm run verify` 통과 (기존 무관 실패 제외)

## Plan(계획)
1. `auth.ts` secret 로직 수정 (인증 코드 → 변경 범위 1줄, 고위험 영역이라 사용자 승인 완료)
2. `npm audit fix` (non-force) 실행, 변경된 의존성 확인
3. `npm run verify`
4. `docs/security-audit.md` 상태 갱신

## Risks & Mitigations(리스크 및 대응)
- 프로덕션(Vercel)에 `NEXTAUTH_SECRET`이 없으면 배포 후 로그인 불가 → 배포 전 Vercel 환경변수 확인 필수
- 의존성 업데이트로 인한 회귀 → verify + 빌드로 확인
