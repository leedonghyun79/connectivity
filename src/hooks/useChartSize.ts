'use client';

import { useEffect, useState } from 'react';

/**
 * 차트를 그릴 영역의 실제 크기를 잰다.
 * 크기가 0이 아닐 때(ready)만 차트를 그리면 빈 축이 먼저 보이는 현상을 막을 수 있다.
 */
export function useChartSize() {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!el) return;
    const update = () => setSize({ width: Math.floor(el.clientWidth), height: Math.floor(el.clientHeight) });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);

  return {
    ref: setEl,
    width: size.width,
    height: size.height,
    ready: size.width > 0 && size.height > 0,
  };
}
