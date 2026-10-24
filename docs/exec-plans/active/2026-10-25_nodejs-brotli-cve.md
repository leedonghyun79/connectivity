# 2026-10-25 Node.js Brotli 디코더 취약점 대응 (CVE-2026-111497)

## Objective(목표)
Node.js 내장 Brotli 디코더의 경계 밖 쓰기(CWE-787) 취약점에 대해, connectivity의 런타임 버전을 패치 버전으로 고정하고 영향 범위를 기록한다.

## 영향 분석
- **런타임 영향**: Node.js 22.x / 24.x / 26.x 전 버전이 대상. 패치는 22.23.4 · 24.22.1 · 26.12.1 (2026-10-21 배포). 이전 버전은 모두 취약.
- **로컬 개발 환경**: `node -v` → `v24.20.0` (패치 전, 취약)
- **프로덕션**: Vercel 배포. Dockerfile/netlify 설정 없음. Vercel 프로젝트의 Node.js 버전 설정에 따라 결정됨 (대시보드 확인 필요)
- **코드 직접 사용처**: `zlib`/Brotli 직접 호출 없음, `express`/`body-parser` 미사용 → 인바운드 Brotli 요청 본문 자동 해제 경로 해당 없음 (Next 14.1.0 라우트 핸들러 기본 동작 기준)
- **아웃바운드 `fetch()`**: `src/lib/revalidate-site.ts`(origin은 환경변수 `PUBLIC_SITE_ORIGIN`, 사용자 입력 아님), `searchConsole.ts`(Google), `storage.ts`(Cloudflare R2), `turnstile.ts`(Cloudflare) → 응답 주체가 신뢰 호스트. 사용자 입력 URL로 fetch하는 코드 없음 → 공격자 제어 응답 경로 낮음
- **결론**: 직접 노출 경로는 낮지만, 런타임 자체가 취약하므로 버전 고정이 실질 조치

## Acceptance Criteria(수용 기준)
- [x] `package.json`에 `engines.node` = `24.x` 지정 (Vercel이 24 LTS 최신 패치를 선택하도록)
- [x] `.nvmrc` 추가 (로컬 `24`)
- [x] 의존성(`dependencies`/`devDependencies`) 변경 없음
- [x] `npm run verify` 중 lint · type-check · build 통과, test 7건 실패는 변경 전과 동일한 기존 실패
- [x] Vercel 프로젝트 Node.js 버전 `24.x` 확인 (대시보드 스크린샷 확인, 2026-10-25)
- [ ] 로컬 Node를 24.22.1 이상으로 업데이트 (사용자 작업, 현재 24.20.0)

## Plan(계획)
1. `package.json`에 `engines` 필드 추가
2. `.nvmrc` 생성 (`24`)
3. `npm run verify` 실행
4. 본 문서 체크리스트 갱신, `docs/security-audit.md`에 항목 추가

## Changes(변경 사항)
- `package.json`: `engines.node` 추가
- `.nvmrc`: 신규
- `docs/security-audit.md`: 2026-10-25 항목 기록

## Verification(검증)
- `node -v` 로 로컬 버전 확인 (패치 후 24.22.1 이상)
- `npm run verify`

## Risks & Mitigations(리스크 및 대응)
- Vercel이 `engines` 필드를 무시하고 기존 Node 버전을 쓰는 경우 → 대시보드 Settings → Node.js Version 직접 확인·변경 필요
- 로컬 Node 24.20.0 → 개발 환경은 사용자가 직접 업데이트 필요 (에이전트가 시스템 Node를 설치하지 않음)
- Next 14.1.0 자체에도 알려진 취약점이 다수 있음 (`docs/security-audit.md` #1, `--force` 업그레이드 필요 → 별도 승인 대상, 본 계획 범위 밖)
- 공식 노드 보안 공지(nodejs.org)에서 CVE 번호 재확인 권장 (뉴스 기사 번호와 차이 가능성 언급됨)

## Rollback(롤백)
`package.json`의 `engines` 필드와 `.nvmrc` 삭제 → 기존 동작 복귀. 런타임 버전 자체는 Vercel 설정에서 되돌릴 수 있음.
