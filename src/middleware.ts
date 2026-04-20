import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // /api, /_next, /login, /favicon.ico 등 퍼블릭 라우트를 제외한 모든 경로 보호
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
