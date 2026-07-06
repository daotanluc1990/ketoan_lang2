import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import type { ReportFilters } from '@/lib/reports/report-filters';
import { normalizeText } from '@/lib/reports/report-filters';
import { KPI_DICTIONARY_CORE } from './catalog';

export type OptionCDashboardMetric = {
  code: string;
  name: string;
  group: string;
  value: number | string;
  displayValue: string;
  unit: string;
  status: string;
  source: string;
  owner: string;
  action: string;
};

export type OptionCDashboardSummary = {
  dataMode: 'dashboard_report' | 'partial_option_c' | 'missing_dashboard_report';
  hasDashboardReport: boolean;
  dashboardRows: Record<string, unknown>[];
  importLogRows: Record<string, unknown>[];
  sourceCounts: {
    dashboardReport: number;
    importLog: number;
    revenue: number;
    cashbook: number;
    debt: number;
    payroll: number;
    storeInventory: number;
    bttInventory: number;
    bttExports: number;
    waste: number;
    stockCalc: number;
    lossCalc: number;
    financeCalc: number;
  };
  missingSources: string[];
  coreKpis: OptionCDashboardMetric[];
  redAlerts: string[][];
  taskSeeds: string[][];
  reportDueRows: string[][];
  quickRows: string[][];
  dataQualityScore: number;
};

const DASHBOARD_REQUIRED_SOURCES = [
  SHEET_NAMES.DASHBOARD_REPORT,
  SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG,
  SHEET_NAMES.DATA_DOANH_THU,
  SHEET_NAMES.DATA_SO_QUY,
  SHEET_NAMES.DATA_KHO_CUA_HANG,
  SHEET_NAMES.DATA_KHO_BTT,
  SHEET_NAMES.DATA_XUAT_BTT_CUA_HANG,
  SHEET_NAMES.DATA_HANG_HUY_KIEM_KE
];

const COUNT_SHEETS = [
  ['revenue', SHEET_NAMES.DATA_DOANH_THU],
  ['cashbook', SHEET_NAMES.DATA_SO_QUY],
  ['debt', SHEET_NAMES.DATA_CONG_NO],
  ['payroll', SHEET_NAMES.DATA_NHAN_SU_LUONG],
  ['storeInventory', SHEET_NAMES.DATA_KHO_CUA_HANG],
  ['bttInventory', SHEET_NAMES.DATA_KHO_BTT],
  ['bttExports', SHEET_NAMES.DATA_XUAT_BTT_CUA_HANG],
  ['waste', SHEET_NAMES.DATA_HANG_HUY_KIEM_KE],
  ['stockCalc', SHEET_NAMES.CALC_TON_KHO],
  ['lossCalc', SHEET_NAMES.CALC_HAO_HUT_THAT_THOAT],
  ['financeCalc', SHEET_NAMES.CALC_TAI_CHINH_DU_TOAN]
] as const;

