import { GoogleAuth } from 'google-auth-library';
import { normalizePrivateKey } from './ga4';

// 서버 전용 모듈 — 서비스 계정 키를 다루므로 클라이언트 컴포넌트에서 import 금지
export interface SearchQueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

let auth: GoogleAuth | null = null;

function getAuth() {
  if (auth) return auth;

  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const rawKey = process.env.GA4_PRIVATE_KEY;
  const privateKey = rawKey ? normalizePrivateKey(rawKey) : undefined;
  if (!clientEmail || !privateKey) {
    throw new Error('GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY 환경변수가 없습니다.');
  }

  auth = new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: [SCOPE],
  });
  return auth;
}

function getSiteUrl() {
  const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;
  if (!siteUrl) {
    throw new Error('SEARCH_CONSOLE_SITE_URL 환경변수가 없습니다.');
  }
  return siteUrl;
}

/**
 * 구글 검색 자연검색 검색어별 클릭·노출·CTR·평균 순위 (클릭 많은 순 상위 `limit`개).
 * `startDate`~`endDate`는 'YYYY-MM-DD', 양끝 포함. 서치 콘솔 데이터는 2~3일 늦게 쌓인다.
 */
export async function fetchSearchConsoleQueries(startDate: string, endDate: string, limit = 30): Promise<SearchQueryRow[]> {
  const token = await getAuth().getAccessToken();
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(getSiteUrl())}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, dimensions: ['query'], rowLimit: limit }),
      cache: 'no-store',
    }
  );
  if (!res.ok) {
    throw new Error(`Search Console API ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    rows?: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
  };
  return (json.rows ?? []).map(row => ({
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  }));
}
