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
