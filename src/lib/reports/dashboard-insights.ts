import type { DashboardReport } from '@/lib/reports/report-aggregator';
import type { Alert } from '@/components/charts/AlertPanel';
import type { MoverItem } from '@/components/charts/TopMoversBarChart';
import type { TrendPoint } from '@/components/charts/TrendLineChart';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

// === 4 trends mới (Phase 2 charts) ===

/**
 * Trend chi phí theo nhóm (từ sổ quỹ groupRows).
 * Hiển thị cơ cấu chi phí: NVL, nhân sự, vận hành, marketing...
 */
export function buildExpenseStructure(report: DashboardReport): MoverItem[] {
  return report.cashbookGroupRows
    .filter((row) => parseMoney(row[3]) > 0) // cột cashOut > 0
    .slice(0, 8)
    .map((row) => ({
      label: String(row[0] ?? 'Nhóm khác'),
      value: parseMoney(row[3]),
      caption: `${row[1]} giao dịch`,
      trend: 'down' as const,
    }));
}

/**
 * Top NVL thất thoát/hao hụt cao nhất (từ lossTop5Rows).
 * Giúp CEO thấy nguyên liệu nào đang thất thoát nhiều.
 */
export function buildLossTrend(report: DashboardReport): MoverItem[] {
  return report.lossTop5Rows
    .map((row) => ({
      label: String(row[0] ?? 'NVL'),
      value: parseMoney(row[3]),
      caption: `${row[2]} ${row[1]} · ${row[4]}`,
      trend: 'down' as const,
    }))
    .filter((item) => item.value > 0);
}

/**
 * Cơ cấu doanh thu theo kênh (từ revenueByChannel).
 * Tiền mặt, chuyển khoản, app giao hàng...
 */
export function buildRevenueMix(report: DashboardReport): MoverItem[] {
  return report.revenueByChannel.map((ch) => ({
    label: ch.channel,
    value: ch.value,
    caption: ch.revenue,
    trend: 'up' as const,
  }));
}

/**
 * Xu hướng dòng tiền multi-series (cho dashboard CEO).
 * Trả data cho 3 line: cashIn, cashOut, net theo ngày.
 */
export function buildCashflowTrend(report: DashboardReport): TrendPoint[] {
  return buildTrendData(report);
}

/**
 * Sinh danh sách cảnh báo + đề xuất từ DashboardReport.
 * Dựa trên các ngưỡng nghiệp vụ kế toán F&B.
 */
