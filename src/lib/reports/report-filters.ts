export type ReportFilters = {
  fromDate?: string;
  toDate?: string;
  weekCode?: string;
  branch?: string;
  channel?: string;
  source?: string;
  dataStatus?: string;
  alertStatus?: string;
  costGroup?: string;
  importedBy?: string;
};

export type FilterOption = { label: string; value: string; count?: number };

export type ReportFilterOptions = {
  branches: FilterOption[];
  weeks: FilterOption[];
  channels: FilterOption[];
  sources: FilterOption[];
  dataStatuses: FilterOption[];
  alertStatuses: FilterOption[];
  costGroups: FilterOption[];
  importedBy: FilterOption[];
};

export type RowGroup = { sheetName: string; label: string; rows: Record<string, unknown>[] };

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined> | undefined | null;

const ALL_VALUES = new Set([
  '',
  'all',
  'tat-ca',
  'tất cả',
  'toan-bo',
  'toàn bộ',
  'tat-ca-nguon',
  'tất cả nguồn',
  'tat-ca-kenh',
  'tất cả kênh',
  'tat-ca-nhom',
  'tất cả nhóm'
]);

const SOURCE_LABELS: Record<string, string> = {
  '01_CONFIG_MASTER': 'Cấu hình master',
  DL_DOANH_THU_APP: 'Doanh thu app',
  DL_DOANH_THU_CUA_HANG: 'Doanh thu cửa hàng',
  DL_SO_QUY: 'Sổ quỹ',
  DL_TON_KHO: 'Tồn kho',
  DL_THAT_THOAT_NVL: 'Thất thoát NVL',
  DL_CONG_NO: 'Công nợ',
  DL_THU_MUA: 'Thu mua',
  '03_IMPORT_LOG_SYSTEM_LOG': 'Nhật ký import',
  '04_DATA_DOANH_THU': 'Doanh thu',
  '05_DATA_SO_QUY': 'Sổ quỹ',
  '06_DATA_CONG_NO': 'Công nợ',
  '08_DATA_KHO_CUA_HANG': 'Kho cửa hàng',
  '09_DATA_KHO_BTT': 'Kho BTT',
  '10_DATA_XUAT_BTT_CUA_HANG': 'Xuất BTT - cửa hàng',
  '11_DATA_HANG_HUY_KIEM_KE': 'Hàng hủy / kiểm kê',
  '12_CALC_TON_KHO': 'Tính tồn kho',
  '13_CALC_HAO_HUT_THAT_THOAT': 'Hao hụt / thất thoát',
  'DATA_BAO CAO_CA': 'Báo cáo ca KiotViet'
};

const CHANNEL_FILTER_SHEETS = new Set(['DL_DOANH_THU_APP', 'DL_DOANH_THU_CUA_HANG']);
const CONFIG_MASTER_SHEET = '01_CONFIG_MASTER';
const DATA_STATUS_FIELDS = ['Trạng thái dữ liệu', 'trang_thai_dong', 'Trạng thái', 'trang_thai', 'Đánh giá', 'Check', 'Kết luận', 'trang_thai_doi_chieu', 'trang_thai_thanh_toan'];
const ALERT_STATUS_FIELDS = ['Mức độ', 'muc_canh_bao'];
const STATUS_EQUIVALENTS: Record<string, string[]> = {
  dat: ['dat', 'tot', 'ok', 'hop-le', 'khop', 'valid', 'success'],
  'canh-bao': ['canh-bao', 'can-kiem', 'can-doi-chieu', 'lech', 'warning', 'nguy-hiem', 'do', 'cam', 'vang'],
  'thieu-du-lieu': ['thieu-du-lieu', 'chua-du-du-lieu', 'missing', 'thieu-nguon', 'thieu-file', 'thieu-cot'],
  'chua-xu-ly': ['chua-xu-ly', 'preview', 'dang-xu-ly', 'cho-xac-nhan', 'pending', 'chua-xac-nhan'],
  'da-xu-ly': ['da-xu-ly', 'da-xac-nhan', 'thanh-cong', 'thanh-cong-mot-phan', 'done', 'completed', 'closed']
};

