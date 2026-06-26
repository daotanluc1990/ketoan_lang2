import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { createRecordKey } from '@/lib/import/record-key';
import { createRowHash } from '@/lib/import/row-hash';
import type { ImportRow } from '@/lib/import/import-types';
import type { ExcelFileInput, ParsedExcelImport } from './import-parser-types';
import { cleanHeader, getMonth, getWeekCode, getYear, inferBranch, readWorkbook, rowsAsMatrix, sheetToRows, toDateString } from './excel-utils';

type V7Target = {
  sheetName: string;
  loaiDuLieu: string;
  keywords: string[];
  requiredHeaders: string[];
  identityHeaders: string[];
  dateHeaders?: string[];
  branchHeaders?: string[];
  khoHeaders?: string[];
  numericHeaders?: string[];
};

const TARGETS: V7Target[] = [
  { sheetName: SHEET_NAMES.DM_CHI_NHANH, loaiDuLieu: 'Danh mục chi nhánh', keywords: ['dm chi nhanh', 'danh muc chi nhanh'], requiredHeaders: ['Mã chi nhánh', 'Tên chi nhánh'], identityHeaders: ['Mã chi nhánh', 'Tên chi nhánh'] },
  { sheetName: SHEET_NAMES.DM_KHO_CHI_NHANH, loaiDuLieu: 'Danh mục kho chi nhánh', keywords: ['dm kho chi nhanh', 'kho chi nhanh'], requiredHeaders: ['Mã kho', 'Tên kho'], identityHeaders: ['Mã kho', 'Tên kho'] },
  { sheetName: SHEET_NAMES.DM_MON_BAN, loaiDuLieu: 'Danh mục món bán', keywords: ['dm mon ban', 'danh muc mon ban', 'mon ban'], requiredHeaders: ['Mã món', 'Tên món'], identityHeaders: ['Mã món', 'Tên món'] },
  { sheetName: SHEET_NAMES.DM_NGUYEN_VAT_LIEU, loaiDuLieu: 'Danh mục nguyên vật liệu', keywords: ['dm nguyen vat lieu', 'nguyen vat lieu', 'nvl'], requiredHeaders: ['Mã NVL', 'Tên NVL'], identityHeaders: ['Mã NVL', 'Mã hàng', 'Tên NVL', 'Tên hàng'] },
  { sheetName: SHEET_NAMES.DM_CONG_THUC_CHE_BIEN, loaiDuLieu: 'Công thức chế biến', keywords: ['cong thuc che bien', 'dinh muc mon', 'recipe'], requiredHeaders: ['Mã món', 'Mã NVL', 'Định mức'], identityHeaders: ['Mã món', 'Mã NVL', 'Tên món', 'Tên NVL'], branchHeaders: ['Chi nhánh', 'Cửa hàng'], numericHeaders: ['Định mức', 'Tỷ lệ hao hụt', 'Số lượng'] },
  { sheetName: SHEET_NAMES.DM_HAO_HUT_HOP_LE, loaiDuLieu: 'Hao hụt hợp lệ', keywords: ['hao hut hop le', 'dinh muc hao hut'], requiredHeaders: ['Mã NVL', 'Hao hụt hợp lệ'], identityHeaders: ['Mã NVL', 'Tên NVL', 'Nhóm NVL'], numericHeaders: ['Hao hụt hợp lệ', 'Tỷ lệ hao hụt'] },
  { sheetName: SHEET_NAMES.DM_DON_GIA_NVL, loaiDuLieu: 'Đơn giá NVL', keywords: ['don gia nvl', 'gia von nvl', 'don gia nguyen vat lieu'], requiredHeaders: ['Mã NVL', 'Đơn giá'], identityHeaders: ['Mã NVL', 'Tên NVL', 'Đơn giá'], dateHeaders: ['Ngày hiệu lực', 'Hiệu lực từ ngày'], numericHeaders: ['Đơn giá', 'Giá vốn'] },

  { sheetName: SHEET_NAMES.DL_XNT_CUA_HANG, loaiDuLieu: 'XNT cửa hàng', keywords: ['xnt cua hang', 'xuat nhap ton cua hang', 'kho cua hang', 'ton kho cua hang'], requiredHeaders: ['Ngày', 'Kho', 'Mã hàng'], identityHeaders: ['Ngày', 'Chi nhánh', 'Kho', 'Mã hàng', 'Tên hàng'], dateHeaders: ['Ngày', 'Ngày kiểm kê', 'Ngày giao dịch'], branchHeaders: ['Chi nhánh', 'Cửa hàng'], khoHeaders: ['Kho', 'Kho cửa hàng'], numericHeaders: ['Tồn đầu', 'Nhập', 'Xuất', 'Hủy', 'Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Giá trị lệch'] },
  { sheetName: SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM, loaiDuLieu: 'XNT Bếp Trung Tâm', keywords: ['xnt bep trung tam', 'xnt btt', 'kho btt', 'ton kho bep trung tam', 'ton kho btt', 'ton kho bep'], requiredHeaders: ['Ngày', 'Kho', 'Mã hàng'], identityHeaders: ['Ngày', 'Kho', 'Mã hàng', 'Tên hàng'], dateHeaders: ['Ngày', 'Ngày kiểm kê', 'Ngày giao dịch'], branchHeaders: ['Chi nhánh'], khoHeaders: ['Kho', 'Kho BTT'], numericHeaders: ['Tồn đầu', 'Nhập NCC', 'Xuất cửa hàng', 'Hủy', 'Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Giá trị lệch', 'Tồn kho', 'Tồn kho hiện tại'] },
  { sheetName: SHEET_NAMES.DL_XUAT_BTT_CHO_CUA_HANG, loaiDuLieu: 'BTT xuất cho cửa hàng', keywords: ['xuat btt cho cua hang', 'btt xuat', 'xuat btt'], requiredHeaders: ['Ngày', 'Cửa hàng', 'Mã hàng', 'Số lượng xuất'], identityHeaders: ['Ngày', 'Mã phiếu', 'Cửa hàng', 'Mã hàng'], dateHeaders: ['Ngày', 'Ngày xuất', 'Thời gian xuất'], branchHeaders: ['Cửa hàng', 'Chi nhánh'], khoHeaders: ['Kho xuất', 'Kho BTT'], numericHeaders: ['Số lượng xuất', 'Số lượng', 'SL xuất'] },
  { sheetName: SHEET_NAMES.DL_CUA_HANG_NHAN_TU_BTT, loaiDuLieu: 'Cửa hàng nhận từ BTT', keywords: ['cua hang nhan tu btt', 'nhan tu btt', 'cua hang nhan'], requiredHeaders: ['Ngày', 'Cửa hàng', 'Mã hàng', 'Số lượng nhận'], identityHeaders: ['Ngày', 'Mã phiếu', 'Cửa hàng', 'Mã hàng'], dateHeaders: ['Ngày', 'Ngày nhận', 'Thời gian nhận'], branchHeaders: ['Cửa hàng', 'Chi nhánh'], khoHeaders: ['Kho nhận', 'Kho cửa hàng'], numericHeaders: ['Số lượng nhận', 'Số lượng', 'SL nhận'] },
  { sheetName: SHEET_NAMES.DL_HUY_HANG_CUA_HANG, loaiDuLieu: 'Hủy hàng cửa hàng', keywords: ['huy hang cua hang', 'hang huy cua hang'], requiredHeaders: ['Ngày hủy', 'Kho', 'Mã hàng', 'Số lượng'], identityHeaders: ['Ngày hủy', 'Kho', 'Mã hàng', 'Lý do'], dateHeaders: ['Ngày hủy', 'Ngày'], branchHeaders: ['Chi nhánh', 'Cửa hàng'], khoHeaders: ['Kho'], numericHeaders: ['Số lượng', 'Giá trị hủy', 'Đơn giá'] },
  { sheetName: SHEET_NAMES.DL_HUY_HANG_BTT, loaiDuLieu: 'Hủy hàng BTT', keywords: ['huy hang btt', 'hang huy btt', 'huy hang bep trung tam'], requiredHeaders: ['Ngày hủy', 'Kho', 'Mã hàng', 'Số lượng'], identityHeaders: ['Ngày hủy', 'Kho', 'Mã hàng', 'Lý do'], dateHeaders: ['Ngày hủy', 'Ngày'], branchHeaders: ['Chi nhánh'], khoHeaders: ['Kho', 'Kho BTT'], numericHeaders: ['Số lượng', 'Giá trị hủy', 'Đơn giá'] },
  { sheetName: SHEET_NAMES.DL_CHE_BIEN_THUC_TE, loaiDuLieu: 'Chế biến thực tế', keywords: ['che bien thuc te', 'thuc te che bien', 'actual production'], requiredHeaders: ['Ngày', 'Món', 'NVL', 'Thực tế dùng'], identityHeaders: ['Ngày', 'Món', 'NVL', 'Ca', 'Người thực hiện'], dateHeaders: ['Ngày', 'Ngày chế biến'], branchHeaders: ['Chi nhánh', 'Cửa hàng'], khoHeaders: ['Kho'], numericHeaders: ['Thực tế dùng', 'Số lượng chế biến', 'Định mức'] },

  { sheetName: SHEET_NAMES.KQ_HAO_HUT_CHE_BIEN, loaiDuLieu: 'Kết quả hao hụt chế biến', keywords: ['kq hao hut che bien', 'hao hut che bien'], requiredHeaders: ['Ngày', 'Món', 'NVL'], identityHeaders: ['Ngày', 'Món', 'NVL', 'Ca'], dateHeaders: ['Ngày'], branchHeaders: ['Chi nhánh'], numericHeaders: ['Thực tế dùng', 'Định mức', 'Hao hụt', 'Vượt định mức', 'Giá trị vượt'] },
  { sheetName: SHEET_NAMES.KQ_THAT_THOAT_TON_KHO, loaiDuLieu: 'Kết quả thất thoát tồn kho', keywords: ['kq that thoat ton kho', 'that thoat ton kho'], requiredHeaders: ['Kho', 'NVL', 'Tồn lý thuyết', 'Tồn thực tế'], identityHeaders: ['Kho', 'NVL', 'Mã hàng', 'Tên hàng'], dateHeaders: ['Ngày', 'Ngày kiểm kê'], branchHeaders: ['Chi nhánh'], khoHeaders: ['Kho'], numericHeaders: ['Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Giá trị thất thoát', 'Tỷ lệ'] }
];

