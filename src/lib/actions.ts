'use server';

import prisma from './prisma';
import { revalidatePath } from 'next/cache';

/**
 * 고객 관련 액션
 */

// 고객 생성
export async function createCustomer(data: { name: string; email?: string; company?: string; phone?: string }) {
  try {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        status: 'pending', // 대기 상태가 기본값
      },
    });
    revalidatePath('/customers');
    return { success: true, data: customer };
  } catch (error: any) {
    console.error('Failed to create customer:', error);
    return { success: false, error: '고객 등록에 실패했습니다.' };
  }
}

// 고객 수정
export async function updateCustomer(id: string, data: { name: string; email?: string; company?: string; phone?: string; status?: string }) {
  try {
    const customer = await prisma.customer.update({
      where: { id },
      data,
    });
    revalidatePath('/customers');
    return { success: true, data: customer };
  } catch (error) {
    console.error('Failed to update customer:', error);
    return { success: false, error: '고객 정보 수정에 실패했습니다.' };
  }
}

// 고객 삭제
export async function deleteCustomer(id: string) {
  try {
    await prisma.customer.delete({
      where: { id },
    });
    revalidatePath('/customers');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return { success: false, error: '고객 삭제에 실패했습니다.' };
  }
}

// 고객 목록 가져오기
export async function getCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return customers;
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return [];
  }
}

// 고객 단일 조회 (상세 페이지용 - 연관 데이터 포함)
export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        projects: { orderBy: { createdAt: 'desc' } },
        estimates: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
        transactions: { orderBy: { date: 'desc' } },
        inquiries: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) return null;
    return {
      ...customer,
      estimates: customer.estimates.map(est => ({
        ...est,
        amount: est.amount?.toString() || '0',
        items: est.items.map(item => ({
          ...item,
          unitPrice: item.unitPrice.toString(),
          supplyValue: item.supplyValue.toString(),
          vat: item.vat.toString(),
        })),
      })),
      transactions: customer.transactions.map(tx => ({
        ...tx,
        amount: tx.amount.toString(),
      })),
    };
  } catch (error) {
    console.error('Failed to fetch customer by id:', error);
    return null;
  }
}

/**
 * 견적서 관련 액션
 */

// 견적서 생성
export async function createEstimate(data: {
  title: string;
  customerId: string;
  bizNumber?: string;
  bizName?: string;
  bizCEO?: string;
  bizAddress?: string;
  bizPhone?: string;
  bizEmail?: string;
  items: any[];
}) {
  try {
    // 항목들의 총액 계산
    const totalAmount = data.items.reduce((acc, item) => acc + (Number(item.supplyValue) || 0) + (Number(item.vat) || 0), 0);

    const estimate = await prisma.estimate.create({
      data: {
        title: data.title,
        amount: totalAmount,
        customerId: data.customerId,
        status: 'pending',
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 유효
        bizNumber: data.bizNumber,
        bizName: data.bizName,
        bizCEO: data.bizCEO,
        bizAddress: data.bizAddress,
        bizPhone: data.bizPhone,
        bizEmail: data.bizEmail,
        items: {
          create: data.items.map(item => ({
            itemName: item.itemName,
            spec: item.spec,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            supplyValue: Number(item.supplyValue) || 0,
            vat: Number(item.vat) || 0,
          }))
        }
      },
    });
    revalidatePath('/estimates');
    return { success: true, data: estimate };
  } catch (error) {
    console.error('Failed to create estimate:', error);
    return { success: false, error: '견적서 생성에 실패했습니다.' };
  }
}

// 견적서 목록 가져오기
export async function getEstimates() {
  try {
    const estimates = await prisma.estimate.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true, items: true },
    });
    return estimates.map(est => ({
      ...est,
      amount: est.amount ? est.amount.toString() : '0',
      items: est.items.map(item => ({
        ...item,
        unitPrice: item.unitPrice.toString(),
        supplyValue: item.supplyValue.toString(),
        vat: item.vat.toString(),
      }))
    }));
  } catch (error) {
    console.error('Failed to fetch estimates:', error);
    return [];
  }
}

