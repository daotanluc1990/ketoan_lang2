import { describe, expect, it } from 'vitest';
import * as XLSX from '@e965/xlsx';
import { parseExcelFile } from '../excel-parsers';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

function workbookBuffer(sheetName: string, rows: unknown[][]) {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), sheetName);
  return Buffer.from(XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' }) as Buffer);
}

describe('parseExcelFile', () => {
  it('parses store revenue file into DL_DOANH_THU_CUA_HANG rows', () => {
    const buffer = workbookBuffer('Sheet1', [
      ['Tên CH', 'Ngày', 'Năm', 'Tháng', 'Ca', 'Tổng Phần', 'Số Hộp', 'Số Dĩa', 'Tiền Mặt', 'MoMo', 'Chi Tiền Mặt', 'TỔNG DOANH THU'],
      ['CN NVT', '01/06/2026', 2026, 6, 'Ca Sáng', 100, 80, 20, 1000000, 2000000, 100000, 3100000]
    ]);
    const parsed = parseExcelFile({ filename: 'báo cáo doanh thu tại cửa hàng.xlsx', buffer });
    expect(parsed.loaiDuLieu).toBe('Doanh thu cửa hàng');
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_DOANH_THU_CUA_HANG);
    expect(parsed.rows[0].data['Doanh thu bán hàng thực']).toBe(3000000);
  });

  it('parses cashbook file into DL_SO_QUY rows', () => {
    const buffer = workbookBuffer('SoQuy', [
      ['Mã phiếu', 'Thời gian', 'Loại thu chi', 'Người nộp/nhận', 'Giá trị'],
      ['TTM001', '01/06/2026', 'Phiếu thu Doanh thu Tiền mặt - Làng NVT', '', 500000]
    ]);
    const parsed = parseExcelFile({ filename: 'SoQuy.xlsx', buffer });
    expect(parsed.loaiDuLieu).toBe('Sổ quỹ');
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_SO_QUY);
    expect(parsed.rows[0].data['Loại giao dịch']).toBe('Thu');
  });

  it('parses inventory file and marks negative stock', () => {
    const buffer = workbookBuffer('Kho', [
      ['Nhóm quản lý', 'Nhóm hàng (3 Cấp)', 'Mã hàng', 'Tên hàng', 'Giá vốn', 'Tồn kho hiện tại', 'Định mức tồn nhỏ nhất', 'Định mức tồn lớn nhất', 'ĐVT'],
      ['Món sản xuất', 'Nguyên liệu', 'SP001', 'Thịt cốt lết', 100000, -2, 0, 999999999, 'kg']
    ]);
    const parsed = parseExcelFile({ filename: 'DanhSachKhoHang.xlsx', buffer });
    expect(parsed.loaiDuLieu).toBe('Tồn kho');
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_TON_KHO);
    expect(parsed.rows[0].data['Trạng thái tồn âm']).toBe('Tồn âm');
  });
});

  it('parses debt file into DL_CONG_NO rows', () => {
    const buffer = workbookBuffer('CongNo', [
      ['Ngày', 'Nhà cung cấp', 'Phải trả', 'Đã trả', 'Còn phải trả', 'Quá hạn', 'Ghi chú'],
      ['10/06/2026', 'Công ty SiBa Food', 12000000, 5000000, 7000000, 0, 'NCC thịt']
    ]);
    const parsed = parseExcelFile({ filename: 'bao_cao_cong_no.xlsx', buffer });
    expect(parsed.loaiDuLieu).toBe('Công nợ');
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_CONG_NO);
    expect(parsed.rows[0].data['Còn phải trả']).toBe(7000000);
  });

  it('parses purchase file into DL_THU_MUA rows', () => {
    const buffer = workbookBuffer('ThuMua', [
      ['Ngày', 'Mặt hàng', 'NCC', 'Giá tuần trước', 'Giá tuần này', 'Số lượng mua'],
      ['10/06/2026', 'Sườn cốt lết', 'Công ty Vĩnh Tân', 92000, 98000, 50]
    ]);
    const parsed = parseExcelFile({ filename: 'bao_cao_thu_mua.xlsx', buffer });
    expect(parsed.loaiDuLieu).toBe('Thu mua');
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_THU_MUA);
    expect(parsed.rows[0].data['Tác động tiền']).toBe(300000);
  });

  it('parses KiotViet debt report with header after report metadata', () => {
    const buffer = workbookBuffer('BigByLiabilitiesReport', [
      ['', 'Ngày lập25/06/2026 10:26'],
      ['', '', 'Báo cáo công nợ theo nhà cung cấp'],
      ['', 'Từ ngày 01/06/2026 đến ngày 07/06/2026'],
      ['', 'Mã nhà cung cấp', '', 'Tên nhà cung cấp', '', '', 'Nợ đầu kỳ', 'Ghi nợ', 'Ghi có', '', 'Nợ cuối kỳ'],
      ['', 'SL NCC: 2', '', '', '', 0, '', 26491000, 7500000, '', 18991000],
      ['', 'NCC000016', '', 'Nguyên Liệu Ánh LTM', '', '', 0, 11491000, 0, '', 11491000],
      ['', 'NCC000019', '', 'Gạo Tấm Thục Nhi', '', '', 0, 15000000, 7500000, '', 7500000]
    ]);
    const parsed = parseExcelFile({ filename: 'Công nợ.xlsx', buffer });
    const errors = parsed.rows.flatMap((row) => row.errors);

    expect(parsed.loaiDuLieu).toBe('Công nợ');
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_CONG_NO);
    expect(parsed.rows[0].data['Nhà cung cấp/Đối tượng']).toBe('Nguyên Liệu Ánh LTM');
    expect(parsed.rows[0].data['Còn phải trả']).toBe(11491000);
    expect(errors).toHaveLength(0);
  });

  it('parses Xuat Huy KiotViet report as BTT transfer to store, not waste', () => {
    const buffer = workbookBuffer('ProductByDamageItem', [
      ['', 'Ngày lập 25/06/2026 10:09'],
      ['', '', 'Báo cáo hàng hóa xuất hủy'],
      ['', 'Từ ngày 01/06/2026 đến ngày 07/06/2026'],
      ['', 'Chi nhánh: Chi nhánh trung tâm'],
      ['', 'Xuất hủy', '', 'Cửa hàng', 'Làng Nguyễn Văn tăng (NVT)'],
      ['', 'Mã hàng', '', 'Tên hàng', '', '', '', 'Tổng SL hủy', 'Tổng giá trị'],
      ['', 'SL mặt hàng: 2', '', '', '', '', 10, '', 100000],
      ['', 'SP000003', '', 'Sườn cốt lết nướng (kg)', '', '', '', 7.5, 750000],
      ['', 'SP000004', '', 'Chả trứng hấp (kg)', '', '', '', 2.5, 250000]
    ]);
    const parsed = parseExcelFile({ filename: 'Xuất Hủy.xlsx', buffer });
    const errors = parsed.rows.flatMap((row) => row.errors);

    expect(parsed.loaiDuLieu).toBe('BTT xuất cho cửa hàng');
    expect(parsed.rows).toHaveLength(2);
    expect(parsed.rows[0].sheetDich).toBe(SHEET_NAMES.DL_XUAT_BTT_CHO_CUA_HANG);
    expect(parsed.rows[0].data['Cửa hàng']).toBe('Làng Nguyễn Văn tăng (NVT)');
    expect(parsed.rows[0].data['Kho xuất']).toBe('Bếp Trung Tâm');
    expect(parsed.rows[0].data['Số lượng xuất']).toBe(7.5);
    expect(parsed.rows[0].data['Giá trị xuất']).toBe(750000);
    expect(errors).toHaveLength(0);
  });
