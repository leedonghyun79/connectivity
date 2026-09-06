import prisma from './prisma';

/**
 * 이미지 저장 추상화.
 * 지금은 DB(ColumnImage) 구현체. 추후 R2 구현체로 교체 예정 —
 * 아래 인터페이스만 만족하면 호출부는 그대로 둔다.
 */
export interface ImageStore {
  save(data: Buffer, mimeType: string): Promise<{ id: string; url: string }>;
  get(id: string): Promise<{ data: Buffer; mimeType: string } | null>;
  delete(id: string): Promise<void>;
}

// 본문 HTML에 절대 URL로 박히므로, 배포 도메인을 환경변수로 받는다.
function publicBase(): string {
  return (
    process.env.CONNECTIVITY_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export const dbImageStore: ImageStore = {
  async save(data, mimeType) {
    const row = await prisma.columnImage.create({
      data: { data, mimeType },
      select: { id: true },
    });
    return { id: row.id, url: `${publicBase()}/api/images/${row.id}` };
  },

  async get(id) {
    const row = await prisma.columnImage.findUnique({ where: { id } });
    if (!row) return null;
    return { data: Buffer.from(row.data), mimeType: row.mimeType };
  },

  async delete(id) {
    await prisma.columnImage.delete({ where: { id } }).catch(() => {});
  },
};

// 호출부는 이 심볼만 사용한다.
export const imageStore: ImageStore = dbImageStore;
