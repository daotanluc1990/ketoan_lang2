import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

const SHEET_MAP: Record<string, string> = {
  [SHEET_NAMES.DL_DOANH_THU_CUA_HANG]: SHEET_NAMES.DATA_DOANH_THU,
  [SHEET_NAMES.DL_DOANH_THU_APP]: SHEET_NAMES.DATA_DOANH_THU,
  [SHEET_NAMES.DL_SO_QUY]: SHEET_NAMES.DATA_SO_QUY,
  [SHEET_NAMES.DL_CONG_NO]: SHEET_NAMES.DATA_CONG_NO,
  [SHEET_NAMES.DL_XNT_CUA_HANG]: SHEET_NAMES.DATA_KHO_CUA_HANG,
  [SHEET_NAMES.DL_TON_KHO]: SHEET_NAMES.CALC_TON_KHO,
  [SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM]: SHEET_NAMES.DATA_KHO_BTT,
  [SHEET_NAMES.DL_XUAT_BTT_CHO_CUA_HANG]: SHEET_NAMES.DATA_XUAT_BTT_CUA_HANG,
  [SHEET_NAMES.DL_CUA_HANG_NHAN_TU_BTT]: SHEET_NAMES.DATA_XUAT_BTT_CUA_HANG,
  [SHEET_NAMES.DL_HUY_HANG_CUA_HANG]: SHEET_NAMES.DATA_HANG_HUY_KIEM_KE,
  [SHEET_NAMES.DL_HUY_HANG_BTT]: SHEET_NAMES.DATA_HANG_HUY_KIEM_KE,
  [SHEET_NAMES.DL_CHE_BIEN_THUC_TE]: SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC,
  [SHEET_NAMES.DL_THAT_THOAT_NVL]: SHEET_NAMES.CALC_HAO_HUT_THAT_THOAT,
  [SHEET_NAMES.DM_CONG_THUC_CHE_BIEN]: SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC,
  [SHEET_NAMES.DM_HAO_HUT_HOP_LE]: SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC,
  [SHEET_NAMES.KQ_HAO_HUT_CHE_BIEN]: SHEET_NAMES.CALC_HAO_HUT_THAT_THOAT,
  [SHEET_NAMES.KQ_THAT_THOAT_TON_KHO]: SHEET_NAMES.CALC_HAO_HUT_THAT_THOAT,
  [SHEET_NAMES.IMPORT_LICH_SU]: SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG,
  [SHEET_NAMES.IMPORT_DONG_LOI]: SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG,
  [SHEET_NAMES.IMPORT_DU_LIEU_TRUNG]: SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG,
  [SHEET_NAMES.IMPORT_DU_LIEU_LECH]: SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG,
  [SHEET_NAMES.AUDIT_LOG]: SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG,
  [SHEET_NAMES.CAI_DAT_NGUONG]: SHEET_NAMES.CONFIG_MASTER,
  [SHEET_NAMES.CAI_DAT_BOT]: SHEET_NAMES.CONFIG_MASTER,
  [SHEET_NAMES.CEO_DASHBOARD]: SHEET_NAMES.DASHBOARD_REPORT,
  [SHEET_NAMES.TONG_QUAN_KE_TOAN]: SHEET_NAMES.DASHBOARD_REPORT
};

