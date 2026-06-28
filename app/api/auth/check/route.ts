import { NextRequest, NextResponse } from 'next/server';
import { createAuthSessionCookie, getAuthCookieName, getSessionMaxAgeSeconds } from '@/lib/auth/session';
import { getServerEnv } from '@/lib/env/server-env';
import { normalizeRole } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const body = await request.json().catch(() => null);
  const requestedRole = normalizeRole(body?.role) ?? normalizeRole(env.appDefaultRole) ?? 'Kế toán';
  const actor = String(body?.actor ?? requestedRole);
  const secureCookie = request.nextUrl.protocol === 'https:';
  if (!env.basicAuthEnabled) {
    const response = NextResponse.json({ ok: true, mode: 'disabled', role: requestedRole, message: 'Basic Auth tạm đang tắt. Đã ghi role cookie phục vụ UAT RBAC.' });
    response.cookies.set('ctl_role', requestedRole, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
    response.cookies.set('ctl_actor', actor, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 });
    return response;
  }
  const ok = body?.username === env.appUsername && body?.password === env.appPassword;
  const response = NextResponse.json({ ok, mode: 'basic_auth', role: ok ? requestedRole : null, message: ok ? 'Đăng nhập tạm thành công.' : 'Sai tài khoản hoặc mật khẩu.' }, { status: ok ? 200 : 401 });
  if (ok) {
    const maxAge = getSessionMaxAgeSeconds();
    response.cookies.set(getAuthCookieName(), await createAuthSessionCookie({ role: requestedRole, actor }), { path: '/', httpOnly: true, sameSite: 'lax', secure: secureCookie, maxAge });
    response.cookies.set('ctl_role', requestedRole, { path: '/', sameSite: 'lax', secure: secureCookie, maxAge });
    response.cookies.set('ctl_actor', actor, { path: '/', sameSite: 'lax', secure: secureCookie, maxAge });
  }
  return response;
}
