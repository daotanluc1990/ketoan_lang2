import type { DataRow, DataStore } from './store-interface';

const DATA_SHEET_PREFIXES = ['DL_'];

function isDataSheet(sheetName: string) {
  return DATA_SHEET_PREFIXES.some((prefix) => sheetName.startsWith(prefix));
}

function normalize(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-');
}

function hasImportMetadata(rows: DataRow[]) {
  return rows.some((row) =>
    String(row['Mã dòng dữ liệu'] ?? '').trim() ||
    String(row['Mã lần import'] ?? '').trim() ||
    String(row['Tên file nguồn'] ?? '').trim() ||
    String(row['Trạng thái dữ liệu'] ?? '').trim()
  );
}

function isRolledBack(row: DataRow) {
  const status = normalize(row['Trạng thái dữ liệu']);
  return status === 'da-hoan-tac' || status.includes('hoan-tac');
}

function hasTrustedImportId(value: string) {
  return value.startsWith('IMP-') || value.startsWith('BATCH-') || value.startsWith('PREVIEW-') || value.startsWith('IMPORT-');
}

function hasConfirmedStatus(row: DataRow) {
  const status = normalize(row['Trạng thái dữ liệu'] ?? row['Trạng thái']);
  return ['da-xac-nhan', 'dat', 'hop-le', 'thanh-cong', 'thanh-cong-mot-phan', 'preview'].some((item) => status === item || status.includes(item));
}

function hasBusinessData(row: DataRow) {
  return Boolean(
    String(row['Mã phiếu'] ?? row['Số phiếu'] ?? '').trim() ||
    String(row['Ngày'] ?? row['Ngày kiểm kê'] ?? row['Ngày hủy'] ?? '').trim() ||
    String(row['Mã hàng'] ?? row['Tên hàng'] ?? row['Tên nguyên vật liệu'] ?? '').trim() ||
    String(row['Số tiền'] ?? row['Giá trị'] ?? row['Tồn thực tế'] ?? row['Tồn kho'] ?? '').trim()
  );
}

function isConfirmedImportRow(sheetName: string, row: DataRow) {
  if (isRolledBack(row)) return false;

  const rowId = String(row['Mã dòng dữ liệu'] ?? '').trim();
  const importId = String(row['Mã lần import'] ?? '').trim();

  if (rowId.startsWith(`${sheetName}|`)) return true;
  if (hasTrustedImportId(importId)) return true;
  if (hasConfirmedStatus(row) && hasBusinessData(row)) return true;
  if (String(row['Tên file nguồn'] ?? '').trim() && hasBusinessData(row)) return true;

  return false;
}

export function sanitizeDataRows(sheetName: string, rows: DataRow[]) {
  if (!isDataSheet(sheetName)) return rows;
  if (!hasImportMetadata(rows)) return rows;
  return rows.filter((row) => isConfirmedImportRow(sheetName, row));
}

export function withSanitizedReads(store: DataStore): DataStore {
  return {
    async read(sheetName) {
      const rows = await store.read(sheetName);
      return sanitizeDataRows(sheetName, rows);
    },
    append(sheetName, rows) {
      return store.append(sheetName, rows);
    },
    replace(sheetName, rows) {
      return store.replace(sheetName, rows);
    },
    markRowsByImportId(input) {
      if (!store.markRowsByImportId) {
        return Promise.resolve({ sheetName: input.sheetName, matchedRows: 0, updatedRows: 0 });
      }
      return store.markRowsByImportId(input);
    }
  };
}
