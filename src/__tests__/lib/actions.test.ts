import { updateEstimateStatus, getTodayStats } from '@/lib/actions';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Prisma 및 Next.js 캐시 함수 모킹
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    estimate: {
      update: jest.fn(),
    },
    customer: {
      count: jest.fn(),
    },
    project: {
      count: jest.fn(),
    },
    inquiry: {
      count: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('Server Actions (lib/actions.ts) Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateEstimateStatus', () => {
    it('견적서 상태를 성공적으로 업데이트하고 경로를 갱신해야 함', async () => {
      const mockEstimate = { id: 'est_123', status: 'approved' };
      (prisma.estimate.update as jest.Mock).mockResolvedValue(mockEstimate);

      const result = await updateEstimateStatus('est_123', 'approved');

      expect(result.success).toBe(true);
      expect(prisma.estimate.update).toHaveBeenCalledWith({
        where: { id: 'est_123' },
        data: { status: 'approved' },
      });
      expect(revalidatePath).toHaveBeenCalledWith('/estimates');
      expect(revalidatePath).toHaveBeenCalledWith('/');
    });

    it('DB 에러 발생 시 실패 결과를 반환해야 함', async () => {
      (prisma.estimate.update as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const result = await updateEstimateStatus('est_123', 'rejected');

      expect(result.success).toBe(false);
      expect(result.error).toBe('견적서 상태 업데이트에 실패했습니다.');
    });
  });

  describe('getTodayStats', () => {
    it('오늘의 통계 데이터를 올바르게 집계해야 함', async () => {
      (prisma.customer.count as jest.Mock).mockResolvedValue(5);
      (prisma.project.count as jest.Mock).mockResolvedValue(2);
      (prisma.inquiry.count as jest.Mock).mockResolvedValue(10);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(3);

      const stats = await getTodayStats();

      expect(stats.newCustomers).toBe(5);
      expect(stats.closedProjects).toBe(2);
      expect(stats.newInquiries).toBe(10);
      expect(stats.newTransactions).toBe(3);
    });
  });
});
