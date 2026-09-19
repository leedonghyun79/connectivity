'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSystemConfig } from './actions';
import { formatDate as formatDateWith } from './format';

interface SystemConfigValue {
  timezone: string;
  dateFormat: string;
  refresh: () => void;
}

const DEFAULT_CONFIG: Omit<SystemConfigValue, 'refresh'> = { timezone: 'Asia/Seoul', dateFormat: 'YYYY.MM.DD' };

const SystemConfigCtx = createContext<SystemConfigValue>({ ...DEFAULT_CONFIG, refresh: () => {} });

// 설정 페이지에서 저장한 타임존/날짜 형식을 앱 전체에서 쓸 수 있게 공급한다.
export function SystemConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const load = useCallback(() => {
    getSystemConfig().then((c) => {
      if (c) setConfig({ timezone: c.timezone, dateFormat: c.dateFormat });
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return <SystemConfigCtx.Provider value={{ ...config, refresh: load }}>{children}</SystemConfigCtx.Provider>;
}

export function useSystemConfig() {
  return useContext(SystemConfigCtx);
}

// 컴포넌트에서 formatDate(date)만 호출하면 현재 타임존/날짜 형식이 자동 반영되는 훅.
export function useFormatDate() {
  const config = useSystemConfig();
  return useCallback(
    (date: Date | string | null | undefined, withTime = false) =>
      formatDateWith(date, { ...config, withTime }),
    [config]
  );
}
