import type { DataRow } from '@/lib/data-store/store-interface';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import type { Status } from '@/lib/report-types';
import { isActiveDataRow } from '@/lib/reports/report-filters';

export type V7Metric = {
  label: string;
  value: string;
  trend?: string;
  status?: Status;
};

export type V7Table = {
  title: string;
  headers: string[];
  rows: string[][];
};

export type V7Report = {
  title: string;
  description: string;
  status: string;
  metrics: V7Metric[];
  primary: V7Table;
  secondary: V7Table;
  readiness: V7Table;
  issues: V7Table;
  emptyTitle?: string;
  emptyDescription?: string;
};

type SourceSpec = {
  sheetName: string;
  label: string;
  rows: DataRow[];
};

type Store = ReturnType<typeof getDataStore>;

const MONEY_KEYS = ['Giá trị', 'Giá trị tồn', 'Giá trị tồn thực tế', 'Giá trị lệch', 'Giá trị chênh lệch', 'Giá trị thất thoát', 'Giá trị vượt', 'Thành tiền', 'Số tiền'];
const QUANTITY_KEYS = ['Số lượng', 'Số lượng xuất', 'Số lượng nhận', 'Lệch', 'Chênh lệch', 'Thiếu', 'Dư', 'Vượt SL'];

function asText(value: unknown) {
  return String(value ?? '').trim();
}

