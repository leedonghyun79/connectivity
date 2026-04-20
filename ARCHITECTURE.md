# ARCHITECTURE.md — 기술 아키텍처

## 프로젝트 개요
**Connectivity (Pixel Connect CRM)**
소규모 에이전시·프리랜서를 위한 고객 관계 관리 어드민 시스템.
고객 관리, 견적서 발행, 매출 추적, 문의 처리를 단일 대시보드에서 제공한다.

---

## 기술 스택

### 프론트엔드
| 기술 | 버전 | 역할 |
|------|------|------|
| Next.js | 15 | App Router, SSR/SSG/ISR |
| TypeScript | 5.x | 타입 안전성 |
| Tailwind CSS | 3.x | 유틸리티 CSS |
| shadcn/ui | 최신 | UI 컴포넌트 라이브러리 |
| Recharts | 최신 | 매출/분석 차트 |
| Lucide React | 최신 | 아이콘 시스템 |
| Tanstack Query | 5.x | 서버 상태 관리 |
| Zustand | 4.x | 클라이언트 상태 관리 |
| Sonner | 최신 | 토스트 알림 |

### 백엔드/데이터베이스
| 기술 | 버전 | 역할 |
|------|------|------|
| Next.js Server Actions | 15 | 서버 사이드 로직 (`'use server'`) |
| Prisma ORM | 최신 | DB 쿼리 추상화 |
| PostgreSQL | 16 | 운영 데이터베이스 |
| SQLite (dev.db) | - | 개발 로컬 DB |
| Resend | 최신 | 트랜잭션 이메일 발송 |

### 개발 도구
| 기술 | 역할 |
|------|------|
| Vitest | 단위/통합 테스트 |
| Testing Library | 컴포넌트 테스트 |
| ESLint | 코드 린팅 |
| Prettier | 코드 포맷 |
| Husky | Git 훅 (pre-commit) |

---

## 디렉토리 구조

```
connectivity/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # 루트 레이아웃 (Sidebar + Header)
│   │   ├── page.tsx            # 대시보드 (/)
│   │   ├── customers/          # 고객 관리
│   │   │   ├── page.tsx        # → /customers/page/1 리다이렉트
│   │   │   ├── page/[page]/    # 고객 목록 (페이지네이션)
│   │   │   ├── [id]/           # 고객 상세 (미구현)
│   │   │   └── add/            # 고객 등록 (미구현)
│   │   ├── estimates/          # 견적서 관리
│   │   ├── sales/              # 매출 분석
│   │   ├── inquiries/          # 문의 게시판
│   │   ├── settings/           # 환경 설정
│   │   └── api/                # API 라우트
│   ├── components/
│   │   ├── layout/             # Sidebar, Header
│   │   ├── dashboard/          # 대시보드 위젯
│   │   ├── customers/          # 고객 관련 컴포넌트
│   │   ├── estimates/          # 견적서 컴포넌트
│   │   ├── sales/              # 매출 컴포넌트
│   │   ├── settings/           # 설정 컴포넌트
│   │   ├── modals/             # 모달 컴포넌트
│   │   └── common/             # 공용 컴포넌트 (DataTable, PageLoader 등)
│   ├── lib/
│   │   ├── actions.ts          # Next.js Server Actions (CRUD 전체)
│   │   ├── prisma.ts           # Prisma 클라이언트 싱글턴
│   │   └── sync.ts             # 통계 동기화 유틸
│   ├── store/                  # Zustand 스토어
│   ├── types/                  # TypeScript 타입 정의
│   └── styles/                 # 전역 스타일
├── prisma/
│   ├── schema.prisma           # DB 스키마
│   ├── seed.ts                 # 시드 데이터
│   └── dev.db                  # 로컬 개발 DB (SQLite)
├── docs/                       # 하네스 문서 시스템
├── skills/                     # Compound Engineering
├── scripts/                    # 품질 게이트 스크립트
├── CLAUDE.md                   # AI 에이전트 시스템 프롬프트
├── AGENTS.md                   # 에이전트 진입점 맵
└── ARCHITECTURE.md             # 이 문서
```

---

## 데이터 모델 (Prisma Schema)

```
Customer ──── Project ──── Maintenance
    │
    ├───── Inquiry
    ├───── Estimate ──── EstimateItem
    └───── Transaction

DailyStat (독립 테이블, GA4 연동 예정)
```

### 주요 모델 상태값
| 모델 | 필드 | 허용값 |
|------|------|--------|
| Customer | status | `pending` / `processing` / `closed` |
| Project | status | `PENDING` / `PROGRESS` / `REST` / `COMPLETED` |
| Inquiry | status | `pending` / `answered` / `closed` |
| Estimate | status | `pending` / `sent` / `approved` / `rejected` |
| Transaction | status | `pending` / `completed` |

---

## 데이터 흐름

```
Client Component
    │
    ├── useQuery / useState
    │
    └── Server Action ('use server')
            │
            └── Prisma ORM
                    │
                    └── PostgreSQL / SQLite
```

- **읽기**: Client에서 `Server Action` 직접 호출 → Prisma 조회
- **쓰기**: Client에서 `Server Action` 호출 → Prisma 뮤테이션 → `revalidatePath`
- **이메일**: Server Action에서 `Resend` SDK 호출

---

## 주요 설계 결정 (ADR 요약)

| # | 결정 | 이유 |
|---|------|------|
| 1 | Server Actions 채택 | tRPC/REST API 없이 단순하게 유지 |
| 2 | SQLite (dev) + PostgreSQL (prod) | 로컬 개발 속도 최적화 |
| 3 | Tanstack Query 도입 | 로딩/캐시 상태 관리 일관성 |
| 4 | Tailwind 유틸리티 직접 사용 | shadcn 기반이지만 커스텀 디자인 시스템 구현 |

---

## 미구현 항목 (기술 부채)
→ 상세 내용: [docs/PLANS.md](docs/PLANS.md)

1. `/customers/[id]` — 고객 상세 페이지
2. `/customers/add` — 고객 등록 전용 페이지
3. `AnalyticsTable`, `RecentInquiryList`, `StatChart` 대시보드 위젯
4. 문의 게시판 — 필터/검색/모달/답변 처리 미연결
5. 설정 페이지 — 탭 5개 중 1개만 동작
6. GA4 API 연동 (`DailyStat` 자동 수집)
