import { NextResponse } from 'next/server';
import { getAuthCookieName } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ ok: true, message: 'Đã đăng xuất.' });
  for (const name of [getAuthCookieName(), 'ctl_role', 'ctl_actor', 'ctl_google_oauth_state', 'ctl_google_oauth_next']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}
