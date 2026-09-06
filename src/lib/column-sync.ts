import 'server-only';

/**
 * 발행/발행취소/삭제 시 pixelconnect 공개 사이트로 칼럼을 동기화한다.
 * 공유 시크릿 헤더로 인증.
 */

const SYNC_URL = process.env.PIXELCONNECT_SYNC_URL?.replace(/\/$/, '');
const SECRET = process.env.COLUMN_SYNC_SECRET;

export interface ColumnSyncPayload {
  id: string;
  title: string;
  category: string;
  contentHtml: string;
  thumbnail: string | null;
  publishedAt: string; // ISO
}

function assertConfig() {
  if (!SYNC_URL || !SECRET) {
    throw new Error('동기화 환경변수(PIXELCONNECT_SYNC_URL, COLUMN_SYNC_SECRET)가 설정되지 않았습니다.');
  }
}

// 본문 HTML에서 첫 번째 이미지 src 추출 (대표 이미지 폴백용)
export function firstImageSrc(html: string): string | null {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

export async function pushColumn(payload: ColumnSyncPayload): Promise<void> {
  assertConfig();
  const res = await fetch(`${SYNC_URL}/api/columns/sync`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-sync-secret': SECRET! },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`pixelconnect 동기화 실패 (${res.status}) ${text}`.trim());
  }
}

export async function removeColumn(id: string): Promise<void> {
  assertConfig();
  const res = await fetch(`${SYNC_URL}/api/columns/sync/${id}`, {
    method: 'DELETE',
    headers: { 'x-sync-secret': SECRET! },
    cache: 'no-store',
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`pixelconnect 삭제 동기화 실패 (${res.status})`);
  }
}
