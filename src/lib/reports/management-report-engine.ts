import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { isActiveDataRow, normalizeText, parseDateToUtc, type ReportFilters } from './report-filters';

type Row = Record<string, unknown>;
type ReportPeriod = 'day' | 'week' | 'month';

export type ManagementReportTables = {
  statusRows: string[][];
  comparisonRows: string[][];
  closeConditionRows: string[][];
  actionRows: string[][];
};

function pick(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  const entries = Object.entries(row);
  for (const key of keys) {
    const target = normalizeText(key);
    const found = entries.find(([candidate, value]) => normalizeText(candidate) === target && String(value ?? '').trim() !== '');
    if (found) return found[1];
  }
  return '';
}

function num(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  let text = String(value ?? '').replace(/\s/g, '').replace(/đ|vnd/gi, '').replace(/%/g, '');
  if (text.includes(',') && text.includes('.')) text = text.replace(/\./g, '').replace(/,/g, '.');
  else if (text.includes(',')) text = text.replace(/,/g, '');
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberFrom(row: Row, keys: string[]) {
  return num(pick(row, keys));
}

function sum(rows: Row[], keys: string[]) {
  return rows.reduce((total, row) => total + numberFrom(row, keys), 0);
}

function money(value: number) {
  if (!Number.isFinite(value)) return '—';
  return Math.round(value).toLocaleString('vi-VN');
}

function pct(value: number) {
  if (!Number.isFinite(value)) return '—';
  return `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`;
}

function rowDate(row: Row) {
  return parseDateToUtc(pick(row, ['Ngày', 'ngay', 'Ngày bán', 'Ngày kiểm kê', 'Ngày import', 'Thời gian', 'updated_at']));
}

function isoWeekCode(utc: number) {
  const date = new Date(utc);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const year = date.getUTCFullYear();
  const week1 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getUTCDay() + 6) % 7)) / 7);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

function periodKey(row: Row, period: ReportPeriod) {
  const explicit = String(pick(row, ['Kỳ báo cáo', 'ky_bao_cao', 'Mã tuần', 'period_code'])).trim();
  if (period === 'week' && /^\d{4}-W\d{1,2}$/i.test(explicit)) {
    const [year, week] = explicit.toUpperCase().split('-W');
    return `${year}-W${String(Number(week)).padStart(2, '0')}`;
  }
  const utc = rowDate(row);
  if (utc === null) return explicit;
  const date = new Date(utc);
  if (period === 'day') return date.toISOString().slice(0, 10);
  if (period === 'month') return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  return isoWeekCode(utc);
}

