import prisma from './prisma';

// 임시 GA4 데이터 가져오기 함수 (실제 GA4 API 키가 있으면 여기서 호출)
async function getGA4Data(date: Date) {
  // 실제 GA4 API 연동 시 구글 라이브러리 사용
  // return await ga4Client.runReport({...});

  // 지금은 랜덤 데이터를 반환하도록 구현
  return {
    pageViews: Math.floor(Math.random() * 500) + 100,
    visitors: Math.floor(Math.random() * 300) + 50,
  };
}

// 특정 날짜의 데이터를 동기화하는 핵심 함수
export async function syncDailyStats(date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. GA4 데이터 가져오기
  const ga4Data = await getGA4Data(date);

  // 2. 내부 DB에서 지표 계산하기
  // (1) 회원가입 수 (Customer 테이블)
  const signupCount = await prisma.customer.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay }
    }
  });

  // (2) 문의 수 (Inquiry 테이블)
  const inquiryCount = await prisma.inquiry.count({
    where: {
      createdAt: { gte: startOfDay, lte: endOfDay }
    }
  });

  // (3) 매출액 (Transaction 테이블)
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: startOfDay, lte: endOfDay },
      status: 'completed'
    }
  });
  const totalRevenue = transactions.reduce((acc, tr) => acc + Number(tr.amount), 0);

  // 3. DailyStat 테이블에 저장 (이미 있으면 업데이트, 없으면 생성)
  await prisma.dailyStat.upsert({
    where: { date: startOfDay },
    update: {
      pageViews: ga4Data.pageViews,
      visitors: ga4Data.visitors,
      signups: signupCount,
      inquiries: inquiryCount,
      revenue: totalRevenue,
    },
    create: {
      date: startOfDay,
      pageViews: ga4Data.pageViews,
      visitors: ga4Data.visitors,
      signups: signupCount,
      inquiries: inquiryCount,
      revenue: totalRevenue,
    }
  });

  console.log(`✅ Synced stats for ${startOfDay.toLocaleDateString()}`);
}