const DATA_STATUS_OPTIONS = [
  { label: 'Đạt', aliases: STATUS_EQUIVALENTS.dat },
  { label: 'Cảnh báo', aliases: STATUS_EQUIVALENTS['canh-bao'] },
  { label: 'Thiếu dữ liệu', aliases: STATUS_EQUIVALENTS['thieu-du-lieu'] },
  { label: 'Chưa xử lý', aliases: STATUS_EQUIVALENTS['chua-xu-ly'] },
  { label: 'Đã xử lý', aliases: STATUS_EQUIVALENTS['da-xu-ly'] }
] as const;

export function normalizeText(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isAllFilter(value: unknown) {
  return ALL_VALUES.has(normalizeText(value));
}

export function isActiveDataRow(row: Record<string, unknown>) {
  const status = normalizeText(row['Trạng thái dữ liệu'] ?? row['trang_thai_dong']);
  return status !== 'da-hoan-tac';
}

function firstParam(params: SearchParamsInput, key: string) {
  if (!params) return undefined;
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function cleanParam(value: string | undefined) {
  const trimmed = String(value ?? '').trim();
  return trimmed && !isAllFilter(trimmed) ? trimmed : undefined;
}

export function parseReportFilters(params?: SearchParamsInput): ReportFilters {
  return {
    fromDate: cleanParam(firstParam(params, 'fromDate') ?? firstParam(params, 'from')),
    toDate: cleanParam(firstParam(params, 'toDate') ?? firstParam(params, 'to')),
    weekCode: cleanParam(firstParam(params, 'weekCode') ?? firstParam(params, 'week')),
    branch: cleanParam(firstParam(params, 'branch')),
    channel: cleanParam(firstParam(params, 'channel')),
    source: cleanParam(firstParam(params, 'source')),
    dataStatus: cleanParam(firstParam(params, 'dataStatus') ?? firstParam(params, 'status')),
    alertStatus: cleanParam(firstParam(params, 'alertStatus') ?? firstParam(params, 'alert')),
    costGroup: cleanParam(firstParam(params, 'costGroup')),
    importedBy: cleanParam(firstParam(params, 'importedBy'))
  };
}

export async function parsePageReportFilters(searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>) {
  return parseReportFilters(await searchParams);
}

function ddmmyyyy(day: number, month: number, year: number) {
  return Date.UTC(year, month - 1, day);
}

export function parseDateToUtc(value: unknown): number | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  if (typeof value === 'number' && Number.isFinite(value)) {
    // Excel serial date, roughly valid for modern business dates.
    if (value > 30000 && value < 60000) return Date.UTC(1899, 11, 30 + Math.floor(value));
    return null;
  }
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const iso = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return ddmmyyyy(Number(iso[3]), Number(iso[2]), Number(iso[1]));
  const vn = raw.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (vn) {
    const year = Number(vn[3].length === 2 ? `20${vn[3]}` : vn[3]);
    return ddmmyyyy(Number(vn[1]), Number(vn[2]), year);
  }
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }
  return null;
}

function rowDateValue(row: Record<string, unknown>) {
  return row['Ngày'] ?? row['Ngày kiểm kê'] ?? row['Tuần bắt đầu'] ?? row['Thời gian'] ?? row['Ngày import'];
}

function rowMatchesDate(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.fromDate && !filters.toDate) return true;
  const rowTime = parseDateToUtc(rowDateValue(row));
  if (rowTime === null) return false;
  const fromTime = filters.fromDate ? parseDateToUtc(filters.fromDate) : null;
  const toTime = filters.toDate ? parseDateToUtc(filters.toDate) : null;
  if (fromTime !== null && rowTime < fromTime) return false;
  if (toTime !== null && rowTime > toTime) return false;
  return true;
}