function normalize(value: unknown) {
  return String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').trim();
}

function makeImportRow(sheetDich: string, keyParts: Array<string | number | undefined | null>, data: Record<string, unknown>, errors: string[] = []): ImportRow {
  const maDongDuLieu = createRecordKey([sheetDich, ...keyParts]);
  return { maDongDuLieu, dauVetDong: createRowHash(data), sheetDich, data, errors };
}

function withSource(data: Record<string, unknown>, filename: string, rowIndex: number): Record<string, unknown> {
  return { ...data, 'Tên file nguồn': filename, 'Dấu vết dòng': `${filename}#${rowIndex}`, 'Trạng thái dữ liệu': 'Preview', 'Ngày import': new Date().toISOString() };
}

function getValue(row: Record<string, unknown>, candidates: string[]) {
  for (const candidate of candidates) {
    if (row[candidate] !== undefined && String(row[candidate] ?? '').trim() !== '') return row[candidate];
  }
  const entries = Object.entries(row);
  for (const candidate of candidates) {
    const target = normalize(candidate);
    const found = entries.find(([key, value]) => normalize(key).includes(target) && String(value ?? '').trim() !== '');
    if (found) return found[1];
  }
  return '';
}

function headersFromMatrix(matrix: unknown[][], headerRowIndex: number) {
  return (matrix[headerRowIndex] ?? []).map(cleanHeader).filter(Boolean);
}

