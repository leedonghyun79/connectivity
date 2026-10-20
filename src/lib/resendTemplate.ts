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

/** 관리자 문의 게시판 주소. 설정이 없으면 null → 메일에서 버튼을 뺀다. */
function inquiriesUrl(): string | null {
  const base = process.env.CONNECTIVITY_PUBLIC_URL || process.env.NEXTAUTH_URL;
  return base ? `${base.replace(/\/$/, '')}/inquiries` : null;
}

function adminButton(): string {
  const url = inquiriesUrl();
  if (!url) return '';
  return `<p style="margin:24px 0 0;text-align:center;"><a href="${esc(url)}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:8px;">관리자 페이지에서 확인하기 →</a></p>`;
}

/** 새 상담 문의 알림 메일 HTML */
export function inquiryEmailHtml(inq: InquiryNotice): string {
  return `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2 style="margin:0 0 16px;">새 상담 문의가 도착했어요</h2>
          <table style="width:100%;border-collapse:collapse;font-size:15px;">
            <tr><td style="padding:6px 0;color:#888;width:90px;">이름</td><td>${esc(inq.name)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">이메일</td><td>${esc(inq.email)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">연락처</td><td>${esc(inq.phone || '-')}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">서비스</td><td>${esc(inq.service || '미선택')}</td></tr>
          </table>
          <div style="background:#f9f9f9;padding:16px;border-radius:8px;margin-top:16px;white-space:pre-wrap;line-height:1.6;">${esc(inq.message)}</div>
          ${adminButton()}
          <p style="font-size:12px;color:#999;margin-top:24px;">이 메일에 답장하면 문의자에게 바로 전달돼요.</p>
        </div>
      `;
}