function rowMatchesWeek(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.weekCode) return true;
  const expected = normalizeText(filters.weekCode);
  const values = [row['Mã tuần'], row['ky_bao_cao'], row['Kỳ báo cáo'], rowWeekLabel(row), row['Tuần'], row['Tuần bắt đầu'], row['Tuần kết thúc']].map(normalizeText).filter(Boolean);
  return values.some((value) => value === expected || value.includes(expected) || expected.includes(value));
}

function rowMatchesBranch(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.branch) return true;
  const expected = normalizeText(filters.branch);
  const values = branchValues(row).map(normalizeText).filter(Boolean);
  return values.some((actual) => actual === expected || actual.includes(expected) || expected.includes(actual));
}

function rowMatchesChannel(row: Record<string, unknown>, sheetName: string, filters: ReportFilters) {
  if (!filters.channel) return true;
  const expected = normalizeText(filters.channel);
  if (sheetName === 'DL_DOANH_THU_CUA_HANG' && ['offline', 'cua-hang', 'tai-cua-hang', 'ban-tai-cua-hang'].includes(expected)) return true;

  // Channel is a sales filter. Do not let a selected sales channel hide cashbook,
  // inventory, BTT, or loss rows that do not have channel-level fields.
  if (!CHANNEL_FILTER_SHEETS.has(sheetName)) return true;

  const values = [row['Kênh bán'], row['Tài khoản app'], row['Phương thức'], row['Ca bán']].map(normalizeText).filter(Boolean);
  return values.some((value) => value === expected || value.includes(expected) || expected.includes(value));
}

function rowMatchesSource(sheetName: string, filters: ReportFilters) {
  if (!filters.source) return true;
  const expected = normalizeText(filters.source);
  const sourceLabel = SOURCE_LABELS[sheetName] ?? sheetName;
  const values = [sheetName, sourceLabel].map(normalizeText);
  return values.some((value) => value === expected || value.includes(expected) || expected.includes(value));
}

function rowMatchesDataStatus(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.dataStatus) return true;
  const expectedOption = normalizeDataStatusOption(filters.dataStatus);
  const expected = normalizeText(expectedOption?.value ?? filters.dataStatus);
  const values = DATA_STATUS_FIELDS.map((field) => normalizeText(row[field])).filter(Boolean);
  const normalizedLabels = DATA_STATUS_FIELDS.map((field) => normalizeDataStatusOption(row[field])?.value).filter(Boolean).map(normalizeText);
  if (expectedOption) return normalizedLabels.includes(expected);
  const equivalentValues = STATUS_EQUIVALENTS[expected] ?? [];

  if (equivalentValues.length) return values.some((value) => equivalentValues.some((alias) => value === alias || value.includes(alias) || alias.includes(value)));

  return values.some((value) => value === expected || value.includes(expected) || expected.includes(value));
}

function rowMatchesAlert(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.alertStatus) return true;
  const expected = normalizeText(filters.alertStatus);
  const values = ALERT_STATUS_FIELDS.map((field) => normalizeText(row[field])).filter(Boolean);
  return values.some((value) => value === expected || value.includes(expected) || expected.includes(value));
}

function rowMatchesCostGroup(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.costGroup) return true;
  const expected = normalizeText(filters.costGroup);
  const values = [row['Nhóm thu/chi'], row['Loại nguyên vật liệu'], row['Nhóm hàng'], row['Nhóm công nợ'], row['Mặt hàng']].map(normalizeText).filter(Boolean);
  return values.some((value) => value === expected || value.includes(expected) || expected.includes(value));
}

function rowMatchesImportedBy(row: Record<string, unknown>, filters: ReportFilters) {
  if (!filters.importedBy) return true;
  const expected = normalizeText(filters.importedBy);
  const actual = normalizeText(row['Người import'] ?? row['Người tạo'] ?? row['Người dùng']);
  return actual === expected || actual.includes(expected) || expected.includes(actual);
}

