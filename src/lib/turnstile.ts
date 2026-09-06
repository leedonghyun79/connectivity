const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Cloudflare Turnstile 토큰을 서버측에서 검증한다.
 * secret 미설정/네트워크 오류/검증 실패는 모두 false.
 */
export async function verifyTurnstile(token: string, remoteip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY 미설정');
    return false;
  }
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (remoteip) form.set('remoteip', remoteip);
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[turnstile] siteverify 실패', err);
    return false;
  }
}
