'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30">
      <div className="flex items-center flex-1 max-w-2xl">
        <div className="relative w-full group">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
          <input
            type="text"
            placeholder="전체 검색: 프로젝트, 고객사, 또는 송장..."
            className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                toast.info('통합 검색 엔진은 현재 개발 중입니다.');
              }
            }}
          />
          <div className="absolute bottom-0 left-0 w-0 h-px bg-black group-focus-within:w-full transition-all duration-500"></div>
        </div>
      </div>

      <div className="flex items-center gap-8 ml-8">
        <button 
          onClick={() => toast.info('실시간 알림 센터는 현재 개발 중입니다.')}
          className="p-2 text-gray-300 hover:text-black relative transition-all group">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full ring-4 ring-white"></span>
        </button>

        <div className="flex items-center gap-4 pl-8 border-l border-gray-100 relative" ref={dropdownRef}>
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-black uppercase tracking-wider leading-tight">
              {session?.user?.name || '관리자'}
            </p>
            <p className="text-[10px] font-bold text-gray-300 uppercase">ADMINISTRATOR LEVEL</p>
          </div>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative group focus:outline-none"
          >
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 overflow-hidden ${isDropdownOpen ? 'bg-black text-white border-black' : 'bg-gray-50 text-black border-gray-100 hover:border-black'}`}>
              <User size={24} />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 bg-white border rounded-full flex items-center justify-center transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 border-black' : 'border-gray-100'}`}>
              <ChevronDown size={10} className={isDropdownOpen ? 'text-black' : 'text-gray-400'} />
            </div>
          </button>

          {/* 드롭다운 메뉴 */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-4 w-56 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">계정 계층</p>
                <p className="text-sm font-bold text-black">{session?.user?.name || '관리자'}</p>
              </div>
              
              <Link 
                href="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:text-black hover:bg-gray-50 rounded-2xl transition-all group"
              >
                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-white transition-colors">
                  <Settings size={16} />
                </div>
                프로필 설정
              </Link>

              <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
              >
                <div className="p-2 bg-red-50 rounded-xl group-hover:bg-white transition-colors">
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
