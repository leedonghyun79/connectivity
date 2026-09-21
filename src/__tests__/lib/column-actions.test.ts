import { createColumn, updateColumn } from '@/lib/actions';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    column: {
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
  title: '전환율을 높이는 5가지 방법',
  category: '전환율 최적화',
  contentHtml: '<p>내용</p>',
};

describe('Server Actions (lib/actions.ts) Column SEO description Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createColumn', () => {
    it('description을 입력하면 trim해서 prisma에 전달해야 함', async () => {
      (prisma.column.create as jest.Mock).mockResolvedValue({ id: 'col_1', ...basePayload });

      const result = await createColumn({ ...basePayload, description: '  요약 설명입니다.  ' });

      expect(result.success).toBe(true);
      expect(prisma.column.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: '요약 설명입니다.' }),
        })
      );
      expect(revalidatePath).toHaveBeenCalledWith('/columns');
    });

    it('description을 비워두면 null로 저장해야 함', async () => {
      (prisma.column.create as jest.Mock).mockResolvedValue({ id: 'col_1', ...basePayload });

      await createColumn(basePayload);

      expect(prisma.column.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ description: null }),
        })
      );
    });
  });

  describe('updateColumn', () => {
    it('description을 수정해서 prisma에 전달해야 함', async () => {
      (prisma.column.update as jest.Mock).mockResolvedValue({ id: 'col_1', ...basePayload });

      await updateColumn('col_1', { ...basePayload, description: '수정된 요약' });

      expect(prisma.column.update).toHaveBeenCalledWith({
        where: { id: 'col_1' },
        data: expect.objectContaining({ description: '수정된 요약' }),
      });
    });
  });
});
