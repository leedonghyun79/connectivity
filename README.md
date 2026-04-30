# Connectivity CRM

## Vercel + Prisma 배포 가이드
- **런타임 강제**: `app/layout.tsx`에서 `export const runtime = "nodejs";`로 전체 App Router를 Node.js로 고정했습니다. Prisma는 Edge에서 동작하지 않으니 새 라우트/페이지도 그대로 유지하세요.
- **서버 코드 위치**: Prisma 접근은 `app/api/.../route.ts` 라우트 핸들러나 `use server` 액션에서만 사용하세요. 클라이언트 컴포넌트에 직접 넣지 않습니다.
- **빌드 시 클라이언트 생성**: `postinstall` 스크립트에 `prisma generate`가 설정되어 있어 Vercel 빌드 단계에서 클라이언트가 자동 생성됩니다.
- **환경 변수**: Vercel 프로젝트에 `DATABASE_URL`(또는 Prisma Postgres/Accelerate URL)을 설정하고, 필요하면 `RESEND_API_KEY` 등을 함께 등록하세요.
- **연결 관리 권장**: 서버리스 연결 폭증을 막으려면 Prisma Accelerate(Data Proxy)나 Vercel Postgres의 Prisma용 URL을 사용하는 것이 안전합니다.

## 로컬 개발
1) `.env`에 로컬 `DATABASE_URL`을 설정합니다.
2) `npm install` 후 `npm run dev`.
3) Prisma 스키마 변경 시 `npx prisma migrate dev`.
