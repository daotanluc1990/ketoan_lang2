import { NextRequest, NextResponse } from 'next/server';

type AppUser = { username: string; password: string; role?: string };

function isPublicAsset(pathname: string) {
  return Boolean(
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|map|txt)$/i)
  );
}

function unauthorized(message = 'Authentication required') {
  return new NextResponse(message, {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Com Tam Lang ERP"' }
  });
}

function safeCompare(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

function parseBasicAuth(header: string | null) {
  if (!header?.startsWith('Basic ')) return null;
  try {
    const decoded = atob(header.slice('Basic '.length));
    const separator = decoded.indexOf(':');
    if (separator < 0) return null;
    return { username: decoded.slice(0, separator), password: decoded.slice(separator + 1) };
  } catch {
    return null;
  }
}

function parseUsers(): AppUser[] {
  const rawUsers = process.env.APP_USERS_JSON;
  if (rawUsers) {
    try {
      const users = JSON.parse(rawUsers) as AppUser[];
      return users.filter((user) => user.username && user.password);
    } catch {
      return [];
    }
  }
  if (process.env.APP_USERNAME && process.env.APP_PASSWORD) {
    return [{ username: process.env.APP_USERNAME, password: process.env.APP_PASSWORD, role: process.env.APP_DEFAULT_ROLE ?? 'Kế toán' }];
  }
  return [];
}

function findUser(username: string, password: string) {
  return parseUsers().find((user) => safeCompare(user.username, username) && safeCompare(user.password, password));
}

export function middleware(request: NextRequest) {
  if (isPublicAsset(request.nextUrl.pathname)) return NextResponse.next();
  if (process.env.APP_BASIC_AUTH_ENABLED !== 'true') return NextResponse.next();

  const credentials = parseBasicAuth(request.headers.get('authorization'));
  if (!credentials) return unauthorized();
  const user = findUser(credentials.username, credentials.password);
  if (!user) {
    const configured = parseUsers().length;
    return configured ? unauthorized('Invalid credentials') : new NextResponse('Basic Auth is enabled but APP_USERS_JSON or APP_USERNAME/APP_PASSWORD are missing.', { status: 503 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-ctl-auth-actor', user.username);
  requestHeaders.set('x-ctl-auth-role', user.role ?? process.env.APP_DEFAULT_ROLE ?? 'Kế toán');
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
