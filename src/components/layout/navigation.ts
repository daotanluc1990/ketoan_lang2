import { BarChart3, Bot, BriefcaseBusiness, ClipboardList, DollarSign, FileInput, Home, Scale, ShieldAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Permission } from '@/lib/rbac/rbac';
import type { Role } from '@/lib/report-types';

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: 'CEO' | 'Báo cáo quản trị' | 'Kế toán' | 'Hệ thống';
  permission: Permission;
  allowedRoles: Role[];
};

export const navigationItems: NavigationItem[] = [
  { href: '/tong-quan', label: 'CEO Dashboard', icon: Home, group: 'CEO', permission: 'view_dashboard', allowedRoles: ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'] },
  { href: '/pl-tuan', label: 'P&L Tuần', icon: BarChart3, group: 'Báo cáo quản trị', permission: 'view_pnl', allowedRoles: ['CEO', 'Kế toán', 'Admin'] },
  { href: '/dong-tien', label: 'Dòng tiền Tuần', icon: DollarSign, group: 'Báo cáo quản trị', permission: 'view_cashflow', allowedRoles: ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'] },
  { href: '/can-doi', label: 'Cân đối rút gọn', icon: Scale, group: 'Báo cáo quản trị', permission: 'view_balance', allowedRoles: ['CEO', 'Kế toán', 'Admin'] },
  { href: '/du-toan', label: 'Dự toán tuần tới', icon: ClipboardList, group: 'Báo cáo quản trị', permission: 'view_forecast', allowedRoles: ['CEO', 'Kế toán', 'Admin'] },
  { href: '/that-thoat-chi-tiet', label: 'Báo cáo thất thoát chi tiết', icon: ShieldAlert, group: 'Báo cáo quản trị', permission: 'view_loss', allowedRoles: ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'] },
  { href: '/ban-lam-viec-ke-toan', label: 'Bàn làm việc kế toán', icon: BriefcaseBusiness, group: 'Kế toán', permission: 'view_workbench', allowedRoles: ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'] },
  { href: '/import-nhap-lieu', label: 'Nhập liệu & Import', icon: FileInput, group: 'Kế toán', permission: 'view_import', allowedRoles: ['CEO', 'Kế toán', 'Admin'] },
  { href: '/cai-dat-bot', label: 'Cài đặt & Bot báo cáo', icon: Bot, group: 'Hệ thống', permission: 'view_settings', allowedRoles: ['CEO', 'Admin'] }
];

export const navigationGroups = ['CEO', 'Báo cáo quản trị', 'Kế toán', 'Hệ thống'] as const;
