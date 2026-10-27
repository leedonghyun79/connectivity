'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { SystemConfigProvider } from '@/lib/SystemConfigContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 로그인 페이지일 경우 사이드바/헤더 숨김
  if (pathname === '/login') {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  return (
    <SystemConfigProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden text-[#060606] border-x">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <Header />
          <main className="flex-1 min-h-0 overflow-auto bg-gray-50/50 pt-[30px] pb-3 overscroll-none">
            <div className="w-full px-6 min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SystemConfigProvider>
  );
}