function pick(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  const entries = Object.entries(row);
  for (const key of keys) {
    const expected = normalizeText(key);
    const found = entries.find(([candidate, value]) => normalizeText(candidate) === expected && String(value ?? '').trim() !== '');
    if (found) return found[1];
  }
  return '';
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? '').replace(/,/g, '').replace(/%/g, '').replace(/đ/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function displayValue(value: unknown, unit: string) {
  const numeric = numberValue(value);
  if (numeric !== 0 || typeof value === 'number') {
    if (unit.toLowerCase().includes('vnd')) return new Intl.NumberFormat('vi-VN').format(Math.round(numeric));
    if (unit.includes('%')) return `${numeric}%`;
    return String(numeric);
  }
  const text = String(value ?? '').trim();
  return text || '—';
}

function isMixedKpiUnit(unit: string) {
  return /vnd\s*\/\s*%/i.test(unit) || /kg\s*\/\s*cái\s*\/\s*vnd/i.test(unit);
}

function rowMatchesFilters(row: Record<string, unknown>, filters: ReportFilters) {
  const period = normalizeText(pick(row, ['ky_bao_cao', 'Kỳ báo cáo', 'period_code', 'Mã tuần', 'Tuần']));
  const branch = normalizeText(pick(row, ['cua_hang', 'Chi nhánh', 'Cửa hàng', 'branch']));
  if (filters.weekCode && period && period !== normalizeText(filters.weekCode) && !period.includes(normalizeText(filters.weekCode))) return false;
  if (filters.branch && branch && branch !== normalizeText(filters.branch) && !branch.includes(normalizeText(filters.branch))) return false;
  return true;
}

async function safeRead(sheetName: string) {
  try {
    return await getDataStore().read(sheetName);
  } catch {
    return [] as Record<string, unknown>[];
  }
}

function metricCode(row: Record<string, unknown>) {
  return String(pick(row, ['metric_key', 'metric_code', 'ma_chi_so', 'Mã KPI', 'Mã chỉ số', 'code'])).trim();
}

function metricName(row: Record<string, unknown>) {
  return String(pick(row, ['metric_name', 'ten_chi_so', 'Tên KPI', 'Tên chỉ số', 'name'])).trim();
}

function metricStatus(row: Record<string, unknown>) {
  const status = String(pick(row, ['muc_canh_bao', 'trang_thai', 'Trạng thái', 'Mức cảnh báo', 'status'])).trim();
  if (!status) return 'Chưa đủ dữ liệu';
  if (['red', 'danger', 'do', 'đỏ', 'nguy-hiem'].includes(normalizeText(status))) return 'Đỏ';
  if (['orange', 'cam'].includes(normalizeText(status))) return 'Cam';
  if (['yellow', 'vang', 'vàng', 'warning'].includes(normalizeText(status))) return 'Vàng';
  if (['green', 'xanh', 'good', 'tot', 'tốt'].includes(normalizeText(status))) return 'Tốt';
  return status;
}

function dashboardMetric(row: Record<string, unknown>, fallback: { code: string; name: string; group: string; unit: string; source: string }): OptionCDashboardMetric {
  const rowUnit = String(pick(row, ['don_vi', 'Đơn vị', 'unit']) || '').trim();
  const unit = rowUnit && !isMixedKpiUnit(rowUnit) ? rowUnit : fallback.unit;
  const rawValue = pick(row, ['gia_tri', 'Giá trị', 'value', 'so_lieu', 'Số liệu']);
  const value = typeof rawValue === 'number' || typeof rawValue === 'string' ? rawValue : String(rawValue ?? '');
  return {
    code: metricCode(row) || fallback.code,
    name: metricName(row) || fallback.name,
    group: String(pick(row, ['module', 'nhom_chi_so', 'Nhóm', 'group']) || fallback.group),
    value: value === '' ? '—' : value,
    displayValue: displayValue(value, unit),
    unit,
    status: metricStatus(row),
    source: String(pick(row, ['source', 'nguon_du_lieu', 'Nguồn', 'Nguồn dữ liệu']) || fallback.source),
    owner: String(pick(row, ['nguoi_phu_trach', 'Người phụ trách', 'owner']) || 'Kế toán'),
    action: String(pick(row, ['hanh_dong_de_xuat', 'Hành động đề xuất', 'action']) || 'Theo dõi và đối soát khi có cảnh báo')
  };
}

function findMetricRows(rows: Record<string, unknown>[]) {
  const byCode = new Map<string, Record<string, unknown>>();
  const byName = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const code = normalizeText(metricCode(row));
    const name = normalizeText(metricName(row));
    if (code) byCode.set(code, row);
    if (name) byName.set(name, row);
  }
  return { byCode, byName };
}

function scoreFromRows(rows: Record<string, unknown>[], missingSources: string[]) {
  const scoreMetric = rows.find((row) => normalizeText(metricCode(row)) === 'dq001' || normalizeText(metricName(row)).includes('data-quality'));
  const explicit = numberValue(pick(scoreMetric ?? {}, ['gia_tri', 'Giá trị', 'value']));
  if (explicit > 0) return Math.max(0, Math.min(100, explicit));
  const redRows = rows.filter((row) => metricStatus(row) === 'Đỏ').length;
  const warningRows = rows.filter((row) => ['Cam', 'Vàng', 'Cảnh báo', 'Cần đối chiếu'].includes(metricStatus(row))).length;
  return Math.max(0, 100 - missingSources.length * 10 - redRows * 8 - warningRows * 3);
}

function parseMissingSources(rows: Record<string, unknown>[], fallbackMissing: string[]) {
  const missingMetric = rows.find((row) => normalizeText(metricCode(row)) === 'dq002' || normalizeText(metricName(row)).includes('nguon-du-lieu-con-thieu'));
  const detailRaw = String(pick(missingMetric ?? {}, ['chi_tiet', 'detail', 'nguon_thieu', 'Nguồn thiếu', 'missing_sources'])).trim();
  const detailSources = detailRaw.split(/[,;\n]/).map((item) => item.trim()).filter((item) => item && item !== '0' && !/^\d+([.,]\d+)?$/.test(item));
  if (detailSources.length) return detailSources;

  const valueRaw = String(pick(missingMetric ?? {}, ['gia_tri', 'Giá trị', 'value'])).trim();
  const explicit = valueRaw.split(/[,;\n]/).map((item) => item.trim()).filter((item) => item && item !== '0' && !/^\d+([.,]\d+)?$/.test(item));
  return explicit.length ? explicit : fallbackMissing;
}

