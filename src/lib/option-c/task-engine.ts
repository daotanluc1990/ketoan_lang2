import { parsePageReportFilters, type ReportFilters } from '@/lib/reports/report-filters';
import { buildOptionCDashboardSummary, type OptionCDashboardSummary } from './dashboard-report';

export type AccountingTaskStatus = 'Chưa xử lý' | 'Đang xử lý' | 'Chờ xác nhận' | 'Hoàn thành' | 'Quá hạn';
export type AccountingTaskPriority = 'Xanh' | 'Vàng' | 'Cam' | 'Đỏ';

export type AccountingTask = {
  id: string;
  createdAt: string;
  periodCode: string;
  module: string;
  type: string;
  title: string;
  source: string;
  priority: AccountingTaskPriority;
  owner: string;
  deadline: string;
  status: AccountingTaskStatus;
  action: string;
  href: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function tomorrowIso() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function taskId(prefix: string, value: string) {
  return `${prefix}-${value}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isMissingSourceAlert(alert: string[]) {
  return String(alert[1] ?? '').toLowerCase().includes('thiếu nguồn dữ liệu');
}

export function buildAccountingTasksFromReport(report: OptionCDashboardSummary, filters: ReportFilters = {}) {
  const periodCode = filters.weekCode ?? 'Kỳ hiện tại';
  const createdAt = new Date().toISOString();
  const tasks: AccountingTask[] = [];

  for (const source of report.missingSources) {
    tasks.push({
      id: taskId('missing-source', source),
      createdAt,
      periodCode,
      module: 'Nhập liệu & dữ liệu',
      type: 'Thiếu nguồn dữ liệu',
      title: `Bổ sung nguồn dữ liệu: ${source}`,
      source,
      priority: 'Đỏ',
      owner: 'Kế toán',
      deadline: todayIso(),
      status: 'Quá hạn',
      action: 'Upload file hoặc ghi rõ lý do nếu chốt có ngoại lệ.',
      href: '/nhap-lieu/du-lieu-loi-thieu'
    });
  }

  if (report.sourceCounts.importLog === 0) {
    tasks.push({
      id: 'import-history-empty',
      createdAt,
      periodCode,
      module: 'Nhập liệu & dữ liệu',
      type: 'Chưa có lịch sử import',
      title: 'Kiểm tra lại lịch sử import của kỳ báo cáo',
      source: '03_IMPORT_LOG_SYSTEM_LOG / IMPORT_LICH_SU',
      priority: 'Cam',
      owner: 'Kế toán',
      deadline: todayIso(),
      status: 'Chưa xử lý',
      action: 'Xác nhận file đã upload đúng kỳ trước khi chốt.',
      href: '/nhap-lieu/lich-su-import'
    });
  }

  const negativeStock = report.coreKpis.find((kpi) => kpi.code === 'KH001');
  const negativeStockCount = Number(negativeStock?.value ?? 0);
  if (negativeStockCount > 0) {
    tasks.push({
      id: 'negative-stock',
      createdAt,
      periodCode,
      module: 'Kho cửa hàng',
      type: 'Tồn âm',
      title: `Xử lý ${negativeStockCount} dòng tồn âm`,
      source: '12_CALC_TON_KHO',
      priority: 'Đỏ',
      owner: 'Kế toán kho',
      deadline: todayIso(),
      status: 'Quá hạn',
      action: 'Kiểm nhập, xuất, bán, hủy và kiểm kê thực tế.',
      href: '/kho-cua-hang/ton-kho'
    });
  }

  const actionableAlerts = report.redAlerts.filter((alert) => !isMissingSourceAlert(alert));
  const cashWarningCount = actionableAlerts.filter((row) => String(row[1]).toLowerCase().includes('tiền') || String(row[2]).toLowerCase().includes('sổ quỹ')).length;
  if (cashWarningCount > 0) {
    tasks.push({
      id: 'cashbook-warning',
      createdAt,
      periodCode,
      module: 'Tài chính',
      type: 'Sổ quỹ cần đối soát',
      title: `Đối soát ${cashWarningCount} cảnh báo sổ quỹ`,
      source: '05_DATA_SO_QUY',
      priority: 'Cam',
      owner: 'Kế toán tài chính',
      deadline: todayIso(),
      status: 'Chưa xử lý',
      action: 'Kiểm chứng từ, nhóm chi và người duyệt.',
      href: '/tai-chinh/dong-tien'
    });
  }

  if (actionableAlerts.length > 0) {
    tasks.push({
      id: 'dashboard-issues',
      createdAt,
      periodCode,
      module: 'Tổng quan kế toán',
      type: 'Cảnh báo dashboard',
      title: `Rà soát ${actionableAlerts.length} cảnh báo điều hành`,
      source: '15_DASHBOARD_REPORT / rule hiện tại',
      priority: actionableAlerts.some((alert) => alert[0] === 'Đỏ') ? 'Đỏ' : 'Vàng',
      owner: 'Kế toán tổng hợp',
      deadline: tomorrowIso(),
      status: 'Đang xử lý',
      action: 'Đánh dấu nguyên nhân và người xử lý trước khi chốt.',
      href: '/tong-quan-ke-toan'
    });
  }

  for (const [index, alert] of actionableAlerts.slice(0, 6).entries()) {
    tasks.push({
      id: taskId('option-c-alert', `${index}-${alert[1]}-${alert[2]}`),
      createdAt,
      periodCode,
      module: String(alert[1] ?? 'Dashboard'),
      type: 'Cảnh báo cần xử lý',
      title: String(alert[2] ?? alert[1] ?? 'Cảnh báo dữ liệu'),
      source: '15_DASHBOARD_REPORT',
      priority: alert[0] === 'Đỏ' ? 'Đỏ' : 'Cam',
      owner: String(alert[3] ?? 'Kế toán'),
      deadline: alert[0] === 'Đỏ' ? todayIso() : tomorrowIso(),
      status: alert[0] === 'Đỏ' ? 'Quá hạn' : 'Đang xử lý',
      action: String(alert[4] ?? 'Ghi nguyên nhân và xử lý trước khi chốt.'),
      href: '/tong-quan-ke-toan'
    });
  }

  return tasks;
}

export async function buildAccountingTasks(searchParams?: Promise<Record<string, string | string[] | undefined>>) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildOptionCDashboardSummary(filters);
  return buildAccountingTasksFromReport(report, filters);
}

export function filterAccountingTasks(tasks: AccountingTask[], filter?: 'today' | 'overdue' | 'pending') {
  if (filter === 'overdue') return tasks.filter((task) => task.status === 'Quá hạn' || task.priority === 'Đỏ');
  if (filter === 'pending') return tasks.filter((task) => task.status === 'Chờ xác nhận' || task.type.includes('xác nhận') || task.action.toLowerCase().includes('xác nhận'));
  return tasks.filter((task) => task.status !== 'Hoàn thành');
}
