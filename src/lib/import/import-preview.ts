import { getDataStore } from '@/lib/data-store';
import { buildExistingRowIndex, classifyImportRows } from '@/lib/dedupe/dedupe-engine';
import type { ImportErrorDetail, ImportPreviewResult, ImportRow } from './import-types';
import { writeAuditLog } from '@/lib/audit/audit-log';
import { AUDIT_EVENTS } from '@/lib/audit/audit-events';

function inferErrorColumn(message: string) {
  const missing = message.match(/Thiếu(?: cột bắt buộc)?\s+(.+)$/i);
  if (missing) return missing[1].trim();
  const numeric = message.match(/^(.+?)\s+phải là số/i);
  if (numeric) return numeric[1].trim();
  return 'Dòng dữ liệu';
}

function errorDetails(rows: ImportRow[]): ImportErrorDetail[] {
  return rows.flatMap((row) => {
    const messages = row.errors?.length
      ? row.errors
      : row.status === 'Dữ liệu lệch'
        ? ['Dữ liệu lệch với dòng đã có cùng khóa nghiệp vụ']
        : row.status === 'Dữ liệu trùng'
          ? ['Dữ liệu trùng với dòng đã có']
          : [];
    return messages.map((message) => {
      const column = inferErrorColumn(message);
      return {
        maDongDuLieu: row.maDongDuLieu,
        sheetDich: row.sheetDich,
        rowRef: String(row.data['Dấu vết dòng'] ?? row.data['Tên file nguồn'] ?? ''),
        column,
        value: String(row.data[column] ?? ''),
        message,
        status: row.status ?? 'Dòng lỗi'
      };
    });
  });
}

export async function previewImport(input: {
  loaiDuLieu: string;
  chiNhanh: string;
  tenFile: string;
  dauVetFile: string;
  sheetDich: string;
  rows: ImportRow[];
  actor: string;
}): Promise<ImportPreviewResult> {
  const store = getDataStore();
  const existingRows = await store.read(input.sheetDich);
  const existingIndex = buildExistingRowIndex(existingRows);
  const classifiedRows = classifyImportRows(input.rows, existingIndex);
  const summary = {
    dongMoi: classifiedRows.filter((r) => r.status === 'Dòng mới').length,
    duLieuTrung: classifiedRows.filter((r) => r.status === 'Dữ liệu trùng').length,
    duLieuLech: classifiedRows.filter((r) => r.status === 'Dữ liệu lệch').length,
    dongLoi: classifiedRows.filter((r) => r.status === 'Dòng lỗi').length
  };
  const result = {
    maLanImport: `IMP-${Date.now()}`,
    loaiDuLieu: input.loaiDuLieu,
    chiNhanh: input.chiNhanh,
    tenFile: input.tenFile,
    dauVetFile: input.dauVetFile,
    rows: classifiedRows,
    errorDetails: errorDetails(classifiedRows),
    summary
  };
  await writeAuditLog({ eventType: AUDIT_EVENTS.IMPORT_PREVIEW, actor: input.actor, target: input.tenFile, after: summary });
  return result;
}