// 견적서 수정
export async function updateEstimate(id: string, data: {
  title: string;
  customerId: string;
  bizNumber?: string;
  bizName?: string;
  bizCEO?: string;
  bizAddress?: string;
  bizPhone?: string;
  bizEmail?: string;
  issueDate?: Date;
  items: any[];
}) {
  try {
    // 항목들의 총액 계산
    const totalAmount = data.items.reduce((acc, item) => acc + (Number(item.supplyValue) || 0) + (Number(item.vat) || 0), 0);

    const estimate = await prisma.estimate.update({
      where: { id },
      data: {
        title: data.title,
        amount: totalAmount,
        customerId: data.customerId,
        issueDate: data.issueDate,
        bizNumber: data.bizNumber,
        bizName: data.bizName,
        bizCEO: data.bizCEO,
        bizAddress: data.bizAddress,
        bizPhone: data.bizPhone,
        bizEmail: data.bizEmail,
        // 기존 항목 삭제 후 재생성
        items: {
          deleteMany: {},
          create: data.items.map(item => ({
            itemName: item.itemName,
            spec: item.spec,
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice) || 0,
            supplyValue: Number(item.supplyValue) || 0,
            vat: Number(item.vat) || 0,
          }))
        }
      },
    });
    revalidatePath('/estimates');
    return { success: true, data: estimate };
  } catch (error) {
    console.error('Failed to update estimate:', error);
    return { success: false, error: '견적서 수정에 실패했습니다.' };
  }
}

// 견적서 삭제
export async function deleteEstimate(id: string) {
  try {
    await prisma.estimate.delete({
      where: { id },
    });
    revalidatePath('/estimates');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete estimate:', error);
    return { success: false, error: '견적서 삭제에 실패했습니다.' };
  }
}

// 견적서 상태 업데이트 (승인/거절 등)
export async function updateEstimateStatus(id: string, status: 'pending' | 'sent' | 'approved' | 'rejected') {
  try {
    const estimate = await prisma.estimate.findUnique({
      where: { id },
      include: { customer: true }
    });

    if (!estimate) return { success: false, error: '견적서를 찾을 수 없습니다.' };

    const updatedEstimate = await prisma.estimate.update({
      where: { id },
      data: { status },
    });

    // 승인 시 거래 내역(Transaction) 자동 생성
    if (status === 'approved' && estimate.amount) {
      await prisma.transaction.create({
        data: {
          serviceType: estimate.title.replace(' 견적서', ''),
          amount: estimate.amount,
          status: 'completed', // 승인 시 바로 매출로 잡음 (또는 pending으로 하고 입금확인 절차를 둘 수도 있음)
          date: new Date(),
          customerId: estimate.customerId,
          customerName: estimate.customerName || estimate.customer?.name,
        }
      });

      await createLog(
        'TRANSACTION_CREATE', 
        `견적 승인에 따른 매출 전표가 자동 생성되었습니다: ${updatedEstimate.title}`,
        'SYSTEM'
      );
    }

    revalidatePath('/estimates');
    revalidatePath('/sales');
    revalidatePath('/');
    
    return { success: true, data: updatedEstimate };
  } catch (error) {
    console.error('Failed to update estimate status:', error);
    return { success: false, error: '견적서 상태 업데이트에 실패했습니다.' };
  }
}

