import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // /api, /_next, /login, /favicon.ico 등 퍼블릭 라우트를 제외한 모든 경로 보호
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
