'use client';

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import PageLoader from "@/components/common/PageLoader";
import { Settings, Shield, User, Bell, Globe, Database, Save, ArrowRight, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { 
  updateAdminProfile, 
  changePassword, 
  getSystemStats, 
  getSystemLogs, 
  resetAllData,
  getSystemConfig,
  updateSystemConfig
} from "@/lib/actions";

type TabId = 'profile' | 'notifications' | 'locale' | 'storage';

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: 'profile', label: '프로필 설정', icon: User },
  { id: 'notifications', label: '알림 엔진 설정', icon: Bell },
  { id: 'locale', label: '지역 및 언어 설정', icon: Globe },
  { id: 'storage', label: '스토리지 및 로그', icon: Database },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await getSystemConfig();
      if (data) setConfig(data);
    };
    fetchConfig();

    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async () => {
    toast.info("우측 하단의 개별 섹션 저장 버튼을 이용해주세요.");
  };

  if (isLoading || !config) return <PageLoader />;

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
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
          마지막 동기화: {new Date(config.updatedAt || Date.now()).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' })}
        </div>
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
          {activeTab === 'profile' && <ProfileTab session={session} update={update} />}
          {activeTab === 'notifications' && <NotificationsTab initialConfig={config} onSave={() => getSystemConfig().then(setConfig)} />}
          {activeTab === 'locale' && <LocaleTab initialConfig={config} onSave={() => getSystemConfig().then(setConfig)} />}
          {activeTab === 'storage' && <StorageTab />}
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
        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all disabled:opacity-50"
        {...props}
      />
    </div>
  );
}

