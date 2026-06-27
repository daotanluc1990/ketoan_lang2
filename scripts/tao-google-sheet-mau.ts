import path from 'node:path';
import fs from 'node:fs';
import * as XLSX from '@e965/xlsx';
import { GOOGLE_SHEETS_SCHEMA } from '../src/lib/google-sheets/schema';

const workbook = XLSX.utils.book_new();
for (const sheet of GOOGLE_SHEETS_SCHEMA) {
  const ws = XLSX.utils.aoa_to_sheet([sheet.columns]);
  XLSX.utils.book_append_sheet(workbook, ws, sheet.sheetName);
}

const outDir = path.join(process.cwd(), 'templates');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'GOOGLE_SHEET_DATA_MASTER_CEO_REPORT_TEMPLATE.xlsx');
XLSX.writeFile(workbook, out);
console.log(`Đã tạo template: ${out}`);
