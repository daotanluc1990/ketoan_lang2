import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env/server-env';
import type { Role } from '@/lib/report-types';
import type { DashboardReport } from '@/lib/reports/report-aggregator';

export type AppRole = Role;
export type Permission =
  | 'view_dashboard'
  | 'view_cashflow'
  | 'view_pnl'
  | 'view_balance'
  | 'view_loss'
  | 'view_import'
  | 'import_preview'
  | 'import_confirm'
  | 'rollback_preview'
  | 'rollback_confirm'
  | 'view_settings'
  | 'manage_settings'
  | 'send_bot'
  | 'view_agents'
  | 'view_workbench'
  | 'resolve_conflict'
  | 'view_data_control'
  | 'view_forecast'
  | 'view_inventory'
  | 'view_btt_inventory'
  | 'view_transfer'
  | 'view_waste'
  | 'view_standard_loss'
  | 'view_stock_loss'
  | 'view_master_data'
  | 'view_debt'
  | 'view_close_history';

export const ROLES: AppRole[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

const ROLE_ALIASES: Record<string, AppRole> = {
  ceo: 'CEO',
  owner: 'CEO',
  chu: 'CEO',
  'chủ': 'CEO',
  'ke-toan': 'Kế toán',
  ketoan: 'Kế toán',
  accountant: 'Kế toán',
  accounting: 'Kế toán',
  'kế toán': 'Kế toán',
  admin: 'Admin',
  administrator: 'Admin',
  'quan-ly-cua-hang': 'Quản lý cửa hàng',
  'quanlycuahang': 'Quản lý cửa hàng',
  'quản lý cửa hàng': 'Quản lý cửa hàng',
  manager: 'Quản lý cửa hàng',
  'store-manager': 'Quản lý cửa hàng',
  store_manager: 'Quản lý cửa hàng'
};

const FULL_FINANCE_ROLES: AppRole[] = ['CEO', 'Kế toán', 'Admin'];
const OPERATION_ROLES: AppRole[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export const PERMISSION_MATRIX: Record<Permission, AppRole[]> = {
  view_dashboard: OPERATION_ROLES,
  view_cashflow: OPERATION_ROLES,
  view_pnl: FULL_FINANCE_ROLES,
  view_balance: FULL_FINANCE_ROLES,
  view_loss: OPERATION_ROLES,
  view_import: FULL_FINANCE_ROLES,
  import_preview: FULL_FINANCE_ROLES,
  import_confirm: FULL_FINANCE_ROLES,
  rollback_preview: FULL_FINANCE_ROLES,
  rollback_confirm: ['CEO', 'Admin'],
  view_settings: ['CEO', 'Admin'],
  manage_settings: ['CEO', 'Admin'],
  send_bot: ['CEO', 'Admin'],
  view_agents: FULL_FINANCE_ROLES,
  view_workbench: OPERATION_ROLES,
  resolve_conflict: FULL_FINANCE_ROLES,
  view_data_control: FULL_FINANCE_ROLES,
  view_forecast: FULL_FINANCE_ROLES,
  view_inventory: OPERATION_ROLES,
  view_btt_inventory: OPERATION_ROLES,
  view_transfer: OPERATION_ROLES,
  view_waste: OPERATION_ROLES,
  view_standard_loss: OPERATION_ROLES,
  view_stock_loss: OPERATION_ROLES,
  view_master_data: FULL_FINANCE_ROLES,
  view_debt: FULL_FINANCE_ROLES,
  view_close_history: FULL_FINANCE_ROLES
};

export type RbacContext = {
  role: AppRole | null;
  actor: string;
  rbacEnabled: boolean;
  source: 'header' | 'query' | 'cookie' | 'default' | 'disabled' | 'missing';
};

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-');
}

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (ROLES.includes(trimmed as AppRole)) return trimmed as AppRole;
  const key = normalizeKey(trimmed);
  return ROLE_ALIASES[key] ?? null;
}

export function canRole(role: AppRole | null | undefined, permission: Permission) {
  if (!role) return false;
  return PERMISSION_MATRIX[permission].includes(role);
}

export function getRolePermissionLabels(role: AppRole) {
  return Object.entries(PERMISSION_MATRIX)
    .filter(([, roles]) => roles.includes(role))
    .map(([permission]) => permission);
}

