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
  Layers,
  Eye,
  CalendarDays,
  Globe,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePendingInquiries } from '@/hooks/usePendingInquiries';

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
  {
    name: '방문자 통계', icon: Eye, label: '트래픽 지표',
    children: [
      { name: '기간별 분석', path: '/visitors', icon: CalendarDays, label: '일별·월별 방문 추이' },
      { name: '유입 경로 분석', path: '/visitors/sites', icon: Globe, label: '유입 소스별 세션' },
      { name: '유입 검색어 분석', path: '/visitors/keywords', icon: Search, label: '검색어별 세션' },
    ],
  },
  { name: '활동 내역', path: '/logs', icon: Activity, label: '활동 및 브리핑' },
  { name: '환경 설정', path: '/settings', icon: Settings, label: '시스템 설정' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState('대시보드');
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const { count: pendingCount } = usePendingInquiries();

  useEffect(() => {
    for (const item of menuItems) {
      if ('children' in item) {
        // 가장 긴 경로가 우선 매칭되도록 (/visitors 와 /visitors/sites 구분)
        const child = item.children
          .filter(c => pathname === c.path || pathname.startsWith(c.path + '/'))
          .sort((a, b) => b.path.length - a.path.length)[0]
          ?? item.children.find(c => pathname === c.path);
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
    <aside className="w-72 bg-white border-r border-[#D1D5DB] h-full flex flex-col">
      {/* 로고 섹션 */}
      <div className="h-24 flex items-center px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-[8px] flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon196.png" alt="Pixel Connect" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-black text-[#060606] tracking-tighter">CONNECTIVITY</span>
        </Link>
      </div>

      {/* 메뉴 섹션 */}
      <div className="flex-1 px-6 py-4 overflow-y-auto no-scrollbar">

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
                    className={`group flex w-full items-center justify-between px-4 py-3.5 rounded-[8px] transition-all duration-300 ${childActive
                      ? 'bg-gray-50 text-[#060606]'
                      : 'text-[#4B5563] hover:bg-gray-50 hover:text-[#060606]'
                      }`}
                  >
                    <div className="flex items-center">
                      <Icon size={18} className={`mr-3 ${childActive ? 'text-[#060606]' : 'text-[#4B5563] group-hover:text-[#060606] transition-colors'}`} />
                      <span className="text-[18px] font-black uppercase tracking-widest leading-none">{item.name}</span>
                    </div>
                    {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-[#4B5563]" />}
                  </button>
                  {open && (
                    <div className="mt-1 ml-6 space-y-1 border-l border-[#D1D5DB] pl-4">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = activeMenu === child.name;
                        return (
                          <Link
                            key={child.path}
                            href={child.path}
                            className={`group flex items-center px-3 py-2.5 rounded-[8px] transition-all duration-300 ${isActive
                              ? 'bg-black text-white'
                              : 'text-[#4B5563] hover:bg-gray-50 hover:text-[#060606]'
                              }`}
                          >
                            <ChildIcon size={16} className={`mr-2.5 ${isActive ? 'text-white' : 'text-[#4B5563] group-hover:text-[#060606] transition-colors'}`} />
                            <span className="text-[18px] font-bold">{child.name}</span>
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
                className={`group flex items-center justify-between px-4 py-3.5 rounded-[8px] transition-all duration-300 ${isActive
                  ? 'bg-black text-white'
                  : 'text-[#4B5563] hover:bg-gray-50 hover:text-[#060606]'
                  }`}
              >
                <div className="flex items-center">
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-[#4B5563] group-hover:text-[#060606] transition-colors'}`} />
                  <span className="text-[18px] font-black uppercase tracking-widest leading-none">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.path === '/inquiries' && pendingCount > 0 && (
                    <span className={`min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-black leading-none ${isActive ? 'bg-white text-[#060606]' : 'bg-black text-white'}`}>
                      {pendingCount > 99 ? '99+' : pendingCount}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} className="text-gray-500" />}
                </div>
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
