import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding data...');

  // 1. 기존 데이터 삭제 (테스트 환경이므로 초기화)
  await prisma.transaction.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.project.deleteMany();
  await prisma.customer.deleteMany();

  // 2. 고객 데이터 생성
  const customerNames = ['김철수', '이영희', '박지성', '최동원', '정우성', '한지민', '강동원', '송혜교', '유재석', '강호동'];
  const companies = ['삼성전자', 'LG화학', '현대자동차', 'SK텔레콤', '네이버', '카카오', '쿠팡', '배달의민족', '토스', '당근마켓'];

  const customers = [];
  for (let i = 0; i < 10; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: customerNames[i],
        email: `customer${i + 1}@example.com`,
        company: companies[i],
        phone: `010-1234-567${i}`,
        status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'pending',
        lastLogin: new Date(2024, 1, i + 1), // 2월 날짜
      },
    });
    customers.push(customer);
  }
  console.log(`✅ Created ${customers.length} customers.`);

  // 3. 문의 데이터 생성
  for (let i = 0; i < 10; i++) {
    await prisma.inquiry.create({
      data: {
        title: i % 2 === 0 ? '서비스 이용 관련 문의드립니다.' : '결제 내역 확인 부탁드립니다.',
        content: '안녕하세요, 서비스를 이용하던 중 궁금한 점이 있어 문의드립니다...',
        authorName: customers[i % 5].name,
        customerId: customers[i % 5].id,
        type: i % 3 === 0 ? '기술지원' : i % 3 === 1 ? '일반문의' : '결제/환불',
        status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'answered' : 'closed',
        createdAt: new Date(2024, 1, i + 1),
      },
    });
  }
  console.log(`✅ Created inquiries.`);

  // 4. 견적서 데이터 생성
  const estimateTitles = ['웹사이트 리뉴얼', '앱 개발', '유지보수 계약', 'SEO 최적화', '클라우드 마이그레이션'];
  for (let i = 0; i < 10; i++) {
    const amount = Math.floor(Math.random() * 50000000) + 5000000;
    await prisma.estimate.create({
      data: {
        estimateNum: `EST-2024-${1001 + i}`,
        title: `${estimateTitles[i % 5]} 견적서`,
        amount: amount,
        status: i % 4 === 0 ? 'pending' : i % 4 === 1 ? 'sent' : i % 4 === 2 ? 'approved' : 'rejected',
        issueDate: new Date(2024, 1, i + 1),
        validUntil: new Date(2024, 1, i + 21),
        customerId: customers[i % 5].id,
      },
    });
  }
  console.log(`✅ Created estimates.`);

  // 5. 매출/거래 데이터 생성
  const services = ['웹사이트 리뉴얼', '모바일 앱 구축', 'ERP 유지보수', 'UI/UX 디자인', '클라우드 비용'];
  for (let i = 0; i < 5; i++) {
    const amount = Math.floor(Math.random() * 10000000) + 1000000;
    await prisma.transaction.create({
      data: {
        serviceType: services[i],
        amount: amount,
        customerId: customers[i].id,
        status: i === 0 ? 'pending' : 'completed',
        date: new Date(2024, 5, 25 - i), // 6월 데이터
      },
    });
  }
  console.log(`✅ Created transactions.`);

  console.log('🏁 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