export function generateAlerts(report: DashboardReport): Alert[] {
  const alerts: Alert[] = [];
  const t = report.totals;

  // 1. Tồn âm
  if (t.negativeStockCount > 0) {
    alerts.push({
      severity: 'critical',
      category: 'Tồn kho',
      title: `${t.negativeStockCount} mặt hàng tồn âm`,
      detail: `Giá trị tồn kho hiện tại ${formatMoney(t.inventoryValue)}. Có ${t.negativeStockCount} NVL có tồn < 0 — xuất nhiều hơn nhập.`,
      suggestion: 'Kiểm kê lại kho, đối chiếu phiếu xuất BTT và số bán theo định mức. Có thể thiếu phiếu nhập NCC.',
    });
  }

  // 2. Thất thoát vượt ngưỡng (> 1% doanh thu hoặc > 5tr)
  if (t.lossValue > 5_000_000 || (t.revenue > 0 && t.lossValue / t.revenue > 0.01)) {
    alerts.push({
      severity: 'critical',
      category: 'Thất thoát',
      title: `Thất thoát ${formatMoney(t.lossValue)}`,
      detail: `Vượt ngưỡng 5tr hoặc 1% doanh thu. Cần chốt lý do và người phụ trách.`,
      suggestion: 'Đối chiếu định mức NVL với số bán thực tế, kiểm tra quy trình sơ chế và ghi nhận hao hụt.',
    });
  }

  // 3. % phí app cao
  if (t.appGross > 0 && t.appFeePercent > 0.25) {
    alerts.push({
      severity: 'warning',
      category: 'App giao hàng',
      title: `Phí app ${(t.appFeePercent * 100).toFixed(0)}% doanh thu gộp`,
      detail: `Phí app ${formatMoney(t.appFees)} trên doanh thu gộp ${formatMoney(t.appGross)}. Ngưỡng bình thường 18-22%.`,
      suggestion: 'Đàm phán lại tỷ lệ chiết khấu với app, hoặc đẩy mạnh kênh trực tiếp (tiền mặt, Zalo) để giảm phụ thuộc.',
    });
  }

  // 4. Chi lớn bất thường
  if (t.biggestCashOut > 50_000_000) {
    alerts.push({
      severity: 'warning',
      category: 'Dòng tiền',
      title: `Phiếu chi lớn ${formatMoney(t.biggestCashOut)}`,
      detail: `Có phiếu chi vượt 50tr. Tổng tiền ra kỳ này ${formatMoney(t.cashOut)}.`,
      suggestion: 'Kế toán đối chiếu chứng từ, xác nhận có duyệt CEO không, ghi rõ mục đích chi.',
    });
  }

  // 5. % giá vốn cao
  if (t.revenue > 0 && t.cogsPercent > 0.4) {
    alerts.push({
      severity: 'warning',
      category: 'Biên lợi nhuận',
      title: `Giá vốn ${(t.cogsPercent * 100).toFixed(0)}% doanh thu`,
      detail: `Tổng giá vốn + thất thoát ${formatMoney(t.appCogs + t.lossValue)} trên doanh thu ${formatMoney(t.revenue)}. Ngưỡng F&B 30-35%.`,
      suggestion: 'Kiểm tra giá mua NVL, định mức chế biến, tỷ lệ hao hụt hợp lệ. Có thể cần điều giá bán.',
    });
  }

  // 6. Dòng tiền âm
  if (t.cashIn > 0 && t.cashOut > t.cashIn) {
    alerts.push({
      severity: 'critical',
      category: 'Dòng tiền',
      title: `Chi vượt thu ${formatMoney(t.cashOut - t.cashIn)}`,
      detail: `Tiền vào ${formatMoney(t.cashIn)}, tiền ra ${formatMoney(t.cashOut)}. Dòng tiền tạm âm.`,
      suggestion: 'Cắt chi không cần thiết, thu hồi công nợ, xem lại kỳ thanh toán NCC.',
    });
  }

  // 7. Data quality
  if (report.missingSources.length > 0) {
    alerts.push({
      severity: 'info',
      category: 'Data Quality',
      title: `Thiếu ${report.missingSources.length} nguồn dữ liệu`,
      detail: `Còn thiếu: ${report.missingSources.join(', ')}. Dashboard chưa chốt đầy đủ.`,
      suggestion: 'Import các file còn thiếu trước khi chốt báo cáo kỳ.',
    });
  }

  // 8. Số dư tiền mặt thấp
  if (t.cashEnding > 0 && t.cashEnding < 50_000_000) {
    alerts.push({
      severity: 'info',
      category: 'Thanh khoản',
      title: `Số dư tiền mặt thấp ${formatMoney(t.cashEnding)}`,
      detail: `Dưới ngưỡng an toàn 50tr cho vận hành F&B.`,
      suggestion: 'Chuẩn bị quỹ dự phòng hoặc đôn đốc thu hồi công nợ để duy trì thanh khoản.',
    });
  }

  return alerts;
}

/**
 * Convert cashbookDailyRows → data cho TrendLineChart.
 * Format row: [date, count, cashIn, cashOut, net, status]
 */