function previousKey(key: string, period: ReportPeriod) {
  if (period === 'day') {
    const date = new Date(`${key}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) return '';
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
  }
  if (period === 'month') {
    const match = key.match(/^(\d{4})-(\d{2})$/);
    if (!match) return '';
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 2, 1));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  const match = key.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), 0, 4 + (Number(match[2]) - 1) * 7));
  date.setUTCDate(date.getUTCDate() - 7);
  return isoWeekCode(date.getTime());
}

async function safeRead(sheetName: string) {
  try {
    return (await getDataStore().read(sheetName)).filter(isActiveDataRow);
  } catch {
    return [] as Row[];
  }
}

function pickCurrentKey(allRows: Row[], period: ReportPeriod, filters: ReportFilters) {
  if (period === 'week' && filters.weekCode) return filters.weekCode.toUpperCase().replace(/-W(\d)$/i, '-W0$1');
  if (filters.fromDate) {
    const utc = parseDateToUtc(filters.fromDate);
    if (utc !== null) {
      const fake = { Ngày: new Date(utc).toISOString().slice(0, 10) };
      return periodKey(fake, period);
    }
  }
  const keys = allRows.map((row) => periodKey(row, period)).filter(Boolean).sort();
  return keys[keys.length - 1] ?? '';
}

function rowsFor(rows: Row[], period: ReportPeriod, key: string, filters: ReportFilters) {
  return rows.filter((row) => {
    if (key && periodKey(row, period) !== key) return false;
    if (filters.branch) {
      const branch = normalizeText(pick(row, ['Chi nhánh', 'Cửa hàng', 'branch', 'cua_hang']));
      const expected = normalizeText(filters.branch);
      if (branch && branch !== expected && !branch.includes(expected) && !expected.includes(branch)) return false;
    }
    return true;
  });
}

function compareRow(group: string, metric: string, unit: string, current: number, previous: number, status: string) {
  const diff = current - previous;
  const diffText = unit === '%' ? pct(diff) : money(diff);
  const currentText = unit === '%' ? pct(current) : money(current);
  const previousText = previous ? (unit === '%' ? pct(previous) : money(previous)) : '—';
  return [group, metric, unit, currentText, previousText, previous ? diffText : '—', previous ? pct((diff / Math.abs(previous)) * 100) : '—', status];
}

function cashIn(rows: Row[]) {
  return rows.filter((row) => normalizeText(pick(row, ['Loại giao dịch'])).includes('thu') || numberFrom(row, ['Số tiền', 'Giá trị']) > 0).reduce((total, row) => total + Math.abs(numberFrom(row, ['Số tiền', 'Giá trị'])), 0);
}

function cashOut(rows: Row[]) {
  return rows.filter((row) => normalizeText(pick(row, ['Loại giao dịch'])).includes('chi') || numberFrom(row, ['Số tiền', 'Giá trị']) < 0).reduce((total, row) => total + Math.abs(numberFrom(row, ['Số tiền', 'Giá trị'])), 0);
}

function overdueDebt(rows: Row[]) {
  return rows.reduce((total, row) => total + Math.abs(numberFrom(row, ['Còn phải trả', 'Phải trả', 'Công nợ đến hạn', 'Quá hạn', 'Dư nợ'])), 0);
}

export async function buildManagementReportTables(period: ReportPeriod, filters: ReportFilters = {}): Promise<ManagementReportTables> {
  const [revenueRows, cashRows, debtRows, storeInventoryRows, bttInventoryRows, lossRows, financeRows] = await Promise.all([
    safeRead(SHEET_NAMES.DATA_DOANH_THU).then(async (rows) => rows.length ? rows : safeRead(SHEET_NAMES.DL_DOANH_THU_CUA_HANG)),
    safeRead(SHEET_NAMES.DATA_SO_QUY).then(async (rows) => rows.length ? rows : safeRead(SHEET_NAMES.DL_SO_QUY)),
    safeRead(SHEET_NAMES.DATA_CONG_NO).then(async (rows) => rows.length ? rows : safeRead(SHEET_NAMES.DL_CONG_NO)),
    safeRead(SHEET_NAMES.DATA_KHO_CUA_HANG).then(async (rows) => rows.length ? rows : safeRead(SHEET_NAMES.DL_XNT_CUA_HANG)),
    safeRead(SHEET_NAMES.DATA_KHO_BTT).then(async (rows) => rows.length ? rows : safeRead(SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM)),
    safeRead(SHEET_NAMES.CALC_HAO_HUT_THAT_THOAT).then(async (rows) => rows.length ? rows : safeRead(SHEET_NAMES.DL_THAT_THOAT_NVL)),
    safeRead(SHEET_NAMES.CALC_TAI_CHINH_DU_TOAN)
  ]);
  const allRows = [...revenueRows, ...cashRows, ...debtRows, ...storeInventoryRows, ...bttInventoryRows, ...lossRows, ...financeRows];
  const currentKey = pickCurrentKey(allRows, period, filters);
  const prevKey = previousKey(currentKey, period);
  const current = {
    revenue: rowsFor(revenueRows, period, currentKey, filters),
    cash: rowsFor(cashRows, period, currentKey, filters),
    debt: rowsFor(debtRows, period, currentKey, filters),
    storeInventory: rowsFor(storeInventoryRows, period, currentKey, filters),
    bttInventory: rowsFor(bttInventoryRows, period, currentKey, filters),
    loss: rowsFor(lossRows, period, currentKey, filters),
    finance: rowsFor(financeRows, period, currentKey, filters)
  };
  const previous = {
    revenue: rowsFor(revenueRows, period, prevKey, filters),
    cash: rowsFor(cashRows, period, prevKey, filters),
    debt: rowsFor(debtRows, period, prevKey, filters),
    storeInventory: rowsFor(storeInventoryRows, period, prevKey, filters),
    bttInventory: rowsFor(bttInventoryRows, period, prevKey, filters),
    loss: rowsFor(lossRows, period, prevKey, filters),
    finance: rowsFor(financeRows, period, prevKey, filters)
  };
  const revenue = sum(current.revenue, ['Doanh thu ròng', 'Doanh thu gộp', 'Doanh thu bán hàng thực', 'Thành tiền', 'Tổng doanh thu']);
  const prevRevenue = sum(previous.revenue, ['Doanh thu ròng', 'Doanh thu gộp', 'Doanh thu bán hàng thực', 'Thành tiền', 'Tổng doanh thu']);
  const currentCashIn = cashIn(current.cash);
  const currentCashOut = cashOut(current.cash);
  const prevCashNet = cashIn(previous.cash) - cashOut(previous.cash);
  const debt = overdueDebt(current.debt);
  const prevDebt = overdueDebt(previous.debt);
  const storeInventoryValue = sum(current.storeInventory, ['Giá trị tồn', 'Giá trị tồn kho', 'Giá trị tồn thực tế']);
  const bttInventoryValue = sum(current.bttInventory, ['Giá trị tồn', 'Giá trị tồn kho', 'Giá trị tồn thực tế']);
  const lossValue = sum(current.loss, ['Giá trị thất thoát', 'Giá trị chênh lệch', 'Giá trị vượt', 'Giá trị hao hụt']);
  const prevLossValue = sum(previous.loss, ['Giá trị thất thoát', 'Giá trị chênh lệch', 'Giá trị vượt', 'Giá trị hao hụt']);
  const foodCostPercent = revenue ? (lossValue / revenue) * 100 : 0;
  const prevFoodCostPercent = prevRevenue ? (prevLossValue / prevRevenue) * 100 : 0;
  const dataSources = [
    ['Doanh thu', current.revenue.length],
    ['Sổ quỹ', current.cash.length],
    ['Công nợ', current.debt.length],
    ['Kho cửa hàng', current.storeInventory.length],
    ['Kho BTT', current.bttInventory.length],
    ['Hao hụt/thất thoát', current.loss.length]
  ];
  const missing = dataSources.filter(([, count]) => Number(count) === 0).map(([name]) => String(name));
  const statusRows = [
    ['Báo cáo doanh thu', currentKey || 'Chưa rõ kỳ', current.revenue.length ? 'Có dữ liệu' : 'Chưa đủ dữ liệu', '04_DATA_DOANH_THU / DL_DOANH_THU_*', 'Kế toán doanh thu', current.revenue.length ? 'Đối chiếu và chốt' : 'Import doanh thu'],
    ['Báo cáo dòng tiền', currentKey || 'Chưa rõ kỳ', current.cash.length ? 'Có dữ liệu' : 'Chưa đủ dữ liệu', '05_DATA_SO_QUY / DL_SO_QUY', 'Kế toán tài chính', current.cash.length ? 'Rà chi lớn và công nợ' : 'Import sổ quỹ'],
    ['Báo cáo kho BTT/CH', currentKey || 'Chưa rõ kỳ', current.storeInventory.length || current.bttInventory.length ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', '08/09/10_DATA_KHO', 'Kế toán kho', 'Đối chiếu tồn, xuất nhận, hủy'],
    ['Báo cáo công nợ/dự toán', currentKey || 'Chưa rõ kỳ', current.debt.length || current.finance.length ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', '06_DATA_CONG_NO / 14_CALC_TAI_CHINH_DU_TOAN', 'Kế toán tài chính', 'Rà công nợ đến hạn và thiếu tiền']
  ];
  const comparisonRows = [
    compareRow('Doanh thu', period === 'month' ? 'Tổng doanh thu tháng' : period === 'day' ? 'Tổng doanh thu ngày' : 'Tổng doanh thu tuần', 'VND', revenue, prevRevenue, current.revenue.length ? 'Tốt' : 'Chưa đủ dữ liệu'),
    compareRow('Dòng tiền', 'Dòng tiền hiện tại', 'VND', currentCashIn - currentCashOut, prevCashNet, current.cash.length ? (currentCashIn >= currentCashOut ? 'Tốt' : 'Cảnh báo') : 'Chưa đủ dữ liệu'),
    compareRow('Công nợ', 'Công nợ đến hạn', 'VND', debt, prevDebt, current.debt.length ? (debt ? 'Cần đối chiếu' : 'Tốt') : 'Chưa đủ dữ liệu'),
    compareRow('Kho', 'Giá trị tồn kho cửa hàng', 'VND', storeInventoryValue, sum(previous.storeInventory, ['Giá trị tồn', 'Giá trị tồn kho', 'Giá trị tồn thực tế']), current.storeInventory.length ? 'Cần kiểm' : 'Chưa đủ dữ liệu'),
    compareRow('Kho BTT', 'Giá trị tồn kho BTT', 'VND', bttInventoryValue, sum(previous.bttInventory, ['Giá trị tồn', 'Giá trị tồn kho', 'Giá trị tồn thực tế']), current.bttInventory.length ? 'Cần kiểm' : 'Chưa đủ dữ liệu'),
    compareRow('Hao hụt', 'Giá trị thất thoát định mức', 'VND', lossValue, prevLossValue, current.loss.length ? (lossValue ? 'Cảnh báo' : 'Tốt') : 'Chưa đủ dữ liệu'),
    compareRow('Hao hụt', 'Tỷ lệ chi phí/thất thoát theo doanh thu', '%', foodCostPercent, prevFoodCostPercent, revenue && current.loss.length ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu')
  ];
  const dqScore = Math.max(0, 100 - missing.length * 12);
  const redTaskCount = missing.length + (currentCashOut > currentCashIn && current.cash.length ? 1 : 0) + (lossValue > 0 ? 1 : 0);
  const closeConditionRows = [
    ['Data Quality', `${dqScore}/100`, dqScore >= 80 ? 'Tốt' : dqScore >= 60 ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', missing.length ? `Thiếu ${missing.join(', ')}` : 'Đủ nguồn chính'],
    ['Nguồn thiếu', String(missing.length), missing.length ? 'Cần bổ sung' : 'Tốt', missing.join(', ') || 'Không'],
    ['Task đỏ', String(redTaskCount), redTaskCount ? 'Cần xử lý' : 'Tốt', redTaskCount ? 'Xử lý hoặc chốt có ngoại lệ' : 'Có thể chốt'],
    ['Kết luận chốt', dqScore >= 80 && redTaskCount === 0 ? 'Có thể chốt' : 'Chốt có ngoại lệ', dqScore >= 80 && redTaskCount === 0 ? 'Tốt' : 'Cần đối chiếu', currentKey || 'Chưa rõ kỳ']
  ];
  const actionRows = [
    ...missing.map((source, index) => [String(index + 1), `Bổ sung nguồn ${source}`, 'Kế toán', 'Hôm nay', 'Import hoặc ghi lý do ngoại lệ']),
    ...(currentCashOut > currentCashIn && current.cash.length ? [[String(missing.length + 1), 'Dòng tiền âm trong kỳ', 'Kế toán tài chính', 'Hôm nay', 'Rà chi lớn/công nợ đến hạn']] : []),
    ...(lossValue > 0 ? [[String(missing.length + 2), 'Có thất thoát/hao hụt quy tiền', 'Kế toán kho', 'Hôm nay', 'Đối chiếu định mức, tồn kho, chứng từ hủy']] : [])
  ];
  return {
    statusRows,
    comparisonRows,
    closeConditionRows,
    actionRows: actionRows.length ? actionRows : [['1', 'Không có việc đỏ từ dữ liệu hiện tại', 'Kế toán', 'Theo dõi', 'Tiếp tục rà số liệu theo kỳ']]
  };
}
