import prisma from './prisma';
import { fetchGA4DailyTraffic } from './ga4';

// 날짜 기준은 모두 KST(UTC+9). 서버(Vercel)는 UTC라 로컬 시간에 기대면 하루씩 어긋남.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** KST 기준 오늘부터 과거 `days`일의 'YYYY-MM-DD' 목록 (최신 → 과거 순) */
function recentKstDays(days: number): string[] {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  const list: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(kstNow.getTime() - i * DAY_MS);
    list.push(d.toISOString().slice(0, 10));
  }
  return list;
}

/**
 * 최근 `days`일 통계를 동기화한다.
 * - GA4: 페이지뷰·순 방문자 (GA4 Data API)
 * - DB: 가입·문의·매출 (Customer / Inquiry / Transaction)
 * GA4 호출이 실패하면 아무것도 쓰지 않고 throw → 기존 값이 0으로 덮어써지지 않음.
 */
export async function syncRecentStats(days = 30) {
  const traffic = await fetchGA4DailyTraffic(`${days - 1}daysAgo`);

  const dayKeys = recentKstDays(days);
  await Promise.all(
    dayKeys.map(async (day) => {
      const start = new Date(`${day}T00:00:00+09:00`);
      const end = new Date(start.getTime() + DAY_MS - 1);
      const ga = traffic.get(day.replaceAll('-', '')) ?? { pageViews: 0, visitors: 0 };

      const [signupCount, inquiryCount, revenue] = await Promise.all([
        prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.inquiry.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { date: { gte: start, lte: end }, status: 'completed' },
        }),
      ]);

      const data = {
        pageViews: ga.pageViews,
        visitors: ga.visitors,
        signups: signupCount,
        inquiries: inquiryCount,
        revenue: revenue._sum.amount ?? 0,
      };

      await prisma.dailyStat.upsert({
        where: { date: start },
        update: data,
        create: { date: start, ...data },
      });
    })
  );
}