function countHeaderMatches(headers: string[], requiredHeaders: string[]) {
  const normalizedHeaders = headers.map(normalize);
  return requiredHeaders.filter((required) => normalizedHeaders.some((header) => header.includes(normalize(required)) || normalize(required).includes(header))).length;
}

function findHeaderRowIndex(matrix: unknown[][], target: V7Target) {
  let best = { index: 0, matches: 0 };
  matrix.slice(0, 12).forEach((row, index) => {
    const headers = row.map(cleanHeader).filter(Boolean);
    const matches = countHeaderMatches(headers, target.requiredHeaders);
    if (matches > best.matches) best = { index, matches };
  });
  return best.matches >= Math.min(2, target.requiredHeaders.length) ? best.index : 0;
}

function headerScore(matrix: unknown[][], target: V7Target) {
  const headerRowIndex = findHeaderRowIndex(matrix, target);
  const headers = headersFromMatrix(matrix, headerRowIndex);
  return countHeaderMatches(headers, target.requiredHeaders);
}

function hasEnoughHeaderEvidence(matrix: unknown[][], target: V7Target) {
  return headerScore(matrix, target) >= Math.min(2, target.requiredHeaders.length);
}

function isSpecificBttInventoryFilename(filename: string) {
  return filename.includes('ton kho bep trung tam') || filename.includes('ton kho btt') || filename.includes('xnt bep trung tam') || filename.includes('xnt btt');
}