function get(row: DataRow, keys: string[]) {
  for (const key of keys) {
    const direct = row[key];
    if (asText(direct)) return direct;
  }
  const entries = Object.entries(row);
  for (const key of keys) {
    const normalized = key.toLowerCase();
    const found = entries.find(([entryKey, value]) => entryKey.toLowerCase().includes(normalized) && asText(value));
    if (found) return found[1];
  }
  return '';
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  let text = asText(value)
    .replace(/\s/g, '')
    .replace(/đ|vnd/gi, '')
    .replace(/%/g, '');
  const hasComma = text.includes(',');
  const hasDot = text.includes('.');
  if (hasComma && hasDot) text = text.replace(/\./g, '').replace(/,/g, '.');
  else if (hasComma) {
    const parts = text.split(',');
    text = parts.length === 2 && parts[1].length <= 2 ? `${parts[0]}.${parts[1]}` : text.replace(/,/g, '');
  }
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberFrom(row: DataRow, keys: string[]) {
  return toNumber(get(row, keys));
}

function sumRows(rows: DataRow[], keys: string[]) {
  return rows.reduce((total, row) => total + numberFrom(row, keys), 0);
}

function formatNumber(value: number, suffix = '') {
  return `${Math.round(value).toLocaleString('vi-VN')}${suffix}`;
}

function formatMoney(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M`;
  if (abs >= 1_000) return `${(value / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}K`;
  return value.toLocaleString('vi-VN');
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '—';
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function previousNumberFrom(row: DataRow, keys: string[]) {
  const value = numberFrom(row, keys);
  return value === 0 && !keys.some((key) => asText(get(row, [key]))) ? null : value;
}

function compareFields(row: DataRow, currentKeys: string[], previousKeys: string[], previousLabel = 'Kỳ trước') {
  const current = numberFrom(row, currentKeys);
  const previous = previousNumberFrom(row, previousKeys);
  if (previous === null) return { [previousLabel]: '—', 'Kỳ trước': '—', 'Chênh lệch': '—', '% thay đổi': '—', 'Xu hướng': '—' };
  const diff = current - previous;
  const pct = previous ? (diff / Math.abs(previous)) * 100 : 0;
  return {
    [previousLabel]: formatMoney(previous),
    'Kỳ trước': formatMoney(previous),
    'Chênh lệch': formatMoney(diff),
    '% thay đổi': formatPercent(pct),
    'Xu hướng': diff > 0 ? 'Tăng' : diff < 0 ? 'Giảm' : 'Không đổi'
  };
}

function inventoryLossFields(row: DataRow) {
  const variance = numberFrom(row, ['Lệch', 'Chênh lệch', 'Thiếu', 'chenh_lech_ton', 'thieu_kho']);
  const unitCost = numberFrom(row, ['Đơn giá vốn', 'Đơn giá', 'Giá vốn', 'don_gia_von']);
  const theoretical = Math.abs(numberFrom(row, ['Tồn lý thuyết', 'ton_ly_thuyet']));
  const inflow = Math.abs(numberFrom(row, ['Tồn đầu', 'Nhập', 'Nhập từ BTT', 'Nhập NCC', 'ton_dau', 'tong_nhap']));
  const shortage = variance < 0 ? Math.abs(variance) : 0;
  const base = theoretical || inflow;
  return {
    'Giá trị thất thoát (VND)': shortage && unitCost ? formatMoney(shortage * unitCost) : '—',
    'Tỷ lệ TT (%)': shortage && base ? formatPercent((shortage / base) * 100) : '—'
  };
}

function statusForRows(rows: DataRow[], warningCount: number) {
  if (!rows.length) return 'Chưa đủ dữ liệu';
  if (warningCount > 0) return 'Cảnh báo';
  return 'Tốt';
}

function rowStatus(row: DataRow) {
  return asText(get(row, ['Trạng thái', 'Trạng thái dữ liệu', 'Đánh giá', 'Kết luận'])) || 'Cần kiểm';
}

function sortByAbsValue(rows: DataRow[], keys: string[]) {
  return [...rows].sort((a, b) => Math.abs(numberFrom(b, keys)) - Math.abs(numberFrom(a, keys)));
}

function sourceReadiness(sources: SourceSpec[]): V7Table {
  return {
    title: 'Độ sẵn sàng dữ liệu',
    headers: ['Nguồn', 'Sheet', 'Dòng', 'Trạng thái'],
    rows: sources.map((source) => [source.label, source.sheetName, formatNumber(source.rows.length), source.rows.length ? 'Đạt' : 'Chưa đủ dữ liệu'])
  };
}

function missingIssues(sources: SourceSpec[], extra: string[][] = []): V7Table {
  const missing = sources.filter((source) => !source.rows.length).map((source, index) => [String(index + 1), source.label, 'Chưa đủ dữ liệu', `Cần import hoặc map sheet ${source.sheetName}`]);
  return {
    title: 'Việc cần xử lý trước khi chốt',
    headers: ['Ưu tiên', 'Mảng', 'Trạng thái', 'Hành động'],
    rows: [...missing, ...extra].length ? [...missing, ...extra] : [['1', 'Dữ liệu', 'Tốt', 'Không có cảnh báo lớn trong nguồn hiện có']]
  };
}

function tableRows(rows: DataRow[], headers: string[], keysByHeader: Record<string, string[]>, limit = 12) {
  if (!rows.length) return [['—', '—', '—', '—', '—', '—', '—', 'Chưa đủ dữ liệu']];
  return rows.slice(0, limit).map((row) => headers.map((header) => asText(get(row, keysByHeader[header] ?? [header])) || '—'));
}

function topValueRows(rows: DataRow[], labelKeys: string[], valueKeys: string[], title = 'Top giá trị ảnh hưởng'): V7Table {
  const sorted = sortByAbsValue(rows, valueKeys).slice(0, 8);
  return {
    title,
    headers: ['#', 'Đối tượng', 'Giá trị', 'Trạng thái'],
    rows: sorted.length ? sorted.map((row, index) => [String(index + 1), asText(get(row, labelKeys)) || 'Chưa rõ', formatMoney(numberFrom(row, valueKeys)), rowStatus(row)]) : [['1', 'Chưa có dữ liệu', '0', 'Chưa đủ dữ liệu']]
  };
}

function normalizedValue(value: unknown) {
  return asText(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function defaultRecipeRow(itemName: string, materialName: string, unit: string, standard: number, note = ''): DataRow {
  const itemKey = normalizedValue(itemName);
  const materialKey = normalizedValue(materialName);
  return {
    ma_cong_thuc: `${itemKey}__${materialKey}`,
    ma_mon: itemKey,
    ten_mon: itemName,
    'Tên món': itemName,
    ma_nvl: materialKey,
    ten_nvl: materialName,
    'Tên NVL': materialName,
    dvt_nvl: unit,
    'Đơn vị tính': unit,
    dinh_muc_1_don_vi: standard,
    'Định mức': standard,
    hao_hut_hop_le_pct: 0,
    'Hao hụt hợp lệ': 0,
    kho_ap_dung: 'Kho cửa hàng',
    kenh_ap_dung: 'Tất cả',
    trang_thai: 'Đang dùng',
    ghi_chu: note || 'Seed từ sheet CHẾ BIẾN - Báo cáo thất thoát NVL tuần'
  };
}

const DEFAULT_RECIPE_ROWS: DataRow[] = [
  ...['Trà tắc', 'Trà tắc quán', 'Trà tắc APP'].flatMap((item) => [
    defaultRecipeRow(item, 'Trà lài', 'Kg', 0.0033, 'CÔNG THỨC TRÀ TẮC'),
    defaultRecipeRow(item, 'Mật ong', 'Can', 0.0099478261, 'CÔNG THỨC TRÀ TẮC'),
    defaultRecipeRow(item, 'Tắc trái', 'Kg', 0.04136, 'CÔNG THỨC TRÀ TẮC'),
    defaultRecipeRow(item, 'Nước đường', 'Kg', 0.06336, 'CÔNG THỨC TRÀ TẮC'),
    defaultRecipeRow(item, 'Ly 700ml', 'Cái', 1, 'CÔNG THỨC TRÀ TẮC')
  ]),
  ...['Chả', 'Chả trứng'].flatMap((item) => [
    defaultRecipeRow(item, 'Mọc', 'Kg', 0.0097777778, 'CÔNG THỨC CHẢ TRỨNG: quy đổi theo 22.5 miếng/ổ'),
    defaultRecipeRow(item, 'Nấm mèo', 'Kg', 0.0006666667, 'CÔNG THỨC CHẢ TRỨNG: quy đổi theo 22.5 miếng/ổ'),
    defaultRecipeRow(item, 'Bún tàu', 'Kg', 0.0044444444, 'CÔNG THỨC CHẢ TRỨNG: quy đổi theo 22.5 miếng/ổ'),
    defaultRecipeRow(item, 'Trứng gà', 'Cái', 0.7111111111, 'CÔNG THỨC CHẢ TRỨNG: quy đổi theo 22.5 miếng/ổ')
  ]),
  defaultRecipeRow('Canh rong biển', 'Rong biển', 'Kg', 0.003, 'CÔNG THỨC CANH RONG BIỂN'),
  defaultRecipeRow('Canh rong biển', 'Thịt xay', 'Kg', 0.02, 'CÔNG THỨC CANH RONG BIỂN'),
  defaultRecipeRow('Coca', 'Coca', 'Chai 1.5L', 0.1733333333, 'CÔNG THỨC COCA: 260ml/phần'),
  defaultRecipeRow('Coca', 'Ly 700ml', 'Cái', 1, 'CÔNG THỨC COCA'),
  defaultRecipeRow('Nấu cơm', 'Gạo', 'Kg', 0.125, 'CÔNG THỨC NẤU CƠM'),
  defaultRecipeRow('Nướng sườn', 'Sườn', 'Kg', 0.135, 'NƯỚNG SƯỜN'),
  defaultRecipeRow('Nướng sườn', 'Than', 'Kg', 0.035, 'NƯỚNG SƯỜN'),
  defaultRecipeRow('Nướng sườn', 'Dầu ăn', 'Kg', 0.001, 'NƯỚNG SƯỜN')
];

function salesRecipeKey(row: DataRow) {
  return normalizedValue(get(row, ['ma_mon', 'Mã món', 'Mã hàng', 'ten_mon', 'Tên món', 'Món', 'Món bán', 'Tên hàng']));
}

function recipeKeys(row: DataRow) {
  const keys = [
    normalizedValue(get(row, ['ma_mon', 'Mã món'])),
    normalizedValue(get(row, ['ten_mon', 'Tên món', 'Món bán']))
  ].filter(Boolean);
  const aliases = keys.flatMap((key) => key.startsWith('sp-') ? [key, key.slice(3)] : [key]);
  return Array.from(new Set(aliases));
}

function recipeMaterialKeys(row: DataRow) {
  const keys = [
    normalizedValue(get(row, ['ma_nvl', 'Mã NVL'])),
    normalizedValue(get(row, ['ten_nvl', 'Tên NVL', 'Tên nguyên vật liệu']))
  ].filter(Boolean);
  const aliases = keys.flatMap((key) => {
    const values = [key];
    if (key.startsWith('nvl-')) values.push(key.slice(4));
    if (key === 'tac-trai') values.push('tac');
    if (key === 'tac') values.push('tac-trai');
    return values;
  });
  return Array.from(new Set(aliases));
}

function mergeDefaultRecipes(recipeRows: DataRow[]) {
  const seen = new Set(recipeRows.flatMap((row) => recipeKeys(row).flatMap((key) => recipeMaterialKeys(row).map((materialKey) => `${key}__${materialKey}`))));
  const rows = [...recipeRows];
  for (const row of DEFAULT_RECIPE_ROWS) {
    const keys = recipeKeys(row).flatMap((key) => recipeMaterialKeys(row).map((materialKey) => `${key}__${materialKey}`));
    if (!keys.some((key) => seen.has(key))) rows.push(row);
  }
  return rows;
}

function recipeRawUnit(row: DataRow) {
  return asText(get(row, ['dvt_nvl', 'ĐVT', 'Đơn vị tính', 'don_vi_tinh']));
}

function recipeMaterialNameKey(row: DataRow) {
  return normalizedValue(get(row, ['ten_nvl', 'Tên NVL', 'Tên nguyên vật liệu', 'ma_nvl', 'Mã NVL']));
}

function normalizedRecipeStandard(row: DataRow) {
  const raw = numberFrom(row, ['dinh_muc_1_don_vi', 'Định mức', 'Định mức 1 đơn vị']);
  const material = recipeMaterialNameKey(row);
  const unit = normalizedValue(recipeRawUnit(row));
  if (!raw) return 0;
  if (material.includes('trung-ga')) return raw;
  if (material.includes('mat-ong') && unit.includes('g')) return raw / 1000 / 2.3;
  if (material === 'coca' && unit === 'ml') return raw / 1500;
  if (unit === 'g' || unit === 'g-ml' || unit === 'g-cai' || unit === 'g-kg') return raw / 1000;
  if (unit === 'ml') return raw / 1000;
  return raw;
}

function normalizedRecipeUnit(row: DataRow) {
  const material = recipeMaterialNameKey(row);
  const unit = normalizedValue(recipeRawUnit(row));
  if (material.includes('trung-ga')) return 'Cái';
  if (material.includes('mat-ong') && unit.includes('g')) return 'Can';
  if (material === 'coca' && unit === 'ml') return 'Chai 1.5L';
  if (unit === 'g' || unit === 'g-ml' || unit === 'g-cai' || unit === 'g-kg') return 'Kg';
  if (unit === 'ml') return 'L';
  return recipeRawUnit(row) || '—';
}

function saleNumber(row: DataRow, keys: string[]) {
  return keys.reduce((total, key) => total + numberFrom(row, [key]), 0);
}

function makeSaleRow(source: DataRow, itemName: string, sold: number, itemKey = normalizedValue(itemName)): DataRow {
  return {
    ...source,
    ma_mon: itemKey,
    ten_mon: itemName,
    'Tên món': itemName,
    so_luong_ban: sold,
    'Số lượng bán': sold
  };
}

function salesColumnRecipeKeys(column: string) {
  const key = normalizedValue(column);
  const keys = [key];
  if (key.includes('tra-tac') && key.includes('quan')) keys.push('tra-tac-quan');
  if (key.includes('tra-tac') && key.includes('app')) keys.push('tra-tac-app');
  if (key.includes('tra-tac')) keys.push('tra-tac');
  if (key.includes('canh-rong-bien')) keys.push('canh-rong-bien');
  if (key.startsWith('coca')) keys.push('coca');
  if (key.startsWith('cha')) keys.push('cha');
  return Array.from(new Set(keys));
}

function salesColumnLabel(column: string, key: string) {
  if (key === 'tra-tac-quan') return 'Trà tắc quán';
  if (key === 'tra-tac-app') return 'Trà tắc APP';
  if (key === 'tra-tac') return 'Trà tắc';
  if (key === 'canh-rong-bien') return 'Canh rong biển';
  if (key === 'coca') return 'Coca';
  if (key === 'cha') return 'Chả';
  return column;
}

function buildSalesRowsFromWideReport(salesRows: DataRow[], recipesByItem: Map<string, DataRow[]>) {
  const rows: DataRow[] = [];
  for (const sale of salesRows) {
    const explicitSold = numberFrom(sale, ['so_luong_ban', 'Số lượng bán', 'Số lượng', 'Tổng số phần', 'Tổng phần']);
    const explicitKey = salesRecipeKey(sale);
    if (explicitSold && explicitKey) rows.push(makeSaleRow(sale, asText(get(sale, ['ten_mon', 'Tên món', 'Món', 'Món bán', 'Mã món'])) || explicitKey, explicitSold));

    for (const [column, value] of Object.entries(sale)) {
      const key = salesColumnRecipeKeys(column).find((candidate) => recipesByItem.has(candidate));
      if (!key) continue;
      const sold = toNumber(value);
      if (sold) rows.push(makeSaleRow(sale, salesColumnLabel(column, key), sold, key));
    }

    const mealPortions = saleNumber(sale, ['Số hộp', 'Số dĩa', 'so_hop', 'so_dia']);
    if (mealPortions) {
      if (recipesByItem.has(normalizedValue('Nấu cơm'))) rows.push(makeSaleRow(sale, 'Nấu cơm', mealPortions));
      if (recipesByItem.has(normalizedValue('Nướng sườn'))) rows.push(makeSaleRow(sale, 'Nướng sườn', mealPortions));
    }
  }
  return rows;
}

export function buildTheoreticalIngredientRows(salesRows: DataRow[], recipeRows: DataRow[]) {
  const recipesByItem = new Map<string, DataRow[]>();
  for (const recipe of mergeDefaultRecipes(recipeRows)) {
    if (normalizedValue(get(recipe, ['trang_thai', 'Trạng thái'])).includes('ngung')) continue;
    for (const key of recipeKeys(recipe)) {
      if (!key) continue;
      const current = recipesByItem.get(key) ?? [];
      current.push(recipe);
      recipesByItem.set(key, current);
    }
  }

  const rows: DataRow[] = [];
  for (const sale of buildSalesRowsFromWideReport(salesRows, recipesByItem)) {
    const sold = numberFrom(sale, ['so_luong_ban', 'Số lượng bán', 'Số lượng', 'Tổng số phần', 'Tổng phần']);
    if (!sold) continue;
    const recipes = recipesByItem.get(salesRecipeKey(sale)) ?? [];
    for (const recipe of recipes) {
      const standard = normalizedRecipeStandard(recipe);
      const unit = normalizedRecipeUnit(recipe);
      const allowedLossPct = numberFrom(recipe, ['hao_hut_hop_le_pct', 'Hao hụt hợp lệ', 'Tỷ lệ hao hụt']);
      const allowed = sold * standard * (1 + (allowedLossPct > 1 ? allowedLossPct / 100 : allowedLossPct));
      rows.push({
        'Ngày': get(sale, ['ngay', 'Ngày']),
        'Món/Nhóm chế biến': get(recipe, ['ten_mon', 'Tên món']) || get(sale, ['ten_mon', 'Tên món']),
        'Món': get(recipe, ['ten_mon', 'Tên món']) || get(sale, ['ten_mon', 'Tên món']),
        'NVL': get(recipe, ['ten_nvl', 'Tên NVL', 'Tên nguyên vật liệu']),
        'Tên nguyên vật liệu': get(recipe, ['ten_nvl', 'Tên NVL', 'Tên nguyên vật liệu']),
        'ĐVT': unit,
        'Đơn vị tính': unit,
        'Sản lượng': sold,
        'Định mức': standard,
        'Định mức gốc': numberFrom(recipe, ['dinh_muc_1_don_vi', 'Định mức', 'Định mức 1 đơn vị']),
        'ĐVT gốc': recipeRawUnit(recipe),
        'Hao hụt hợp lệ': allowedLossPct > 1 ? `${allowedLossPct}%` : `${allowedLossPct * 100}%`,
        'Được phép dùng': allowed,
        'Thực tế dùng': '',
        'Vượt SL': '',
        'Tỷ lệ vượt': '',
        'Giá trị vượt': 0,
        'Trạng thái': 'Suy ra từ bán hàng',
        'Nguồn': '04_DATA_DOANH_THU x 02_DM_CONG_THUC_DINH_MUC'
      });
    }
  }
  return rows;
}

async function readSources(store: Store, specs: Array<{ sheetName: string; label: string }>): Promise<SourceSpec[]> {
  return Promise.all(specs.map(async (spec) => {
    const rows = await store.read(spec.sheetName).catch((error) => {
      console.warn('[v7-report-engines] Cannot read', spec.sheetName, error instanceof Error ? error.message : error);
      return [] as DataRow[];
    });
    return { ...spec, rows: rows.filter(isActiveDataRow) };
  }));
}

export async function buildStoreInventoryReport(): Promise<V7Report> {
  const store = getDataStore();
  const sources = await readSources(store, [
    { sheetName: SHEET_NAMES.DL_XNT_CUA_HANG, label: 'XNT cửa hàng' },
    { sheetName: SHEET_NAMES.DATA_DOANH_THU, label: 'Số lượng bán Option C' },
    { sheetName: SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC, label: 'Công thức/định mức Option C' },
    { sheetName: SHEET_NAMES.DM_CONG_THUC_CHE_BIEN, label: 'Công thức chế biến legacy' }
  ]);
  const rows = sources[0]?.rows ?? [];
  const theoreticalRows = buildTheoreticalIngredientRows(sources[1]?.rows ?? [], [...(sources[2]?.rows ?? []), ...(sources[3]?.rows ?? [])]);
  const enrichedRows = rows.map((row) => ({
    ...row,
    ...inventoryLossFields(row),
    ...compareFields(row, ['Tồn thực tế', 'Tồn kho', 'kiem_ke_thuc_te'], ['Tồn TT kỳ trước', 'Tồn thực tế kỳ trước', 'Tồn kỳ trước', 'ton_thuc_te_ky_truoc'], 'Tồn TT kỳ trước')
  }));
  const varianceValue = sumRows(rows, ['Giá trị lệch', 'Giá trị chênh lệch', 'Giá trị thất thoát']);
  const negativeCount = rows.filter((row) => numberFrom(row, ['Lệch', 'Chênh lệch', 'Thiếu']) < 0 || rowStatus(row).toLowerCase().includes('tồn âm')).length;
  const status = statusForRows(rows, negativeCount);
  const headers = ['Ngày', 'Chi nhánh', 'Kho', 'Mã hàng', 'Tên hàng', 'Tồn đầu', 'Nhập từ BTT', 'Xuất bán lý thuyết', 'Hủy', 'Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', 'Tồn TT kỳ trước', 'Chênh lệch', '% thay đổi', 'Trạng thái'];
  const keys = Object.fromEntries(headers.map((header) => [header, [header]]));
  return {
    title: 'Kho cửa hàng',
    description: 'Engine thật đọc DL_XNT_CUA_HANG để kiểm soát xuất nhập tồn riêng từng cửa hàng.',
    status,
    metrics: [
      { label: 'Dòng XNT', value: formatNumber(rows.length), trend: 'DL_XNT_CUA_HANG', status: rows.length ? 'good' : 'neutral' },
      { label: 'NVL suy ra từ bán', value: formatNumber(theoreticalRows.length), trend: 'Số bán x công thức', status: theoreticalRows.length ? 'good' : 'neutral' },
      { label: 'Giá trị lệch', value: formatMoney(varianceValue), trend: varianceValue ? 'Cần giải trình' : 'Không phát sinh', status: varianceValue ? 'warning' : 'good' },
      { label: 'Tồn âm / thiếu', value: formatNumber(negativeCount), trend: 'Mặt hàng cần kiểm', status: negativeCount ? 'danger' : 'good' },
      { label: 'Tổng giá trị đọc được', value: formatMoney(sumRows(rows, MONEY_KEYS)), trend: 'Theo các cột giá trị hiện có', status: rows.length ? 'good' : 'neutral' }
    ],
    primary: { title: 'Bảng XNT cửa hàng', headers, rows: tableRows(enrichedRows, headers, keys) },
    secondary: theoreticalRows.length
      ? topValueRows(theoreticalRows, ['NVL', 'Tên nguyên vật liệu', 'Món/Nhóm chế biến'], ['Được phép dùng'], 'NVL dùng từ số bán x định mức')
      : topValueRows(rows, ['Tên hàng', 'Tên nguyên vật liệu', 'Mã hàng'], ['Giá trị lệch', 'Giá trị chênh lệch', 'Giá trị thất thoát'], 'Top NVL lệch lớn'),
    readiness: sourceReadiness(sources),
    issues: missingIssues(sources, [
      ...(negativeCount ? [['2', 'Kho cửa hàng', 'Cảnh báo', 'Kiểm kê lại và yêu cầu giải trình tồn âm/thiếu']] : []),
      ...(!theoreticalRows.length ? [['3', 'Công thức/định mức', 'Cần đối chiếu', 'Bổ sung số lượng bán và công thức để suy ra NVL dùng']] : [])
    ])
  };
}

export async function buildBttInventoryReport(): Promise<V7Report> {
  const store = getDataStore();
  const sources = await readSources(store, [{ sheetName: SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM, label: 'XNT Bếp Trung Tâm' }]);
  const rows = sources[0]?.rows ?? [];
  const enrichedRows = rows.map((row) => ({
    ...row,
    ...inventoryLossFields(row),
    ...compareFields(row, ['Tồn thực tế', 'Tồn kho', 'kiem_ke_thuc_te_btt'], ['Tồn TT kỳ trước', 'Tồn thực tế kỳ trước', 'Tồn kỳ trước', 'ton_thuc_te_ky_truoc'], 'Tồn TT kỳ trước')
  }));
  const varianceValue = sumRows(rows, ['Giá trị lệch', 'Giá trị chênh lệch', 'Giá trị thất thoát']);
  const warningCount = rows.filter((row) => Math.abs(numberFrom(row, ['Lệch', 'Chênh lệch'])) > 0 || rowStatus(row).toLowerCase().includes('cảnh báo')).length;
  const unconfirmedCount = rows.filter((row) => asText(get(row, ['Xác nhận CH', 'Trạng thái xác nhận', 'store_confirm_status'])).toLowerCase().includes('chưa')).length;
  const headers = ['Ngày', 'Kho', 'Mã hàng', 'Tên hàng', 'ĐVT', 'Tồn đầu', 'Nhập NCC', 'Sản xuất/sơ chế', 'Xuất cửa hàng', 'Cửa hàng nhận', 'Xác nhận CH', 'Hủy BTT', 'Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', 'Tồn TT kỳ trước', 'Chênh lệch', '% thay đổi', 'Trạng thái', 'Người xử lý', 'Hành động đề xuất'];
  const keys = {
    'Ngày': ['Ngày', 'ngay'],
    'Kho': ['Kho', 'ma_kho', 'ma_kho_btt'],
    'Mã hàng': ['Mã hàng', 'ma_hang', 'sku'],
    'Tên hàng': ['Tên hàng', 'Tên nguyên vật liệu', 'ten_hang'],
    'ĐVT': ['ĐVT', 'Đơn vị', 'dvt'],
    'Tồn đầu': ['Tồn đầu', 'ton_dau'],
    'Nhập NCC': ['Nhập NCC', 'nhap_ncc'],
    'Sản xuất/sơ chế': ['Sản xuất/sơ chế', 'Sản xuất', 'Sơ chế', 'san_xuat_so_che'],
    'Xuất cửa hàng': ['Xuất cửa hàng', 'Số lượng xuất', 'xuat_btt_cho_cua_hang'],
    'Cửa hàng nhận': ['Cửa hàng nhận', 'Chi nhánh nhận', 'cua_hang_nhan'],
    'Xác nhận CH': ['Xác nhận CH', 'Trạng thái xác nhận', 'store_confirm_status'],
    'Hủy BTT': ['Hủy BTT', 'huy_btt', 'huy_hop_le_btt'],
    'Tồn lý thuyết': ['Tồn lý thuyết', 'ton_ly_thuyet'],
    'Tồn thực tế': ['Tồn thực tế', 'kiem_ke_thuc_te_btt', 'kiem_ke_thuc_te'],
    'Lệch': ['Lệch', 'Chênh lệch', 'chenh_lech_ton'],
    'Giá trị thất thoát (VND)': ['Giá trị thất thoát (VND)'],
    'Tỷ lệ TT (%)': ['Tỷ lệ TT (%)'],
    'Tồn TT kỳ trước': ['Tồn TT kỳ trước'],
    'Chênh lệch': ['Chênh lệch'],
    '% thay đổi': ['% thay đổi'],
    'Trạng thái': ['Trạng thái', 'Đánh giá', 'Kết luận'],
    'Người xử lý': ['Người xử lý', 'Người phụ trách', 'owner'],
    'Hành động đề xuất': ['Hành động đề xuất', 'Hành động', 'action']
  };
  return {
    title: 'Kho Bếp Trung Tâm',
    description: 'Engine thật đọc DL_XNT_BEP_TRUNG_TAM để tách BTT thành kho độc lập.',
    status: statusForRows(rows, warningCount),
    metrics: [
      { label: 'Dòng XNT BTT', value: formatNumber(rows.length), trend: 'DL_XNT_BEP_TRUNG_TAM', status: rows.length ? 'good' : 'neutral' },
      { label: 'Nhập NCC', value: formatMoney(sumRows(rows, ['Nhập NCC', 'Giá trị nhập NCC'])), status: rows.length ? 'good' : 'neutral' },
      { label: 'Xuất cửa hàng', value: formatMoney(sumRows(rows, ['Xuất cửa hàng', 'Giá trị xuất cửa hàng'])), status: rows.length ? 'good' : 'neutral' },
      { label: 'Giá trị lệch BTT', value: formatMoney(varianceValue), status: varianceValue ? 'warning' : 'good' },
      { label: 'CH chưa xác nhận', value: formatNumber(unconfirmedCount), trend: 'Xuất BTT cần đối chiếu', status: unconfirmedCount ? 'warning' : 'good' }
    ],
    primary: { title: 'Bảng XNT BTT', headers, rows: tableRows(enrichedRows, headers, keys) },
    secondary: topValueRows(rows, ['Tên hàng', 'Tên nguyên vật liệu', 'Mã hàng'], ['Giá trị lệch', 'Giá trị chênh lệch', 'Giá trị thất thoát'], 'Top lệch BTT'),
    readiness: sourceReadiness(sources),
    issues: missingIssues(sources, [
      ...(warningCount ? [['2', 'Kho BTT', 'Cảnh báo', 'Đối chiếu nhập NCC, xuất cửa hàng và hủy BTT']] : []),
      ...(unconfirmedCount ? [['3', 'Đối chiếu BTT-CH', 'Cần đối chiếu', 'Nhắc cửa hàng xác nhận hàng đã nhận']] : [])
    ])
  };
}

export async function buildBttTransferReport(): Promise<V7Report> {
  const store = getDataStore();
  const sources = await readSources(store, [
    { sheetName: SHEET_NAMES.DL_XUAT_BTT_CHO_CUA_HANG, label: 'BTT xuất cho cửa hàng' },
    { sheetName: SHEET_NAMES.DL_CUA_HANG_NHAN_TU_BTT, label: 'Cửa hàng nhận từ BTT' }
  ]);
  const exportRows = sources[0]?.rows ?? [];
  const receiveRows = sources[1]?.rows ?? [];
  const totalRows = exportRows.length + receiveRows.length;
  const exportQty = sumRows(exportRows, ['Số lượng xuất', 'Số lượng']);
  const receiveQty = sumRows(receiveRows, ['Số lượng nhận', 'Số lượng']);
  const diffQty = exportQty - receiveQty;
  const headers = ['Ngày', 'Mã phiếu', 'Cửa hàng', 'Mã hàng', 'Tên hàng', 'Số lượng xuất', 'Số lượng nhận', 'Lệch', 'Kỳ trước', 'Chênh lệch', '% thay đổi', 'Trạng thái'];
  const combined = exportRows.map((row) => ({ ...row, 'Số lượng nhận': '', 'Lệch': numberFrom(row, ['Số lượng xuất', 'Số lượng']), ...compareFields(row, ['Số lượng xuất', 'Số lượng'], ['Số lượng kỳ trước', 'SL kỳ trước', 'Kỳ trước']) }));
  const keys = Object.fromEntries(headers.map((header) => [header, [header, header.replace('Mã phiếu', 'Phiếu BTT')]]));
  return {
    title: 'Đối chiếu BTT - Cửa hàng',
    description: 'Engine thật đọc 2 nguồn BTT xuất và cửa hàng nhận để phát hiện phiếu lệch/chưa xác nhận.',
    status: statusForRows(sources.flatMap((source) => source.rows), diffQty ? 1 : 0),
    metrics: [
      { label: 'Phiếu BTT xuất', value: formatNumber(exportRows.length), status: exportRows.length ? 'good' : 'neutral' },
      { label: 'Dòng cửa hàng nhận', value: formatNumber(receiveRows.length), status: receiveRows.length ? 'good' : 'neutral' },
      { label: 'SL xuất', value: formatNumber(exportQty), status: exportRows.length ? 'good' : 'neutral' },
      { label: 'SL lệch tạm', value: formatNumber(diffQty), trend: 'Xuất - nhận', status: diffQty ? 'warning' : 'good' }
    ],
    primary: { title: 'Bảng đối chiếu phiếu BTT', headers, rows: tableRows(combined, headers, keys) },
    secondary: topValueRows(combined, ['Cửa hàng', 'Chi nhánh', 'Kho nhận'], ['Lệch', 'Số lượng xuất'], 'Top phiếu/cửa hàng cần kiểm'),
    readiness: sourceReadiness(sources),
    issues: missingIssues(sources, diffQty ? [['3', 'Đối chiếu BTT', 'Cảnh báo', 'So khớp phiếu xuất và phiếu nhận trước khi chốt']] : [])
  };
}

export async function buildWasteReport(): Promise<V7Report> {
  const store = getDataStore();
  const sources = await readSources(store, [
    { sheetName: SHEET_NAMES.DL_HUY_HANG_CUA_HANG, label: 'Hủy hàng cửa hàng' },
    { sheetName: SHEET_NAMES.DL_HUY_HANG_BTT, label: 'Hủy hàng BTT' }
  ]);
  const storeWaste = sources[0]?.rows ?? [];
  const bttWaste = sources[1]?.rows ?? [];
  const rows = sources.flatMap((source) => source.rows.map((row) => ({ ...row, 'Nguồn hủy': source.label })));
  const value = sumRows(rows, ['Giá trị', 'Giá trị hủy', 'Thành tiền']);
  const abnormal = rows.filter((row) => rowStatus(row).toLowerCase().includes('bất thường') || rowStatus(row).toLowerCase().includes('cảnh báo')).length;
  const enrichedRows = rows.map((row) => ({ ...row, ...compareFields(row, ['Giá trị', 'Giá trị hủy', 'Thành tiền'], ['Giá trị T24', 'Giá trị kỳ trước', 'Kỳ trước'], 'Giá trị T24') }));
  const headers = ['Ngày hủy', 'Nguồn hủy', 'Kho', 'Mã hàng', 'Tên hàng', 'Số lượng', 'ĐVT', 'Giá trị', 'Giá trị T24', 'Chênh lệch', 'Lý do', 'Trạng thái'];
  const keys = Object.fromEntries(headers.map((header) => [header, [header, header.replace('Ngày hủy', 'Ngày'), header.replace('Tên hàng', 'Tên nguyên vật liệu')]]));
  return {
    title: 'Hàng hủy',
    description: 'Engine thật tách hủy cửa hàng và hủy BTT, không gộp vào thất thoát tồn kho.',
    status: statusForRows(rows, abnormal),
    metrics: [
      { label: 'Tổng giá trị hủy', value: formatMoney(value), status: value ? 'warning' : 'good' },
      { label: 'Hủy cửa hàng', value: formatNumber(storeWaste.length), status: storeWaste.length ? 'warning' : 'neutral' },
      { label: 'Hủy BTT', value: formatNumber(bttWaste.length), status: bttWaste.length ? 'warning' : 'neutral' },
      { label: 'Hủy bất thường', value: formatNumber(abnormal), status: abnormal ? 'danger' : 'good' }
    ],
    primary: { title: 'Bảng hàng hủy', headers, rows: tableRows(enrichedRows, headers, keys) },
    secondary: topValueRows(rows, ['Lý do', 'Tên hàng', 'Tên nguyên vật liệu'], ['Giá trị', 'Giá trị hủy', 'Thành tiền'], 'Top lý do/NVL hủy'),
    readiness: sourceReadiness(sources),
    issues: missingIssues(sources, abnormal ? [['3', 'Hàng hủy', 'Cảnh báo', 'Yêu cầu giải trình các phiếu hủy bất thường']] : [])
  };
}

export async function buildStandardLossReport(): Promise<V7Report> {
  const store = getDataStore();
  const sources = await readSources(store, [
    { sheetName: SHEET_NAMES.KQ_HAO_HUT_CHE_BIEN, label: 'Kết quả hao hụt chế biến' },
    { sheetName: SHEET_NAMES.DL_CHE_BIEN_THUC_TE, label: 'Chế biến thực tế' },
    { sheetName: SHEET_NAMES.DM_CONG_THUC_CHE_BIEN, label: 'Công thức chế biến' },
    { sheetName: SHEET_NAMES.DM_HAO_HUT_HOP_LE, label: 'Hao hụt hợp lệ' },
    { sheetName: SHEET_NAMES.DATA_DOANH_THU, label: 'Số lượng bán' },
    { sheetName: SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC, label: 'Định mức món bán' },
    { sheetName: SHEET_NAMES.DL_DOANH_THU_CUA_HANG, label: 'Doanh thu cửa hàng legacy' },
    { sheetName: SHEET_NAMES.DL_DOANH_THU_APP, label: 'Doanh thu app legacy' }
  ]);
  const salesRows = [...(sources[4]?.rows ?? []), ...(sources[6]?.rows ?? []), ...(sources[7]?.rows ?? [])];
  const recipeRows = [...(sources[5]?.rows ?? []), ...(sources[2]?.rows ?? [])];
  const derivedRows = buildTheoreticalIngredientRows(salesRows, recipeRows);
  const resultRows = sources[0]?.rows.length ? sources[0].rows : sources[1]?.rows.length ? sources[1].rows : derivedRows;
  const value = sumRows(resultRows, ['Giá trị vượt', 'Giá trị hao hụt', 'Giá trị chênh lệch']);
  const warnings = resultRows.filter((row) => rowStatus(row).toLowerCase().includes('cảnh báo') || rowStatus(row).toLowerCase().includes('nguy hiểm') || numberFrom(row, ['Vượt SL', 'Mức vượt định mức']) > 0).length;
  const enrichedRows = resultRows.map((row) => ({ ...row, ...compareFields(row, ['Giá trị vượt', 'Giá trị hao hụt', 'Giá trị chênh lệch'], ['Giá trị vượt T24', 'Giá trị kỳ trước', 'Kỳ trước'], 'Giá trị vượt T24') }));
  const headers = ['Ngày', 'Món/Nhóm chế biến', 'NVL', 'ĐVT', 'Sản lượng', 'Định mức', 'Hao hụt hợp lệ', 'Được phép dùng', 'Thực tế dùng', 'Vượt SL', 'Tỷ lệ vượt', 'Giá trị vượt', 'Giá trị vượt T24', 'Chênh lệch', 'Trạng thái'];
  const keys = Object.fromEntries(headers.map((header) => [header, [header, header.replace('Món/Nhóm chế biến', 'Món'), header.replace('NVL', 'Tên nguyên vật liệu')]]));
  return {
    title: 'Hao hụt / Vượt định mức',
    description: 'Engine thật đo món/ca/bộ phận dùng quá định mức; không kết luận mất kho ngay.',
    status: statusForRows(resultRows, warnings),
    metrics: [
      { label: 'Giá trị vượt', value: formatMoney(value), status: value ? 'warning' : 'good' },
      { label: 'Dòng kết quả', value: formatNumber(resultRows.length), status: resultRows.length ? 'good' : 'neutral' },
      { label: 'Dòng cảnh báo', value: formatNumber(warnings), status: warnings ? 'danger' : 'good' },
      { label: 'Công thức chuẩn', value: formatNumber(recipeRows.length || DEFAULT_RECIPE_ROWS.length), trend: 'Định mức x số lượng bán', status: recipeRows.length || DEFAULT_RECIPE_ROWS.length ? 'good' : 'neutral' }
    ],
    primary: { title: 'Bảng hao hụt/vượt định mức', headers, rows: tableRows(enrichedRows, headers, keys) },
    secondary: topValueRows(resultRows, ['Món/Nhóm chế biến', 'Món', 'NVL', 'Tên nguyên vật liệu'], ['Giá trị vượt', 'Giá trị hao hụt', 'Giá trị chênh lệch'], 'Top món/NVL vượt định mức'),
    readiness: sourceReadiness(sources),
    issues: missingIssues(sources, warnings ? [['3', 'Định mức', 'Cảnh báo', 'Đào tạo lại ca/bộ phận dùng quá định mức']] : [])
  };
}

export async function buildStockLossReport(): Promise<V7Report> {
  const store = getDataStore();
  const sources = await readSources(store, [{ sheetName: SHEET_NAMES.KQ_THAT_THOAT_TON_KHO, label: 'Kết quả thất thoát tồn kho' }]);
  const rows = sources[0]?.rows ?? [];
  const lossValue = sumRows(rows, ['Giá trị thất thoát', 'Giá trị lệch', 'Giá trị chênh lệch']);
  const shortages = rows.filter((row) => numberFrom(row, ['Thiếu', 'Chênh lệch', 'Lệch']) < 0 || rowStatus(row).toLowerCase().includes('thiếu')).length;
  const enrichedRows = rows.map((row) => ({ ...row, ...compareFields(row, ['Giá trị thất thoát', 'Giá trị lệch', 'Giá trị chênh lệch'], ['Giá trị thất thoát T24', 'Giá trị kỳ trước', 'Kỳ trước']) }));
  const headers = ['Kho', 'NVL', 'ĐVT', 'Tồn đầu', 'Nhập', 'Tiêu hao lý thuyết', 'Hủy hợp lệ', 'Tồn lý thuyết', 'Tồn thực tế', 'Thiếu', 'Dư', 'Tỷ lệ thất thoát', 'Giá trị thất thoát', 'Kỳ trước', 'Chênh lệch', '% thay đổi', 'Trạng thái'];
  const keys = Object.fromEntries(headers.map((header) => [header, [header, header.replace('NVL', 'Tên nguyên vật liệu')]]));
  return {
    title: 'Thất thoát tồn kho',
    description: 'Engine thật đo thiếu/dư giữa tồn lý thuyết và kiểm kê thực tế, tách khỏi hao hụt chế biến.',
    status: statusForRows(rows, shortages),
    metrics: [
      { label: 'Giá trị thất thoát', value: formatMoney(lossValue), status: lossValue ? 'danger' : 'good' },
      { label: 'Dòng thất thoát', value: formatNumber(rows.length), status: rows.length ? 'good' : 'neutral' },
      { label: 'Dòng thiếu kho', value: formatNumber(shortages), status: shortages ? 'danger' : 'good' },
      { label: 'Tỷ lệ TB', value: rows.length ? `${(sumRows(rows, ['Tỷ lệ thất thoát']) / rows.length).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%` : '0%', status: rows.length ? 'warning' : 'neutral' }
    ],
    primary: { title: 'Bảng thất thoát tồn kho', headers, rows: tableRows(enrichedRows, headers, keys) },
    secondary: topValueRows(rows, ['NVL', 'Tên nguyên vật liệu', 'Kho'], ['Giá trị thất thoát', 'Giá trị lệch', 'Giá trị chênh lệch'], 'Top thất thoát theo tiền'),
    readiness: sourceReadiness(sources),
    issues: missingIssues(sources, shortages ? [['2', 'Thất thoát tồn kho', 'Nguy hiểm', 'Yêu cầu giải trình và kiểm kê lại các dòng thiếu kho']] : [])
  };
}