function ToggleRow({ label, description, isOn, onToggle }: { label: string; description: string; isOn: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <div className="text-sm font-black text-gray-900">{label}</div>
        <div className="text-[11px] font-bold text-gray-400 mt-0.5">{description}</div>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${isOn ? 'bg-black' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${isOn ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}

function ProfileTab({ session, update }: { session: any, update: any }) {
  // 프로필 정보 상태
  const [name, setName] = useState(session?.user?.name || '');
  const [username, setUsername] = useState(session?.user?.username || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // 보안 상태
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async () => {
    if (!session?.user?.username) return;
    if (!name.trim() || !username.trim()) {
      toast.error("성함과 아이디는 필수 입력 항목입니다.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const result = await updateAdminProfile(session.user.username, { name, username });
      if (result.success) {
        // 세션 정보 업데이트 (JWT 토큰 갱신 유도)
        await update({
          ...session,
          user: {
            ...session.user,
            name,
            username
          }
        });
        
        toast.success(
          session.user.username !== username 
            ? `아이디가 '${username}'으로 변경되었습니다. 다음 로그인 시 새로운 아이디를 사용해주세요.` 
            : "프로필 정보가 업데이트되었습니다."
        );
      } else {
        toast.error(result.error || "수정에 실패했습니다.");
      }
    } catch (error) {
      toast.error("시스템 오류가 발생했습니다.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwords.new.length < 6) {
      toast.error("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsUpdatingPassword(true);
    const result = await changePassword(session.user.username, passwords.current, passwords.new);
    if (result.success) {
      toast.success("비밀번호가 성공적으로 변경되었습니다.");
      setPasswords({ current: '', new: '', confirm: '' });
    } else {
      toast.error(result.error || "비밀번호 변경에 실패했습니다.");
    }
    setIsUpdatingPassword(false);
  };

  return (
    <div className="space-y-8">
      <SettingSection title="기본 정보 관리">
        <div className="space-y-6">
          <SettingInput 
            label="아이디" 
            placeholder="변경할 아이디 입력"
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
          />
          <SettingInput 
            label="관리자 성함" 
            placeholder="이름 입력" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleUpdateProfile}
            disabled={isUpdatingProfile}
            className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            {isUpdatingProfile ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            프로필 저장
          </button>
        </div>
      </SettingSection>

      <SettingSection title="비밀번호 변경 및 보안">
        <div className="space-y-6">
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">현재 비밀번호</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="현재 비밀번호 입력"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
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
                placeholder="새 비밀번호 입력 (6자 이상)"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className="w-full px-6 py-4 pr-14 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all"
              />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">새 비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="동일하게 재입력"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className="w-full px-6 py-4 pr-14 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all"
              />
              <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handlePasswordChange}
            disabled={isUpdatingPassword}
            className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            {isUpdatingPassword ? <Loader2 className="animate-spin" size={14} /> : <Shield size={14} />}
            비밀번호 변경
          </button>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">2단계 인증 (2FA)</div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-gray-500">Google Authenticator 앱과 연동합니다.</p>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 py-1.5 bg-white border border-gray-200 rounded-xl">준비 중</span>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}

function NotificationsTab({ initialConfig, onSave }: { initialConfig: any; onSave: () => void }) {
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const result = await updateSystemConfig(config);
    if (result.success) {
      toast.success("알림 엔진 설정이 업데이트되었습니다.");
      onSave();
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  return (
    <SettingSection title="알림 엔진 설정">
      <div className="space-y-2">
        <ToggleRow 
          label="신규 문의 알림" 
          description="고객이 새 문의를 등록할 때 이메일 알림" 
          isOn={config.notifyInquiry} 
          onToggle={() => handleToggle('notifyInquiry')} 
        />
        <ToggleRow 
          label="견적서 상태 변경 알림" 
          description="견적서가 승인/거절될 때 알림" 
          isOn={config.notifyEstimate} 
          onToggle={() => handleToggle('notifyEstimate')} 
        />
        <ToggleRow 
          label="거래 완료 알림" 
          description="결제/정산이 완료될 때 알림" 
          isOn={config.notifyTransaction} 
          onToggle={() => handleToggle('notifyTransaction')} 
        />
        <ToggleRow 
          label="일일 리포트 이메일" 
          description="매일 오전 9시 운영 현황 리포트" 
          isOn={config.dailyReport} 
          onToggle={() => handleToggle('dailyReport')} 
        />
        <ToggleRow 
          label="시스템 점검 공지" 
          description="계획된 서버 점검 전 사전 알림" 
          isOn={config.systemNotice} 
          onToggle={() => handleToggle('systemNotice')} 
        />
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdate}
          disabled={isSaving}
          className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
          알림 설정 저장
        </button>
      </div>
    </SettingSection>
  );
}

function LocaleTab({ initialConfig, onSave }: { initialConfig: any; onSave: () => void }) {
  const [config, setConfig] = useState(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    const result = await updateSystemConfig(config);
    if (result.success) {
      toast.success("지역 및 언어 설정이 업데이트되었습니다.");
      onSave();
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  return (
    <SettingSection title="지역 및 언어 설정">
      <div className="space-y-6">
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">시스템 언어</label>
          <select 
            name="language"
            value={config.language}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none"
          >
            <option value="ko">한국어 (Korean)</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">타임존</label>
          <select 
            name="timezone"
            value={config.timezone}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none"
          >
            <option value="Asia/Seoul">Asia/Seoul (UTC+9)</option>
            <option value="UTC">UTC (UTC+0)</option>
            <option value="America/New_York">America/New_York (UTC-5)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">날짜 형식</label>
          <select 
            name="dateFormat"
            value={config.dateFormat}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none"
          >
            <option value="YYYY.MM.DD">YYYY.MM.DD (2026.04.20)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (20/04/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (04/20/2026)</option>
          </select>
        </div>
        <div>
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">통화 단위</label>
          <select 
            name="currency"
            value={config.currency}
            onChange={handleChange}
            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-black/5 outline-none font-bold transition-all appearance-none"
          >
            <option value="KRW">KRW (₩ 대한민국 원)</option>
            <option value="USD">USD ($ 미국 달러)</option>
            <option value="JPY">JPY (¥ 일본 엔)</option>
          </select>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            지역 설정 저장
          </button>
        </div>
      </div>
    </SettingSection>
  );
}

function StorageTab() {
  const [stats, setStats] = useState({ dbSizeMB: 0, totalRecords: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const total = 500; // Neon DB 무료 티어 할당량 (500MB)
  const used = stats.dbSizeMB;
  const pct = Math.min(100, Math.round((used / total) * 100));

  const loadData = async () => {
    setIsLoading(true);
    const [newStats, newLogs] = await Promise.all([
      getSystemStats(),
      getSystemLogs()
    ]);
    setStats(newStats);
    setLogs(newLogs);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    if (!confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    
    setIsResetting(true);
    const result = await resetAllData();
    if (result.success) {
      toast.success('모든 데이터가 성공적으로 초기화되었습니다.');
      loadData();
    } else {
      toast.error('데이터 초기화 중 오류가 발생했습니다.');
    }
    setIsResetting(false);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return new Date(date).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  };

  return (
    <SettingSection title="스토리지 및 시스템 로그">
      {/* DB 용량 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="text-sm font-black text-gray-900">데이터베이스 용량</div>
          <div className="text-[10px] font-black text-gray-400 font-mono">
            {isLoading ? '...' : `${used}MB`} / {total}MB
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-black rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[10px] font-bold text-gray-400">
          {pct}% 사용 중 · {pct < 80 ? '충분한 여유 공간' : '공간 확보 필요'}
        </div>
      </div>

      {/* 시스템 로그 */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">최근 시스템 로그</div>
          <button onClick={loadData} className="text-[9px] font-black text-gray-400 hover:text-black transition-colors uppercase tracking-widest">새로고침</button>
        </div>
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-200" size={24} />
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${log.action === 'LOGIN' ? 'bg-blue-400' : 'bg-black'}`} />
                  <span className="text-[11px] font-bold text-gray-700">{log.message}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 font-mono">{formatTime(log.createdAt)}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[11px] font-bold text-gray-300">기록된 로그가 없습니다.</div>
          )}
        </div>
      </div>

      {/* 데이터 초기화 경고 */}
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
        <div className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-2">위험 구역</div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-red-600">모든 데이터를 초기화합니다. 이 작업은 되돌릴 수 없습니다.</p>
          <button 
            onClick={handleReset}
            disabled={isResetting}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-200 rounded-xl hover:bg-red-100 transition-all ml-4 whitespace-nowrap disabled:opacity-50"
          >
            {isResetting ? '초기화 중...' : '초기화'}
          </button>
        </div>
      </div>
    </SettingSection>
  );
}