export async function buildOptionCDashboardSummary(filters: ReportFilters = {}): Promise<OptionCDashboardSummary> {
  const [dashboardRaw, importLogRows, ...countRows] = await Promise.all([
    safeRead(SHEET_NAMES.DASHBOARD_REPORT),
    safeRead(SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG),
    ...COUNT_SHEETS.map(([, sheetName]) => safeRead(sheetName))
  ]);
  const dashboardRows = dashboardRaw.filter((row) => rowMatchesFilters(row, filters));
  const countValues = Object.fromEntries(COUNT_SHEETS.map(([key], index) => [key, countRows[index]?.length ?? 0])) as Record<(typeof COUNT_SHEETS)[number][0], number>;
  const sourceCounts = {
    dashboardReport: dashboardRows.length,
    importLog: importLogRows.length,
    revenue: countValues.revenue,
    cashbook: countValues.cashbook,
    debt: countValues.debt,
    payroll: countValues.payroll,
    storeInventory: countValues.storeInventory,
    bttInventory: countValues.bttInventory,
    bttExports: countValues.bttExports,
    waste: countValues.waste,
    stockCalc: countValues.stockCalc,
    lossCalc: countValues.lossCalc,
    financeCalc: countValues.financeCalc
  };
  const rawFallbackMissing = DASHBOARD_REQUIRED_SOURCES.filter((sheetName) => {
    if (sheetName === SHEET_NAMES.DASHBOARD_REPORT) return dashboardRows.length === 0;
    if (sheetName === SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG) return importLogRows.length === 0;
    const found = COUNT_SHEETS.find(([, optionCSheet]) => optionCSheet === sheetName);
    return found ? countValues[found[0]] === 0 : false;
  });
  const fallbackMissing = dashboardRows.length ? [] : rawFallbackMissing;
  const missingSources = parseMissingSources(dashboardRows, fallbackMissing);
  const metricRows = findMetricRows(dashboardRows);
  const coreKpis = KPI_DICTIONARY_CORE.map((kpi) => {
    const row = metricRows.byCode.get(normalizeText(kpi.code)) ?? metricRows.byName.get(normalizeText(kpi.name)) ?? {};
    return dashboardMetric(row, kpi);
  });
  const redAlerts = [
    ...dashboardRows
      .filter((row) => ['Đỏ', 'Cam'].includes(metricStatus(row)))
      .slice(0, 12)
      .map((row) => [metricStatus(row), metricName(row) || String(pick(row, ['noi_dung', 'Nội dung']) || 'Cảnh báo dashboard'), String(pick(row, ['chi_tiet', 'detail', 'Ghi chú']) || 'Cần đối soát'), String(pick(row, ['nguoi_phu_trach', 'Người phụ trách']) || 'Kế toán'), String(pick(row, ['hanh_dong_de_xuat', 'Hành động đề xuất']) || 'Ghi nguyên nhân và xử lý trước khi chốt')]),
    ...missingSources.map((source) => ['Đỏ', 'Thiếu nguồn dữ liệu', source, 'Kế toán', 'Upload dữ liệu hoặc chốt có ngoại lệ kèm nguyên nhân'])
  ];
  const dataQualityScore = scoreFromRows(dashboardRows, missingSources);
  const taskSeeds = redAlerts.slice(0, 8).map((alert, index) => [alert[0], alert[1], alert[3], index < 3 ? 'Hôm nay' : 'Ngày mai', alert[4]]);
  const reportDueRows = [
    ['Báo cáo ngày', dataQualityScore >= 70 ? 'Có thể gửi' : 'Chưa đủ dữ liệu', '/bao-cao-quan-tri/ngay'],
    ['Báo cáo tuần', dataQualityScore >= 80 && missingSources.length === 0 ? 'Có thể chốt' : 'Chốt có ngoại lệ', '/bao-cao-quan-tri/tuan'],
    ['Báo cáo tháng', dataQualityScore >= 85 && missingSources.length === 0 ? 'Có thể chốt' : 'Cần đối chiếu', '/bao-cao-quan-tri/thang']
  ];
  const quickRows = [
    [SHEET_NAMES.DASHBOARD_REPORT, String(sourceCounts.dashboardReport), dashboardRows.length ? 'Nguồn dashboard chính' : 'Chưa có dashboard tổng hợp'],
    [SHEET_NAMES.DATA_DOANH_THU, String(sourceCounts.revenue), 'Doanh thu theo kênh'],
    [SHEET_NAMES.DATA_SO_QUY, String(sourceCounts.cashbook), 'Sổ quỹ / dòng tiền'],
    [SHEET_NAMES.DATA_XUAT_BTT_CUA_HANG, String(sourceCounts.bttExports), 'Xuất BTT cho cửa hàng, không phải hàng hủy'],
    [SHEET_NAMES.DATA_HANG_HUY_KIEM_KE, String(sourceCounts.waste), 'Hàng hủy/hư và kiểm kê']
  ];
  return {
    dataMode: dashboardRows.length ? 'dashboard_report' : Object.values(sourceCounts).some((count) => count > 0) ? 'partial_option_c' : 'missing_dashboard_report',
    hasDashboardReport: dashboardRows.length > 0,
    dashboardRows,
    importLogRows,
    sourceCounts,
    missingSources,
    coreKpis,
    redAlerts,
    taskSeeds,
    reportDueRows,
    quickRows,
    dataQualityScore
  };
}