export function buildTrendData(report: DashboardReport): TrendPoint[] {
  return report.cashbookDailyRows
    .filter((row) => row[0] && row[2] !== '—')
    .map((row) => {
      const dateStr = String(row[0] ?? '');
      const shortDate = dateStr.length >= 10 ? dateStr.slice(5) : dateStr; // MM-DD
      return {
        label: shortDate,
        cashIn: parseMoney(row[2]),
        cashOut: parseMoney(row[3]),
        net: parseMoney(row[4]),
      };
    })
    .slice(-30); // 30 ngày gần nhất
}

/**
 * Sinh top movers từ lossTop5Rows + cashbookTopOutRows.
 */
export function buildTopMovers(report: DashboardReport): { losses: MoverItem[]; cashOut: MoverItem[]; channels: MoverItem[] } {
  const losses: MoverItem[] = report.lossTop5Rows
    .filter((row) => parseMoney(row[3]) > 0)
    .map((row) => ({
      label: String(row[0] ?? 'NVL không tên'),
      value: parseMoney(row[3]),
      caption: `${row[2]} ${row[1]}`,
      trend: 'down' as const,
    }));

  const cashOut: MoverItem[] = report.cashbookTopOutRows
    .filter((row) => parseMoney(String(row[row.length - 2] ?? row[3])) > 0)
    .slice(0, 5)
    .map((row) => ({
      label: String(row[2] ?? row[1] ?? 'Chi phí'),
      value: parseMoney(String(row[row.length - 2] ?? row[3])),
      caption: String(row[0] ?? ''),
      trend: 'down' as const,
    }));

  const channels: MoverItem[] = report.revenueByChannel.map((ch) => ({
    label: ch.channel,
    value: ch.value,
    caption: ch.revenue,
    trend: 'up' as const,
  }));

  return { losses, cashOut, channels };
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} tỷ`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}tr`;
  return `${Math.round(value).toLocaleString('vi-VN')}đ`;
}

function parseMoney(value: unknown): number {
  if (typeof value === 'number') return value;
  let str = String(value ?? '').trim().toLowerCase();
  if (!str || str === '—' || str === '-') return 0;
  // Format Việt: "1,8 tỷ", "963,4tr", "807.750đ", "641.667.000"
  let multiplier = 1;
  if (str.includes('tỷ') || str.includes('ty ')) { multiplier = 1_000_000_000; str = str.replace(/[tỹty]/g, '').trim(); }
  else if (str.includes('tr')) { multiplier = 1_000_000; str = str.replace(/tr/g, '').trim(); }
  else if (str.includes('k')) { multiplier = 1_000; str = str.replace(/k/g, '').trim(); }
  else if (str.includes('đ')) { str = str.replace(/đ/g, '').trim(); }
  // Chuẩn hóa: bỏ dấu chấm phân cách nghìn, đổi comma thành dấu thập phân
  str = str.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(str.replace(/[^\d.-]/g, ''));
  return Number.isFinite(num) ? num * multiplier : 0;
}

// === Async helpers: đọc lịch sử nhiều tuần từ CALC tabs + NCC tăng giá ===
// Các hàm này đọc trực tiếp Google Sheet (DashboardReport chỉ chứa snapshot 1 kỳ).

async function safeReadSheet(sheetName: string) {
  try { return await getDataStore().read(sheetName); } catch { return [] as Record<string, unknown>[]; }
}

/**
 * P&L theo tuần: doanh thu thực, chi biến đổi, chi cố định, dòng tiền.
 * Đọc từ 14_CALC_TAI_CHINH_DU_TOAN (nhiều dòng = nhiều tuần).
 */
export async function buildPnLWeeklyTrend(): Promise<TrendPoint[]> {
  const rows = await safeReadSheet(SHEET_NAMES.CALC_TAI_CHINH_DU_TOAN);
  return rows
    .map((row) => ({
      label: String(row['ky_bao_cao'] ?? ''),
      doanhThu: parseMoney(row['doanh_thu_thuc_te']),
      chiBienDoi: parseMoney(row['chi_bien_doi_du_toan']),
      chiCoDinh: parseMoney(row['chi_co_dinh_du_toan']),
      dongTien: parseMoney(row['so_du_cuoi_ky']),
    }))
    .filter((p) => p.label);
}

