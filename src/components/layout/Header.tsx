'use client';

import { Bell, Search, User, Menu, Globe } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-10 sticky top-0 z-30">
      <div className="flex items-center flex-1 max-w-2xl">
        <div className="relative w-full group">
          <Search className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
          <input
            type="text"
            placeholder="전체 검색: 프로젝트, 고객사, 또는 송장..."
            className="w-full pl-10 pr-4 py-3 bg-transparent text-sm font-medium focus:outline-none transition-all placeholder:text-gray-300 placeholder:font-bold placeholder:uppercase placeholder:text-[10px] placeholder:tracking-widest"
          />
          <div className="absolute bottom-0 left-0 w-0 h-px bg-black group-focus-within:w-full transition-all duration-500"></div>
        </div>
      </div>

      <div className="flex items-center gap-8 ml-8">

        <button className="p-2 text-gray-300 hover:text-black relative transition-all group">
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full ring-4 ring-white"></span>
        </button>

        <div className="flex items-center gap-4 pl-8 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-black text-black uppercase tracking-wider leading-tight">마스터 관리자</p>
            <p className="text-[10px] font-bold text-gray-300 uppercase">ADMINISTRATOR LEVEL</p>
          </div>
          <div className="relative group cursor-pointer">
            <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black border border-gray-100 group-hover:bg-black group-hover:text-white transition-all duration-300 overflow-hidden">
              <User size={24} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
