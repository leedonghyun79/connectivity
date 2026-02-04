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
    });
    return inquiries;
  } catch (error) {
    console.error('Failed to fetch inquiries:', error);
    return [];
  }
}

/**
 * 통계 관련 액션
 */

export async function getDashboardStats() {
  try {
    const [customerCount, inquiryCount, estimateCount, totalRevenue] = await Promise.all([
      prisma.customer.count(),
      prisma.inquiry.count({ where: { status: 'pending' } }),
      prisma.estimate.count({ where: { status: 'pending' } }),
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { status: 'completed' }
      })
    ]);

    const recentStat = await prisma.dailyStat.findFirst({
      orderBy: { date: 'desc' }
    });

    return {
      totalCustomers: customerCount,
      pendingInquiries: inquiryCount,
      pendingEstimates: estimateCount,
      totalRevenue: totalRevenue._sum.amount?.toString() || '0',
      todayVisitors: recentStat?.visitors || 0
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return null;
  }
}

export async function getCustomerStats() {
  const [total, pending, processing, closed] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: 'pending' } }),
    prisma.customer.count({ where: { status: 'processing' } }),
    prisma.customer.count({ where: { status: 'closed' } }),
  ]);
  return { total, pending, processing, closed };
}

export async function getInquiryStats() {
  const [total, pending, answered] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'pending' } }),
    prisma.inquiry.count({ where: { status: 'answered' } }),
  ]);
  return { total, pending, answered };
}

export async function getEstimateStats() {
  const [stats, pending, approved] = await Promise.all([
    prisma.estimate.aggregate({ _sum: { amount: true } }),
    prisma.estimate.count({ where: { status: 'pending' } }),
    prisma.estimate.count({ where: { status: 'approved' } }),
  ]);
  return {
    totalAmount: stats._sum.amount?.toString() || '0',
    pending,
    approved
  };
}

export async function getSalesStats() {
  const [revenue, completedCount, pendingCount] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    }),
    prisma.transaction.count({ where: { status: 'completed' } }),
    prisma.transaction.count({ where: { status: 'pending' } }),
  ]);

  const monthlySales = await prisma.transaction.findMany({
    where: { status: 'completed' },
    take: 6,
    orderBy: { date: 'asc' }
  });

  return {
    totalRevenue: revenue._sum.amount?.toString() || '0',
    completedCount,
    pendingCount,
    monthlySales: monthlySales.map(s => ({
      name: new Date(s.date).getMonth() + 1 + '월',
      amount: Number(s.amount)
    }))
  };
}

// 부가 유틸리티
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

export async function syncAllStats() {
  try {
    // 임시 동기화 로직 (실제로는 GA4 API 등을 호출)
    // 여기서는 간단히 리밸리데이션만 처리하거나 더미 데이터 업데이트
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to sync stats:', error);
    return { success: false };
  }
}
