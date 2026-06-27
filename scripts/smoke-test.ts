import { GOOGLE_SHEETS_SCHEMA } from '../src/lib/google-sheets/schema';
import { SHEET_NAMES } from '../src/lib/google-sheets/sheet-names';
import { createRecordKey } from '../src/lib/import/record-key';
import { createRowHash } from '../src/lib/import/row-hash';

const requiredSheets = [
  SHEET_NAMES.DL_SO_QUY,
  SHEET_NAMES.DL_CONG_NO,
  SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM,
  SHEET_NAMES.DL_HUY_HANG_BTT,
  SHEET_NAMES.DL_XNT_CUA_HANG,
  SHEET_NAMES.KQ_THAT_THOAT_TON_KHO,
  SHEET_NAMES.LICH_SU_CHOT_BAO_CAO
];

if (GOOGLE_SHEETS_SCHEMA.length < 35) {
  throw new Error('Schema chưa đủ sheet production V7.');
}

const names = new Set(GOOGLE_SHEETS_SCHEMA.map((sheet) => sheet.sheetName));
for (const sheetName of requiredSheets) {
  if (!names.has(sheetName)) throw new Error(`Thiếu schema sheet production: ${sheetName}`);
}

const key = createRecordKey(['APP_REVENUE', 'NVT', '2026-06-01', 'GRAB']);
const hash = createRowHash({ 'Doanh thu ròng': 1000000, 'Số đơn': 20 });
if (!key.includes('APP_REVENUE|NVT')) throw new Error('Record key lỗi.');
if (!hash || hash.length < 20) throw new Error('Row hash lỗi.');

console.log('Smoke test OK: schema production V7 + import hash foundation hoạt động.');
