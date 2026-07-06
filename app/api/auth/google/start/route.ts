import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    ok: false,
    error: {
      code: 'GOOGLE_OAUTH_DISABLED',
      message: 'Đăng nhập Google Workspace đã tắt. Dùng tài khoản nội bộ trong tab Người dùng phân quyền.'
    }
  }, { status: 410 });
}
