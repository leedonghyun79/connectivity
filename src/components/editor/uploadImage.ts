// 에디터에서 고른 이미지를 connectivity 이미지 API로 업로드하고 URL을 돌려준다.
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch('/api/images', { method: 'POST', body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || '이미지 업로드에 실패했습니다.');
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}
