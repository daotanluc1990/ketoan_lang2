import { auth, sheets } from '@googleapis/sheets';
import { GOOGLE_SHEETS_SCHEMA } from './schema';
import { getServerEnv, hasGoogleSheetsEnv } from '@/lib/env/server-env';

export type SheetAppendRequest = {
  sheetName: string;
  rows: Record<string, unknown>[];
};

export type SheetsClient = {
  appendRows(request: SheetAppendRequest): Promise<void>;
  readRows(sheetName: string): Promise<Record<string, unknown>[]>;
  markRowsByImportId(request: {
    sheetName: string;
    maLanImport: string;
    actor: string;
    reason: string;
  }): Promise<{ sheetName: string; matchedRows: number; updatedRows: number }>;
  healthCheck(): Promise<{ ok: boolean; mode: 'real' | 'missing_env'; spreadsheetIdConfigured: boolean; accessible?: boolean; sheetCount?: number; message: string }>;
};

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const MAX_HEADER_SCAN_ROWS = 10;

// Google Sheet V7 dùng header snake_case (row_id, import_batch_id, ...) nhưng code expect
// keys tiếng Việt theo GOOGLE_SHEETS_SCHEMA (Mã dòng dữ liệu, Mã lần import, ...).
// Map này dịch header thật → key schema Việt khi readRows() build row object,
// để toàn bộ code downstream (report-aggregator, parsers, validImportRows) hoạt động.
const COLUMN_ALIASES: Record<string, string> = {
  row_id: 'Mã dòng dữ liệu',
  import_batch_id: 'Mã lần import',
  imported_at: 'Ngày import',
  imported_by: 'Người import',
  trang_thai_dong: 'Trạng thái dữ liệu',
  nguon_file: 'Tên file nguồn',
  dau_vet_file: 'Dấu vết file',
  dau_vet_dong: 'Dấu vết dòng',
  ky_bao_cao: 'Mã tuần',
  ngay: 'Ngày',
  ngay_kiem_ke: 'Ngày kiểm kê',
  cua_hang: 'Chi nhánh',
  ca_ban: 'Ca bán',
  kenh_ban: 'Kênh bán',
  ma_mon: 'Mã món',
  ten_mon: 'Tên món',
  ma_phieu: 'Mã phiếu',
  loai_giao_dich: 'Loại giao dịch',
  nhom_thu_chi: 'Nhóm thu/chi',
  noi_dung: 'Diễn giải',
  so_tien_thu: 'Số tiền',
  so_tien_chi: 'Giá trị',
  phuong_thuc: 'Phương thức',
  so_du_sau_giao_dich: 'Số dư sau giao dịch',
  doi_tuong: 'Số dư sau giao dịch',
  chung_tu: 'Chứng từ',
  nguoi_duyet: 'Người tạo',
  ma_hang: 'Mã hàng',
  ten_hang: 'Tên hàng',
  nhom_hang: 'Nhóm hàng',
  don_vi_tinh: 'Đơn vị tính',
  ton_kho: 'Tồn kho',
  gia_tri_ton: 'Giá trị tồn',
  trang_thai_ton_am: 'Trạng thái tồn âm',
  dinh_muc_ton_toi_thieu: 'Định mức tồn tối thiểu',
  dinh_muc_ton_toi_da: 'Định mức tồn tối đa',
  // Doanh thu (additional, chưa có ở phần trên)
  doanh_thu_gross: 'Doanh thu bán hàng thực',
  doanh_thu_net: 'Doanh thu ròng',
  giam_gia: 'Giảm giá',
  phi_app: 'Tổng khấu trừ/phí',
  hoan_huy: 'Hoàn/hủy',
  tien_thuc_nhan: 'Tiền thực nhận',
  so_luong_ban: 'Số lượng bán',
  // NVL / định mức
  don_gia_von: 'Đơn giá vốn',
  gia_tri_vuot_dinh_muc: 'Giá trị vượt định mức',
  gia_tri_that_thoat_ton_kho: 'Giá trị chênh lệch',
  // Công nợ KiotViet
  ma_doi_tuong: 'Mã nhà cung cấp',
  no_dau_ky: 'Nợ đầu kỳ',
  phat_sinh_tang: 'Ghi nợ',
  phat_sinh_giam: 'Ghi có',
  no_cuoi_ky: 'Nợ cuối kỳ',
  // Lương/nhân sự
  ky_luong: 'Kỳ lương',
  nhan_vien: 'Nhân viên',
  vai_tro: 'Vai trò',
  so_cong: 'Số công',
  gio_lam: 'Giờ làm',
  di_tre: 'Đi trễ',
  ca_gay: 'Ca gãy',
  tam_ung: 'Tạm ứng',
  thuong: 'Thưởng',
  phat: 'Phạt',
  phu_cap: 'Phụ cấp',
  luong_tam_tinh: 'Lương tạm tính',
  khau_tru: 'Khấu trừ',
  thuc_nhan: 'Thực nhận',
  trang_thai_duyet: 'Trạng thái duyệt',
  ghi_chu: 'Ghi chú'
};

