'use client';

import { useState, useEffect } from "react";
import { toast } from "sonner";
import PageLoader from "@/components/common/PageLoader";
import { Settings, Shield, User, Bell, Globe, Database, Save, ArrowRight, Eye, EyeOff, Check } from "lucide-react";

type TabId = 'identity' | 'security' | 'notifications' | 'locale' | 'storage';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'identity', label: '기본 아이덴티티', icon: User },
  { id: 'security', label: '보안 및 액세스', icon: Shield },
  { id: 'notifications', label: '알림 엔진 설정', icon: Bell },
  { id: 'locale', label: '지역 및 언어 자산', icon: Globe },
  { id: 'storage', label: '스토리지 및 로그', icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('identity');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.info("환경 설정 저장 기능은 현재 통신 연결(개발) 중입니다.");
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
          <Save size={14} />
          {isSaving ? "동기화 중..." : "변경사항 저장"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* 탭 네비게이션 */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 group
                  ${isActive ? 'bg-black text-white shadow-xl shadow-black/10' : 'text-gray-400 hover:bg-gray-50 hover:text-black'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-300 group-hover:text-black'} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{tab.label}</span>
                </div>
                {isActive && <ArrowRight size={14} className="text-gray-500" />}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'identity' && <IdentityTab />}
          {activeTab === 'security' && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'locale' && <LocaleTab />}
          {activeTab === 'storage' && <StorageTab />}

          <div className="flex justify-end gap-4">
            <button className="px-8 py-4 text-[11px] font-black uppercase tracking-widest text-gray-400 border border-gray-100 rounded-2xl hover:bg-black hover:text-white transition-all active:scale-95">
              모든 변경 취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──── 탭별 컨텐츠 컴포넌트 ──── */

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-[0_40px_100px_rgba(0,0,0,0.02)] space-y-8">
      <h3 className="text-[10px] font-black text-black uppercase tracking-[0.3em] border-b pb-3">{title}</h3>
      {children}
    </div>
  );
}

function SettingInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">{label}</label>
      <input
        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all"
        {...props}
      />
    </div>
  );
}

function ToggleRow({ label, description, defaultOn }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn ?? false);
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-black text-gray-900">{label}</div>
        <div className="text-[11px] font-bold text-gray-400 mt-0.5">{description}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${on ? 'bg-black' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${on ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}

function IdentityTab() {
  return (
    <SettingSection title="핵심 식별 로그">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <SettingInput label="조직명 (Organization)" defaultValue="Connectivity Inc." />
        <SettingInput label="관리자 사용자 ID" defaultValue="admin_master_01" readOnly className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none font-bold text-gray-400" />
      </div>
      <div className="space-y-6">
        <SettingInput label="기본 이메일 프로토콜" type="email" defaultValue="admin@connectivity.com" />
        <SettingInput label="대표 전화번호" type="tel" placeholder="010-0000-0000" />
      </div>
    </SettingSection>
  );
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  return (
    <SettingSection title="보안 및 액세스 제어">
      <div className="space-y-6">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">현재 비밀번호</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              placeholder="현재 비밀번호 입력"
              className="w-full px-6 py-4 pr-14 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all"
            />
            <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">새 비밀번호</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="새 비밀번호 입력 (8자 이상)"
              className="w-full px-6 py-4 pr-14 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all"
            />
            <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <SettingInput label="새 비밀번호 확인" type="password" placeholder="동일하게 재입력" />
      </div>
      <div className="p-6 bg-gray-50 rounded-2xl">
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">2단계 인증 (2FA)</div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-500">Google Authenticator 앱과 연동합니다.</p>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-white border border-gray-200 rounded-xl">준비 중</span>
        </div>
      </div>
    </SettingSection>
  );
}

function NotificationsTab() {
  return (
    <SettingSection title="알림 엔진 설정">
      <ToggleRow label="신규 문의 알림" description="고객이 새 문의를 등록할 때 이메일 알림" defaultOn={true} />
      <ToggleRow label="견적서 상태 변경 알림" description="견적서가 승인/거절될 때 알림" defaultOn={true} />
      <ToggleRow label="거래 완료 알림" description="결제/정산이 완료될 때 알림" defaultOn={false} />
      <ToggleRow label="일일 리포트 이메일" description="매일 오전 9시 운영 현황 리포트" defaultOn={false} />
      <ToggleRow label="시스템 점검 공지" description="계획된 서버 점검 전 사전 알림" defaultOn={true} />
    </SettingSection>
  );
}

function LocaleTab() {
  return (
    <SettingSection title="지역 및 언어 자산">
      <div className="space-y-6">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">시스템 언어</label>
          <select className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none">
            <option value="ko">한국어 (Korean)</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">타임존</label>
          <select className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none">
            <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
            <option value="UTC">UTC (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">날짜 형식</label>
          <select className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none">
            <option value="YYYY.MM.DD">YYYY.MM.DD (2026.04.20)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (20/04/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (04/20/2026)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">통화 단위</label>
          <select className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none">
            <option value="KRW">KRW (₩ 대한민국 원)</option>
            <option value="USD">USD ($ 미국 달러)</option>
            <option value="JPY">JPY (¥ 일본 엔)</option>
          </select>
        </div>
      </div>
    </SettingSection>
  );
}

function StorageTab() {
  const used = 61; // dev.db 크기 (KB)
  const total = 500; // 임시 총 할당량 (KB)
  const pct = Math.min(100, Math.round((used / total) * 100));

  const logs = [
    { action: '설정 저장', time: '방금 전', type: 'info' },
    { action: '고객 등록', time: '10분 전', type: 'success' },
    { action: '견적서 발송', time: '1시간 전', type: 'success' },
    { action: '로그인', time: '오늘 09:00', type: 'info' },
  ];

  return (
    <SettingSection title="스토리지 및 시스템 로그">
      {/* DB 용량 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="text-sm font-black text-gray-900">데이터베이스 용량</div>
          <div className="text-[10px] font-black text-gray-400 font-mono">{used}KB / {total}KB</div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] font-bold text-gray-400">{pct}% 사용 중 · 충분한 여유 공간</div>
      </div>

      {/* 시스템 로그 */}
      <div>
        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">최근 시스템 로그</div>
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-black' : 'bg-gray-400'}`} />
                <span className="text-[11px] font-bold text-gray-700">{log.action}</span>
              </div>
              <span className="text-[10px] font-black text-gray-400 font-mono">{log.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 데이터 초기화 경고 */}
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
        <div className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">위험 구역</div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-red-600">모든 데이터를 초기화합니다. 이 작업은 되돌릴 수 없습니다.</p>
          <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-all ml-4 whitespace-nowrap">
            초기화
          </button>
        </div>
      </div>
    </SettingSection>
  );
}
