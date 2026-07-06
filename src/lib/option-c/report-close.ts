import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { writeAuditLog } from '@/lib/audit/audit-log';
import { AUDIT_EVENTS } from '@/lib/audit/audit-events';
import { buildAccountingTasks } from './task-engine';
import { buildOptionCDashboardSummary } from './dashboard-report';

export type ReportCloseType = 'day' | 'week' | 'month';

export type ReportCloseInput = {
  reportType: ReportCloseType;
  periodCode: string;
  branch?: string;
  actor: string;
  note?: string;
  exceptionReason?: string;
  missingDataReason?: string;
  expectedImpact?: string;
  responsibleOwner?: string;
  supplementDueDate?: string;
  force?: boolean;
};

function nowIso() {
  return new Date().toISOString();
}

function closeId(input: Pick<ReportCloseInput, 'reportType' | 'periodCode'> & { branch: string }) {
  return `CLOSE-${input.reportType}-${input.periodCode}-${input.branch}-${Date.now()}`.replace(/\s+/g, '-');
}

function closeLabel(type: ReportCloseType) {
  if (type === 'day') return 'Báo cáo ngày';
  if (type === 'month') return 'Báo cáo tháng';
  return 'Báo cáo tuần';
}

function normalizeCloseType(value: unknown): ReportCloseType {
  if (value === 'day' || value === 'month' || value === 'week') return value;
  return 'week';
}

async function existingCloseRows(input: Pick<ReportCloseInput, 'reportType' | 'periodCode'> & { branch: string }) {
  const rows = await getDataStore().read(SHEET_NAMES.LICH_SU_CHOT_BAO_CAO).catch(() => [] as Record<string, unknown>[]);
  return rows.filter((row) => {
    const samePeriod = String(row['Kỳ báo cáo'] ?? '').trim() === input.periodCode;
    const sameType = String(row['Loại báo cáo'] ?? 'week') === input.reportType || String(row['Loại báo cáo'] ?? '') === closeLabel(input.reportType);
    const rowBranch = String(row['Chi nhánh'] ?? 'Toàn hệ thống');
    const sameBranch = rowBranch === input.branch || rowBranch === 'Toàn hệ thống' || input.branch === 'Toàn hệ thống';
    const status = String(row['Trạng thái chốt'] ?? row['Trạng thái dữ liệu'] ?? '');
    return samePeriod && sameType && sameBranch && !status.includes('Hoàn tác');
  });
}

export async function buildReportClosePreview(input: Omit<ReportCloseInput, 'actor'>) {
  const reportType = normalizeCloseType(input.reportType);
  const branch = String(input.branch ?? 'Toàn hệ thống').trim() || 'Toàn hệ thống';
  const dashboard = await buildOptionCDashboardSummary({ weekCode: input.periodCode, ...(branch === 'Toàn hệ thống' ? {} : { branch }) });
  const tasks = await buildAccountingTasks(Promise.resolve({ week: input.periodCode, branch }));
  const redTasks = tasks.filter((task) => task.priority === 'Đỏ' && task.status !== 'Hoàn thành');
  const existingCloses = await existingCloseRows({ reportType, periodCode: input.periodCode, branch });

  const checks = [
    {
      code: 'PERIOD',
      label: 'Kỳ báo cáo',
      status: input.periodCode ? 'Tốt' : 'Chưa đủ dữ liệu',
      detail: `${closeLabel(reportType)} · ${input.periodCode || 'chưa chọn kỳ'} · ${branch}`
    },
    {
      code: 'DUPLICATE_CLOSE',
      label: 'Trùng lần chốt',
      status: existingCloses.length ? 'Cần đối chiếu' : 'Tốt',
      detail: existingCloses.length ? `Đã có ${existingCloses.length} lần chốt cùng kỳ/phạm vi` : 'Chưa có lần chốt trùng'
    },
    {
      code: 'REQUIRED_SOURCES',
      label: 'Nguồn dữ liệu bắt buộc',
      status: dashboard.missingSources.length ? 'Chưa đủ dữ liệu' : 'Tốt',
      detail: dashboard.missingSources.length ? `Thiếu: ${dashboard.missingSources.join(', ')}` : 'Không ghi nhận nguồn thiếu'
    },
    {
      code: 'RED_TASKS',
      label: 'Task đỏ ảnh hưởng chốt',
      status: redTasks.length ? 'Nguy hiểm' : 'Tốt',
      detail: redTasks.length ? `${redTasks.length} task đỏ chưa xử lý` : 'Không có task đỏ mở'
    },
    {
      code: 'IMPORT_QUALITY',
      label: 'Lịch sử import',
      status: dashboard.sourceCounts.importLog ? 'Tốt' : 'Cần đối chiếu',
      detail: dashboard.sourceCounts.importLog ? `${dashboard.sourceCounts.importLog} dòng lịch sử import` : 'Chưa thấy lịch sử import trong kỳ'
    }
  ];

  const blockingChecks = checks.filter((check) => ['Chưa đủ dữ liệu', 'Nguy hiểm', 'Cần đối chiếu'].includes(check.status));
  return {
    ok: true,
    reportType,
    reportLabel: closeLabel(reportType),
    periodCode: input.periodCode,
    branch,
    generatedAt: nowIso(),
    status: blockingChecks.length ? 'CHƯA ĐỦ ĐIỀU KIỆN CHỐT' : 'ĐỦ ĐIỀU KIỆN CHỐT',
    canCleanClose: blockingChecks.length === 0,
    canCloseWithException: blockingChecks.length > 0,
    missingSources: dashboard.missingSources,
    redTasks,
    checks,
    blockingChecks,
    existingCloses,
    snapshot: {
      reportType,
      periodCode: input.periodCode,
      branch,
      dataQualityScore: dashboard.dataQualityScore,
      kpis: dashboard.coreKpis.map((kpi) => ({ code: kpi.code, name: kpi.name, value: kpi.displayValue, status: kpi.status })),
      sourceCounts: dashboard.sourceCounts,
      missingSources: dashboard.missingSources,
      redTasks: redTasks.map((task) => ({ id: task.id, title: task.title, owner: task.owner, deadline: task.deadline })),
      checks
    }
  };
}

