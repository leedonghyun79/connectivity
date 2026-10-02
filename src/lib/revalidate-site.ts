// 어드민에서 칼럼이 바뀌면 pixelconnect 공개 사이트의 캐시를 즉시 비운다.
// 실패해도 저장 자체는 성공시켜야 하므로 에러는 로그만 남기고 삼킨다.
// (신호를 놓쳐도 pixelconnect 쪽 24시간 캐시 만료 시 반영됨)
export async function revalidateSite(): Promise<void> {
  const origin = process.env.PUBLIC_SITE_ORIGIN || 'https://pixelconnect.co.kr';
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    console.warn('REVALIDATE_SECRET 미설정 — 공개 사이트 캐시 갱신을 건너뜀');
    return;
  }

  try {
    const res = await fetch(`${origin.replace(/\/$/, '')}/api/revalidate`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('공개 사이트 캐시 갱신 실패:', res.status);
  } catch (error) {
    console.error('공개 사이트 캐시 갱신 요청 실패:', error);
  }
}