function text(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function numberValue(row: Record<string, unknown>, keys: string[]) {
  const raw = text(row, keys).replace(/\s/g, '').replace(/,/g, '');
  const value = Number(raw);
  return Number.isFinite(value) ? value : '';
}

function base(row: Record<string, unknown>, meta: Record<string, unknown>) {
  return {
    import_batch_id: meta['Mã lần import'],
    nguon_file: text(row, ['Tên file nguồn']) || meta['Tên file nguồn'],
    imported_at: meta['Ngày import'],
    imported_by: meta['Người import'],
    trang_thai_dong: meta['Trạng thái dữ liệu'],
    row_id: meta['Mã dòng dữ liệu'],
    ky_bao_cao: text(row, ['Mã tuần', 'Tuần', 'Kỳ báo cáo']),
    ngay: text(row, ['Ngày', 'Ngày hủy', 'Ngày kiểm kê']),
    cua_hang: text(row, ['Chi nhánh', 'Cửa hàng'])
  };
}

export function mapToOptionCSheet(sheetName: string) {
  return SHEET_MAP[sheetName] ?? (/^\d{2}_/.test(sheetName) ? sheetName : null);
}

export function isOptionCSheet(sheetName: string) {
  return (Object.values(SHEET_NAMES) as string[]).includes(sheetName) && /^\d{2}_/.test(sheetName);
}

export function toOptionCImportRow(sheetName: string, row: Record<string, unknown>, meta: Record<string, unknown>) {
  const common = base(row, meta);
  const target = mapToOptionCSheet(sheetName);

  if (target === SHEET_NAMES.DATA_DOANH_THU) {
    const gross = numberValue(row, ['Doanh thu gộp', 'Tổng doanh thu theo file', 'Doanh thu bán hàng thực']);
    const net = numberValue(row, ['Doanh thu ròng', 'Doanh thu bán hàng thực', 'Tiền mặt còn lại sau chi']);
    return {
      ...common,
      ca_ban: text(row, ['Ca bán']),
      kenh_ban: text(row, ['Kênh bán', 'Tài khoản app']) || 'offline',
      ma_mon: text(row, ['Mã món']),
      ten_mon: text(row, ['Tên món']),
      so_luong_ban: numberValue(row, ['Số lượng bán', 'Số lượng', 'Tổng phần', 'Số hộp', 'Số dĩa', 'Số đơn']),
      doanh_thu_gross: gross || numberValue(row, ['Thành tiền']),
      giam_gia: numberValue(row, ['Giảm giá']),
      phi_app: numberValue(row, ['Tổng khấu trừ/phí', 'Phí app']),
      hoan_huy: numberValue(row, ['Hoàn/hủy', 'Hoàn hủy']),
      doanh_thu_net: net || gross || numberValue(row, ['Thành tiền']),
      tien_thuc_nhan: numberValue(row, ['Tiền mặt', 'MoMo/chuyển khoản', 'Doanh thu ròng', 'Tiền thực nhận', 'Thành tiền']),
      chung_tu: text(row, ['Mã phiếu', 'Chứng từ'])
    };
  }

  if (target === SHEET_NAMES.OPTION_C_DM_CONG_THUC_DINH_MUC) {
    const maMon = text(row, ['ma_mon', 'Mã món', 'Mã hàng']);
    const maNvl = text(row, ['ma_nvl', 'Mã NVL', 'Mã nguyên vật liệu', 'Mã hàng']);
    const tenMon = text(row, ['ten_mon', 'Tên món', 'Món bán', 'Tên hàng']);
    const tenNvl = text(row, ['ten_nvl', 'Tên NVL', 'Tên nguyên vật liệu', 'Nguyên liệu']);
    return {
      import_batch_id: common.import_batch_id,
      nguon_file: common.nguon_file,
      imported_at: common.imported_at,
      imported_by: common.imported_by,
      trang_thai_dong: common.trang_thai_dong,
      ma_cong_thuc: text(row, ['ma_cong_thuc', 'Mã công thức']) || [maMon || tenMon, maNvl || tenNvl].filter(Boolean).join('__'),
      ma_mon: maMon,
      ten_mon: tenMon,
      ma_nvl: maNvl,
      ten_nvl: tenNvl,
      dvt_nvl: text(row, ['dvt_nvl', 'ĐVT', 'Đơn vị tính']),
      dinh_muc_1_don_vi: numberValue(row, ['dinh_muc_1_don_vi', 'Định mức', 'Định mức 1 đơn vị']),
      hao_hut_hop_le_pct: numberValue(row, ['hao_hut_hop_le_pct', 'Hao hụt hợp lệ (%)', 'Hao hụt hợp lệ', 'Tỷ lệ hao hụt']),
      kho_ap_dung: text(row, ['kho_ap_dung', 'Kho áp dụng', 'Kho']),
      kenh_ap_dung: text(row, ['kenh_ap_dung', 'Kênh áp dụng', 'Kênh bán']) || 'Tất cả',
      hieu_luc_tu_ngay: text(row, ['hieu_luc_tu_ngay', 'Hiệu lực từ', 'Hiệu lực từ ngày']),
      trang_thai: text(row, ['trang_thai', 'Trạng thái']) || 'Đang dùng',
      nguoi_duyet: text(row, ['nguoi_duyet', 'Người duyệt']),
      ghi_chu: text(row, ['ghi_chu', 'Ghi chú'])
    };
  }

  if (target === SHEET_NAMES.DATA_SO_QUY) {
    const amount = numberValue(row, ['Số tiền', 'Giá trị']);
    const type = text(row, ['Loại giao dịch', 'Loại thu chi']);
    const isExpense = type.toLowerCase().includes('chi') || Number(amount) < 0;
    return {
      ...common,
      loai_giao_dich: type || (isExpense ? 'Chi' : 'Thu'),
      nhom_thu_chi: text(row, ['Nhóm thu/chi', 'Loại thu chi']),
      noi_dung: text(row, ['Diễn giải', 'Nội dung', 'Ghi chú']),
      so_tien_thu: isExpense ? '' : amount,
      so_tien_chi: isExpense ? Math.abs(Number(amount)) : '',
      phuong_thuc: text(row, ['Phương thức', 'Hình thức thanh toán']),
      doi_tuong: text(row, ['Người tạo', 'Đối tượng']),
      chung_tu: text(row, ['Mã phiếu', 'Số phiếu']),
      nguoi_duyet: text(row, ['Người duyệt'])
    };
  }

  if (target === SHEET_NAMES.DATA_CONG_NO) {
    return {
      ...common,
      loai_cong_no: text(row, ['Nhóm công nợ']) || 'Phải trả NCC',
      doi_tuong: text(row, ['Nhà cung cấp/Đối tượng', 'Nhà cung cấp', 'Đối tượng']),
      ma_doi_tuong: text(row, ['Mã đối tượng', 'Mã NCC']),
      no_dau_ky: numberValue(row, ['Nợ đầu kỳ']),
      phat_sinh_tang: numberValue(row, ['Phải trả', 'Phát sinh tăng']),
      phat_sinh_giam: numberValue(row, ['Đã trả', 'Phát sinh giảm']),
      no_cuoi_ky: numberValue(row, ['Còn phải trả', 'Công nợ', 'Dư nợ']),
      han_thanh_toan: text(row, ['Đến hạn', 'Ngày đến hạn']),
      trang_thai_doi_chieu: text(row, ['Trạng thái đối chiếu']),
      trang_thai_thanh_toan: text(row, ['Trạng thái thanh toán']),
      muc_canh_bao: text(row, ['Cần CEO duyệt', 'Mức cảnh báo'])
    };
  }

  if (target === SHEET_NAMES.DATA_KHO_CUA_HANG) {
    return {
      ...common,
      ma_kho: text(row, ['Mã kho', 'Kho']),
      ma_hang: text(row, ['Mã hàng', 'Mã NVL']),
      ten_hang: text(row, ['Tên hàng', 'Tên NVL']),
      dvt: text(row, ['Đơn vị tính', 'ĐVT']),
      ton_dau: numberValue(row, ['Tồn đầu', 'Tồn đầu kỳ']),
      nhap_tu_btt: numberValue(row, ['Nhập từ bếp trung tâm', 'Nhập từ BTT']),
      nhap_ncc: numberValue(row, ['Nhập NCC', 'Nhập']),
      so_luong_ban: numberValue(row, ['Số lượng bán', 'Xuất bán theo định mức']),
      huy_hop_le: numberValue(row, ['Hủy', 'Hủy hợp lệ']),
      kiem_ke_thuc_te: numberValue(row, ['Tồn thực tế', 'Tồn kho', 'Kiểm kê thực tế']),
      dieu_chinh_tang: numberValue(row, ['Điều chỉnh tăng']),
      dieu_chinh_giam: numberValue(row, ['Điều chỉnh giảm']),
      don_gia_von: numberValue(row, ['Đơn giá', 'Giá vốn'])
    };
  }

  if (target === SHEET_NAMES.DATA_KHO_BTT) {
    return {
      ...common,
      ma_kho_btt: text(row, ['Mã kho', 'Kho']),
      ma_hang: text(row, ['Mã hàng', 'Mã NVL']),
      ten_hang: text(row, ['Tên hàng', 'Tên NVL']),
      dvt: text(row, ['Đơn vị tính', 'ĐVT']),
      ton_dau: numberValue(row, ['Tồn đầu', 'Tồn đầu kỳ']),
      nhap_ncc: numberValue(row, ['Nhập NCC', 'SL Nhập', 'Nhập']),
      san_xuat_so_che_dau_vao: numberValue(row, ['Sản xuất sơ chế đầu vào']),
      san_xuat_so_che_dau_ra: numberValue(row, ['Sản xuất sơ chế đầu ra']),
      huy_hop_le_btt: numberValue(row, ['Hủy hợp lệ BTT']),
      kiem_ke_thuc_te_btt: numberValue(row, ['Tồn thực tế', 'Tồn kho']),
      dieu_chinh_tang: numberValue(row, ['Điều chỉnh tăng']),
      dieu_chinh_giam: numberValue(row, ['Điều chỉnh giảm']),
      don_gia_von: numberValue(row, ['Đơn giá', 'Giá vốn'])
    };
  }

  if (target === SHEET_NAMES.DATA_XUAT_BTT_CUA_HANG) {
    return {
      ...common,
      ma_kho_xuat: text(row, ['Mã kho xuất']),
      kho_xuat: text(row, ['Kho xuất', 'Kho']),
      cua_hang_nhan: text(row, ['Cửa hàng', 'Chi nhánh']),
      ma_kho_nhan: text(row, ['Mã kho nhận', 'Kho nhận']),
      ma_hang: text(row, ['Mã hàng', 'Mã NVL']),
      ten_hang: text(row, ['Tên hàng', 'Tên NVL']),
      dvt: text(row, ['Đơn vị tính', 'ĐVT']),
      so_luong_xuat: numberValue(row, ['Số lượng xuất', 'Số lượng', 'SL xuất', 'Tổng SL hủy']),
      so_luong_cua_hang_xac_nhan: numberValue(row, ['Số lượng nhận', 'SL nhận']),
      chenh_lech_xuat_nhan: numberValue(row, ['Chênh lệch xuất nhận', 'Lệch']),
      gia_tri_xuat: numberValue(row, ['Giá trị xuất', 'Tổng giá trị', 'Giá trị hủy']),
      trang_thai_nhan: text(row, ['Trạng thái']) || 'CHUA_XAC_NHAN',
      nguoi_xac_nhan: text(row, ['Người xác nhận'])
    };
  }

  if (target === SHEET_NAMES.DATA_HANG_HUY_KIEM_KE) {
    return {
      ...common,
      loai_du_lieu: text(row, ['Loại dữ liệu']) || 'HUY_HANG',
      loai_kho: sheetName === SHEET_NAMES.DL_HUY_HANG_BTT ? 'BTT' : 'CUA_HANG',
      cua_hang_hoac_btt: text(row, ['Chi nhánh', 'Cửa hàng', 'Kho']) || 'BTT',
      ma_kho: text(row, ['Mã kho', 'Kho']),
      ma_hang: text(row, ['Mã hàng', 'Mã NVL']),
      ten_hang: text(row, ['Tên hàng', 'Tên NVL']),
      dvt: text(row, ['Đơn vị tính', 'ĐVT']),
      so_luong: numberValue(row, ['Số lượng']),
      don_gia_von: numberValue(row, ['Đơn giá', 'Giá vốn']),
      gia_tri: numberValue(row, ['Giá trị hủy', 'Giá trị']),
      ly_do: text(row, ['Lý do']),
      nguoi_ghi_nhan: text(row, ['Người ghi nhận', 'Người tạo']),
      nguoi_duyet: text(row, ['Người duyệt']),
      chung_tu_anh: text(row, ['Chứng từ ảnh', 'Chứng từ'])
    };
  }

  return { ...common, ...row };
}