export async function confirmReportClose(input: ReportCloseInput) {
  const preview = await buildReportClosePreview(input);
  const exceptionReason = String(input.exceptionReason ?? '').trim();
  const missingDataReason = String(input.missingDataReason ?? '').trim();
  const responsibleOwner = String(input.responsibleOwner ?? '').trim();
  const supplementDueDate = String(input.supplementDueDate ?? '').trim();

  if (preview.existingCloses.length && !input.force) {
    await writeAuditLog({ eventType: AUDIT_EVENTS.REPORT_CLOSE_REJECTED, actor: input.actor, target: input.periodCode, after: preview, note: input.note });
    return {
      ok: false,
      error: { code: 'REPORT_CLOSE_DUPLICATE', message: 'Kỳ báo cáo này đã có lần chốt. Muốn chốt lại phải dùng chốt có ngoại lệ và ghi rõ lý do.' },
      preview
    };
  }

  if (!preview.canCleanClose && (!exceptionReason || !missingDataReason || !responsibleOwner || !supplementDueDate)) {
    await writeAuditLog({ eventType: AUDIT_EVENTS.REPORT_CLOSE_REJECTED, actor: input.actor, target: input.periodCode, after: preview, note: input.note });
    return {
      ok: false,
      error: {
        code: 'REPORT_CLOSE_EXCEPTION_REQUIRED',
        message: 'Báo cáo thiếu dữ liệu/còn cảnh báo. Muốn chốt phải nhập lý do, nguyên nhân thiếu dữ liệu, người chịu trách nhiệm và hạn bổ sung.'
      },
      preview
    };
  }

  const id = closeId({ reportType: preview.reportType, periodCode: input.periodCode, branch: preview.branch });
  const closedAt = nowIso();
  const closeStatus = preview.canCleanClose ? 'ĐÃ CHỐT ĐỦ DỮ LIỆU' : 'ĐÃ CHỐT CÓ NGOẠI LỆ';
  const row = {
    'Mã chốt': id,
    'Loại báo cáo': preview.reportType,
    'Tên báo cáo': preview.reportLabel,
    'Kỳ báo cáo': input.periodCode,
    'Chi nhánh': preview.branch,
    'Trạng thái chốt': closeStatus,
    'Trạng thái dữ liệu': preview.canCleanClose ? 'Đủ dữ liệu' : 'Chốt có ngoại lệ',
    'Nguồn dữ liệu thiếu': preview.missingSources.join(', '),
    'Lý do chốt thiếu': exceptionReason,
    'Nguyên nhân thiếu dữ liệu': missingDataReason,
    'Ảnh hưởng dự kiến': input.expectedImpact ?? '',
    'Người chịu trách nhiệm': responsibleOwner,
    'Hạn bổ sung': supplementDueDate,
    'Số lỗi chặn': preview.blockingChecks.length,
    'Người chốt': input.actor,
    'Thời gian chốt': closedAt,
    'Snapshot JSON': JSON.stringify(preview.snapshot),
    'Ghi chú': input.note ?? ''
  };

  const store = getDataStore();
  await store.append(SHEET_NAMES.LICH_SU_CHOT_BAO_CAO, [row]);
  await writeAuditLog({ eventType: AUDIT_EVENTS.REPORT_CLOSE_CONFIRMED, actor: input.actor, target: id, after: { row, preview }, note: input.note });

  return { ok: true, closeId: id, closedAt, row, preview };
}
