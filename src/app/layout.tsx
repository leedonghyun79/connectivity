import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "./queryProvider";
import AuthProvider from "@/providers/AuthProvider";
import AppLayout from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

// Prisma는 Node.js 런타임에서만 동작하므로 전역으로 강제합니다.
export const runtime = "nodejs";

// Poppins — 제목, 테이블 헤더, 레이블, 포인트 텍스트
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Connectivity CRM",
  description: "Customer Relationship Management",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon30.png", type: "image/png", sizes: "30x30" },
      { url: "/favicon196.png", type: "image/png", sizes: "196x196" },
    ],
    apple: { url: "/favicon196.png", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={poppins.variable}>
      {/* Pretendard — 설명, 테이블 body, 본문 텍스트 */}
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        <link rel="shortcut icon" type="image/png" href="/favicon30.png" sizes="30x30" />
        <link rel="icon" type="image/png" href="/favicon196.png" sizes="196x196" />
      </head>
      <body>
        <AuthProvider>
          <QueryProvider>
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
