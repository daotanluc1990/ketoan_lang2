import type { DataStore } from './store-interface';
import { sheetsRepository } from '@/lib/google-sheets/sheets-repository';
import { mapToOptionCSheet } from '@/lib/option-c/sheet-mapping';

// Google Sheet V7 chỉ có 17 tab dạng số (04_DATA_DOANH_THU, 05_DATA_SO_QUY, ...).
// Code còn dùng tên legacy (DL_SO_QUY, DL_DOANH_THU_CUA_HANG) → Google API parse range error.
// mapToOptionCSheet() dịch legacy → tab thực; fallback về tên gốc nếu không có map.
function resolveSheetName(sheetName: string): string {
  return mapToOptionCSheet(sheetName) ?? sheetName;
}

export const googleSheetsStore: DataStore = {
  async read(sheetName) {
    return sheetsRepository.readRows(resolveSheetName(sheetName));
  },
  async append(sheetName, rows) {
    return sheetsRepository.appendRows({ sheetName: resolveSheetName(sheetName), rows });
  },
  async replace() {
    throw new Error('Không cho replace trực tiếp Google Sheet trong production. Dùng append + trạng thái rollback.');
  },
  async markRowsByImportId({ sheetName, maLanImport, actor, reason }) {
    return sheetsRepository.markRowsByImportId({ sheetName: resolveSheetName(sheetName), maLanImport, actor, reason });
  }
};
