import { NextRequest, NextResponse } from 'next/server';

function isPublicAsset(pathname: string) {
  return pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.startsWith('/robots') || pathname.startsWith('/sitemap') || pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js|map|txt)$/i);
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

export function middleware(request: NextRequest) {
  if (isPublicAsset(request.nextUrl.pathname)) return NextResponse.next();
  if (process.env.APP_BASIC_AUTH_ENABLED !== 'true') return NextResponse.next();

  const expectedUsername = process.env.APP_USERNAME;
  const expectedPassword = process.env.APP_PASSWORD;
  if (!expectedUsername || !expectedPassword) {
    return new NextResponse('Basic Auth is enabled but APP_USERNAME/APP_PASSWORD are missing.', { status: 503 });
  }

  const credentials = parseBasicAuth(request.headers.get('authorization'));
  if (!credentials) return unauthorized();
  if (!safeCompare(credentials.username, expectedUsername) || !safeCompare(credentials.password, expectedPassword)) return unauthorized('Invalid credentials');

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
