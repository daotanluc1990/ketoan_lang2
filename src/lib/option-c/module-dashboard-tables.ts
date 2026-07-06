import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import type { OptionCPage } from './catalog';
import { getSubtabDashboardSpec } from './subtab-dashboard-spec';
import { buildTheoreticalIngredientRows } from '@/lib/reports/v7/report-engines';

type Row = Record<string, unknown>;

export type ModuleDashboardTable = {
  title: string;
  headers: string[];
  rows: string[][];
};

function text(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function num(value: unknown) {
  const parsed = Number(String(value ?? '').replace(/\s/g, '').replace(/đ|vnd/gi, '').replace(/,/g, '').replace(/%/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function number(row: Row, keys: string[]) {
  return num(text(row, keys));
}

function money(value: number) {
  return value ? value.toLocaleString('vi-VN') : '0';
}

function pct(value: number) {
  return Number.isFinite(value) ? `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%` : '—';
}

function previousNumber(row: Row) {
  const value = text(row, ['Kỳ trước', 'Tuần trước', 'T24', 'Giá trị T24', 'Nợ cuối T24', 'so_sanh_ky_truoc', 'ky_truoc']);
  return value ? num(value) : null;
}

function currentNumber(row: Row) {
  return number(row, [
    'gia_tri',
    'Giá trị',
    'Số tiền',
    'Thành tiền',
    'Doanh thu',
    'Doanh thu app',
    'Tiền thực nhận',
    'Còn phải trả',
    'Thực nhận',
    'Giá trị thất thoát',
    'Giá trị lệch'
  ]);
}

function compareText(row: Row, type: 'previous' | 'diff' | 'pct') {
  if (type === 'previous') return text(row, ['Kỳ trước', 'Tuần trước', 'T24', 'Giá trị T24', 'Nợ cuối T24', 'so_sanh_ky_truoc']) || '—';
  const explicit = text(row, type === 'diff' ? ['Chênh lệch', 'chenh_lech'] : ['% thay đổi', 'ty_le_thay_doi']);
  if (explicit) return explicit;
  const previous = previousNumber(row);
  if (previous === null) return '—';
  const diff = currentNumber(row) - previous;
  if (type === 'diff') return money(diff);
  return previous ? pct((diff / Math.abs(previous)) * 100) : '0%';
}

function norm(value: unknown) {
  return String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

function channelOf(row: Row) {
  const raw = norm(text(row, ['kenh_ban', 'Kênh bán', 'Tài khoản app', 'nguon_file']));
  if (raw.includes('grab')) return 'Grab';
  if (raw.includes('shopee')) return 'ShopeeFood';
  if (raw.includes('befood') || raw.includes('be food') || raw.includes('be-')) return 'BeFood';
  if (raw.includes('xanh')) return 'Xanh';
  return 'Offline';
}

function revenueChannelTable(rows: Row[]): ModuleDashboardTable {
  const channels = ['Offline', 'Grab', 'ShopeeFood', 'BeFood', 'Xanh'];
  const totalRevenue = rows.reduce((sum, row) => sum + number(row, ['doanh_thu_net', 'doanh_thu_gross', 'Doanh thu ròng', 'Doanh thu gộp', 'Doanh thu bán hàng thực']), 0);
  return {
    title: 'Bảng doanh thu theo kênh',
    headers: ['Kênh', 'Doanh thu', 'Số đơn', 'AOV', 'Tỷ trọng %', 'Kỳ trước', 'Chênh lệch', '% thay đổi'],
    rows: channels.map((channel) => {
      const channelRows = rows.filter((row) => channelOf(row) === channel);
      const revenue = channelRows.reduce((sum, row) => sum + number(row, ['doanh_thu_net', 'doanh_thu_gross', 'Doanh thu ròng', 'Doanh thu gộp', 'Doanh thu bán hàng thực']), 0);
      const orders = channelRows.reduce((sum, row) => sum + (number(row, ['so_don', 'Số đơn']) || 1), 0);
      return [channel, money(revenue), String(orders), orders ? money(revenue / orders) : '—', totalRevenue ? pct((revenue / totalRevenue) * 100) : '—', '—', '—', '—'];
    })
  };
}

function inventoryLoss(row: Row) {
  const variance = number(row, ['chenh_lech_ton', 'Lệch', 'Chênh lệch', 'thieu_kho']);
  const unitCost = number(row, ['don_gia_von', 'Đơn giá vốn', 'Đơn giá', 'Giá vốn']);
  const theoretical = Math.abs(number(row, ['ton_ly_thuyet', 'Tồn lý thuyết']));
  const base = theoretical || Math.abs(number(row, ['ton_dau', 'Tồn đầu']) + number(row, ['tong_nhap', 'Nhập', 'Nhập NCC', 'Nhập từ BTT']));
  const shortage = variance < 0 ? Math.abs(variance) : 0;
  return {
    value: shortage && unitCost ? money(shortage * unitCost) : '—',
    ratio: shortage && base ? pct((shortage / base) * 100) : '—'
  };
}

const aliases: Record<string, string[]> = {
  'Tên file': ['ten_file', 'Tên file', 'file_name'],
  'Loại dữ liệu': ['loai_du_lieu', 'Loại dữ liệu', 'module'],
  'Sheet đích': ['sheet_dich', 'Sheet đích', 'target_sheet', 'sheetName', 'sheet_name'],
  'Kỳ báo cáo': ['ky_bao_cao', 'Kỳ báo cáo', 'period_code'],
  'Chi nhánh': ['chi_nhanh', 'Chi nhánh', 'branch', 'Cửa hàng'],
  'Người upload': ['nguoi_upload', 'Người upload', 'actor'],
  'Tổng dòng': ['tong_dong', 'Tổng dòng', 'row_count', 'Số dòng đọc được'],
  'Số dòng đọc được': ['so_dong_doc_duoc', 'Số dòng đọc được', 'row_count'],
  'Số dòng lỗi': ['so_dong_loi', 'Số dòng lỗi', 'error_count'],
  'Dòng mới': ['dong_moi', 'Dòng mới', 'new_rows', 'Tổng dòng mới'],
  'Dòng trùng': ['dong_trung', 'Dòng trùng', 'du_lieu_trung', 'duplicate_rows'],
  'Dòng lệch': ['dong_lech', 'Dòng lệch', 'du_lieu_lech', 'mismatch_rows'],
  'Trạng thái import': ['trang_thai_import', 'Trạng thái import', 'status'],
  'Ghi chú lỗi': ['ghi_chu_loi', 'Ghi chú lỗi', 'error'],
  'Hành động đề xuất': ['hanh_dong_de_xuat', 'Hành động đề xuất', 'action', 'Hành động'],
  'Import ID': ['ma_lan_import', 'Mã lần import', 'Import ID', 'import_id'],
  'Batch ID': ['batch_id', 'Batch ID', 'Mã batch'],
  'Thời gian': ['thoi_gian', 'Thời gian', 'created_at', 'updated_at'],
  'Loại file': ['loai_file', 'Loại file', 'Loại dữ liệu'],
  'Người import': ['nguoi_import', 'Người import', 'actor'],
  'Dòng hợp lệ': ['dong_hop_le', 'Dòng hợp lệ', 'valid_rows'],
  'Dòng lỗi': ['dong_loi', 'Dòng lỗi', 'error_rows'],
  'Trạng thái rollback': ['trang_thai_rollback', 'Trạng thái rollback', 'rollback_status', 'Rollback'],
  'Link log': ['link_log', 'Link log', 'link_chi_tiet'],
  'Nguồn dữ liệu': ['nguon_du_lieu', 'Nguồn dữ liệu', 'source', 'nguon_sheet'],
  'Module ảnh hưởng': ['module_anh_huong', 'Module ảnh hưởng', 'module'],
  'Dòng/Cột lỗi': ['dong_cot_loi', 'Dòng/Cột lỗi', 'row_column', 'cell'],
  'Giá trị lỗi': ['gia_tri_loi', 'Giá trị lỗi', 'invalid_value'],
  'Mức độ': ['muc_canh_bao', 'Mức độ', 'priority', 'Trạng thái'],
  'Lý do thiếu/lỗi': ['ly_do_thieu_loi', 'Lý do thiếu/lỗi', 'chi_tiet', 'Ghi chú lỗi'],
  'Người phụ trách': ['nguoi_phu_trach', 'Người phụ trách', 'owner'],
  Deadline: ['deadline', 'Deadline', 'han_xu_ly'],
  'Ngày': ['ngay', 'Ngày', 'Ngày bán', 'Ngày hủy', 'ngay_ban'],
  'Ca': ['ca', 'Ca'],
  'Cửa hàng': ['cua_hang', 'Cửa hàng', 'Chi nhánh', 'branch'],
  'Kho/cửa hàng': ['cua_hang', 'ma_kho', 'Kho/cửa hàng', 'Cửa hàng', 'Kho'],
  'Kho/Cửa hàng': ['cua_hang', 'ma_kho', 'Kho/Cửa hàng', 'Cửa hàng', 'Kho'],
  'Tiền hệ thống': ['tien_he_thong', 'Tiền hệ thống', 'doanh_thu_tien_mat', 'doanh_thu_gross'],
  'Tiền thực đếm': ['tien_thuc_dem', 'Tiền thực đếm', 'tien_thuc_nhan'],
  'Người chốt': ['nguoi_chot', 'Người chốt'],
  'Trạng thái xử lý': ['trang_thai_xu_ly', 'Trạng thái xử lý', 'trang_thai', 'Trạng thái'],
  'Biên bản': ['bien_ban', 'Biên bản', 'link_chung_tu'],
  'Mã giao dịch': ['ma_giao_dich', 'Mã giao dịch', 'transaction_id'],
  'Số tiền': ['so_tien', 'Số tiền', 'gia_tri', 'Giá trị'],
  'Nội dung chuyển khoản': ['noi_dung_chuyen_khoan', 'Nội dung chuyển khoản', 'noi_dung'],
  'Đơn hàng liên quan': ['don_hang_lien_quan', 'Đơn hàng liên quan', 'order_id'],
  'Trạng thái đối soát': ['trang_thai_doi_soat', 'Trạng thái đối soát', 'trang_thai'],
  'Ghi chú': ['ghi_chu', 'Ghi chú', 'note'],
  App: ['app', 'App', 'kenh_ban', 'Kênh bán', 'Tài khoản app'],
  'Ngày bán': ['ngay_ban', 'Ngày bán', 'Ngày'],
  'Doanh thu app': ['doanh_thu_app', 'Doanh thu app', 'doanh_thu_net', 'doanh_thu_gross'],
  'Phí app': ['phi_app', 'Phí app', 'commission'],
  'Tiền thực nhận': ['tien_thuc_nhan', 'Tiền thực nhận', 'doanh_thu_net'],
  'Ngày dự kiến về tiền': ['ngay_du_kien_ve_tien', 'Ngày dự kiến về tiền'],
  'Tiền đã về': ['tien_da_ve', 'Tiền đã về'],
  'Mã hàng': ['ma_hang', 'Mã hàng', 'sku'],
  'Tên hàng': ['ten_hang', 'Tên hàng', 'Tên nguyên vật liệu'],
  'Mặt hàng': ['ten_hang', 'Mặt hàng', 'Tên hàng', 'Tên nguyên vật liệu'],
  'ĐVT': ['dvt', 'ĐVT', 'Đơn vị'],
  'Tồn đầu': ['ton_dau', 'Tồn đầu'],
  'Nhập BTT': ['nhap_tu_btt', 'Nhập BTT', 'Nhập từ BTT'],
  'Nhập NCC': ['nhap_ncc', 'Nhập NCC'],
  'Sản xuất/sơ chế': ['san_xuat_so_che', 'Sản xuất/sơ chế', 'Sản xuất', 'Sơ chế'],
  'Bán theo định mức': ['ban_theo_dinh_muc', 'Bán theo định mức', 'so_luong_ban'],
  'Hủy hợp lệ': ['huy_hop_le', 'Hủy hợp lệ', 'Hủy'],
  'Tồn lý thuyết': ['ton_ly_thuyet', 'Tồn lý thuyết'],
  'Kiểm kê thực tế': ['kiem_ke_thuc_te', 'Kiểm kê thực tế', 'Tồn thực tế'],
  'Xuất cửa hàng': ['xuat_btt_cho_cua_hang', 'Xuất cửa hàng', 'Số lượng xuất'],
  'Cửa hàng nhận': ['cua_hang_nhan', 'Cửa hàng nhận', 'Chi nhánh nhận', 'store_receive'],
  'Xác nhận CH': ['xac_nhan_ch', 'Xác nhận CH', 'Trạng thái xác nhận', 'store_confirm_status'],
  'Hủy BTT': ['huy_btt', 'Hủy BTT', 'huy_hop_le_btt'],
  'Tồn thực tế': ['kiem_ke_thuc_te_btt', 'Tồn thực tế', 'kiem_ke_thuc_te'],
  'Số lượng hủy': ['so_luong_huy', 'Số lượng hủy', 'Số lượng'],
  'Giá trị': ['gia_tri', 'Giá trị', 'Thành tiền'],
  'Lý do': ['ly_do', 'Lý do'],
  'Người ghi nhận': ['nguoi_ghi_nhan', 'Người ghi nhận'],
  'Chứng từ/ảnh': ['chung_tu_anh', 'Chứng từ/ảnh', 'link_chung_tu'],
  'Trạng thái duyệt': ['trang_thai_duyet', 'Trạng thái duyệt', 'trang_thai'],
  'Món bán': ['mon_ban', 'Món bán', 'Món'],
  'NVL': ['nvl', 'NVL', 'Tên nguyên vật liệu'],
  'Định mức chuẩn': ['dinh_muc_chuan', 'Định mức chuẩn', 'Định mức'],
  'Hao hụt hợp lệ': ['hao_hut_hop_le', 'Hao hụt hợp lệ'],
  'Số lượng bán': ['so_luong_ban', 'Số lượng bán', 'Sản lượng'],
  'NVL đáng lẽ dùng': ['nvl_dang_le_dung', 'NVL đáng lẽ dùng', 'Được phép dùng'],
  'NVL được phép dùng': ['nvl_duoc_phep_dung', 'NVL được phép dùng', 'Được phép dùng'],
  'NVL thực tế dùng': ['nvl_thuc_te_dung', 'NVL thực tế dùng', 'Thực tế dùng'],
  'Vượt định mức': ['vuot_dinh_muc', 'Vượt định mức', 'Vượt SL'],
  'Giá trị vượt': ['gia_tri_vuot', 'Giá trị vượt'],
  NCC: ['ncc', 'NCC', 'Nhà cung cấp'],
  'Số lượng nhập': ['so_luong_nhap', 'Số lượng nhập', 'Nhập NCC'],
  'Đơn giá': ['don_gia', 'Đơn giá'],
  'Thành tiền': ['thanh_tien', 'Thành tiền', 'Giá trị'],
  'Chứng từ': ['chung_tu', 'Chứng từ', 'link_chung_tu'],
  'Trạng thái kiểm hàng': ['trang_thai_kiem_hang', 'Trạng thái kiểm hàng', 'trang_thai'],
  'Mẻ sản xuất': ['me_san_xuat', 'Mẻ sản xuất', 'Mã mẻ'],
  'NVL đầu vào': ['nvl_dau_vao', 'NVL đầu vào'],
  'Thành phẩm': ['thanh_pham', 'Thành phẩm'],
  'Hao hụt chuẩn': ['hao_hut_chuan', 'Hao hụt chuẩn'],
  'Hao hụt thực tế': ['hao_hut_thuc_te', 'Hao hụt thực tế'],
  'Chênh lệch SL': ['chenh_lech_sl', 'Chênh lệch SL', 'Chênh lệch', 'Lệch'],
  'Giá trị hao hụt (VND)': ['gia_tri_hao_hut', 'Giá trị hao hụt', 'Giá trị thất thoát', 'Giá trị lệch'],
  'Tỷ lệ hao hụt (%)': ['ty_le_hao_hut', 'Tỷ lệ hao hụt', 'Tỷ lệ TT (%)'],
  'NCC tăng giá (%)': ['ncc_tang_gia_pct', 'NCC tăng giá (%)', 'Tăng giá %', '% tăng giá'],
  'Loại nghiệp vụ': ['loai_nghiep_vu', 'Loại nghiệp vụ', 'type'],
  'Nhóm khoản mục': ['nhom_khoan_muc', 'Nhóm khoản mục', 'Nhóm chi'],
  'Nhóm thu/chi': ['nhom_thu_chi', 'Nhóm thu/chi', 'Nhóm chi'],
  'Đơn vị': ['don_vi', 'Đơn vị', 'ĐVT'],
  'Tỷ trọng': ['ty_trong', 'Tỷ trọng'],
  'Xu hướng': ['xu_huong', 'Xu hướng'],
  'Nhóm tài sản/công nợ': ['nhom_tai_san_cong_no', 'Nhóm tài sản/công nợ'],
  'Dự toán': ['du_toan', 'Dự toán', 'budget'],
  'Thực tế': ['thuc_te', 'Thực tế', 'actual'],
  'Dòng tiền hiện tại': ['dong_tien_hien_tai', 'Dòng tiền hiện tại', 'Số dư hiện tại'],
  'Dòng tiền dự kiến': ['dong_tien_du_kien', 'Dòng tiền dự kiến', 'Số dư cuối kỳ dự kiến'],
  'Mức thiếu tiền dự kiến': ['muc_thieu_tien_du_kien', 'Mức thiếu tiền dự kiến', 'Cảnh báo thiếu tiền'],
  'Phải thu': ['phai_thu', 'Phải thu', 'receivable'],
  'Phải trả': ['phai_tra', 'Phải trả', 'payable'],
  'Kỳ dự toán': ['ky_du_toan', 'Kỳ dự toán', 'Kỳ báo cáo'],
  'Doanh thu dự kiến': ['doanh_thu_du_kien', 'Doanh thu dự kiến'],
  'Chi dự kiến': ['chi_du_kien', 'Chi dự kiến'],
  'Công nợ đến hạn': ['cong_no_den_han', 'Công nợ đến hạn'],
  'Số dư đầu kỳ': ['so_du_dau_ky', 'Số dư đầu kỳ'],
  'Số dư cuối kỳ dự kiến': ['so_du_cuoi_ky_du_kien', 'Số dư cuối kỳ dự kiến'],
  'Chênh lệch thực tế/dự toán': ['chenh_lech_thuc_te_du_toan', 'Chênh lệch thực tế/dự toán'],
  'Tỷ lệ chênh lệch thực tế/dự toán (%)': ['ty_le_chenh_lech_thuc_te_du_toan', 'Tỷ lệ chênh lệch thực tế/dự toán (%)', '% chênh lệch dự toán'],
  'Cảnh báo thiếu tiền': ['canh_bao_thieu_tien', 'Cảnh báo thiếu tiền'],
  'Nhân viên': ['nhan_vien', 'Nhân viên', 'Tên nhân viên'],
  'Vai trò': ['vai_tro', 'Vai trò'],
  'Giờ công': ['gio_cong', 'Giờ công'],
  'Đi trễ': ['di_tre', 'Đi trễ'],
  'Loại khoản': ['loai_khoan', 'Loại khoản'],
  'Người duyệt': ['nguoi_duyet', 'Người duyệt'],
  'Số công': ['so_cong', 'Số công'],
  'Lương cơ bản': ['luong_co_ban', 'Lương cơ bản'],
  'Phụ cấp': ['phu_cap', 'Phụ cấp'],
  'Thưởng': ['thuong', 'Thưởng'],
  'Tạm ứng': ['tam_ung', 'Tạm ứng'],
  'Khấu trừ': ['khau_tru', 'Khấu trừ'],
  'Thực nhận': ['thuc_nhan', 'Thực nhận'],
  'Tên tài liệu': ['ten_tai_lieu', 'Tên tài liệu'],
  Module: ['module', 'Module'],
  'Phiên bản': ['phien_ban', 'Phiên bản', 'version'],
  'Link mở': ['link_mo', 'Link mở', 'link'],
  'Tình huống': ['tinh_huong', 'Tình huống'],
  'Cách xử lý': ['cach_xu_ly', 'Cách xử lý'],
  'Khi nào báo CEO': ['khi_nao_bao_ceo', 'Khi nào báo CEO'],
  'Link tài liệu': ['link_tai_lieu', 'Link tài liệu'],
  'Tên biểu mẫu': ['ten_bieu_mau', 'Tên biểu mẫu'],
  'Dùng khi nào': ['dung_khi_nao', 'Dùng khi nào'],
  'Người dùng': ['nguoi_dung', 'Người dùng'],
  'Link tải/mở': ['link_tai_mo', 'Link tải/mở'],
  'Quyền xem': ['quyen_xem', 'Quyền xem'],
  'Quyền sửa': ['quyen_sua', 'Quyền sửa'],
  'Quyền chốt': ['quyen_chot', 'Quyền chốt'],
  'Mã cửa hàng/kho': ['ma_cua_hang_kho', 'Mã cửa hàng/kho', 'ma_kho'],
  Tên: ['ten', 'Tên', 'Tên hàng'],
  Loại: ['loai', 'Loại'],
  'Loại danh mục': ['loai_danh_muc', 'Loại danh mục'],
  Mã: ['ma', 'Mã', 'Mã hàng'],
  'Giá vốn': ['gia_von', 'Giá vốn', 'Đơn giá vốn'],
  'Ngày cập nhật': ['ngay_cap_nhat', 'Ngày cập nhật', 'updated_at']
};

function cell(row: Row, header: string) {
  if (header === 'Kỳ trước') return compareText(row, 'previous');
  if (header === 'Chênh lệch') return compareText(row, 'diff');
  if (header === '% thay đổi') return compareText(row, 'pct');
  if (header === 'Giá trị thất thoát (VND)') return inventoryLoss(row).value;
  if (header === 'Tỷ lệ TT (%)') return inventoryLoss(row).ratio;
  return text(row, aliases[header] ?? [header]) || '—';
}

function rowsFromSpec(rows: Row[], headers: string[], emptyState: string) {
  if (!rows.length) return [[emptyState, ...headers.slice(1).map(() => '—')]];
  return rows.slice(0, 20).map((row) => headers.map((header) => cell(row, header)));
}

function inventoryTable(rows: Row[], title: string): ModuleDashboardTable {
  return {
    title,
    headers: ['Ngày', 'Kho/Cửa hàng', 'Mã hàng', 'Tên hàng', 'Tồn đầu', 'Nhập', 'Xuất/Bán', 'Hủy', 'Tồn LT', 'Tồn TT', 'Lệch', 'Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', 'Kỳ trước', 'Chênh lệch', '% thay đổi', 'Trạng thái'],
    rows: rows.slice(0, 20).map((row) => {
      const loss = inventoryLoss(row);
      return [
        text(row, ['ngay', 'Ngày']),
        text(row, ['cua_hang', 'ma_kho', 'ma_kho_btt', 'Kho', 'Cửa hàng']) || '—',
        text(row, ['ma_hang', 'Mã hàng']),
        text(row, ['ten_hang', 'Tên hàng']),
        text(row, ['ton_dau', 'Tồn đầu']) || '0',
        text(row, ['tong_nhap', 'nhap_tu_btt', 'nhap_ncc', 'Nhập', 'Nhập NCC']) || '0',
        text(row, ['so_luong_ban', 'xuat_btt_cho_cua_hang', 'Xuất cửa hàng']) || '0',
        text(row, ['huy_hop_le', 'huy_hop_le_btt', 'Hủy']) || '0',
        text(row, ['ton_ly_thuyet', 'Tồn lý thuyết']) || '—',
        text(row, ['kiem_ke_thuc_te', 'kiem_ke_thuc_te_btt', 'Tồn thực tế']) || '—',
        text(row, ['chenh_lech_ton', 'Lệch', 'Chênh lệch']) || '—',
        loss.value,
        loss.ratio,
        text(row, ['Kỳ trước', 'Tồn TT kỳ trước']) || '—',
        '—',
        '—',
        text(row, ['trang_thai', 'Trạng thái', 'muc_canh_bao']) || 'Cần kiểm'
      ];
    })
  };
}

function specTable(rows: Row[], title: string, headers: string[], emptyState: string): ModuleDashboardTable {
  return {
    title,
    headers,
    rows: rowsFromSpec(rows, headers, emptyState)
  };
}

function theoreticalIngredientTable(rowsBySheet: Record<string, Row[]>, title: string, headers: string[], emptyState: string): ModuleDashboardTable {
  const salesRows = [
    ...(rowsBySheet[SHEET_NAMES.DATA_DOANH_THU] ?? []),
    ...(rowsBySheet[SHEET_NAMES.DL_DOANH_THU_CUA_HANG] ?? []),
    ...(rowsBySheet[SHEET_NAMES.DL_DOANH_THU_APP] ?? [])
  ];
  const recipeRows = [
    ...(rowsBySheet[SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC] ?? []),
    ...(rowsBySheet[SHEET_NAMES.DM_CONG_THUC_CHE_BIEN] ?? [])
  ];
  const derivedRows = buildTheoreticalIngredientRows(salesRows, recipeRows);
  const rows = derivedRows.length ? derivedRows : recipeRows;
  return specTable(rows, derivedRows.length ? 'NVL dùng từ số lượng bán x công thức' : title, headers, emptyState);
}

function genericComparisonTable(rows: Row[], title: string): ModuleDashboardTable {
  const first = rows[0] ?? {};
  const baseHeaders = Object.keys(first).slice(0, 7);
  const headers = baseHeaders.length ? [...baseHeaders, 'Kỳ trước', 'Chênh lệch', '% thay đổi'] : ['Nguồn', 'Trạng thái', 'Kỳ trước', 'Chênh lệch', '% thay đổi'];
  return {
    title,
    headers,
    rows: rows.length ? rows.slice(0, 20).map((row) => [...baseHeaders.map((header) => text(row, [header]) || '—'), '—', '—', '—']) : [['Chưa có dữ liệu', 'Upload/import file hoặc ghi lý do khi chốt có ngoại lệ', '—', '—', '—']]
  };
}

export function buildModuleDashboardTable(page: OptionCPage, rowsBySheet: Record<string, Row[]>): ModuleDashboardTable {
  const spec = getSubtabDashboardSpec(page);
  const mergedRows = page.sourceSheets.flatMap((sheet) => rowsBySheet[sheet] ?? []);
  if (page.path === '/doanh-thu/app-giao-hang') return revenueChannelTable(rowsBySheet[SHEET_NAMES.DATA_DOANH_THU] ?? mergedRows);
  if (page.path === '/doanh-thu/tien-mat' || page.path === '/doanh-thu/chuyen-khoan') return specTable(mergedRows, spec.table.title, spec.table.headers, spec.emptyState);
  if (page.path === '/kho-cua-hang/ton-kho') return specTable(mergedRows, spec.table.title, spec.table.headers, spec.emptyState);
  if (page.path === '/kho-cua-hang/cong-thuc-dinh-muc') return theoreticalIngredientTable(rowsBySheet, spec.table.title, spec.table.headers, spec.emptyState);
  if (page.path === '/kho-bep-trung-tam/ton-kho-hao-hut') return specTable(mergedRows, spec.table.title, spec.table.headers, spec.emptyState);
  if (page.path in {
    '/nhap-lieu/upload': true,
    '/nhap-lieu/lich-su-import': true,
    '/nhap-lieu/du-lieu-loi-thieu': true,
    '/kho-cua-hang/hang-huy-hu': true,
    '/kho-cua-hang/cong-thuc-dinh-muc': true,
    '/kho-bep-trung-tam/nhap-ncc': true,
    '/kho-bep-trung-tam/san-xuat-cong-thuc': true,
    '/tai-chinh/tong-quan': true,
    '/tai-chinh/dong-tien': true,
    '/tai-chinh/can-doi': true,
    '/tai-chinh/du-toan': true,
    '/luong-nhan-su/cham-cong': true,
    '/luong-nhan-su/tam-ung-thuong-phat': true,
    '/luong-nhan-su/bang-luong': true,
    '/tai-lieu/quy-trinh-checklist': true,
    '/tai-lieu/tinh-huong-phat-sinh': true,
    '/tai-lieu/bieu-mau-bao-cao-mau': true,
    '/he-thong/nguoi-dung-phan-quyen': true,
    '/he-thong/cua-hang-kho': true,
    '/he-thong/danh-muc-nen': true
  }) return specTable(mergedRows, spec.table.title, spec.table.headers, spec.emptyState);
  if (page.path.includes('hang-huy')) return genericComparisonTable(mergedRows, 'Bảng hàng hủy / hư');
  if (page.group === 'TÀI CHÍNH') return genericComparisonTable(mergedRows, 'Bảng tài chính có so sánh kỳ trước');
  if (page.group === 'LƯƠNG & NHÂN SỰ') return genericComparisonTable(mergedRows, 'Bảng lương & nhân sự có so sánh kỳ trước');
  return specTable(mergedRows, spec.table.title, spec.table.headers, spec.emptyState);
}
