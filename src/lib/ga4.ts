import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 서버 전용 모듈 — 서비스 계정 키를 다루므로 클라이언트 컴포넌트에서 import 금지
export interface GA4DailyTraffic {
  pageViews: number;
  visitors: number;
}

export type TrafficChannel = '구글 검색' | '네이버 검색' | '소셜 미디어' | '직접 유입' | '참조 링크' | '기타';

let client: BetaAnalyticsDataClient | null = null;

function getClient() {
  if (client) return client;

  const clientEmail = process.env.GA4_CLIENT_EMAIL;
  const privateKey = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!clientEmail || !privateKey) {
    throw new Error('GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY 환경변수가 없습니다.');
  }

  client = new BetaAnalyticsDataClient({
    credentials: { client_email: clientEmail, private_key: privateKey },
  });
  return client;
}

function getPropertyPath() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID 환경변수가 없습니다.');
  }
  return `properties/${propertyId}`;
}

/**
 * 최근 `days`일(오늘 포함)의 일별 페이지뷰·활성 사용자를 가져온다.
 * 키는 GA4 날짜 형식 'YYYYMMDD' (속성 시간대 기준 — 속성 시간대를 Asia/Seoul로 맞출 것)
 */
export async function fetchGA4DailyTraffic(days: number): Promise<Map<string, GA4DailyTraffic>> {
  const [response] = await getClient().runReport({
    property: getPropertyPath(),
    dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
  });

  const result = new Map<string, GA4DailyTraffic>();
  for (const row of response.rows ?? []) {
    const ymd = row.dimensionValues?.[0]?.value;
    if (!ymd) continue;
    result.set(ymd, {
      pageViews: Number(row.metricValues?.[0]?.value ?? 0),
      visitors: Number(row.metricValues?.[1]?.value ?? 0),
    });
  }
  return result;
}

const SOCIAL_SOURCES = ['facebook', 'instagram', 'youtube', 'twitter', 't.co', 'kakao', 'threads', 'linkedin', 'tiktok'];

/** GA4 source/medium 조합을 대시보드 채널로 분류 */
function classifyChannel(source: string, medium: string): TrafficChannel {
  const s = source.toLowerCase();
  const m = medium.toLowerCase();
  if (m === 'organic' && s.includes('google')) return '구글 검색';
  if (m === 'organic' && s.includes('naver')) return '네이버 검색';
  if (m.includes('social') || SOCIAL_SOURCES.some(k => s.includes(k))) return '소셜 미디어';
  if (s === '(direct)' || m === '(none)') return '직접 유입';
  if (m === 'referral') return '참조 링크';
  return '기타';
}

/**
 * 최근 `days`일 세션을 유입 채널별로 합산한다.
 */
export async function fetchGA4TrafficSources(days: number): Promise<Record<TrafficChannel, number>> {
  const [response] = await getClient().runReport({
    property: getPropertyPath(),
    dateRanges: [{ startDate: `${days - 1}daysAgo`, endDate: 'today' }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }],
  });

  const totals: Record<TrafficChannel, number> = {
    '구글 검색': 0,
    '네이버 검색': 0,
    '소셜 미디어': 0,
    '직접 유입': 0,
    '참조 링크': 0,
    '기타': 0,
  };
  for (const row of response.rows ?? []) {
    const source = row.dimensionValues?.[0]?.value ?? '';
    const medium = row.dimensionValues?.[1]?.value ?? '';
    totals[classifyChannel(source, medium)] += Number(row.metricValues?.[0]?.value ?? 0);
  }
  return totals;
}
