import { createPortfolio, publishPortfolio } from '@/lib/portfolio-actions';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    portfolio: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const basePayload = {
  title: '비자르테 쇼핑몰',
  category: '쇼핑몰',
  tags: ['인테리어', '쇼핑몰'],
  contentHtml: '<p>내용</p>',
};

describe('Server Actions (lib/portfolio-actions.ts) Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPortfolio', () => {
    it('카테고리가 PORTFOLIO_CATEGORIES에 없으면 실패를 반환해야 함', async () => {
      const result = await createPortfolio({ ...basePayload, category: '없는카테고리' });

      expect(result.success).toBe(false);
      expect(prisma.portfolio.create).not.toHaveBeenCalled();
    });

    it('tags 배열이 그대로 prisma에 전달되어야 함', async () => {
      (prisma.portfolio.create as jest.Mock).mockResolvedValue({ id: 'pf_1', ...basePayload });

      const result = await createPortfolio(basePayload);

      expect(result.success).toBe(true);
      expect(prisma.portfolio.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ tags: ['인테리어', '쇼핑몰'] }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/portfolios');
    });
  });

  describe('publishPortfolio', () => {
    it('이미 publishedAt이 있으면 값을 유지해야 함', async () => {
      const existingDate = new Date('2026-01-01T00:00:00.000Z');
      (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue({ id: 'pf_1', publishedAt: existingDate });
      (prisma.portfolio.update as jest.Mock).mockResolvedValue({ id: 'pf_1', status: 'published', publishedAt: existingDate });

      const result = await publishPortfolio('pf_1');

      expect(result.success).toBe(true);
      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: 'pf_1' },
        data: { status: 'published', publishedAt: existingDate },
      });
    });

    it('publishedAt이 없으면 새로 세팅해야 함', async () => {
      (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue({ id: 'pf_1', publishedAt: null });
      (prisma.portfolio.update as jest.Mock).mockResolvedValue({ id: 'pf_1', status: 'published' });

      const result = await publishPortfolio('pf_1');

      expect(result.success).toBe(true);
      const callArgs = (prisma.portfolio.update as jest.Mock).mock.calls[0][0];
      expect(callArgs.data.publishedAt).toBeInstanceOf(Date);
    });

    it('작업물을 찾을 수 없으면 실패를 반환해야 함', async () => {
      (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await publishPortfolio('missing');

      expect(result.success).toBe(false);
      expect(prisma.portfolio.update).not.toHaveBeenCalled();
    });
  });
});
