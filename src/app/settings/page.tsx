'use client';

import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageLoader from "@/components/common/PageLoader";
import { Settings, Shield, User, Bell, Globe, Database, Save, ArrowRight } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("시스템 설정이 성공적으로 업데이트되었습니다.");
    } catch {
      toast.error("설정 업데이트에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-10 py-10 max-w-6xl">
      {/* 헤더 섹션 */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-6 border-b-2 border-black pb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-3">시스템 프레임워크</div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">환경 설정</h1>
          <p className="text-sm font-bold text-gray-400 mt-2 flex items-center gap-2">
            <Settings size={14} className="text-black" />
            핵심 플랫폼 환경설정 및 보안 프로토콜을 관리합니다. <span className="text-black uppercase">v2.4.0 안정화 버전</span>
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-3 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? "동기화 중..." : "변경사항 저장"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* 네비게이션 */}
        <div className="lg:col-span-1 space-y-2">
          <SettingNav label="기본 아이덴티티" active icon={User} />
          <SettingNav label="보안 및 액세스" icon={Shield} />
          <SettingNav label="알림 엔진 설정" icon={Bell} />
          <SettingNav label="지역 및 언어 자산" icon={Globe} />
          <SettingNav label="스토리지 및 로그" icon={Database} />
        </div>

        {/* 설정 본문 */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.02)] space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-6 border-b pb-2">핵심 식별 로그</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">조직명 (Organization)</label>
                  <input type="text" defaultValue="Connectivity Inc." className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all" />
                </div>
                <div className="group">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">관리자 사용자 ID</label>
                  <input type="text" defaultValue="admin_master_01" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all text-gray-400" readOnly />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] mb-6 border-b pb-2">커뮤니케이션 채널</h3>
              <div className="space-y-6">
                <div className="group">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">기본 이메일 프로토콜</label>
                  <input type="email" defaultValue="admin@connectivity.com" className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all" />
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
              <div className="flex items-center gap-4 opacity-30 select-none">
                <Settings size={28} className="animate-spin-slow" />
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest">고급 모듈 개발 중</p>
                  <p className="text-[10px] font-bold">추가 서브 모듈은 다음 버전 업데이트 시 동기화될 예정입니다.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-2xl hover:bg-black hover:text-white transition-all active:scale-95">모든 변경 취소</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

function SettingNav({ label, active, icon: Icon }: any) {
  return (
    <button className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group
            ${active ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}>
      <div className="flex items-center gap-3">
        <Icon size={18} className={active ? 'text-white' : 'text-gray-300 group-hover:text-black'} />
        <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
      </div>
      {active && <ArrowRight size={14} className="text-gray-500" />}
    </button>
  )
}