/**
 * Giá trị tồn kho theo tuần (tổng). Đọc từ 12_CALC_TON_KHO, gom theo ky_bao_cao.
 */
export async function buildInventoryWeeklyTrend(): Promise<TrendPoint[]> {
  const rows = await safeReadSheet(SHEET_NAMES.CALC_TON_KHO);
  const byWeek = new Map<string, number>();
  for (const row of rows) {
    const ky = String(row['ky_bao_cao'] ?? '');
    if (!ky) continue;
    const giaTri = parseMoney(row['gia_tri_lech']) + parseMoney(row['ton_cuoi_chot']);
    byWeek.set(ky, (byWeek.get(ky) ?? 0) + giaTri);
  }
  return [...byWeek.entries()].map(([label, tonKho]) => ({ label, tonKho }));
}

/**
 * Thất thoát theo tuần (giá trị). Đọc từ 13_CALC_HAO_HUT_THAT_THOAT, gom theo ky_bao_cao.
 */
export async function buildLossWeeklyTrend(): Promise<TrendPoint[]> {
  const rows = await safeReadSheet(SHEET_NAMES.CALC_HAO_HUT_THAT_THOAT);
  const byWeek = new Map<string, { tien: number; tyLe: number; count: number }>();
  for (const row of rows) {
    const ky = String(row['ky_bao_cao'] ?? '');
    if (!ky) continue;
    const giaTri = parseMoney(row['gia_tri_vuot_dinh_muc']);
    const tyLe = parseMoney(row['ty_le_vuot_dinh_muc']);
    const prev = byWeek.get(ky) ?? { tien: 0, tyLe: 0, count: 0 };
    byWeek.set(ky, { tien: prev.tien + giaTri, tyLe: prev.tyLe + tyLe, count: prev.count + 1 });
  }
  return [...byWeek.entries()].map(([label, v]) => ({
    label,
    giaTri: v.tien,
    tyLe: v.count ? v.tyLe / v.count : 0,
  }));
}

/**
 * Chi phí nhân sự theo tuần. Đọc từ 07_DATA_NHAN_SU_LUONG, gom theo ky_luong.
 */
export async function buildPayrollWeeklyTrend(): Promise<TrendPoint[]> {
  const rows = await safeReadSheet(SHEET_NAMES.DATA_NHAN_SU_LUONG);
  const byWeek = new Map<string, number>();
  for (const row of rows) {
    const ky = String(row['ky_luong'] ?? '');
    if (!ky) continue;
    byWeek.set(ky, (byWeek.get(ky) ?? 0) + parseMoney(row['thuc_nhan']));
  }
  return [...byWeek.entries()].map(([label, luong]) => ({ label, luong }));
}

/**
 * NCC tăng giá — đọc từ DATA_NCC_TANG_GIA.
 * Trả rows cho ReportTable: [NCC, mặt hàng, đơn giá cũ→mới, tỷ lệ tăng, ảnh hưởng, mức].
 */
export async function buildSupplierPriceAlerts(): Promise<string[][]> {
  const rows = await safeReadSheet('DATA_NCC_TANG_GIA');
  if (!rows.length) return [];
  return rows.map((row) => [
    String(row['ten_ncc'] ?? ''),
    String(row['ten_hang'] ?? ''),
    `${parseMoney(row['don_gia_cu']).toLocaleString('vi-VN')}đ → ${parseMoney(row['don_gia_moi']).toLocaleString('vi-VN')}đ`,
    String(row['ty_le_tang'] ?? ''),
    String(row['anh_huong_chi'] ?? ''),
    String(row['muc_canh_bao'] ?? ''),
    String(row['ghi_chu'] ?? ''),
  ]);
}
