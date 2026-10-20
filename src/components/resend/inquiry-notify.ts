import { Resend } from 'resend';
import { inquiryEmailHtml, type InquiryNotice } from '@/lib/resendTemplate';

export type { InquiryNotice };

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
      html: inquiryEmailHtml(inq),
    });
    if (error) console.error('[inquiry-notify] Resend 오류', error);
  } catch (err) {
    console.error('[inquiry-notify] 발송 실패', err);
  }
}
