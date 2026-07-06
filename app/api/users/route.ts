import { NextRequest, NextResponse } from 'next/server';
import { listAppUsers, upsertAppUser, type AppUserStatus } from '@/lib/auth/app-users';
import { appendRbacMeta, normalizeRole, requireApiPermission } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function normalizeStatus(value: unknown): AppUserStatus {
  if (value === 'locked' || value === 'disabled') return value;
  return 'active';
}

function parseBranchScope(value: unknown) {
  if (Array.isArray(value)) return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  return String(value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const rbac = requireApiPermission(request, 'view_settings');
  if (!rbac.ok) return rbac.response;
  const users = await listAppUsers();
  return NextResponse.json(appendRbacMeta({ ok: true, data: users }, rbac.context));
}

export async function POST(request: NextRequest) {
  const rbac = requireApiPermission(request, 'manage_settings');
  if (!rbac.ok) return rbac.response;

  const body = await request.json().catch(() => null);
  const username = String(body?.username ?? '').trim();
  const displayName = String(body?.displayName ?? '').trim();
  const password = String(body?.password ?? '');
  const email = String(body?.email ?? '').trim();
  const branchScope = parseBranchScope(body?.branchScope);
  const note = String(body?.note ?? '').trim();
  const role = normalizeRole(body?.role);

  if (!username) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Thiếu tên đăng nhập.' } }, { status: 400 });
  if (!role) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Vai trò không hợp lệ.' } }, { status: 400 });
  if (password && password.length < 8) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Mật khẩu mới tối thiểu 8 ký tự.' } }, { status: 400 });
  if (role === 'Quản lý cửa hàng' && branchScope.length === 0) return NextResponse.json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Quản lý cửa hàng cần ít nhất một chi nhánh/cửa hàng phụ trách.' } }, { status: 400 });

  try {
    const result = await upsertAppUser({
      username,
      displayName: displayName || username,
      email,
      role,
      branchScope,
      status: normalizeStatus(body?.status),
      password: password || undefined,
      twoFactorEnabled: Boolean(body?.twoFactorEnabled),
      mustChangePassword: Boolean(body?.mustChangePassword),
      actor: rbac.context.actor,
      note
    });
    return NextResponse.json(appendRbacMeta({ ok: true, data: result.user, twoFactorSetup: result.twoFactorSetup }, rbac.context));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không lưu được tài khoản.';
    return NextResponse.json({ ok: false, error: { code: 'USER_SAVE_FAILED', message } }, { status: 400 });
  }
}
