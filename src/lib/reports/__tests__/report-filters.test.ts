import { describe, expect, it } from 'vitest';
import { buildReportFilterOptions, filterRowsByReportFilters, parseDateToUtc, parseReportFilters } from '../report-filters';

describe('report filters', () => {
  it('parses URL search params into filter object', () => {
    const filters = parseReportFilters(new URLSearchParams('branch=L%C3%A0ng%20NVT&weekCode=2026-W23&source=S%E1%BB%95%20qu%E1%BB%B9'));
    expect(filters.branch).toBe('Làng NVT');
    expect(filters.weekCode).toBe('2026-W23');
    expect(filters.source).toBe('Sổ quỹ');
  });

  it('parses Vietnamese and ISO dates to the same UTC day', () => {
    expect(parseDateToUtc('01/06/2026')).toBe(parseDateToUtc('2026-06-01'));
  });

  it('filters rows by date, branch, source and channel', () => {
    const rows = [
      { 'Ngày': '01/06/2026', 'Chi nhánh': 'Làng NVT', 'Kênh bán': 'Grab', 'Mã tuần': '2026-W23', 'Mã lần import': 'B1', 'Doanh thu ròng': 100 },
      { 'Ngày': '08/06/2026', 'Chi nhánh': 'Làng Q9', 'Kênh bán': 'ShopeeFood', 'Mã tuần': '2026-W24', 'Mã lần import': 'B2', 'Doanh thu ròng': 200 }
    ];
    const filtered = filterRowsByReportFilters(rows, 'DL_DOANH_THU_APP', { fromDate: '2026-06-01', toDate: '2026-06-07', branch: 'Làng NVT', channel: 'Grab', source: 'Doanh thu app' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]['Doanh thu ròng']).toBe(100);
  });

  it('builds options from real row groups', () => {
    const options = buildReportFilterOptions([
      { sheetName: 'DL_SO_QUY', label: 'Sổ quỹ', rows: [{ 'Chi nhánh': 'Làng NVT', 'Mã tuần': '2026-W23', 'Nhóm thu/chi': 'NVL', 'Người import': 'Kế toán', 'Mã lần import': 'B1' }] }
    ]);
    expect(options.branches[0]?.label).toBe('Làng NVT');
    expect(options.sources[0]?.label).toBe('Sổ quỹ');
    expect(options.costGroups[0]?.label).toBe('NVL');
  });

  it('keeps branch, status and report period options in the right buckets', () => {
    const row = { ky_bao_cao: '2026-W26', cua_hang: 'NVT', trang_thai_dong: 'Preview', trang_thai: 'Đã thanh toán', muc_canh_bao: 'Đỏ' };
    const options = buildReportFilterOptions([{ sheetName: '04_DATA_DOANH_THU', label: 'Doanh thu', rows: [row] }]);

    expect(options.branches.map((option) => option.label)).toContain('NVT');
    expect(options.weeks.map((option) => option.label)).toContain('2026-W26');
    expect(options.dataStatuses.map((option) => option.label)).toEqual(['Chưa xử lý']);
    expect(options.alertStatuses.map((option) => option.label)).toEqual(['Đỏ']);
    expect(filterRowsByReportFilters([row], '04_DATA_DOANH_THU', { branch: 'NVT', weekCode: '2026-W26', dataStatus: 'Chưa xử lý' })).toHaveLength(1);
    expect(filterRowsByReportFilters([row], '04_DATA_DOANH_THU', { dataStatus: 'Chưa xử lý' })).toHaveLength(1);
  });

  it('seeds branch and status choices from 01_CONFIG_MASTER', () => {
    const options = buildReportFilterOptions([
      {
        sheetName: '01_CONFIG_MASTER',
        label: 'Cấu hình master',
        rows: [
          {
            config_type: 'STORE',
            ma: 'CS1',
            ten: 'CS1 · Nguyễn Văn Tăng',
            gia_tri: '{"ma_ch":"CS1","ten_ch":"CS1 · Nguyễn Văn Tăng","alias":["CS1","NVT","Nguyễn Văn Tăng"]}',
            trang_thai: 'active'
          },
          {
            config_type: 'FILTER_OPTION',
            ma: 'TRANG_THAI',
            gia_tri: '{"values":["Tất cả","Đạt","Cảnh báo","Thiếu dữ liệu","Chưa xử lý","Đã xử lý"]}',
            trang_thai: 'active'
          }
        ]
      }
    ]);

    expect(options.branches.map((option) => option.label)).toEqual(['CS1 · Nguyễn Văn Tăng', 'CS1', 'NVT', 'Nguyễn Văn Tăng']);
    expect(options.dataStatuses.map((option) => option.label)).toEqual(['Đạt', 'Cảnh báo', 'Thiếu dữ liệu', 'Chưa xử lý', 'Đã xử lý']);
  });
});
