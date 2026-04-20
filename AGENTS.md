# AGENTS.md — 작업 진입점

> 이 파일은 목차만 포함한다. 모든 상세 내용은 `docs/`에 있다.

## 작업 시작 전 필수 체크
1. `skills/lessons-learned.md` 읽기 — 등록된 교훈을 코드 작성 전에 반드시 적용
2. `docs/exec-plans/active/` 확인 — 이미 진행 중인 계획이 있는지 체크
3. `docs/QUALITY_SCORE.md` 확인 — 현재 품질 기준 파악
4. `.agents/skills/pixel-connect-design/SKILL.md` 읽기 — 디자인 일관성 유지

## 실행 루프 (모든 작업에 강제)
```
1. 브레인스토밍   → 요구사항 정제, 설계 문서 생성
2. 실행 계획      → docs/exec-plans/active/{작업명}.md 작성
3. 구현           → 슬라이스별 TDD (RED → GREEN → REFACTOR)
4. 검증           → npm run verify — 통과할 때까지 수정
5. 리뷰           → 계획 준수 여부 확인
6. Compound       → skills/lessons-learned.md에 이번 교훈 추가
7. 완료           → active → completed로 이동
```

## 문서 맵
| 목적 | 경로 |
|------|------|
| 전체 문서 맵 | [docs/index.md](docs/index.md) |
| 아키텍처 | [ARCHITECTURE.md](ARCHITECTURE.md) |
| 디자인 시스템 | [.agents/skills/pixel-connect-design/SKILL.md](.agents/skills/pixel-connect-design/SKILL.md) |
| 교훈 목록 | [skills/lessons-learned.md](skills/lessons-learned.md) |
| 설계 결정(ADR) | [docs/design-docs/](docs/design-docs/) |
| 제품 스펙 | [docs/product-specs/](docs/product-specs/) |
| 진행 중 실행 계획 | [docs/exec-plans/active/](docs/exec-plans/active/) |
| 완료된 실행 계획 | [docs/exec-plans/completed/](docs/exec-plans/completed/) |
| 운영 런북 | [docs/operations/](docs/operations/) |
| 신뢰성 | [docs/RELIABILITY.md](docs/RELIABILITY.md) |
| 보안 | [docs/SECURITY.md](docs/SECURITY.md) |
| 품질 기준 | [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) |
| 로드맵/기술 부채 | [docs/PLANS.md](docs/PLANS.md) |

## 출력 계약 (모든 응답에 고정)
```
- Objective(목표):
- Acceptance Criteria(수용 기준):
- Plan(계획):
- Changes(변경 사항):
- Verification(검증):
- Risks & Mitigations(리스크 및 대응):
- Artifacts Updated(갱신된 산출물):
- Next Slice(다음 슬라이스):
```

## 자율성 레벨
| 리스크 | 예시 | 행동 |
|--------|------|------|
| 저위험 | 문서, 테스트, 리팩터링, 스타일 | 자율 진행 → 완료 후 보고 |
| 중위험 | 새 기능, API 변경 | 방향 확인 후 진행 |
| 고위험 | 인증, DB 스키마, 과금, 파괴적 변경 | 중단 → 승인 후 진행 |

## 품질 게이트
- **필수**: lint · typecheck · test · build
- **권장**: 보안 스캔, 접근성 검사
- 모든 작업에 포함 필수: 사용자 영향 · 호환성 · 롤백 절차 · 미해결 리스크

## 주요 페이지 라우트
| 페이지 | 경로 | 상태 |
|--------|------|------|
| 대시보드 | `/` | ✅ 구현 완료 |
| 고객 목록 | `/customers/page/[page]` | ✅ 구현 완료 |
| 고객 상세 | `/customers/[id]` | 🔴 미구현 |
| 고객 등록 | `/customers/add` | 🔴 미구현 |
| 견적서 관리 | `/estimates` | ✅ 구현 완료 |
| 매출 분석 | `/sales` | 🟡 부분 구현 |
| 문의 게시판 | `/inquiries` | 🟡 부분 구현 |
| 환경 설정 | `/settings` | 🟡 부분 구현 |