export function getRoleFromRequest(request: NextRequest): RbacContext {
  const env = getServerEnv();
  const url = new URL(request.url);
  const headerRole = normalizeRole(request.headers.get('x-ctl-role') ?? request.headers.get('x-user-role'));
  if (headerRole) return { role: headerRole, actor: request.headers.get('x-ctl-actor') ?? headerRole, rbacEnabled: env.rbacEnabled, source: 'header' };

  const queryRole = normalizeRole(url.searchParams.get('role'));
  if (queryRole) return { role: queryRole, actor: url.searchParams.get('actor') ?? queryRole, rbacEnabled: env.rbacEnabled, source: 'query' };

  const cookieRole = normalizeRole(request.cookies.get('ctl_role')?.value);
  if (cookieRole) return { role: cookieRole, actor: request.cookies.get('ctl_actor')?.value ?? cookieRole, rbacEnabled: env.rbacEnabled, source: 'cookie' };

  const defaultRole = normalizeRole(env.appDefaultRole);
  if (!env.rbacEnabled) {
    const softRole = defaultRole ?? 'Kế toán';
    return { role: softRole, actor: softRole, rbacEnabled: env.rbacEnabled, source: defaultRole ? 'disabled' : 'default' };
  }
  if (defaultRole) return { role: defaultRole, actor: defaultRole, rbacEnabled: env.rbacEnabled, source: 'default' };
  return { role: null, actor: 'unknown', rbacEnabled: env.rbacEnabled, source: 'missing' };
}

export async function getRoleFromServerCookies(): Promise<RbacContext> {
  const env = getServerEnv();
  const cookieStore = await cookies();
  const cookieRole = normalizeRole(cookieStore.get('ctl_role')?.value);
  const defaultRole = normalizeRole(env.appDefaultRole);
  const role = cookieRole ?? defaultRole ?? (!env.rbacEnabled ? 'Kế toán' : null);
  return {
    role,
    actor: cookieStore.get('ctl_actor')?.value ?? role ?? 'unknown',
    rbacEnabled: env.rbacEnabled,
    source: cookieRole ? 'cookie' : defaultRole ? 'default' : env.rbacEnabled ? 'missing' : 'disabled'
  };
}

export function forbiddenResponse(message: string, context?: Partial<RbacContext>) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'FORBIDDEN',
        message,
        details: context?.role ? `Vai trò hiện tại: ${context.role}` : 'Chưa xác định vai trò'
      }
    },
    { status: 403 }
  );
}

export function unauthorizedResponse(message = 'Chưa xác thực vai trò người dùng.') {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    },
    { status: 401 }
  );
}

export function requireApiPermission(request: NextRequest, permission: Permission): { ok: true; context: RbacContext } | { ok: false; response: NextResponse } {
  const context = getRoleFromRequest(request);
  if (context.rbacEnabled && !context.role) return { ok: false, response: unauthorizedResponse() };
  if (!canRole(context.role, permission)) {
    return { ok: false, response: forbiddenResponse('Bạn không có quyền thực hiện thao tác này.', context) };
  }
  return { ok: true, context };
}

export function appendRbacMeta<T extends Record<string, unknown>>(payload: T, context: RbacContext) {
  return {
    ...payload,
    rbac: {
      enabled: context.rbacEnabled,
      role: context.role,
      actor: context.actor,
      source: context.source
    }
  };
}

export function maskDashboardReportForRole(report: DashboardReport, role: AppRole | null): DashboardReport {
  if (canRole(role, 'view_pnl')) return report;
  return {
    ...report,
    executiveKpis: report.executiveKpis.filter((item) => !['Tổng doanh thu', 'Doanh thu cửa hàng', 'Doanh thu app net', 'Thất thoát quy tiền'].includes(item.label)),
    pnlRows: [['Phân quyền', 'P&L Tuần', 'Không có quyền xem', '—', '—', '—', 'Vai trò hiện tại không được xem lợi nhuận/P&L']],
    balanceRows: [['Phân quyền', 'Cân đối rút gọn', 'Không có quyền xem', '—', '—', 'Không có quyền', 'Vai trò hiện tại không được xem cân đối tài chính']],
    totals: {
      ...report.totals,
      revenue: 0,
      storeSales: 0,
      appNet: 0,
      appGross: 0,
      appFees: 0,
      appCogs: 0,
      lossValue: 0,
      cogsPercent: 0,
      appFeePercent: 0
    }
  };
}

export const PAGE_PERMISSIONS: Record<string, Permission> = {
  '/tong-quan': 'view_dashboard',
  '/pl-tuan': 'view_pnl',
  '/dong-tien': 'view_cashflow',
  '/chi-phi-dong-tien': 'view_cashflow',
  '/can-doi': 'view_balance',
  '/du-toan': 'view_forecast',
  '/that-thoat': 'view_loss',
  '/that-thoat-chi-tiet': 'view_stock_loss',
  '/ban-lam-viec-ke-toan': 'view_workbench',
  '/import-nhap-lieu': 'view_import',
  '/kiem-soat-du-lieu': 'view_data_control',
  '/kho-cua-hang': 'view_inventory',
  '/kho-bep-trung-tam': 'view_btt_inventory',
  '/doi-chieu-btt-cua-hang': 'view_transfer',
  '/hang-huy': 'view_waste',
  '/hao-hut-vuot-dinh-muc': 'view_standard_loss',
  '/that-thoat-ton-kho': 'view_stock_loss',
  '/dinh-muc-mon-ban': 'view_master_data',
  '/cong-no': 'view_debt',
  '/cai-dat-bot': 'view_settings',
  '/lich-su-chot-bao-cao': 'view_close_history'
};
