# skills/lessons-learned.md — 교훈 목록

> **Compound Engineering 원칙**: 코딩 작업 전 반드시 읽고 적용. 작업 완료 후 새 교훈 추가.

---

## 🔒 [영구 규칙] 절대 변경 금지

### 규칙 #0 — 기존 디자인은 절대 건드리지 않는다 ⚠️
- **규칙**: connectivity 프로젝트의 모든 수정/추가 작업 시 기존 페이지의 디자인(레이아웃, 색상, 타이포그래피, 컴포넌트 스타일)을 그대로 유지한다.
- **적용 기준**: `.agents/skills/pixel-connect-design/SKILL.md`의 디자인 시스템을 항상 참조
- **새 페이지 추가 시**: 기존 페이지(customers, estimates, inquiries 등)의 헤더/카드/테이블 패턴을 그대로 복사해서 사용
- **기존 페이지 수정 시**: 디자인 관련 className은 절대 변경하지 않음. 로직/기능만 수정
- **위반 금지 사항**: Tailwind 클래스 임의 변경, 색상 추가, 레이아웃 재구성, 폰트 크기 변경 등

---

## [2026-04-20] 하네스 인프라 적용

### 교훈 #1 — 스텁 컴포넌트는 완성 전까지 페이지에 방치하지 않는다
- **원인**: `AnalyticsTable`, `RecentInquiryList`, `StatChart` 3개가 껍데기만 있어 대시보드 품질 하락
- **적용**: 컴포넌트 파일 생성 시 최소한 로딩/빈상태/실데이터 3가지 상태 모두 구현

### 교훈 #2 — 필터/검색 UI와 상태를 동시에 연결한다
- **원인**: `inquiries` 페이지 필터 탭과 검색 input이 UI만 있고 상태와 미연결
- **적용**: UI 컴포넌트 작성 시 `value`, `onChange`, 필터 `state`를 함께 작성

### 교훈 #3 — URL 기반 페이지네이션은 실제 DB 쿼리와 동기화해야 한다
- **원인**: `/customers/page/[page]` URL이 있지만 Server Action은 전체 조회
- **적용**: 페이지 파라미터를 `take`/`skip` Prisma 옵션에 반드시 연결

### 교훈 #4 — 하드코딩 데이터는 즉시 TODO 주석 표시
- **원인**: `sales` 페이지 `serviceShareData`가 하드코딩으로 방치
- **적용**: 하드코딩 시 `// TODO: DB 연동 필요` 주석 + `docs/PLANS.md`에 등록

### 교훈 #5 — 설정 탭 네비게이션은 active 상태와 컨텐츠를 한 번에 구현한다
- **원인**: settings 탭 버튼이 5개지만 active 상태 변경 로직과 컨텐츠 렌더링이 미연결
- **적용**: 탭 컴포넌트 패턴: `activeTab` state → 조건부 렌더링 → 각 탭 컨텐츠 컴포넌트

## [2026-09-21] SEO meta description 필드 추가

### 교훈 #6 — 공개 콘텐츠 모델에는 처음부터 SEO 요약 필드를 둔다
- **원인**: `Column`/`Portfolio`에 description 필드가 없어서, 공개 API가 SEO meta description을
  내려줄 수단이 없었음(본문 HTML을 통째로 잘라 쓰는 것 외엔 대안 없음). 네이버처럼 본문 앞줄을
  자동으로 긁어 쓰는 방식은 어색한 문장이 잘려 나오는 문제가 있어 사용자가 명시적으로 거부함.
- **적용**: 공개 사이트에 발행되는 콘텐츠 모델(칼럼/포트폴리오 등)을 설계할 때는
  `title`/`contentHtml`과 별개로 `description String?`(150~160자, 작성자 직접 입력) 필드를
  처음부터 포함한다. 비어있을 때만 본문에서 자동 요약(`src/lib/seo.ts`의 `excerptFromHtml`)으로
  fallback하고, 작성 폼에는 150~160자 권장 글자수 카운터를 함께 둔다.
