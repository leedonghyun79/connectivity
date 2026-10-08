'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getPendingInquirySummary } from '@/lib/actions';

export interface PendingInquiryItem {
  id: string;
  title: string;
  authorName: string | null;
  type: string | null;
  createdAt: string;
}

const POLL_MS = 30_000;

/** 답변 대기 문의 수/목록. 30초마다 + 페이지 이동 시 갱신 */
export function usePendingInquiries() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [recent, setRecent] = useState<PendingInquiryItem[]>([]);

  const refresh = useCallback(async () => {
    const res = await getPendingInquirySummary();
    setCount(res.count);
    setRecent(res.recent);
  }, []);

  useEffect(() => {
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { count, recent, refresh };
}
