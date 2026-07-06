import { NextRequest, NextResponse } from 'next/server';
import { createAuthSessionCookie, getAuthCookieName, getSessionMaxAgeSeconds } from '@/lib/auth/session';
import { validateAppUserLogin } from '@/lib/auth/app-users';
import { getServerEnv } from '@/lib/env/server-env';
import { normalizeRole } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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
  const username = String(body?.username ?? '').trim();
  const password = String(body?.password ?? '');
  const otp = String(body?.otp ?? '');
  const userLogin = username && password ? await validateAppUserLogin(username, password, otp) : { ok: false as const, reason: 'not_found' as const };
  const envOk = username === env.appUsername && password === env.appPassword;
  const ok = userLogin.ok || envOk;
  const loginRole = userLogin.ok ? userLogin.user.role : requestedRole;
  const loginActor = userLogin.ok ? userLogin.user.displayName || userLogin.user.username : actor;
  const requiresTwoFactor = !userLogin.ok && (userLogin.reason === 'otp_required' || userLogin.reason === 'bad_otp' || userLogin.reason === 'otp_setup_required');
  const response = NextResponse.json({
    ok,
    mode: userLogin.ok ? 'app_user' : 'basic_auth',
    role: ok ? loginRole : null,
    requiresTwoFactor,
    message: ok
      ? 'Đăng nhập thành công.'
      : userLogin.reason === 'locked'
        ? 'Tài khoản đang bị khóa.'
        : userLogin.reason === 'disabled'
          ? 'Tài khoản đã tắt.'
          : userLogin.reason === 'otp_required'
            ? 'Nhập mã xác thực 2FA để tiếp tục.'
            : userLogin.reason === 'bad_otp'
              ? 'Mã xác thực 2FA không đúng hoặc đã hết hạn.'
              : userLogin.reason === 'otp_setup_required'
                ? 'Tài khoản đã bật 2FA nhưng chưa có secret. Admin cần tắt/bật lại 2FA để cấp mã mới.'
                : 'Sai tài khoản hoặc mật khẩu.'
  }, { status: ok ? 200 : 401 });
  if (ok) {
    const maxAge = getSessionMaxAgeSeconds();
    response.cookies.set(getAuthCookieName(), await createAuthSessionCookie({
      role: loginRole,
      actor: loginActor,
      username: userLogin.ok ? userLogin.user.username : username,
      email: userLogin.ok ? userLogin.user.email || userLogin.user.googleWorkspaceEmail : undefined,
      branchScope: userLogin.ok ? userLogin.user.branchScope : undefined,
      provider: userLogin.ok ? 'password' : 'rescue'
    }), { path: '/', httpOnly: true, sameSite: 'lax', secure: secureCookie, maxAge });
    response.cookies.set('ctl_role', loginRole, { path: '/', sameSite: 'lax', secure: secureCookie, maxAge });
    response.cookies.set('ctl_actor', loginActor, { path: '/', sameSite: 'lax', secure: secureCookie, maxAge });
  }
  return response;
}
