# 보안 점검 기록

- 점검일: 2026-10-07
- 대상: connectivity(어드민 CRM) + pixelconnect(홈페이지, `D:\작업실\study\projects\pixelconnect`)
- 방식: 코드 리뷰 + `npm audit` (모의해킹 아님, 수정 전 상태 기록)

## 1. 코드/의존성 취약점

| # | 심각도 | 대상 | 내용 | 조치 | 상태 |
|---|--------|------|------|------|------|
| 1 | 높음 | 양쪽 | `next` RCE(GHSA-vcvr-r3jv-pc5j), `next-auth` critical, `sharp`/`source-map-js`/`nanoid`/`linkify-it`/`nodemailer` high | `npm audit fix` (connectivity의 next는 `--force` → 버전 점프 확인) | 부분 조치 (2026-10-07 non-force 완료. 남은 prod 취약점: next, nodemailer, postcss, dompurify → `--force` 필요, 별도 승인) |
| 2 | 높음 | connectivity | `src/lib/auth.ts`의 `NEXTAUTH_SECRET` 기본값 폴백 → 환경변수 누락 시 JWT 위조 가능 | 폴백 제거, 값 없으면 에러 | 조치 완료 (개발 환경에서만 기본 키). 배포 전 Vercel `NEXTAUTH_SECRET` 설정 확인 필요 |
| 3 | 높음 | pixelconnect | `column/[slug]/page.tsx`가 `contentHtml`을 sanitize 없이 `dangerouslySetInnerHTML` (stored XSS) | 렌더 직전 allowlist sanitize (Workers용 DOM 없는 라이브러리) | 미조치 |
| 4 | 중간 | connectivity | `src/lib/actions.ts` 서버 액션에 세션/권한 검사 없음, `changePassword`/`updateAdminProfile`이 클라이언트 username 신뢰 | 액션 내부 `getServerSession` + role 검사, username은 세션에서 | 미조치 (고위험 → 승인 필요) |
| 5 | 중간 | connectivity | 로그인 brute-force 방어 없음, 세션 30일, 비번 변경 후 JWT 유지 | 시도 제한/잠금, 세션 단축 | 미조치 |
| 6 | 중간 | connectivity | 공개 문의 API rate limit 없음, `x-forwarded-for` 신뢰 | IP별 제한 | 미조치 |
| 7 | 중간 | pixelconnect | JSON-LD `JSON.stringify` 그대로 삽입 (`</script>` 주입) | `<` → `\u003c` 치환 | 미조치 |
| 8 | 낮음 | pixelconnect | CSP 헤더 없음 | `Content-Security-Policy` 추가 | 미조치 |
| 9 | 낮음 | connectivity | `/api/images/[id]`에 `nosniff` 없음 | 헤더 추가 | 미조치 |
| 10 | 낮음 | pixelconnect | `.env.production` git 추적(공개 값만), `result/`·`extracted_plan.txt`·`undefined/` 커밋됨 | git에서 제외 | 미조치 |

잘된 점: `revalidate` timingSafeEqual 비교, bcrypt, 이미지 업로드 인증/크기/MIME 제한, `.env*` gitignore, 미들웨어 전체 보호, 문의 API Turnstile + 허니팟 + CORS 제한.

## 2. 운영/인프라 보안 체크리스트

| # | 구분 | 조치 | 난이도 | 이 프로젝트 적용 | 담당 |
|---|------|------|--------|------------------|------|
| 1 | 운영 | 엑셀 다운로드 파일 즉시 삭제/암호화, 카톡 전송 금지 | 매우 쉬움 | 사람의 운영 습관 문제. 코드로 강제 불가. 앱에 엑셀 내보내기 기능이 있는지는 미확인 | 본인 |
| 2 | 계정 | GitHub / Vercel / Cloudflare / DB 호스팅 2FA | 쉬움 | 각 서비스 설정에서 켜는 것. Claude는 대신 못 함 | 본인 |
| 3 | 인프라 | DB 접속 IP 제한 | 보통 | DB는 Neon. IP Allow는 유료 플랜 기능(플랜 조건은 콘솔 확인)이고, connectivity는 Vercel 서버리스라 출구 IP가 유동적 → 막으면 서비스 중단 위험. 쓰려면 Vercel Static IPs(유료)와 조합 필요 → 비용 대비 과함. **대안**: Neon 계정 2FA, `sslmode=require` 확인, 앱용 최소 권한 DB 역할 분리, 노출 이력 있으면 비밀번호 재발급, 프로덕션 브랜치 Protected 지정 | 본인(Neon 콘솔) |
| 4 | 네트워크 | Cloudflare 연동 | 쉬움 | pixelconnect는 이미 Cloudflare Workers 배포. `admin.pixelconnect.co.kr`(어드민)이 Cloudflare 프록시(주황 구름)인지 확인 필요. 프록시 + WAF/Rate Limiting 규칙으로 #1-6(rate limit)도 일부 해결 가능 | 본인(DNS) |

## 3. 진행 규칙 (CLAUDE.md)
- 저위험(#1, #2, #7~#10): exec-plan 작성 → 자율 진행 후 보고
- 고위험(#4 인증/권한): 승인 후 진행
- 완료 기준: `npm run verify` 통과
- 두 레포는 따로 커밋. 브랜치는 둘 다 현재 main (메모리상 connectivity 작업 브랜치는 develop)
