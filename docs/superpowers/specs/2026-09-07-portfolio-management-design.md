# 포트폴리오 관리 기능 설계

작성일: 2026-09-07
상태: 승인 대기 (사용자 리뷰)

## 배경 / 목표

pixelconnect 공개 사이트의 `/portfolio` 페이지는 현재 `src/components/Portfolio.tsx` 안에
하드코딩된 6개 프로젝트 배열을 보여준다. 이를 칼럼(Column) 기능과 동일한 구조로
DB 기반 관리 기능으로 전환한다.

- **connectivity(어드민)**: `Portfolio` 모델 + CRUD + 발행 워크플로 + 공개 읽기 API — source of truth
- **pixelconnect(공개)**: DB 없이 공개 API를 fetch 해서 목록/상세만 표시 (칼럼과 동일한 pull 방식)

기존 칼럼 기능(`Column` 모델, `/columns` 어드민, `/api/public/columns`, pixelconnect `lib/columns.ts`)을
거의 1:1로 미러링한다.

## 비목표 (YAGNI)

- 수동 정렬 / featured 플래그 — 발행일 최신순 고정
- pixelconnect 홈페이지 가로스크롤 포트폴리오 섹션의 데이터 연동 — 이번 범위 제외, 하드코딩 유지
- 기존 하드코딩 6개 프로젝트의 데이터 이관/seed — 폐기하고 어드민에서 신규 입력
- 상세 스펙 표의 추가 필드(작업기간 등) — Client / Category / Type 3개로 고정

## 접근 방식

**채택: Column 기능 미러링.** connectivity에 병렬 구조를 추가하고 pixelconnect는 fetch만 한다.

- 기각 — 다형 "콘텐츠" 모델로 Column+Portfolio 일반화: 잘 동작하는 칼럼 코드를 건드려야 하고 2종류엔 과설계.
- 기각 — 발행 워크플로 없이 항상 공개: 칼럼과 흐름이 달라져 일관성이 깨짐.

## 데이터 모델 (connectivity / Prisma)

`prisma/schema.prisma` 에 추가:

