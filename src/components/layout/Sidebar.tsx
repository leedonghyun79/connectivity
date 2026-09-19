'use client';

import {
  LayoutDashboard,
  Users,
  FileText,
  Banknote,
  MessageSquare,
  Settings,
  ChevronRight,
  ChevronDown,
  LogOut,
  Activity,
  Newspaper,
  Briefcase,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  { name: '대시보드', path: '/', icon: LayoutDashboard, label: '통계 요약' },
  { name: '고객 관리', path: '/customers/page/1', icon: Users, label: '고객 데이터베이스' },
  { name: '견적서 관리', path: '/estimates', icon: FileText, label: '견적 및 발행' },
  { name: '매출 분석', path: '/sales', icon: Banknote, label: '재무 지표' },
  { name: '문의 게시판', path: '/inquiries', icon: MessageSquare, label: '고객 지원' },
  {
    name: '콘텐츠 관리', icon: Layers, label: '공개 사이트 발행',
    children: [
      { name: '칼럼 관리', path: '/columns', icon: Newspaper, label: '칼럼(블로그)' },
      { name: '작업물 관리', path: '/portfolios', icon: Briefcase, label: '포트폴리오' },
    ],
  },
  { name: '활동로그', path: '/logs', icon: Activity, label: '활동 및 브리핑' },
  { name: '환경 설정', path: '/settings', icon: Settings, label: '시스템 설정' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState('대시보드');
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    for (const item of menuItems) {
      if ('children' in item) {
        const child = item.children.find(c => pathname === c.path || pathname.startsWith(c.path));
        if (child) { setActiveMenu(child.name); return; }
        continue;
      }
      if (pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))) {
        setActiveMenu(item.name);
        return;
      }
    }
  }, [pathname]);

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-full flex flex-col">
      {/* 로고 섹션 */}
      <div className="h-24 flex items-center px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform">C</div>
          <span className="text-xl font-black text-black tracking-tighter">CONNECTIVITY</span>
        </Link>
      </div>

      {/* 메뉴 섹션 */}
      <div className="flex-1 px-6 py-4 overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase mb-6 px-4">주요 메뉴</div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if ('children' in item) {
              const childActive = item.children.some(c => c.name === activeMenu);
              const open = childActive || openGroup === item.name;
              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => setOpenGroup(openGroup === item.name ? null : item.name)}
                    className={`group flex w-full items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${childActive
                      ? 'bg-gray-50 text-black'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                      }`}
                  >
                    <div className="flex items-center">
                      <Icon size={18} className={`mr-3 ${childActive ? 'text-black' : 'text-gray-300 group-hover:text-black transition-colors'}`} />
                      <span className="text-[11px] font-black uppercase tracking-widest leading-none">{item.name}</span>
                    </div>
                    {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-300" />}
                  </button>
                  {open && (
                    <div className="mt-1 ml-6 space-y-1 border-l border-gray-100 pl-4">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = activeMenu === child.name;
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`group flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 ${isActive
                              ? 'bg-black text-white'
                              : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                              }`}
                          >
                            <ChildIcon size={16} className={`mr-2.5 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-black transition-colors'}`} />
                            <span className="text-[11px] font-bold">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = activeMenu === item.name;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-black text-white'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                  }`}
              >
                <div className="flex items-center">
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-black transition-colors'}`} />
                  <span className="text-[11px] font-black uppercase tracking-widest leading-none">{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-gray-500" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8">
      </div>
    </aside>
  );
}