function findTarget(input: ExcelFileInput, sheetNames: string[], firstSheetName: string, matrix: unknown[][]): V7Target | null {
  const filename = normalize(input.filename);
  const firstName = normalize(firstSheetName);
  const firstSheetExact = TARGETS.find((target) => normalize(target.sheetName) === firstName);
  if (firstSheetExact) return firstSheetExact;
  const firstSheetByKeyword = TARGETS.find((target) => target.keywords.some((keyword) => firstName.includes(normalize(keyword))));
  if (firstSheetByKeyword) return firstSheetByKeyword;
  const filenameByKeyword = TARGETS.find((target) => target.keywords.some((keyword) => filename.includes(normalize(keyword))) && (hasEnoughHeaderEvidence(matrix, target) || (target.sheetName === SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM && isSpecificBttInventoryFilename(filename))));
  if (filenameByKeyword) return filenameByKeyword;
  const headerMatch = TARGETS.map((target) => ({ target, matches: headerScore(matrix, target) })).sort((a, b) => b.matches - a.matches)[0];
  if (headerMatch && headerMatch.matches >= headerMatch.target.requiredHeaders.length) return headerMatch.target;
  const workbookExact = TARGETS.find((target) => sheetNames.map(normalize).includes(normalize(target.sheetName)));
  return workbookExact ?? null;
}

function pickSheet(workbook: ReturnType<typeof readWorkbook>['workbook'], firstSheetName: string, target: V7Target) {
  const firstSheetIsTarget = normalize(firstSheetName) === normalize(target.sheetName) || target.keywords.some((keyword) => normalize(firstSheetName).includes(normalize(keyword)));
  const exactName = workbook.SheetNames.find((sheetName) => normalize(sheetName) === normalize(target.sheetName));
  const keywordName = workbook.SheetNames.find((sheetName) => target.keywords.some((keyword) => normalize(sheetName).includes(normalize(keyword))));
  const sheetName = firstSheetIsTarget ? firstSheetName : exactName ?? keywordName ?? firstSheetName;
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error(`Không đọc được sheet ${sheetName}.`);
  return { sheetName, sheet };
}

function parseLooseNumber(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const normalized = raw.replace(/\s/g, '').replace(/,/g, '');
  const valueNumber = Number(normalized);
  return Number.isFinite(valueNumber) ? valueNumber : NaN;
}

