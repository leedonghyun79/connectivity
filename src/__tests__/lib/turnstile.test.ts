import { verifyTurnstile } from '@/lib/turnstile';

describe('verifyTurnstile', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    global.fetch = jest.fn();
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('secret 미설정이면 fetch 없이 false', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const ok = await verifyTurnstile('tok');
    expect(ok).toBe(false);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('siteverify success:true 면 true', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: true }),
    });
    const ok = await verifyTurnstile('tok', '1.2.3.4');
    expect(ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('siteverify success:false 면 false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    expect(await verifyTurnstile('tok')).toBe(false);
  });

  it('fetch 예외 시 false', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret';
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));
    expect(await verifyTurnstile('tok')).toBe(false);
  });
});