// Normalize 1 header cell → schema key Việt nếu có alias, ngược lại giữ nguyên.
function normalizeColumnKey(rawHeader: string): string {
  const key = String(rawHeader ?? '').trim();
  return COLUMN_ALIASES[key] ?? key;
}

function getSchemaColumns(sheetName: string) {
  return GOOGLE_SHEETS_SCHEMA.find((sheet) => sheet.sheetName === sheetName)?.columns ?? [];
}

function columnNumberToLetter(columnNumber: number) {
  let num = columnNumber;
  let letters = '';
  while (num > 0) {
    const remainder = (num - 1) % 26;
    letters = String.fromCharCode(65 + remainder) + letters;
    num = Math.floor((num - 1) / 26);
  }
  return letters || 'A';
}

function normalizeCell(value: unknown) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function clean(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function detectHeader(values: unknown[][], sheetName: string) {
  const schemaColumns = getSchemaColumns(sheetName);
  const schemaSet = new Set(schemaColumns.map(clean));
  let best = { index: -1, score: 0, header: [] as string[] };

  values.slice(0, MAX_HEADER_SCAN_ROWS).forEach((row, index) => {
    const cells = row.map(String).map((value) => value.trim()).filter(Boolean);
    if (!cells.length) return;
    const score = cells.reduce((total, cell) => total + (schemaSet.has(clean(cell)) ? 1 : 0), 0);
    const hasKeyColumn = cells.some((cell) => ['mã dòng dữ liệu', 'mã lần import', 'ngày', 'chỉ số', 'mã lần import'].includes(clean(cell)));
    const weightedScore = score + (hasKeyColumn ? 2 : 0);
    if (weightedScore > best.score) best = { index, score: weightedScore, header: cells };
  });

  if (best.index >= 0 && best.score >= 2) return best;
  return { index: -1, score: 0, header: schemaColumns };
}

async function createSheetsApi() {
  const env = getServerEnv();
  if (!hasGoogleSheetsEnv()) {
    throw new Error('Thiếu GOOGLE_SHEET_ID / GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY. Chưa thể kết nối Google Sheet thật.');
  }
  const googleAuth = new auth.GoogleAuth({
    credentials: {
      client_email: env.googleClientEmail,
      private_key: env.googlePrivateKey
    },
    scopes: SCOPES
  });
  const authClient = await googleAuth.getClient();
  return {
    spreadsheetId: env.googleSheetId as string,
    api: sheets({ version: 'v4', auth: authClient as never })
  };
}

async function readHeader(sheetName: string) {
  const { api, spreadsheetId } = await createSheetsApi();
  const response = await api.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A1:ZZ${MAX_HEADER_SCAN_ROWS}`,
    valueRenderOption: 'FORMATTED_VALUE'
  });
  const values = (response.data.values ?? []) as unknown[][];
  const detected = detectHeader(values, sheetName);
  if (!detected.header.length) throw new Error(`Sheet ${sheetName} chưa có header và không có schema fallback.`);
  return detected.header;
}

function rowHasContent(row: unknown[]) {
  return row.some((cell) => String(cell ?? '').trim() !== '');
}

async function readSheetValues(sheetName: string) {
  const { api, spreadsheetId } = await createSheetsApi();
  const response = await api.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A:ZZ`,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING'
  });
  return { api, spreadsheetId, values: (response.data.values ?? []) as unknown[][] };
}

