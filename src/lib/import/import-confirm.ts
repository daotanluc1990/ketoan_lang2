import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import type { ImportPreviewResult } from './import-types';
import { writeAuditLog } from '@/lib/audit/audit-log';
import { AUDIT_EVENTS } from '@/lib/audit/audit-events';
import { writeImportControlLogs } from './import-control-log';
import { describeClosedPeriodMatches, findClosedPeriodMatches } from '@/lib/reports/v7/period-guard';
import { mapToOptionCSheet, toOptionCImportRow } from '@/lib/option-c/sheet-mapping';

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

async function appendImportHistory(preview: ImportPreviewResult, actor: string, status: string, note: string) {
  const importedAt = new Date().toISOString();
  await getDataStore().append(SHEET_NAMES.IMPORT_LICH_SU, [
    {
      'Mã lần import': preview.maLanImport,
      'Ngày import': importedAt,
      'Người import': actor,
      'Chi nhánh': preview.chiNhanh,
      'Tuần': inferWeek(preview),
      'Số file': 1,
      'Tổng dòng mới': preview.summary.dongMoi,
      'Tổng dòng trùng': preview.summary.duLieuTrung,
      'Tổng dòng lệch': preview.summary.duLieuLech,
      'Tổng dòng lỗi': preview.summary.dongLoi,
      'Trạng thái': status,
      'Ghi chú': note
    }
  ]);
  await getDataStore().append(SHEET_NAMES.IMPORT_LOG_SYSTEM_LOG, [
    {
      log_id: preview.maLanImport,
      log_type: 'IMPORT',
      thoi_gian: importedAt,
      user: actor,
      role: 'Kế toán',
      module: preview.loaiDuLieu,
      file_name: preview.tenFile,
      file_type: preview.tenFile.split('.').pop() ?? '',
      ky_bao_cao: inferWeek(preview),
      so_dong_doc: preview.rows.length,
      so_dong_hop_le: preview.summary.dongMoi,
      so_dong_loi: preview.summary.dongLoi,
      ket_qua: status,
      noi_dung_loi: preview.summary.dongLoi ? 'Có dòng lỗi trong preview/import' : '',
      hanh_dong_tiep_theo: preview.summary.dongLoi || preview.summary.duLieuLech ? 'Sửa file nguồn hoặc chốt có ngoại lệ nếu được duyệt' : 'Theo dõi dashboard và chốt báo cáo',
      ghi_chu: note
    }
  ]);
}

export async function confirmImport(preview: ImportPreviewResult, actor: string, options: { allowPartial?: boolean; forceClosedPeriod?: boolean } = {}) {
  const hasBlockingRows = preview.summary.dongLoi > 0 || preview.summary.duLieuLech > 0;
  const controlLog = await writeImportControlLogs(preview);

  const closedPeriodMatches = await findClosedPeriodMatches(preview);
  if (closedPeriodMatches.length && options.forceClosedPeriod !== true) {
    const closedMessage = describeClosedPeriodMatches(closedPeriodMatches);
    await appendImportHistory(preview, actor, 'Thất bại', `${preview.loaiDuLieu}: ${preview.tenFile}. Kỳ đã chốt: ${closedMessage}`);
    await writeAuditLog({ eventType: AUDIT_EVENTS.IMPORT_CONFIRM, actor, target: preview.maLanImport, after: { ...preview.summary, controlLog, status: 'closed_period_blocked', closedPeriodMatches } });
    return {
      ok: false,
      writtenRows: 0,
      controlLog,
      closedPeriodMatches,
      message: `Kỳ báo cáo đã chốt nên không ghi dữ liệu mới. Cần CEO/Admin mở kỳ hoặc dùng chốt đặc biệt: ${closedMessage}`
    };
  }

  if (hasBlockingRows && options.allowPartial !== true) {
    await appendImportHistory(preview, actor, 'Thất bại', `${preview.loaiDuLieu}: ${preview.tenFile}. Chưa ghi vì có lỗi/lệch.`);
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
  let optionCWrittenRows = 0;

  for (const row of rowsToWrite) {
    const importMeta = {
      'Mã dòng dữ liệu': row.maDongDuLieu,
      'Dấu vết dòng': row.dauVetDong,
      'Mã lần import': preview.maLanImport,
      'Trạng thái dữ liệu': 'Đã xác nhận',
      'Ngày import': new Date().toISOString(),
      'Người import': actor,
      'Tên file nguồn': preview.tenFile
    };
    const list = rowsBySheet.get(row.sheetDich) ?? [];
    list.push({
      ...row.data,
      ...importMeta
    });
    rowsBySheet.set(row.sheetDich, list);

    const optionCSheet = mapToOptionCSheet(row.sheetDich);
    if (optionCSheet && optionCSheet !== row.sheetDich) {
      const optionCList = rowsBySheet.get(optionCSheet) ?? [];
      optionCList.push(toOptionCImportRow(row.sheetDich, row.data, importMeta));
      rowsBySheet.set(optionCSheet, optionCList);
      optionCWrittenRows += 1;
    }
  }

  for (const [sheetName, rows] of rowsBySheet.entries()) {
    await store.append(sheetName, rows);
  }

  const status = importStatus(preview, rowsToWrite.length);
  await appendImportHistory(preview, actor, status, `${preview.loaiDuLieu}: ${preview.tenFile}. Ghi ${rowsToWrite.length} dòng mới; đồng bộ Option C ${optionCWrittenRows} dòng. ${controlLog.errorRows || controlLog.duplicateRows || controlLog.mismatchRows ? 'Có log kiểm soát.' : ''}`);

  await writeAuditLog({ eventType: AUDIT_EVENTS.IMPORT_CONFIRM, actor, target: preview.maLanImport, after: { ...preview.summary, writtenRows: rowsToWrite.length, optionCWrittenRows, controlLog, status } });
  return {
    ok: status !== 'Thất bại',
    status,
    writtenRows: rowsToWrite.length,
    optionCWrittenRows,
    controlLog,
    message: rowsToWrite.length ? 'Đã ghi dữ liệu mới vào Google Sheet, đồng bộ sheet Option C và ghi log kiểm soát.' : 'Không có dòng mới để ghi. Đã ghi log kiểm soát nếu có trùng/lỗi/lệch.'
  };
}