function enrichRow(row: Record<string, unknown>, target: V7Target, filename: string, rowIndex: number) {
  const dateValue = getValue(row, target.dateHeaders ?? ['Ngày', 'Ngày hủy', 'Ngày kiểm kê', 'Ngày xuất', 'Ngày nhận', 'Ngày hiệu lực']);
  const ngay = toDateString(dateValue);
  const branchValue = getValue(row, target.branchHeaders ?? ['Chi nhánh', 'Cửa hàng', 'Tên CH']);
  const khoValue = getValue(row, target.khoHeaders ?? ['Kho', 'Kho xuất', 'Kho nhận']);
  const data: Record<string, unknown> = {
    ...row,
    ...(ngay ? { 'Ngày': row['Ngày'] || ngay, 'Năm': getYear(ngay), 'Tháng': getMonth(ngay), 'Tuần': getWeekCode(ngay).split('-W')[1] ?? '', 'Mã tuần': getWeekCode(ngay) } : {}),
    ...(branchValue ? { 'Chi nhánh': inferBranch(branchValue) } : {}),
    ...(khoValue ? { 'Kho': khoValue } : {})
  };
  return withSource(data, filename, rowIndex);
}

function rowErrors(row: Record<string, unknown>, target: V7Target, missingHeaders: string[] = []) {
  const errors = [
    ...missingHeaders.map((header) => `Thiếu cột bắt buộc ${header}`),
    ...target.requiredHeaders.filter((header) => !String(getValue(row, [header]) ?? '').trim()).map((header) => `Thiếu ${header}`)
  ];
  for (const header of target.numericHeaders ?? []) {
    const value = getValue(row, [header]);
    const parsed = parseLooseNumber(value);
    if (parsed !== null && Number.isNaN(parsed)) errors.push(`${header} phải là số`);
  }
  return [...new Set(errors)];
}

function keyParts(row: Record<string, unknown>, target: V7Target, rowIndex: number) {
  const parts = target.identityHeaders.map((header) => getValue(row, [header])).filter((value) => String(value ?? '').trim());
  return parts.length ? parts : [rowIndex];
}

function schemaErrorRow(input: ExcelFileInput, target: V7Target, missingHeaders: string[]) {
  const data = withSource({ 'Loại lỗi': 'Sai schema', 'Chi tiết lỗi': `Thiếu cột bắt buộc: ${missingHeaders.join(', ')}` }, input.filename, 0);
  return makeImportRow(target.sheetName, ['SCHEMA', input.filename], data, rowErrors(data, target, missingHeaders));
}

export function parseV7ExcelFile(input: ExcelFileInput): ParsedExcelImport | null {
  const { workbook, firstSheet, firstSheetName } = readWorkbook(input.buffer);
  const firstMatrix = rowsAsMatrix(firstSheet);
  const target = findTarget(input, workbook.SheetNames, firstSheetName, firstMatrix);
  if (!target) return null;

  const picked = pickSheet(workbook, firstSheetName, target);
  const matrix = rowsAsMatrix(picked.sheet);
  const headerRowIndex = findHeaderRowIndex(matrix, target);
  const headers = headersFromMatrix(matrix, headerRowIndex);
  const missingHeaders = target.requiredHeaders.filter((header) => countHeaderMatches(headers, [header]) === 0);
  const rows = sheetToRows(picked.sheet, headerRowIndex);

  const parsedRows = rows.map((row, index) => {
    const data = enrichRow(row, target, input.filename, headerRowIndex + index + 2);
    const errors = rowErrors(data, target, missingHeaders);
    return makeImportRow(target.sheetName, keyParts(data, target, index + 1), data, errors);
  });
  if (!parsedRows.length && missingHeaders.length) parsedRows.push(schemaErrorRow(input, target, missingHeaders));

  const warnings = [
    ...(picked.sheetName === firstSheetName ? [] : [`Đã tự chọn sheet ${picked.sheetName} trong workbook.`]),
    ...(missingHeaders.length ? [`Thiếu cột bắt buộc: ${missingHeaders.join(', ')}`] : []),
    ...(rows.length ? [] : ['File không có dòng dữ liệu sau header.'])
  ];

  return {
    tenFile: input.filename,
    loaiDuLieu: target.loaiDuLieu,
    chiNhanh: inferBranch(getValue(parsedRows[0]?.data ?? {}, ['Chi nhánh', 'Cửa hàng']) || 'NVT'),
    rows: parsedRows,
    warnings
  };
}