export function filterRowsByReportFilters(rows: Record<string, unknown>[], sheetName: string, filters: ReportFilters) {
  if (!Object.values(filters).some(Boolean)) return rows;
  if (!rowMatchesSource(sheetName, filters)) return [];
  return rows.filter((row) =>
    rowMatchesDate(row, filters) &&
    rowMatchesWeek(row, filters) &&
    rowMatchesBranch(row, filters) &&
    rowMatchesChannel(row, sheetName, filters) &&
    rowMatchesDataStatus(row, filters) &&
    rowMatchesAlert(row, filters) &&
    rowMatchesCostGroup(row, filters) &&
    rowMatchesImportedBy(row, filters)
  );
}

function addOption(map: Map<string, FilterOption>, value: unknown, labelOverride?: string) {
  const label = String(labelOverride ?? value ?? '').trim();
  if (!label) return;
  const key = normalizeText(label);
  if (!key || isAllFilter(key)) return;
  const current = map.get(key);
  if (current) current.count = (current.count ?? 0) + 1;
  else map.set(key, { label, value: label, count: 1 });
}

function normalizeDataStatusOption(value: unknown): FilterOption | null {
  const key = normalizeText(value);
  if (!key || isAllFilter(key) || key === 'da-hoan-tac' || key === 'rolled-back') return null;
  const option = DATA_STATUS_OPTIONS.find((candidate) =>
    candidate.aliases.some((alias) => key === alias || (alias.length > 3 && (key.includes(alias) || alias.includes(key))))
  );
  return option ? { label: option.label, value: option.label } : null;
}

function addDataStatusOption(map: Map<string, FilterOption>, value: unknown) {
  const option = normalizeDataStatusOption(value);
  if (!option) return;
  const key = normalizeText(option.value);
  const current = map.get(key);
  if (current) current.count = (current.count ?? 0) + 1;
  else map.set(key, { ...option, count: 1 });
}

function firstText(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function branchValues(row: Record<string, unknown>) {
  return [
    firstText(row, ['Chi nhánh', 'Tên chi nhánh', 'Tên CH', 'Mã CH', 'Cửa hàng', 'cua_hang', 'cua_hang_hoac_btt', 'cua_hang_nhan', 'branch', 'store', 'store_code', 'ma_cua_hang', 'ten_cua_hang']),
    firstText(row, ['Bếp trung tâm', 'Kho BTT', 'ma_kho_btt', 'ten_kho_btt'])
  ].filter(Boolean);
}

function isoWeekCodeFromUtc(utc: number) {
  const date = new Date(utc);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const weekYear = date.getUTCFullYear();
  const week1 = new Date(Date.UTC(weekYear, 0, 4));
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
  return `${weekYear}-W${String(week).padStart(2, '0')}`;
}

function rowWeekLabel(row: Record<string, unknown>) {
  const direct = firstText(row, ['Mã tuần', 'ky_bao_cao', 'Kỳ báo cáo', 'period_code']);
  if (direct) return direct;
  const year = firstText(row, ['Năm', 'nam']);
  const week = firstText(row, ['Tuần', 'tuan']);
  if (year && week && /^\d{1,2}$/.test(week)) return `${year}-W${week.padStart(2, '0')}`;
  const date = parseDateToUtc(row['Ngày'] ?? row['ngay'] ?? row['Dấu thời gian'] ?? row['timestamp']);
  if (date !== null) return isoWeekCodeFromUtc(date);
  return week;
}

function sortedOptions(map: Map<string, FilterOption>) {
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'));
}

function weekSortValue(option: FilterOption) {
  const text = normalizeText(option.value || option.label);
  const week = text.match(/^(\d{4})-w(\d{1,2})$/);
  if (week) return Number(week[1]) * 100 + Number(week[2]);
  const month = text.match(/^(\d{4})-(\d{1,2})$/);
  if (month) return Number(month[1]) * 100 + Number(month[2]);
  return Number.NEGATIVE_INFINITY;
}

function sortedPeriodOptions(map: Map<string, FilterOption>) {
  return Array.from(map.values()).sort((a, b) => {
    const diff = weekSortValue(b) - weekSortValue(a);
    return diff || b.label.localeCompare(a.label, 'vi');
  });
}

function optionsInInputOrder(map: Map<string, FilterOption>) {
  return Array.from(map.values());
}

function parseConfigPayload(row: Record<string, unknown>) {
  const raw = row['gia_tri'] ?? row['Giá trị'] ?? row['value'];
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) return raw as Record<string, unknown>;
  const text = String(raw ?? '').trim();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function stringsFrom(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item ?? '').trim()).filter(Boolean) : [];
}

