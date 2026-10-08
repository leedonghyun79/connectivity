import { Resend } from 'resend';

export interface InquiryNotice {
  name: string;
  email: string;
  phone?: string;
  service?: string | null;
  message: string;
}

const ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c]);
}

/**
 * 새 문의가 들어오면 관리자에게 알림 메일을 보낸다.
 * 실패해도 문의 저장은 이미 끝났으니 절대 throw 하지 않는다.
 */
export async function notifyInquiry(inq: InquiryNotice): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_EMAIL;
  if (!apiKey || !to) {
    console.warn('[inquiry-notify] RESEND_API_KEY / INQUIRY_NOTIFY_EMAIL 미설정 → 메일 생략');
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.INQUIRY_FROM_EMAIL || 'PixelConnect <onboarding@resend.dev>',
      to: [to],
      replyTo: inq.email,
      subject: `[상담문의] ${inq.name}님 - ${inq.service ?? '서비스 미선택'}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2 style="margin:0 0 16px;">새 상담 문의가 도착했어요</h2>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr><td style="padding:6px 0;color:#888;width:90px;">이름</td><td>${esc(inq.name)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">이메일</td><td>${esc(inq.email)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">연락처</td><td>${esc(inq.phone || '-')}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">서비스</td><td>${esc(inq.service || '미선택')}</td></tr>
          </table>
          <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-top:16px;white-space:pre-wrap;line-height:1.6;">${esc(inq.message)}</div>
          <p style="font-size:12px;color:#999;margin-top:24px;">이 메일에 답장하면 문의자에게 바로 전달돼요.</p>
        </div>
      `,
    });
    if (error) console.error('[inquiry-notify] Resend 오류', error);
  } catch (err) {
    console.error('[inquiry-notify] 발송 실패', err);
  }
}
