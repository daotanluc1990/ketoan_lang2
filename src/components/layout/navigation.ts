import { AlertTriangle, Archive, BarChart3, BookOpen, ClipboardCheck, ClipboardList, Database, DollarSign, FileInput, FileText, Home, Scale, Settings, Store, Truck, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Permission } from '@/lib/rbac/rbac';
import type { Role } from '@/lib/report-types';

export type NavigationGroup =
  | 'TỔNG QUAN KẾ TOÁN'
  | 'NHIỆM VỤ KẾ TOÁN'
  | 'NHẬP LIỆU & DỮ LIỆU'
  | 'DOANH THU'
  | 'KHO CỬA HÀNG'
  | 'KHO BẾP TRUNG TÂM'
  | 'TÀI CHÍNH'
  | 'LƯƠNG & NHÂN SỰ'
  | 'BÁO CÁO QUẢN TRỊ'
  | 'TÀI LIỆU'
  | 'HỆ THỐNG';

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: NavigationGroup;
  permission: Permission;
  allowedRoles: Role[];
};

const FULL_FINANCE_ROLES: Role[] = ['CEO', 'Kế toán', 'Admin'];
const OPERATION_ROLES: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export const navigationItems: NavigationItem[] = [
  { href: '/tong-quan-ke-toan', label: 'Tổng quan kế toán', icon: Home, group: 'TỔNG QUAN KẾ TOÁN', permission: 'view_dashboard', allowedRoles: OPERATION_ROLES },
  { href: '/tong-quan/ceo-cfo', label: 'CEO', icon: BarChart3, group: 'TỔNG QUAN KẾ TOÁN', permission: 'view_executive_dashboard', allowedRoles: ['CEO', 'Admin'] },

  { href: '/nhiem-vu-ke-toan', label: 'Nhiệm vụ kế toán', icon: ClipboardCheck, group: 'NHIỆM VỤ KẾ TOÁN', permission: 'view_tasks', allowedRoles: OPERATION_ROLES },

  { href: '/nhap-lieu/upload', label: 'Upload dữ liệu', icon: FileInput, group: 'NHẬP LIỆU & DỮ LIỆU', permission: 'view_import', allowedRoles: FULL_FINANCE_ROLES },
  { href: '/nhap-lieu/lich-su-import', label: 'Lịch sử import', icon: Database, group: 'NHẬP LIỆU & DỮ LIỆU', permission: 'view_import', allowedRoles: FULL_FINANCE_ROLES },
  { href: '/nhap-lieu/du-lieu-loi-thieu', label: 'Dữ liệu lỗi / thiếu', icon: AlertTriangle, group: 'NHẬP LIỆU & DỮ LIỆU', permission: 'view_data_control', allowedRoles: FULL_FINANCE_ROLES },

  { href: '/doanh-thu/tien-mat', label: 'Tiền mặt', icon: DollarSign, group: 'DOANH THU', permission: 'view_revenue', allowedRoles: OPERATION_ROLES },
  { href: '/doanh-thu/chuyen-khoan', label: 'Chuyển khoản', icon: DollarSign, group: 'DOANH THU', permission: 'view_revenue', allowedRoles: OPERATION_ROLES },
  { href: '/doanh-thu/app-giao-hang', label: 'App giao hàng', icon: Truck, group: 'DOANH THU', permission: 'view_revenue', allowedRoles: OPERATION_ROLES },

  { href: '/kho-cua-hang/ton-kho', label: 'Tồn kho', icon: Store, group: 'KHO CỬA HÀNG', permission: 'view_inventory', allowedRoles: OPERATION_ROLES },
  { href: '/kho-cua-hang/hang-huy-hu', label: 'Hàng hủy / hư', icon: AlertTriangle, group: 'KHO CỬA HÀNG', permission: 'view_waste', allowedRoles: OPERATION_ROLES },
  { href: '/kho-cua-hang/cong-thuc-dinh-muc', label: 'Công thức / định mức', icon: ClipboardList, group: 'KHO CỬA HÀNG', permission: 'view_master_data', allowedRoles: FULL_FINANCE_ROLES },

  { href: '/kho-bep-trung-tam/nhap-ncc', label: 'Nhập NCC', icon: Truck, group: 'KHO BẾP TRUNG TÂM', permission: 'view_btt_inventory', allowedRoles: OPERATION_ROLES },
  { href: '/kho-bep-trung-tam/san-xuat-cong-thuc', label: 'Sản xuất / công thức', icon: Archive, group: 'KHO BẾP TRUNG TÂM', permission: 'view_btt_inventory', allowedRoles: OPERATION_ROLES },
  { href: '/kho-bep-trung-tam/ton-kho-hao-hut', label: 'Tồn kho & hao hụt', icon: Archive, group: 'KHO BẾP TRUNG TÂM', permission: 'view_btt_inventory', allowedRoles: OPERATION_ROLES },

  { href: '/tai-chinh/tong-quan', label: 'Tổng quan', icon: DollarSign, group: 'TÀI CHÍNH', permission: 'view_cashflow', allowedRoles: FULL_FINANCE_ROLES },
  { href: '/tai-chinh/dong-tien', label: 'Dòng tiền', icon: DollarSign, group: 'TÀI CHÍNH', permission: 'view_cashflow', allowedRoles: OPERATION_ROLES },
  { href: '/tai-chinh/can-doi', label: 'Cân đối', icon: Scale, group: 'TÀI CHÍNH', permission: 'view_balance', allowedRoles: FULL_FINANCE_ROLES },
  { href: '/tai-chinh/du-toan', label: 'Dự toán', icon: ClipboardList, group: 'TÀI CHÍNH', permission: 'view_forecast', allowedRoles: FULL_FINANCE_ROLES },

  { href: '/luong-nhan-su/cham-cong', label: 'Chấm công', icon: Users, group: 'LƯƠNG & NHÂN SỰ', permission: 'view_payroll', allowedRoles: FULL_FINANCE_ROLES },
  { href: '/luong-nhan-su/tam-ung-thuong-phat', label: 'Tạm ứng / thưởng phạt', icon: Users, group: 'LƯƠNG & NHÂN SỰ', permission: 'view_payroll', allowedRoles: FULL_FINANCE_ROLES },
  { href: '/luong-nhan-su/bang-luong', label: 'Bảng lương', icon: Users, group: 'LƯƠNG & NHÂN SỰ', permission: 'view_payroll', allowedRoles: FULL_FINANCE_ROLES },

  { href: '/bao-cao-quan-tri', label: 'Báo cáo quản trị', icon: FileText, group: 'BÁO CÁO QUẢN TRỊ', permission: 'view_management_reports', allowedRoles: FULL_FINANCE_ROLES },

  { href: '/tai-lieu/quy-trinh-checklist', label: 'Quy trình & Checklist', icon: BookOpen, group: 'TÀI LIỆU', permission: 'view_documents', allowedRoles: OPERATION_ROLES },
  { href: '/tai-lieu/tinh-huong-phat-sinh', label: 'Tình huống phát sinh', icon: BookOpen, group: 'TÀI LIỆU', permission: 'view_documents', allowedRoles: OPERATION_ROLES },
  { href: '/tai-lieu/bieu-mau-bao-cao-mau', label: 'Biểu mẫu & Báo cáo mẫu', icon: BookOpen, group: 'TÀI LIỆU', permission: 'view_documents', allowedRoles: OPERATION_ROLES },

  { href: '/he-thong/nguoi-dung-phan-quyen', label: 'Người dùng & phân quyền', icon: Settings, group: 'HỆ THỐNG', permission: 'view_settings', allowedRoles: ['CEO', 'Admin'] },
  { href: '/he-thong/cua-hang-kho', label: 'Cửa hàng & kho', icon: Store, group: 'HỆ THỐNG', permission: 'view_settings', allowedRoles: ['CEO', 'Admin'] },
  { href: '/he-thong/danh-muc-nen', label: 'Danh mục nền', icon: Database, group: 'HỆ THỐNG', permission: 'view_settings', allowedRoles: ['CEO', 'Admin'] },
  { href: '/he-thong/rule-formula-sheet-map', label: 'Rule / Formula / Sheet map', icon: ClipboardList, group: 'HỆ THỐNG', permission: 'view_settings', allowedRoles: ['CEO', 'Admin'] }
];

export const navigationGroups: NavigationGroup[] = [
  'TỔNG QUAN KẾ TOÁN',
  'NHIỆM VỤ KẾ TOÁN',
  'NHẬP LIỆU & DỮ LIỆU',
  'DOANH THU',
  'KHO CỬA HÀNG',
  'KHO BẾP TRUNG TÂM',
  'TÀI CHÍNH',
  'LƯƠNG & NHÂN SỰ',
  'BÁO CÁO QUẢN TRỊ',
  'TÀI LIỆU',
  'HỆ THỐNG'
];
