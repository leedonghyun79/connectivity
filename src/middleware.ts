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
    // /api/auth, /api/images(공개 이미지), /api/public(pixelconnect용 공개 칼럼 API),
    // /_next, /login, /favicon.ico 등 퍼블릭 라우트를 제외한 모든 경로 보호
    "/((?!login|api/auth|api/images|api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};
