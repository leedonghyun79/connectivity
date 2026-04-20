import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import QueryProvider from "./queryProvider";
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
      </head>
      <body>
        <QueryProvider>
          <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              <Header />
              <main className="flex-1 overflow-auto bg-slate-50/50 p-6 overscroll-none">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
