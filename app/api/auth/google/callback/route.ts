import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function safeNextPath(value?: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/tong-quan-ke-toan';
}

export function GET(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', safeNextPath(request.cookies.get('ctl_google_oauth_next')?.value));
  loginUrl.searchParams.set('error', 'Đăng nhập Google Workspace đã tắt. Dùng tài khoản nội bộ.');
  const response = NextResponse.redirect(loginUrl);
  for (const name of ['ctl_google_oauth_state', 'ctl_google_oauth_next']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}