function findColumnIndex(header: string[], columnName: string) {
  return header.findIndex((column) => clean(column) === clean(columnName));
}

export function createSheetsClient(): SheetsClient {
  return {
    async appendRows({ sheetName, rows }) {
      if (!rows.length) return;
      const { api, spreadsheetId } = await createSheetsApi();
      const header = await readHeader(sheetName);
      const values = rows.map((row) => header.map((column) => normalizeCell(row[column])));
      const endColumn = columnNumberToLetter(header.length);
      await api.spreadsheets.values.append({
        spreadsheetId,
        range: `'${sheetName}'!A:${endColumn}`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values }
      });
    },

    async readRows(sheetName) {
      const { values } = await readSheetValues(sheetName);
      const detected = detectHeader(values, sheetName);
      const rawHeader = detected.header.length ? detected.header : getSchemaColumns(sheetName);
      // Normalize snake_case → schema Việt để code downstream tìm thấy keys.
      const header = rawHeader.map(normalizeColumnKey);
      const dataStartIndex = detected.index >= 0 ? detected.index + 1 : 1;
      return values.slice(dataStartIndex).filter(rowHasContent).map((row: unknown[]) => {
        const obj: Record<string, unknown> = {};
        header.forEach((column, index) => {
          obj[column] = row[index] ?? '';
        });
        return obj;
      });
    },

    async markRowsByImportId({ sheetName, maLanImport, actor, reason }) {
      const { api, spreadsheetId, values } = await readSheetValues(sheetName);
      const detected = detectHeader(values, sheetName);
      const header = detected.header.length ? detected.header : getSchemaColumns(sheetName);
      const headerRowIndex = detected.index;
      if (headerRowIndex < 0) {
        throw new Error(`Không tìm thấy header cho sheet ${sheetName}. Không thể rollback an toàn.`);
      }
      const importColumnIndex = findColumnIndex(header, 'Mã lần import');
      const statusColumnIndex = findColumnIndex(header, 'Trạng thái dữ liệu');
      if (importColumnIndex < 0 || statusColumnIndex < 0) {
        throw new Error(`Sheet ${sheetName} thiếu cột Mã lần import hoặc Trạng thái dữ liệu.`);
      }

      let matchedRows = 0;
      let updatedRows = 0;
      const requests: Array<Promise<unknown>> = [];
      const statusColumnLetter = columnNumberToLetter(statusColumnIndex + 1);
      const dataRows = values.slice(headerRowIndex + 1);

      dataRows.forEach((row, index) => {
        const absoluteRowNumber = headerRowIndex + 2 + index;
        if (String(row[importColumnIndex] ?? '') !== maLanImport) return;
        matchedRows += 1;
        if (String(row[statusColumnIndex] ?? '') === 'Đã hoàn tác') return;
        updatedRows += 1;
        requests.push(api.spreadsheets.values.update({
          spreadsheetId,
          range: `'${sheetName}'!${statusColumnLetter}${absoluteRowNumber}:${statusColumnLetter}${absoluteRowNumber}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [['Đã hoàn tác']] }
        }));
      });

      await Promise.all(requests);
      return { sheetName, matchedRows, updatedRows };
    },

    async healthCheck() {
      const env = getServerEnv();
      if (!hasGoogleSheetsEnv()) {
        return {
          ok: false,
          mode: 'missing_env',
          spreadsheetIdConfigured: Boolean(env.googleSheetId),
          message: 'Thiếu biến môi trường Google Sheets. Chưa thể test kết nối thật.'
        };
      }
      try {
        const { api, spreadsheetId } = await createSheetsApi();
        const response = await api.spreadsheets.get({ spreadsheetId, fields: 'sheets.properties.title' });
        return {
          ok: true,
          mode: 'real',
          spreadsheetIdConfigured: true,
          accessible: true,
          sheetCount: response.data.sheets?.length ?? 0,
          message: 'Kết nối Google Sheet thật thành công.'
        };
      } catch (error) {
        return {
          ok: false,
          mode: 'real',
          spreadsheetIdConfigured: true,
          accessible: false,
          message: error instanceof Error ? error.message : 'Không thể kết nối Google Sheet.'
        };
      }
    }
  };
}
