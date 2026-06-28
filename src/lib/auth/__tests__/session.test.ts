import { describe, expect, it, vi } from 'vitest';
import { createAuthSessionCookie, verifyAuthSessionCookie } from '../session';

describe('auth session cookie', () => {
  it('verifies a signed session cookie', async () => {
    vi.stubEnv('APP_PASSWORD', 'test-secret');
    vi.stubEnv('APP_SESSION_MAX_AGE_HOURS', '1');
    const cookie = await createAuthSessionCookie({ role: 'Kế toán', actor: 'Ke toan UAT' }, 1_000);
    const session = await verifyAuthSessionCookie(cookie, 2_000);

    expect(session?.role).toBe('Kế toán');
    expect(session?.actor).toBe('Ke toan UAT');
  });

  it('rejects tampered and expired cookies', async () => {
    vi.stubEnv('APP_PASSWORD', 'test-secret');
    vi.stubEnv('APP_SESSION_MAX_AGE_HOURS', '1');
    const cookie = await createAuthSessionCookie({ role: 'CEO' }, 1_000);

    await expect(verifyAuthSessionCookie(cookie.replace(/.$/, '0'), 2_000)).resolves.toBeNull();
    await expect(verifyAuthSessionCookie(cookie, 3_602_000)).resolves.toBeNull();
  });
});
