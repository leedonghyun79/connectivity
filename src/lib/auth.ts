import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "관리자 인증",
      credentials: {
        username: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" }
      },
      async authorize(credentials) {
        // 실제 운영 환경에서는 DB 조회와 bcrypt.compare 등의 암호화 로직이 들어가야 합니다.
        // 현재는 하드코딩된 어드민 계정으로만 접근을 허용합니다 (초기 개발용).
        if (
          credentials?.username === "admin" && 
          credentials?.password === "admin123!"
        ) {
          return {
            id: "1",
            name: "최고 관리자",
            email: "admin@connectivity.com",
            role: "admin",
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login', // 커스텀 로그인 페이지 경로
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET || "connectivity_super_secret_dev_key",
};