```prisma
// 픽셀커넥트 공개 사이트에 발행하는 포트폴리오(프로젝트) 항목
model Portfolio {
  id          String    @id @default(cuid())
  title       String                       // 프로젝트명 예: "비자르테 쇼핑몰"
  category    String                       // 필터용 단일값 (아래 PORTFOLIO_CATEGORIES)
  tags        String[]                      // 카드 칩 예: ["인테리어", "쇼핑몰"]
  result      String?                       // 카드 한줄 성과 예: "제작 후 문의 3배 증가"
  client      String?                       // 고객사 (상세 스펙 표 Client)
  projectType String?                       // Type (자유 입력) 예: "신규 제작", "리뉴얼"
  websiteUrl  String?                       // "웹사이트 보기" 링크 (http/https)
  thumbnail   String?                       // 카드 대표 이미지 URL (R2)
  contentHtml String                        // Tiptap getHTML() — 상세 설명 + 사이트 이미지
  contentJson Json?                         // Tiptap getJSON() — 재편집 안정성용
  status      String    @default("draft")   // draft | published
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

- `tags String[]` — Postgres text[] (Prisma 네이티브 지원). 폼에서는 쉼표구분 텍스트로 입력받아 `string[]`로 변환, 표시 시 `join(', ')`.
- 이미지 저장은 기존 `src/lib/storage.ts`의 `imageStore`(R2) + `POST /api/images` 라우트를 그대로 재사용한다. 새 이미지 모델·라우트 없음.
- 카테고리 상수: `PORTFOLIO_CATEGORIES = ['쇼핑몰', '기업 홈페이지', '병원·클리닉', '교육', '기타']` (pixelconnect 기존 필터 목록과 일치). 서버 액션에서 검증.
- **마이그레이션 1개 필요.** 로컬 `npx prisma migrate dev --name add_portfolio`, 배포 시 `prisma migrate deploy`.

## connectivity 어드민

### 서버 액션 — `src/lib/portfolio-actions.ts` (신규, `'use server'`)

`src/lib/actions.ts`의 칼럼 액션(`createColumn` 등)을 복제하여 아래를 제공. 반환 형태는 동일하게 `{ success, data?, error? }`.

| 함수 | 설명 |
|---|---|
| `getPortfolios()` | 전체 목록, `updatedAt desc` |
| `getPortfolio(id)` | 단건 |
| `createPortfolio(data: PortfolioInput)` | 생성, `status: 'draft'` |
| `updatePortfolio(id, data: PortfolioInput)` | 수정 |
| `publishPortfolio(id)` | `status: 'published'`, `publishedAt`은 최초 1회만 세팅 (`existing.publishedAt ?? new Date()`) |
| `unpublishPortfolio(id)` | `status: 'draft'` |
| `deletePortfolio(id)` | 삭제 |

- `PortfolioInput` = `{ title, category, tags: string[], result?, client?, projectType?, websiteUrl?, thumbnail?: string | null, contentHtml, contentJson? }`
- 검증: `title` 필수, `category`는 `PORTFOLIO_CATEGORIES` 포함 여부.
- `contentJson`은 저장 전 `JSON.parse(JSON.stringify(contentJson))`로 plain 객체화 (칼럼과 동일 — ProseMirror null-prototype attrs 대응).
- 변경 액션은 `revalidatePath('/portfolios')`.

### 페이지 (칼럼 페이지 복제)

- `src/app/portfolios/page.tsx` — 테이블 목록. 컬럼: 제목 / 카테고리 / 상태 / 발행일 / 수정일 / 액션(수정·발행토글·삭제). `ConfirmModal` 재사용. `src/app/columns/page.tsx`와 동일 UX.
- `src/app/portfolios/new/page.tsx` — `<PortfolioForm mode="create" />`
- `src/app/portfolios/[id]/edit/page.tsx` — `<PortfolioForm mode="edit" id={...} />`

### 폼 — `src/components/portfolio/PortfolioForm.tsx` (신규)

`src/components/columns/ColumnForm.tsx`를 복제하고 필드 추가:

- 기존 유지: 제목, 카테고리(select, `PORTFOLIO_CATEGORIES`), 대표 이미지 업로드, 본문 에디터, 임시저장/발행/발행취소 버튼
- 추가 입력: `tags`(쉼표구분 텍스트), `result`(한줄 성과), `client`, `projectType`, `websiteUrl`
- `payload()`에서 `contentJson: JSON.parse(JSON.stringify(jsonRef.current))` 유지

### 에디터 폴더 이동 (targeted 개선)

에디터가 이제 칼럼·포트폴리오 공유 자원이므로 위치를 정리한다.

- `src/components/columns/editor/**` → `src/components/editor/**` 로 이동
- `ColumnForm.tsx`의 import 경로를 `./editor/...` → `../editor/...` (또는 `@/components/editor/...`)로 수정
- 그 외 에디터 내부 상대 경로는 그대로 (폴더 통째 이동)
- 별도 동작 변경 없음 — 순수 이동 + import 수정

### 네비게이션

칼럼 관리 메뉴가 있는 곳(사이드바 컴포넌트)에 "포트폴리오 관리" 항목을 `/portfolios`로 추가.

## 공개 API (connectivity)

`src/app/api/public/columns/*`를 복제.

### `GET /api/public/portfolios`

```ts
// published만, publishedAt desc
[{
  id, title, category,
  tags: string[],
  result: string | null,
  thumbnail: string | null,   // 없으면 contentHtml 첫 <img> 폴백 (firstImageSrc)
  publishedAt: string          // ISO
}]
```

### `GET /api/public/portfolios/[id]`

```ts
// 미발행/없음 → 404
{
  id, title, category, tags, result, thumbnail, publishedAt,
  client: string | null,
  projectType: string | null,
  websiteUrl: string | null,
  contentHtml: string
}
```

- `runtime = 'nodejs'`, `dynamic = 'force-dynamic'` (칼럼과 동일)
- `firstImageSrc(html)` 헬퍼는 칼럼 라우트 것과 동일 로직 (복제 허용)

## pixelconnect (공개)

### `src/lib/portfolio.ts` (신규) — `src/lib/columns.ts` 미러

```ts
const BASE = (process.env.CONNECTIVITY_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const revalidate = { next: { revalidate: 60 } } as const;   // 60초 ISR, 장애 시 캐시로 버팀

export interface PortfolioListItem {
  id: string; title: string; category: string;
  tags: string[]; result: string | null;
  thumbnail: string | null; publishedAt: string;
}
export interface PortfolioDetail extends PortfolioListItem {
  client: string | null; projectType: string | null;
  websiteUrl: string | null; contentHtml: string;
}

export async function fetchPortfolios(): Promise<PortfolioListItem[]>   // 실패 시 []
export async function fetchPortfolio(id: string): Promise<PortfolioDetail | null>  // 실패 시 null
```

### `Portfolio.tsx` 분리

현재 `Portfolio.tsx`는 홈(가로스크롤, `hideHeader=false`)과 `/portfolio`(그리드, `hideHeader=true`)를 겸한다.

- 그리드 브랜치를 **`src/app/portfolio/PortfolioGrid.tsx`** (신규, client)로 추출:
  - props: `items: PortfolioListItem[]`
  - 유지: 필터 버튼(고정 목록 `['전체', ...PORTFOLIO_CATEGORIES]`), IntersectionObserver fade-in, 카드 마크업. CSS는 기존 `src/components/Portfolio.module.css` 재사용 (grid/card/thumbImg 스타일 이미 존재)
  - 카드 클릭 → `/portfolio/${item.id}` (기존 `#contact` 대체)
  - 썸네일: `item.thumbnail` 있으면 `<img>`, 없으면 기존 `🖥️` placeholder
  - `result` 있으면 카드 하단에 표시
- `Portfolio.tsx`는 **홈 가로스크롤 하드코딩 버전만** 남긴다 (이번 범위에서 홈은 그대로).

### `src/app/portfolio/page.tsx` 수정

```tsx
export default async function PortfolioPage() {
  const items = await fetchPortfolios();
  return (
    <main>
      <PageHero eyebrow="OUR WORK" title="포트폴리오" ... breadcrumb="포트폴리오" />
      <PortfolioGrid items={items} />
      <Stats />
    </main>
  );
}
```

빈 배열이면 `PortfolioGrid`가 "아직 등록된 포트폴리오가 없습니다" 표시.

### `src/app/portfolio/[id]/page.tsx` + `detail.module.css` (신규) — `column/[id]` 미러

- `generateMetadata` — title/description/OG image (`column/[id]` 방식)
- 없거나 미발행 → `notFound()`
- 구성:
  1. 헤더: `category` + `title`
  2. **스펙 표**: Client / Category / Type 행 (값 없는 행은 렌더 스킵)
  3. **"웹사이트 보기"** 버튼 — `websiteUrl` 있을 때만, `target="_blank" rel="noopener noreferrer"`
  4. 썸네일 (`thumbnail` 있을 때)
  5. 본문 `contentHtml` → `dangerouslySetInnerHTML`, 뒤에 `<HighlightCode />` 재사용
  6. 푸터 CTA: "프로젝트 문의하기"(`/contact`) / "목록으로 돌아가기"(`/portfolio`)
- `HighlightCode.tsx`는 `column/[id]`의 것을 재사용 (import 경로 공유; 필요 시 `src/components/`로 이동). 셀렉터가 `article pre code`이므로 상세 페이지도 `<article>` 래퍼 사용.

## 에러 처리

- connectivity 액션: 기존 칼럼 액션과 동일하게 `try/catch` → `{ success: false, error }`, `console.error`.
- 공개 API: 미발행/없음 404. 그 외 예외는 Next 기본 500.
- pixelconnect fetch: 네트워크/비정상 응답 시 `[]` / `null` 반환 (페이지는 빈 상태 렌더, 크래시 없음).

## 테스트

- `src/__tests__/lib/portfolio-actions.test.ts` (신규) — `src/__tests__/lib/actions.test.ts` 패턴(prisma·getServerSession·next/cache 목) 미러:
  - `createPortfolio` — `category`가 `PORTFOLIO_CATEGORIES`에 없으면 `{ success: false }`
  - `createPortfolio` — `tags` 배열이 그대로 prisma에 전달되는지
  - `publishPortfolio` — 이미 `publishedAt`이 있으면 값이 유지되고, 없으면 새로 세팅
- 수동 E2E: 어드민에서 생성 → 에디터에 이미지 업로드 → 저장 → 발행 → `GET /api/public/portfolios` 확인 → pixelconnect `/portfolio` 목록 + `/portfolio/[id]` 상세 확인.

## 영향 범위 요약

**connectivity (신규)**
- `prisma/schema.prisma` (+`Portfolio`), 마이그레이션 1개
- `src/lib/portfolio-actions.ts`
- `src/app/portfolios/{page,new/page,[id]/edit/page}.tsx`
- `src/components/portfolio/PortfolioForm.tsx`
- `src/app/api/public/portfolios/{route,[id]/route}.ts`
- `src/__tests__/lib/portfolio-actions.test.ts`
- 사이드바 네비 항목 1개

**connectivity (이동/수정)**
- `src/components/columns/editor/**` → `src/components/editor/**`
- `src/components/columns/ColumnForm.tsx` import 경로 수정

**pixelconnect (신규/수정)**
- `src/lib/portfolio.ts` (신규)
- `src/app/portfolio/PortfolioGrid.tsx` (신규)
- `src/app/portfolio/[id]/page.tsx` + `detail.module.css` (신규)
- `src/app/portfolio/page.tsx` (async 전환)
- `src/components/Portfolio.tsx` (그리드 브랜치 제거, 홈 버전만 유지)

**환경변수**: 신규 없음 (`CONNECTIVITY_API_URL` 재사용).
