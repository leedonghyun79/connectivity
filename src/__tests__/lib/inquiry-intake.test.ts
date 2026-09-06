import { processInquiry, serviceLabel } from '@/lib/inquiry-intake';
import prisma from '@/lib/prisma';
import { verifyTurnstile } from '@/lib/turnstile';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: { inquiry: { create: jest.fn() } },
}));
jest.mock('@/lib/turnstile', () => ({
  __esModule: true,
  verifyTurnstile: jest.fn(),
}));

const create = prisma.inquiry.create as jest.Mock;
const verify = verifyTurnstile as jest.Mock;

const base = {
  name: '홍길동',
  email: 'hong@example.com',
  phone: '010-1234-5678',
  service: 'web',
  message: '홈페이지 제작 문의합니다.',
  turnstileToken: 'tok',
};

beforeEach(() => {
  jest.clearAllMocks();
  verify.mockResolvedValue(true);
  create.mockResolvedValue({ id: 'inq_1' });
});

describe('serviceLabel', () => {
  it('알려진 값 → 한글 라벨', () => {
    expect(serviceLabel('web')).toBe('웹사이트 제작');
    expect(serviceLabel('maintain')).toBe('유지보수·운영');
  });
  it('빈 값/미지의 값 → null', () => {
    expect(serviceLabel(undefined)).toBeNull();
    expect(serviceLabel('')).toBeNull();
    expect(serviceLabel('xxx')).toBeNull();
  });
});

describe('processInquiry', () => {
  it('허니팟(company 채워짐) → 200 ok, DB 저장 안 함', async () => {
    const r = await processInquiry({ ...base, company: 'bot' }, {});
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ ok: true });
    expect(create).not.toHaveBeenCalled();
  });

  it('이름 없음 → 400', async () => {
    const r = await processInquiry({ ...base, name: '  ' }, {});
    expect(r.status).toBe(400);
    expect(create).not.toHaveBeenCalled();
  });

  it('이메일 형식 오류 → 400', async () => {
    const r = await processInquiry({ ...base, email: 'not-an-email' }, {});
    expect(r.status).toBe(400);
  });

  it('메시지 없음 → 400', async () => {
    const r = await processInquiry({ ...base, message: '' }, {});
    expect(r.status).toBe(400);
  });

  it('turnstileToken 없음 → 403, DB 저장 안 함', async () => {
    const r = await processInquiry({ ...base, turnstileToken: '' }, {});
    expect(r.status).toBe(403);
    expect(create).not.toHaveBeenCalled();
    expect(verify).not.toHaveBeenCalled();
  });

  it('verifyTurnstile false → 403', async () => {
    verify.mockResolvedValue(false);
    const r = await processInquiry(base, { remoteip: '1.2.3.4' });
    expect(r.status).toBe(403);
    expect(verify).toHaveBeenCalledWith('tok', '1.2.3.4');
    expect(create).not.toHaveBeenCalled();
  });

  it('정상 → 200, 매핑된 값으로 create 1회', async () => {
    const r = await processInquiry(base, {});
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ ok: true });
    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        title: '[상담문의] 홍길동님 - 웹사이트 제작',
        content: '홈페이지 제작 문의합니다.',
        authorName: '홍길동',
        authorEmail: 'hong@example.com',
        authorPhone: '010-1234-5678',
        type: '웹사이트 제작',
        status: 'pending',
      },
    });
  });

  it('service 미선택 → type null, 제목에 "서비스 미선택"', async () => {
    await processInquiry({ ...base, service: undefined }, {});
    const arg = create.mock.calls[0][0].data;
    expect(arg.type).toBeNull();
    expect(arg.title).toBe('[상담문의] 홍길동님 - 서비스 미선택');
  });

  it('phone 빈 값 → authorPhone null', async () => {
    await processInquiry({ ...base, phone: '' }, {});
    expect(create.mock.calls[0][0].data.authorPhone).toBeNull();
  });

  it('prisma.create 예외 → 500', async () => {
    create.mockRejectedValue(new Error('db down'));
    const r = await processInquiry(base, {});
    expect(r.status).toBe(500);
    expect(r.body).toMatchObject({ ok: false });
  });
});
