# Connectivity CRM

> Pixel Connect — 소규모 에이전시·프리랜서를 위한 고객 관계 관리(CRM) 어드민 시스템

## 기술 스택
- **Next.js 15** (App Router) · **TypeScript** · **Tailwind CSS**
- **Prisma ORM** + **PostgreSQL** (데이터베이스)
- **shadcn/ui** + **Recharts** (UI/차트)
- **Zustand** (클라이언트 상태 관리)
- **Tanstack Query** (서버 상태 관리)
- **Sonner** (토스트 알림)
- **Resend** (이메일 발송)
- **Vitest** + **Testing Library** (테스트)
- **ESLint** + **Prettier** (코드 품질)
- **Vercel** (배포)

## 에이전트 진입점
→ [AGENTS.md](./AGENTS.md) — 모든 작업의 시작점
→ [docs/index.md](./docs/index.md) — 전체 문서 맵
→ [ARCHITECTURE.md](./ARCHITECTURE.md) — 기술 아키텍처

## 하네스 스택
| 계층 | 도구 | 역할 |
|------|------|------|
| 스킬 | `.agents/skills/` | 도메인별 디자인·코딩 가이드 |
| 메모리 | Compound Engineering | `skills/lessons-learned.md` — 같은 실수 반복 방지 |
| 시스템 | `docs/` + `AGENTS.md` | 에이전트 가독성 지식 베이스 + 실행 규칙 |

## 실행 흐름
```
1. 브레인스토밍  → 요구사항 정제, 설계 문서 생성
2. 실행 계획     → docs/exec-plans/active/{작업명}.md 작성
3. 구현          → 슬라이스별 TDD (RED → GREEN → REFACTOR)
4. 검증          → npm run verify 통과 확인
5. 리뷰          → 계획 준수 여부 확인
6. Compound      → skills/lessons-learned.md 업데이트
7. 완료          → active → completed 이동
```

## Compound Engineering 규칙
**코딩 작업 전**: `skills/lessons-learned.md`를 읽고 등록된 교훈을 반드시 적용한다.
**작업 완료 후**: 이번 세션의 리워크 원인을 교훈으로 추가한다.

## 주요 규칙
- 모든 변경은 `docs/exec-plans/active/`에 exec-plan을 먼저 작성
- 작은 슬라이스 단위로만 — PR 하나에 하나의 관심사
- `npm run verify` 통과 후에만 작업 완료 처리
- 고위험 변경(인증, DB 스키마, 파괴적 변경)은 반드시 승인 후 진행

## 디자인 시스템
→ [.agents/skills/pixel-connect-design/SKILL.md](./.agents/skills/pixel-connect-design/SKILL.md)

**핵심 원칙**: 고대비 흑백 · 대형 볼드 타이포 · 프리미엄 미니멀 · 마이크로 인터랙션

> ⚠️ **[절대 규칙] 기존 디자인 유지**
> 모든 수정/페이지 추가 작업 시 기존 디자인을 절대 변경하지 않는다.
> - **새 페이지**: 기존 페이지(customers, estimates, inquiries)의 헤더·카드·테이블 패턴을 그대로 복사
> - **기존 페이지 수정**: Tailwind className 변경 금지 — 로직과 기능만 수정
> - **절대 금지**: 색상 변경, 레이아웃 재구성, 폰트 크기 변경, 임의 스타일 추가

## 자율성
- 저위험(문서, 테스트, 리팩터링, 스타일): 자율 진행 후 보고
- 중위험(새 기능, API 변경): 방향 확인 후 진행
- 고위험(인증, DB 스키마, 파괴적 변경): 중단 → 승인 후 진행

## 환경 변수
```
DATABASE_URL        — PostgreSQL 연결 문자열
RESEND_API_KEY      — 이메일 발송 API 키
```