function addConfigOptions(row: Record<string, unknown>, branches: Map<string, FilterOption>, dataStatuses: Map<string, FilterOption>) {
  const configType = normalizeText(row['config_type'] ?? row['Config type']);
  const code = normalizeText(row['ma'] ?? row['Mã']);
  const payload = parseConfigPayload(row);
  const status = normalizeText(row['trang_thai'] ?? row['Trạng thái']);
  if (status && !['active', 'dang-dung', 'dang-hoat-dong'].includes(status)) return;

  if (configType === 'store') {
    const primary = String(payload.ten_ch ?? row['ten'] ?? row['Tên'] ?? '').trim();
    const storeCode = String(payload.ma_ch ?? row['ma'] ?? '').trim();
    addOption(branches, primary || storeCode);
    if (storeCode && storeCode !== primary) addOption(branches, storeCode);
    stringsFrom(payload.alias).forEach((alias) => addOption(branches, alias));
    return;
  }

  if (configType === 'filter-option' && code === 'trang-thai') {
    stringsFrom(payload.values).forEach((value) => addDataStatusOption(dataStatuses, value));
  }
}

export function buildReportFilterOptions(groups: RowGroup[]): ReportFilterOptions {
  const branches = new Map<string, FilterOption>();
  const weeks = new Map<string, FilterOption>();
  const channels = new Map<string, FilterOption>();
  const sources = new Map<string, FilterOption>();
  const dataStatuses = new Map<string, FilterOption>();
  const alertStatuses = new Map<string, FilterOption>();
  const costGroups = new Map<string, FilterOption>();
  const importedBy = new Map<string, FilterOption>();

  for (const group of groups) {
    if (group.rows.length) addOption(sources, group.sheetName, SOURCE_LABELS[group.sheetName] ?? group.label);
    if (group.sheetName === CONFIG_MASTER_SHEET) {
      for (const row of group.rows) addConfigOptions(row, branches, dataStatuses);
      continue;
    }

    for (const row of group.rows) {
      branchValues(row).forEach((branch) => addOption(branches, branch));
      addOption(weeks, rowWeekLabel(row));
      addOption(channels, row['Kênh bán'] ?? row['Tài khoản app']);
      if (group.sheetName === 'DL_DOANH_THU_CUA_HANG') addOption(channels, 'Offline');
      DATA_STATUS_FIELDS.forEach((field) => addDataStatusOption(dataStatuses, row[field]));
      ALERT_STATUS_FIELDS.forEach((field) => addOption(alertStatuses, row[field]));
      addOption(costGroups, row['Nhóm thu/chi'] ?? row['Loại nguyên vật liệu'] ?? row['Nhóm hàng'] ?? row['Nhóm công nợ']);
      addOption(importedBy, row['Người import'] ?? row['Người tạo'] ?? row['Người dùng']);
    }
  }

  return {
    branches: optionsInInputOrder(branches),
    weeks: sortedPeriodOptions(weeks),
    channels: sortedOptions(channels),
    sources: sortedOptions(sources),
    dataStatuses: optionsInInputOrder(dataStatuses),
    alertStatuses: sortedOptions(alertStatuses),
    costGroups: sortedOptions(costGroups),
    importedBy: sortedOptions(importedBy)
  };
}

export function hasActiveFilters(filters: ReportFilters) {
  return Object.values(filters).some(Boolean);
}
