import { NextResponse, type NextRequest } from 'next/server';
import { getAuthCookieName, verifyAuthSessionCookie } from '@/lib/auth/session';

const PUBLIC_FILE = /\.(.*)$/;

function isPublicPath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/api/auth/check' ||
    pathname === '/api/auth/logout' ||
    pathname.startsWith('/api/auth/google/') ||
    pathname === '/api/health' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    PUBLIC_FILE.test(pathname)
  );
}

function isApiPath(pathname: string) {
  return pathname.startsWith('/api/');
}

function roleHeaderValue(role: string) {
  if (role === 'Kế toán') return 'ketoan';
  if (role === 'Quản lý cửa hàng') return 'quan-ly-cua-hang';
  return role.toLowerCase();
}

export async function proxy(request: NextRequest) {
  const authEnabled = process.env.APP_BASIC_AUTH_ENABLED === 'true';
  if (!authEnabled) return NextResponse.next();

  const pathname = request.nextUrl.pathname;
  const session = await verifyAuthSessionCookie(request.cookies.get(getAuthCookieName())?.value);

  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/tong-quan-ke-toan', request.url));
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  if (!session) {
    if (isApiPath(pathname)) {
      return NextResponse.json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập để tiếp tục.' } }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  const headers = new Headers(request.headers);
  headers.set('x-ctl-auth-role', roleHeaderValue(session.role));
  headers.set('x-ctl-auth-actor', encodeURIComponent(session.actor));
  if (session.username) headers.set('x-ctl-auth-username', encodeURIComponent(session.username));
  if (session.email) headers.set('x-ctl-auth-email', encodeURIComponent(session.email));
  if (session.provider) headers.set('x-ctl-auth-provider', session.provider);
  if (session.branchScope?.length) headers.set('x-ctl-auth-branch-scope', encodeURIComponent(session.branchScope.join(',')));
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
