import path from 'node:path';
import fs from 'node:fs';
import * as XLSX from '@e965/xlsx';
import { GOOGLE_SHEETS_SCHEMA } from '../src/lib/google-sheets/schema';

const duplicateSheetNames = GOOGLE_SHEETS_SCHEMA
  .map((s) => s.sheetName)
  .filter((name, idx, arr) => arr.indexOf(name) !== idx);

if (duplicateSheetNames.length) {
  console.error('Trùng tên sheet:', duplicateSheetNames);
  process.exit(1);
}

const badSheets = GOOGLE_SHEETS_SCHEMA.filter((s) => !s.columns.length || s.sheetName.length > 31);
if (badSheets.length) {
  console.error('Sheet lỗi:', badSheets.map((s) => s.sheetName));
  process.exit(1);
}

const templatePath = path.join(process.cwd(), 'templates', 'GOOGLE_SHEET_DATA_MASTER_CEO_REPORT_TEMPLATE.xlsx');
if (fs.existsSync(templatePath)) {
  const workbook = XLSX.readFile(templatePath, { bookSheets: true });
  const schemaSheets = GOOGLE_SHEETS_SCHEMA.map((sheet) => sheet.sheetName);
  const missingInTemplate = schemaSheets.filter((sheetName) => !workbook.SheetNames.includes(sheetName));
  const extraInTemplate = workbook.SheetNames.filter((sheetName) => !schemaSheets.includes(sheetName));

  if (missingInTemplate.length || extraInTemplate.length) {
    console.error('Template Excel lệch schema:', { missingInTemplate, extraInTemplate });
    process.exit(1);
  }
}

console.log(`OK: ${GOOGLE_SHEETS_SCHEMA.length} sheet tiếng Việt đã được định nghĩa và template Excel khớp schema.`);
