import { BetaAnalyticsDataClient } from '@google-analytics/data';

// 서버 전용 모듈 — 서비스 계정 키를 다루므로 클라이언트 컴포넌트에서 import 금지
export interface GA4DailyTraffic {
  pageViews: number;
  visitors: number;
}

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

/**
 * 최근 `days`일(오늘 포함)의 일별 페이지뷰·활성 사용자를 가져온다.
 * 키는 GA4 날짜 형식 'YYYYMMDD' (속성 시간대 기준 — 속성 시간대를 Asia/Seoul로 맞출 것)
 */
export async function fetchGA4DailyTraffic(days: number): Promise<Map<string, GA4DailyTraffic>> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  if (!propertyId) {
    throw new Error('GA4_PROPERTY_ID 환경변수가 없습니다.');
  }

  const [response] = await getClient().runReport({
    property: `properties/${propertyId}`,
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
