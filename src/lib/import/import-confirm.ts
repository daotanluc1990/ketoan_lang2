import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import type { ImportPreviewResult } from './import-types';
import { writeAuditLog } from '@/lib/audit/audit-log';
import { AUDIT_EVENTS } from '@/lib/audit/audit-events';
import { writeImportControlLogs } from './import-control-log';

function inferWeek(preview: ImportPreviewResult) {
  const week = preview.rows.map((row) => String(row.data['Mã tuần'] ?? row.data['Tuần'] ?? '').trim()).find(Boolean);
  return week || 'Tự nhận diện';
}

function importStatus(preview: ImportPreviewResult, writtenRows: number) {
  if (preview.summary.dongLoi || preview.summary.duLieuLech) {
    return writtenRows > 0 ? 'Thành công một phần' : 'Thất bại';
  }
  return 'Đã xác nhận';
}

export async function confirmImport(preview: ImportPreviewResult, actor: string, options: { allowPartial?: boolean } = {}) {
  const hasBlockingRows = preview.summary.dongLoi > 0 || preview.summary.duLieuLech > 0;
  const controlLog = await writeImportControlLogs(preview);

  if (hasBlockingRows && options.allowPartial !== true) {
    await getDataStore().append(SHEET_NAMES.IMPORT_LICH_SU, [
      {
        'Mã lần import': preview.maLanImport,
        'Ngày import': new Date().toISOString(),
        'Người import': actor,
        'Chi nhánh': preview.chiNhanh,
        'Tuần': inferWeek(preview),
        'Số file': 1,
        'Tổng dòng mới': preview.summary.dongMoi,
        'Tổng dòng trùng': preview.summary.duLieuTrung,
        'Tổng dòng lệch': preview.summary.duLieuLech,
        'Tổng dòng lỗi': preview.summary.dongLoi,
        'Trạng thái': 'Thất bại',
        'Ghi chú': `${preview.loaiDuLieu}: ${preview.tenFile}. Chưa ghi vì có lỗi/lệch.`
      }
    ]);
    await writeAuditLog({ eventType: AUDIT_EVENTS.IMPORT_CONFIRM, actor, target: preview.maLanImport, after: { ...preview.summary, controlLog, status: 'blocked' } });
    return {
      ok: false,
      writtenRows: 0,
      controlLog,
      message: 'Có dòng lỗi hoặc dữ liệu lệch. Không ghi Google Sheet. Đã ghi chi tiết vào tab kiểm soát lỗi/trùng/lệch.'
    };
  }

  const store = getDataStore();
  const rowsToWrite = preview.rows.filter((row) => row.status === 'Dòng mới');
  const rowsBySheet = new Map<string, Record<string, unknown>[]>();

  for (const row of rowsToWrite) {
    const list = rowsBySheet.get(row.sheetDich) ?? [];
    list.push({
      ...row.data,
      'Mã dòng dữ liệu': row.maDongDuLieu,
      'Dấu vết dòng': row.dauVetDong,
      'Mã lần import': preview.maLanImport,
      'Trạng thái dữ liệu': 'Đã xác nhận',
      'Ngày import': new Date().toISOString(),
      'Người import': actor
    });
    rowsBySheet.set(row.sheetDich, list);
  }

  for (const [sheetName, rows] of rowsBySheet.entries()) {
    await store.append(sheetName, rows);
  }

  const status = importStatus(preview, rowsToWrite.length);
  await store.append(SHEET_NAMES.IMPORT_LICH_SU, [
    {
      'Mã lần import': preview.maLanImport,
      'Ngày import': new Date().toISOString(),
      'Người import': actor,
      'Chi nhánh': preview.chiNhanh,
      'Tuần': inferWeek(preview),
      'Số file': 1,
      'Tổng dòng mới': preview.summary.dongMoi,
      'Tổng dòng trùng': preview.summary.duLieuTrung,
      'Tổng dòng lệch': preview.summary.duLieuLech,
      'Tổng dòng lỗi': preview.summary.dongLoi,
      'Trạng thái': status,
      'Ghi chú': `${preview.loaiDuLieu}: ${preview.tenFile}. Ghi ${rowsToWrite.length} dòng mới. ${controlLog.errorRows || controlLog.duplicateRows || controlLog.mismatchRows ? 'Có log kiểm soát.' : ''}`
    }
  ]);

  await writeAuditLog({ eventType: AUDIT_EVENTS.IMPORT_CONFIRM, actor, target: preview.maLanImport, after: { ...preview.summary, writtenRows: rowsToWrite.length, controlLog, status } });
  return {
    ok: status !== 'Thất bại',
    status,
    writtenRows: rowsToWrite.length,
    controlLog,
    message: rowsToWrite.length ? 'Đã ghi dữ liệu mới vào Google Sheet và ghi log kiểm soát.' : 'Không có dòng mới để ghi. Đã ghi log kiểm soát nếu có trùng/lỗi/lệch.'
  };
}
