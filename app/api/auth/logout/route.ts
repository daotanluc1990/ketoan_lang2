import { NextResponse } from 'next/server';
import { getAuthCookieName } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ ok: true, message: 'Đã đăng xuất.' });
  for (const name of [getAuthCookieName(), 'ctl_role', 'ctl_actor']) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}
