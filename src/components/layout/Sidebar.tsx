'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CreditCard, FileText, Settings, MessageSquare, ChevronRight } from 'lucide-react';

interface MenuItem {
  name: string;
  path: string;
  icon: any;
  label: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string>('DASHBOARD');

  const menuItems: MenuItem[] = [
    { name: 'DASHBOARD', label: '대시보드', path: '/', icon: LayoutDashboard },
    { name: 'CUSTOMERS', label: '고객 목록', path: '/customers', icon: Users },
    { name: 'SALES', label: '매출 분석', path: '/sales', icon: CreditCard },
    { name: 'ESTIMATES', label: '견적서 관리', path: '/estimates', icon: FileText },
    { name: 'INQUIRIES', label: '문의 게시판', path: '/inquiries', icon: MessageSquare },
    { name: 'SETTINGS', label: '시스템 설정', path: '/settings', icon: Settings },
  ];

  useEffect(() => {
    const exactMatch = menuItems.find(menu => pathname === menu.path);
    if (exactMatch) {
      setActiveMenu(exactMatch.name);
    } else if (pathname.startsWith('/customers')) {
      setActiveMenu('CUSTOMERS');
    } else if (pathname.includes('estimates')) {
      setActiveMenu('ESTIMATES');
    }
  }, [pathname]);

  return (
    <aside className="w-72 bg-white border-r border-gray-100 h-full flex flex-col shadow-[1px_0_0_rgba(0,0,0,0.02)]">
      <div className="h-24 flex items-center px-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform">C</div>
          <span className="text-xl font-black text-black tracking-tighter">CONNECTIVITY</span>
        </Link>
      </div>

      <div className="px-6 py-4">
        <div className="text-[10px] font-black text-gray-300 tracking-[0.3em] uppercase mb-6 px-4">Menu Selection</div>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                  ? 'bg-black text-white shadow-xl shadow-black/10'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-black'
                  }`}
              >
                <div className="flex items-center">
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-black transition-colors'}`} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">{item.name}</span>
                    <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-gray-400' : 'text-gray-300'}`}>{item.label}</span>
                  </div>
                </div>
                {isActive && <ChevronRight size={14} className="text-gray-500" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-8">
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
          <div className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-2">Usage Plan</div>
          <div className="text-sm font-black text-black mb-4">PREMIUM ENTERPRISE</div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-black w-4/5"></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 font-bold">80% of storage used</p>
        </div>
      </div>
    </aside>
  );
}