// 견적서 이메일 발송 (Resend 연동)
export async function sendEstimateEmail(estimateId: string, email: string, pdfBase64?: string) {
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const estimate = await prisma.estimate.findUnique({
      where: { id: estimateId },
      include: { customer: true, items: true }
    });

    if (!estimate) return { success: false, error: '견적서를 찾을 수 없습니다.' };

    // Buffer 모듈 동적 로드 (클라이언트 빌드 에러 방지)
    const { Buffer } = await import('buffer');

    const attachments = pdfBase64 ? [
      {
        filename: `견적서_${estimate.title}.pdf`,
        content: Buffer.from(pdfBase64.split(',')[1], 'base64'),
      }
    ] : [];

    const { data, error } = await resend.emails.send({
      from: 'Connectivity <onboarding@resend.dev>', // 나중에 본인 도메인으로 변경 가능
      to: [email],
      subject: `[견적서] ${estimate.title} - Connectivity`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #000; font-size: 24px; font-weight: 800; margin-bottom: 20px;">견적서가 도착했습니다.</h1>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">안녕하세요, <strong>${estimate.customer?.name || estimate.customerName}</strong>님.</p>
          <p style="font-size: 16px; color: #666; line-height: 1.6;">요청하신 <strong>'${estimate.title}'</strong>에 대한 견적 상세 내용을 확인해 주세요.</p>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>견적 총액:</strong> ${Number(estimate.amount).toLocaleString()} KRW</p>
            <p style="margin: 5px 0;"><strong>발행 일자:</strong> ${estimate.issueDate?.toLocaleDateString('ko-KR')}</p>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 40px;">첨부된 PDF 파일을 확인해 주시기 바랍니다.<br/>본 메일은 Connectivity 시스템에서 자동으로 발송되었습니다.</p>
        </div>
      `,
      attachments,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: '이메일 발송 중 오류가 발생했습니다.' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: '이메일 발송에 실패했습니다.' };
  }
}

/**
 * 문의 관련 액션
 */

// 문의 목록 가져오기
export async function getInquiries() {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });
    return inquiries;
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return [];
  }
}

// 문의 상태 변경
export async function updateInquiryStatus(id: string, status: string) {
  try {
    await prisma.inquiry.update({
      where: { id },
      data: { status },
    });
    revalidatePath('/inquiries');
    return { success: true };
  } catch (error) {
    console.error('Failed to update inquiry status:', error);
    return { success: false, error: '상태 변경에 실패했습니다.' };
  }
}

// 문의 답변 등록
export async function answerInquiry(id: string, answer: string) {
  try {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { 
        answer,
        status: 'answered',
        answeredAt: new Date()
      },
    });

    await createLog(
      'INQUIRY_ANSWER', 
      `문의 '${inquiry.title}'에 대한 답변이 등록되었습니다.`,
      'ADMIN' // 나중에 실제 세션 유저로 변경 가능
    );

    revalidatePath('/inquiries');
    return { success: true, data: inquiry };
  } catch (error) {
    console.error('Failed to answer inquiry:', error);
    return { success: false, error: '답변 등록에 실패했습니다.' };
  }
}

// 문의 삭제
export async function deleteInquiry(id: string) {
  try {
    await prisma.inquiry.delete({ where: { id } });
    revalidatePath('/inquiries');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete inquiry:', error);
    return { success: false, error: '문의 삭제에 실패했습니다.' };
  }
}

// 문의 통계 가져오기
export async function getInquiryStats() {
  try {
    const [total, pending, answered] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'pending' } }),
      prisma.inquiry.count({ where: { status: 'answered' } }),
    ]);

    return { total, pending, answered };
  } catch (error) {
    console.error('Failed to fetch inquiry stats:', error);
    return { total: 0, pending: 0, answered: 0 };
  }
}

/**
 * 통계 관련 액션
 */

// 매출 통계 데이터 조회 (매출 분석 페이지용)
export async function getSalesStats() {
  try {
    const [transactions, allTransactions] = await Promise.all([
      prisma.transaction.findMany({
        where: { status: 'completed' },
        orderBy: { date: 'asc' },
      }),
      prisma.transaction.findMany()
    ]);

    // 1. 총 매출 및 건수 계산
    const totalRevenue = transactions.reduce((acc, tx) => acc + Number(tx.amount), 0);
    const completedCount = transactions.length;
    const pendingCount = allTransactions.filter(tx => tx.status === 'pending').length;

    // 2. 월별 매출 집계 (최근 6개월)
    const monthlyMap: Record<string, number> = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(tx.amount);
    });

    const monthlySales = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, amount]) => ({
        name: `${parseInt(key.split('-')[1])}월`,
        amount,
      }));

    // 3. 서비스 비중 집계
    const typeMap: Record<string, number> = {};
    allTransactions.forEach(tx => {
      const type = tx.serviceType || '기타';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const serviceDistribution = Object.entries(typeMap).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    return {
      totalRevenue,
      completedCount,
      pendingCount,
      monthlySales,
      serviceDistribution
    };
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return {
      totalRevenue: 0,
      completedCount: 0,
      pendingCount: 0,
      monthlySales: [],
      serviceDistribution: []
    };
  }
}

// 관리자 프로필 업데이트 (이름, 아이디 등)
export async function updateAdminProfile(currentUsername: string, data: { name?: string; username?: string }) {
  try {
    // 아이디 변경 시 중복 체크
    if (data.username && data.username !== currentUsername) {
      const existingUser = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existingUser) {
        return { success: false, error: '이미 사용 중인 아이디입니다.' };
      }
    }

    const updatedUser = await prisma.user.update({
      where: { username: currentUsername },
      data,
    });

    if (data.username && data.username !== currentUsername) {
      await createLog('PROFILE_UPDATE', `관리자 아이디가 변경되었습니다: ${currentUsername} -> ${data.username}`, data.username);
    } else {
      await createLog('PROFILE_UPDATE', `관리자 정보가 변경되었습니다.`, currentUsername);
    }

    return { success: true, data: updatedUser };
  } catch (error) {
    console.error('Failed to update admin profile:', error);
    return { success: false, error: '프로필 수정에 실패했습니다.' };
  }
}

// 비밀번호 변경
export async function changePassword(username: string, currentPassword: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    const isPasswordValid = await (await import('bcryptjs')).compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };
    }

    const hashedNewPassword = await (await import('bcryptjs')).hash(newPassword, 10);
    await prisma.user.update({
      where: { username },
      data: { password: hashedNewPassword },
    });
    await createLog('PASSWORD_CHANGE', '관리자 비밀번호가 변경되었습니다.', username);
    return { success: true };
  } catch (error) {
    console.error('Failed to change password:', error);
    return { success: false, error: '비밀번호 변경에 실패했습니다.' };
  }
}

// 수동 거래 내역 생성
export async function createTransaction(data: {
  serviceType: string;
  amount: number;
  customerId?: string;
  customerName?: string;
  date?: Date;
  status?: 'pending' | 'completed';
}) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        serviceType: data.serviceType,
        amount: data.amount,
        customerId: data.customerId,
        customerName: data.customerName,
        date: data.date || new Date(),
        status: data.status || 'completed',
      },
    });

    await createLog(
      'TRANSACTION_MANUAL_CREATE', 
      `수동 거래 내역이 등록되었습니다: ${data.serviceType} (${Number(data.amount).toLocaleString()}원)`,
      'ADMIN'
    );

    revalidatePath('/sales');
    revalidatePath('/');
    return { success: true, data: transaction };
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return { success: false, error: '거래 내역 등록에 실패했습니다.' };
  }
}

// --- System & Logs ---

export async function createLog(action: string, message: string, user?: string) {
  try {
    await prisma.systemLog.create({
      data: { action, message, user }
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
}

/**
 * 유틸리티 및 통계 데이터 조회
 */

export async function getTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: { customer: true },
    });
    return transactions.map(tx => ({
      ...tx,
      amount: tx.amount.toString(),
    }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return [];
  }
}

export async function getDailyStats() {
  try {
    const stats = await prisma.dailyStat.findMany({
      orderBy: { date: 'desc' },
      take: 7
    });
    return stats.map(s => ({
      ...s,
      revenue: s.revenue.toString()
    }));
  } catch (error) {
    console.error('Failed to fetch daily stats:', error);
    return [];
  }
}

export async function resetAllData() {
  try {
    // 주의: 실제 운영 환경에서는 매우 위험한 작업입니다.
    await prisma.$transaction([
      prisma.estimateItem.deleteMany(),
      prisma.estimate.deleteMany(),
      prisma.project.deleteMany(),
      prisma.customer.deleteMany(),
      prisma.systemLog.create({
        data: {
          action: 'RESET',
          message: '모든 비즈니스 데이터가 초기화되었습니다.',
          user: 'ADMIN'
        }
      })
    ]);
    return { success: true };
  } catch (error) {
    console.error('Failed to reset data:', error);
    return { success: false };
  }
}

/**
 * 대시보드: 오늘 통계 집계
 */
export async function getTodayStats() {
  try {
    // 한국 시간 기준으로 오늘 자정(00:00:00)의 UTC 시간 구하기
    const now = new Date();
    const kstTodayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);
    const todayKSTStart = new Date(`${kstTodayStr}T00:00:00+09:00`);

    const [newCustomers, closedProjects, newInquiries, newTransactions] = await Promise.all([
      prisma.customer.count({ where: { createdAt: { gte: todayKSTStart } } }),
      prisma.project.count({ where: { status: 'COMPLETED', updatedAt: { gte: todayKSTStart } } }),
      prisma.inquiry.count({ where: { createdAt: { gte: todayKSTStart } } }),
      prisma.transaction.count({ where: { date: { gte: todayKSTStart }, status: 'completed' } }),
    ]);

    return {
      newCustomers,
      closedProjects,
      newInquiries,
      newTransactions
    };
  } catch (error) {
    console.error('Error fetching today stats:', error);
    return { newCustomers: 0, closedProjects: 0, newInquiries: 0, newTransactions: 0 };
  }
}

/**
 * 대시보드: 최근 활동 통합 피드 (비즈니스 활동 + 시스템 로그)
 */
export async function getRecentActivityFeed() {
  try {
    const [inquiries, estimates, customers, logs] = await Promise.all([
      prisma.inquiry.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
      prisma.estimate.findMany({ take: 3, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
      prisma.customer.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
      prisma.systemLog.findMany({ take: 3, orderBy: { createdAt: 'desc' } }),
    ]);

    const feed = [
      ...inquiries.map(item => ({
        id: `inquiry-${item.id}`,
        type: 'ESTIMATE',
        title: `문의 접수: ${item.title}`,
        client: item.authorName || item.customer?.name || '익명 고객',
        createdAt: item.createdAt,
      })),
      ...estimates.map(item => ({
        id: `estimate-${item.id}`,
        type: 'ESTIMATE',
        title: `견적서 발행: ${item.title}`,
        client: item.customer?.name || '알 수 없음',
        createdAt: item.createdAt,
      })),
      ...customers.map(item => ({
        id: `customer-${item.id}`,
        type: 'CLIENT',
        title: `신규 고객 등록: ${item.name}`,
        client: item.company || '개인',
        createdAt: item.createdAt,
      })),
      ...logs.map(log => ({
        id: `log-${log.id}`,
        type: 'INFO',
        title: log.message,
        client: log.user || '시스템 관리자',
        createdAt: log.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 8);

    return feed;
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    return [];
  }
}

/**
 * 대시보드: 최근 문의 목록
 */
export async function getRecentInquiries() {
  try {
    return await prisma.inquiry.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { customer: true }
    });
  } catch (error) {
    console.error('Error fetching recent inquiries:', error);
    return [];
  }
}

/**
 * 대시보드: 통합 통계 데이터 (상단 카드용)
 */
export async function getDashboardStats() {
  try {
    const [pendingInquiries, pendingEstimates, totalRevenue] = await Promise.all([
      prisma.inquiry.count({ where: { status: 'pending' } }),
      prisma.estimate.count({ where: { status: 'pending' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })
    ]);

    return {
      todayVisitors: 124, 
      pendingInquiries,
      pendingEstimates,
      totalRevenue: totalRevenue._sum.amount || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { todayVisitors: 0, pendingInquiries: 0, pendingEstimates: 0, totalRevenue: 0 };
  }
}

/**
 * 대시보드: 고객 통계 (AnalyticsTable용)
 */
export async function getCustomerStats() {
  try {
    const [total, pending, processing, closed] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: 'pending' } }),
      prisma.customer.count({ where: { status: 'processing' } }),
      prisma.customer.count({ where: { status: 'closed' } }),
    ]);

    return { total, pending, processing, closed };
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    return { total: 0, pending: 0, processing: 0, closed: 0 };
  }
}

/**
 * 대시보드: 견적 통계 (AnalyticsTable용)
 */
export async function getEstimateStats() {
  try {
    const [pending, approved, totalSum] = await Promise.all([
      prisma.estimate.count({ where: { status: 'pending' } }),
      prisma.estimate.count({ where: { status: 'approved' } }),
      prisma.estimate.aggregate({ _sum: { amount: true } })
    ]);

    return {
      pending,
      approved,
      totalAmount: Number(totalSum._sum.amount || 0)
    };
  } catch (error) {
    console.error('Error fetching estimate stats:', error);
    return { pending: 0, approved: 0, totalAmount: 0 };
  }
}

/**
 * 대시보드: 월별 매출 집계 (최근 6개월)
 */
export async function getMonthlySalesStats() {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'completed' },
      orderBy: { date: 'asc' },
    });

    const monthlyMap: Record<string, number> = {};
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + Number(tx.amount);
    });

    return Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, amount]) => ({
        name: `${parseInt(key.split('-')[1])}월`,
        amount,
      }));
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    return [];
  }
}

/**
 * 설정: 시스템 상태 조회
 */
export async function getSystemStats() {
  try {
    const result: any[] = await prisma.$queryRaw`SELECT sum(pg_database_size(datname)) as size FROM pg_database`;
    const sizeInBytes = Number(result[0]?.size || 0);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    const [customerCount, projectCount, estimateCount] = await Promise.all([
      prisma.customer.count(),
      prisma.project.count(),
      prisma.estimate.count(),
    ]);

    return {
      dbSizeMB: Number(sizeInMB.toFixed(2)),
      totalRecords: customerCount + projectCount + estimateCount
    };
  } catch (error) {
    console.error('Failed to get system stats:', error);
    return { dbSizeMB: 0, totalRecords: 0 };
  }
}/**
 * 설정: 특정 날짜의 시스템 로그 조회
 */
export async function getLogsByDate(dateStr: string) {
  try {
    // 입력받은 YYYY-MM-DD를 한국 시간 기준의 시작/종료 시간으로 변환
    const start = new Date(`${dateStr}T00:00:00+09:00`);
    const end = new Date(`${dateStr}T23:59:59.999+09:00`);

    return await prisma.systemLog.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Failed to get logs by date:', error);
    return [];
  }
}

/**
 * 설정: 특정 날짜의 비즈니스 통계 조회
 */
export async function getStatsByDate(dateStr: string) {
  try {
    const start = new Date(`${dateStr}T00:00:00+09:00`);
    const end = new Date(`${dateStr}T23:59:59.999+09:00`);

    const [newCustomers, closedProjects, newInquiries, newTransactions] = await Promise.all([
      prisma.customer.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.project.count({ where: { status: 'COMPLETED', updatedAt: { gte: start, lte: end } } }),
      prisma.inquiry.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.transaction.count({ where: { date: { gte: start, lte: end }, status: 'completed' } }),
    ]);

    return {
      newCustomers,
      closedProjects,
      newInquiries,
      newTransactions
    };
  } catch (error) {
    console.error('Error fetching stats by date:', error);
    return { newCustomers: 0, closedProjects: 0, newInquiries: 0, newTransactions: 0 };
  }
}

/**
 * 설정: 시스템 로그 조회
 */
export async function getSystemLogs() {
  try {
    return await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  } catch (error) {
    console.error('Failed to get system logs:', error);
    return [];
  }
}

/**
 * 설정: 시스템 환경 설정 조회
 */
export async function getSystemConfig() {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { id: 1 }
    });
    
    if (!config) {
      config = await prisma.systemConfig.create({
        data: { id: 1 }
      });
    }
    
    return config;
  } catch (error) {
    console.error('Failed to get system config:', error);
    return null;
  }
}

/**
 * 설정: 시스템 환경 설정 업데이트
 */
export async function updateSystemConfig(data: any) {
  try {
    const config = await prisma.systemConfig.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data }
    });
    
    await createLog(
      'SYSTEM_CONFIG_UPDATE', 
      '시스템 환경 설정이 업데이트되었습니다.',
      'ADMIN'
    );
    
    revalidatePath('/settings');
    return { success: true, data: config };
  } catch (error) {
    console.error('Failed to update system config:', error);
    return { success: false, error: '설정 저장에 실패했습니다.' };
  }
}

/**
 * 대시보드: 시스템 전체 통계 수동 동기화 (임시 구현)
 */
export async function syncAllStats() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: '동기화에 실패했습니다.' };
  }
}
