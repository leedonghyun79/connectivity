'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, MessageSquare, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePendingInquiries } from '@/hooks/usePendingInquiries';

const SEEN_KEY = 'notif:lastSeenAt';

// 현재 경로에 맞는 페이지 제목 (긴 경로를 먼저 검사)
const PAGE_TITLES: [string, string][] = [
  ['/visitors/keywords', '유입 검색어 분석'],
  ['/visitors/sites', '유입 경로 분석'],
  ['/visitors', '방문자 분석'],
  ['/customers', '고객 관리'],
  ['/estimates', '견적서 관리'],
  ['/inquiries', '문의 게시판'],
  ['/sales', '매출 통계 분석'],
  ['/logs', '일일 활동 내역'],
  ['/settings', '환경 설정'],
  ['/columns', '칼럼 관리'],
  ['/portfolios', '작업물 관리'],
];

function getPageTitle(pathname: string) {
  if (pathname === '/') return '대시보드';
  // 고객 상세는 고객 이름이 본문 제목이라 헤더에서는 비움
  if (pathname.startsWith('/customers/') && !pathname.startsWith('/customers/page/')) return '';
  const match = PAGE_TITLES.find(([path]) => pathname === path || pathname.startsWith(`${path}/`));
  return match ? match[1] : '';
}

function timeAgo(iso: string) {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [lastSeenAt, setLastSeenAt] = useState<number>(0);
  const { count: pendingCount, recent, isLoaded: notifLoaded } = usePendingInquiries();

  useEffect(() => {
    try {
      setLastSeenAt(Number(localStorage.getItem(SEEN_KEY)) || 0);
    } catch {}
  }, []);

  const hasUnseen = recent.some((i) => new Date(i.createdAt).getTime() > lastSeenAt);

  const toggleNotif = () => {
    const next = !isNotifOpen;
    setIsNotifOpen(next);
    setIsDropdownOpen(false);
    if (next) {
      const now = Date.now();
      setLastSeenAt(now);
      try {
        localStorage.setItem(SEEN_KEY, String(now));
      } catch {}
    }
  };

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-[#D1D5DB] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1 min-w-0">
        <h1 className="text-[32px] font-black text-gray-900 tracking-tighter uppercase truncate">{getPageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-6 ml-8">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4B5563]" size={18} />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2.5 rounded-[8px] border border-[#D1D5DB] bg-white text-sm font-medium focus:outline-none focus:border-black transition-colors placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                toast.info('통합 검색 엔진은 현재 개발 중입니다.');
              }
            }}
          />
        </div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotif}
            className="p-2 text-[#4B5563] hover:text-[#060606] relative transition-all group">
            <Bell size={22} />
            {hasUnseen && (
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full ring-4 ring-white"></span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-4 w-80 bg-white rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#D1D5DB] p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-[#D1D5DB] mb-1 flex items-center justify-between">
                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest">알림</p>
                <p className="text-[10px] font-black text-[#060606]">답변 대기 {pendingCount}건</p>
              </div>
              {!notifLoaded ? (
                <div className="px-4 py-6 space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-50 rounded-[8px]" />
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <p className="px-4 py-8 text-center text-xs font-bold text-[#4B5563]">새로운 알림이 없습니다</p>
              ) : (
                recent.map((item) => (
                  <Link
                    key={item.id}
                    href="/inquiries"
                    onClick={() => setIsNotifOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 rounded-[8px] transition-all group"
                  >
                    <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white transition-colors text-gray-500">
                      <MessageSquare size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-[#060606] truncate">{item.title}</p>
                      <p className="text-[10px] font-bold text-[#4B5563] uppercase mt-0.5">
                        {item.authorName || '익명'} · {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))
              )}
              <Link
                href="/inquiries"
                onClick={() => setIsNotifOpen(false)}
                className="block px-4 py-3 mt-1 border-t border-[#D1D5DB] text-center text-[11px] font-black text-gray-500 hover:text-[#060606] transition-colors"
              >
                문의 게시판 전체 보기
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none group"
          >
            <div className="h-11 w-11 rounded-[8px] bg-gray-100 border border-[#D1D5DB] flex items-center justify-center text-[#4B5563] overflow-hidden group-hover:border-black transition-colors">
              <User size={20} />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-black text-[#060606] leading-tight">{session?.user?.name || '관리자'}</p>
              <p className="text-[11px] font-bold text-[#4B5563] leading-tight">Admin</p>
            </div>
            <ChevronDown size={16} className={`text-[#4B5563] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-[8px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#D1D5DB] p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-[#D1D5DB] mb-1">
                <p className="text-[10px] font-black text-[#4B5563] uppercase tracking-widest">계정 계층</p>
                <p className="text-sm font-bold text-[#060606]">{session?.user?.name || '관리자'}</p>
              </div>
              
              <Link 
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-[#060606] hover:bg-gray-50 rounded-[8px] transition-all group"
              >
                <div className="p-2 bg-gray-50 rounded-[8px] group-hover:bg-white transition-colors">
                  <Settings size={16} />
                </div>
                프로필 설정
              </Link>

              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[#060606] hover:bg-gray-100 rounded-[8px] transition-all group"
              >
                <div className="p-2 bg-gray-100 rounded-[8px] group-hover:bg-white transition-colors">
                  <LogOut size={16} />
                </div>
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
