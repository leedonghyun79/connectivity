import { randomUUID } from 'crypto';
import { AwsClient } from 'aws4fetch';
import prisma from './prisma';

/**
 * 이미지 저장 추상화.
 * - R2 설정(R2_BUCKET 등)이 있으면 Cloudflare R2 (S3 호환 API, aws4fetch 서명)
 * - 없으면 DB(ColumnImage) — 로컬 개발 / 폴백
 * 호출부(에디터, /api/images)는 `imageStore` 심볼만 사용한다.
 *
 * 참고: 과거 DB에 저장된 이미지는 /api/images/[id] 가 계속 dbImageStore 로 서빙한다
 * (신규 업로드만 R2). 그래서 dbImageStore.get 도 export 유지.
 */
export interface ImageStore {
  save(data: Buffer, mimeType: string): Promise<{ id: string; url: string }>;
  get(id: string): Promise<{ data: Buffer; mimeType: string } | null>;
  delete(id: string): Promise<void>;
}

// ---------- DB 구현 (레거시 / 폴백) ----------

function dbPublicBase(): string {
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
    return { id: row.id, url: `${dbPublicBase()}/api/images/${row.id}` };
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

// ---------- R2 구현 (S3 호환) ----------

const R2 = {
  accountId: process.env.R2_ACCOUNT_ID || '',
  accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  bucket: process.env.R2_BUCKET || '',
  // 이미지가 서빙될 공개 도메인 (커스텀 도메인 권장). 예: https://img.pixelconnect.co.kr
  publicUrl: (process.env.R2_PUBLIC_URL || '').replace(/\/$/, ''),
};

const r2Enabled =
  !!R2.bucket && !!R2.accessKeyId && !!R2.secretAccessKey && !!R2.accountId && !!R2.publicUrl;

const EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

function r2Client() {
  return new AwsClient({
    accessKeyId: R2.accessKeyId,
    secretAccessKey: R2.secretAccessKey,
    service: 's3',
    region: 'auto',
  });
}

function r2ObjectUrl(key: string) {
  return `https://${R2.accountId}.r2.cloudflarestorage.com/${R2.bucket}/${key}`;
}

export const r2ImageStore: ImageStore = {
  async save(data, mimeType) {
    const ext = EXT[mimeType] || 'bin';
    const key = `columns/${randomUUID()}.${ext}`;
    const res = await r2Client().fetch(r2ObjectUrl(key), {
      method: 'PUT',
      body: new Uint8Array(data), // Buffer는 BodyInit 타입이 아니라 뷰로 변환
      headers: { 'content-type': mimeType },
    });
    if (!res.ok) {
      throw new Error(`R2 업로드 실패 (${res.status})`);
    }
    return { id: key, url: `${R2.publicUrl}/${key}` };
  },

  // R2 이미지는 공개 도메인에서 직접 서빙되므로 이 경로로 안 온다.
  async get() {
    return null;
  },

  async delete(id) {
    // id = object key
    await r2Client()
      .fetch(r2ObjectUrl(id), { method: 'DELETE' })
      .catch(() => {});
  },
};

// ---------- 선택 ----------

export const imageStore: ImageStore = r2Enabled ? r2ImageStore : dbImageStore;
