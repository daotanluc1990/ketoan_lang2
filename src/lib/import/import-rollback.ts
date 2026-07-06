import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { writeAuditLog } from '@/lib/audit/audit-log';
import { AUDIT_EVENTS } from '@/lib/audit/audit-events';

const ROLLBACK_SOURCE_SHEETS = [
  SHEET_NAMES.DL_DOANH_THU_APP,
  SHEET_NAMES.DL_DOANH_THU_CUA_HANG,
  SHEET_NAMES.DL_SO_QUY,
  SHEET_NAMES.DL_TON_KHO,
  SHEET_NAMES.DL_THAT_THOAT_NVL,
  SHEET_NAMES.DL_CONG_NO,
  SHEET_NAMES.DL_THU_MUA,
  SHEET_NAMES.DM_CHI_NHANH,
  SHEET_NAMES.DM_KHO_CHI_NHANH,
  SHEET_NAMES.DM_MON_BAN,
  SHEET_NAMES.DM_NGUYEN_VAT_LIEU,
  SHEET_NAMES.DM_CONG_THUC_CHE_BIEN,
  SHEET_NAMES.DM_HAO_HUT_HOP_LE,
  SHEET_NAMES.DM_DON_GIA_NVL,
  SHEET_NAMES.DL_XNT_CUA_HANG,
  SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM,
  SHEET_NAMES.DL_XUAT_BTT_CHO_CUA_HANG,
  SHEET_NAMES.DL_CUA_HANG_NHAN_TU_BTT,
  SHEET_NAMES.DL_HUY_HANG_CUA_HANG,
  SHEET_NAMES.DL_HUY_HANG_BTT,
  SHEET_NAMES.DL_CHE_BIEN_THUC_TE,
  SHEET_NAMES.KQ_HAO_HUT_CHE_BIEN,
  SHEET_NAMES.KQ_THAT_THOAT_TON_KHO
];

type RollbackInput = {
  maLanImport: string;
  actor: string;
  reason: string;
  confirm?: boolean;
};

function normalizeStatus(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function findRowsByImportId(maLanImport: string) {
  const store = getDataStore();
  const results = [];
  for (const sheetName of ROLLBACK_SOURCE_SHEETS) {
    const rows = await store.read(sheetName).catch(() => [] as Record<string, unknown>[]);
    const matchingRows = rows.filter((row) => String(row['Mã lần import'] ?? '') === maLanImport);
    const activeRows = matchingRows.filter((row) => normalizeStatus(row['Trạng thái dữ liệu'] ?? row['trang_thai_dong']) !== 'da-hoan-tac');
    if (matchingRows.length) {
      results.push({ sheetName, matchedRows: matchingRows.length, activeRows: activeRows.length });
    }
  }
  return results;
}

async function safeWriteRollbackAudit(input: Parameters<typeof writeAuditLog>[0]) {
  try {
    await writeAuditLog(input);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Không ghi được audit log.';
  }
}

async function safeAppendRollbackHistory(row: Record<string, unknown>) {
  try {
    await getDataStore().append(SHEET_NAMES.IMPORT_LICH_SU, [row]);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Không ghi được lịch sử import.';
  }
}

export async function rollbackImport(input: RollbackInput) {
  const store = getDataStore();
  const preview = await findRowsByImportId(input.maLanImport);
  const affectedRows = preview.reduce((total, item) => total + item.activeRows, 0);

  if (!input.confirm) {
    const auditWarning = await safeWriteRollbackAudit({
      eventType: AUDIT_EVENTS.IMPORT_ROLLBACK,
      actor: input.actor,
      target: input.maLanImport,
      note: `Rollback preview: ${input.reason}`,
      after: { affectedRows, sheets: preview }
    });
    return {
      ok: true,
      mode: 'preview',
      maLanImport: input.maLanImport,
      affectedRows,
      sheets: preview,
      warnings: auditWarning ? [auditWarning] : [],
      message: affectedRows ? 'Đây là bản xem trước hoàn tác. Chưa đổi dữ liệu. Gửi confirm=true nếu CEO/Admin duyệt.' : 'Không tìm thấy dòng dữ liệu còn hiệu lực để hoàn tác.'
    };
  }

  if (!store.markRowsByImportId) {
    throw new Error('Data store hiện tại không hỗ trợ hoàn tác theo mã import.');
  }

  const updates = [];
  const updateErrors: Array<{ sheetName: string; message: string }> = [];
  for (const item of preview) {
    if (!item.activeRows) continue;
    try {
      updates.push(await store.markRowsByImportId({
        sheetName: item.sheetName,
        maLanImport: input.maLanImport,
        actor: input.actor,
        reason: input.reason
      }));
    } catch (error) {
      updateErrors.push({ sheetName: item.sheetName, message: error instanceof Error ? error.message : 'Không cập nhật được sheet.' });
    }
  }
  const updatedRows = updates.reduce((total, item) => total + item.updatedRows, 0);
  const afterPreview = await findRowsByImportId(input.maLanImport);
  const remainingActiveRows = afterPreview.reduce((total, item) => total + item.activeRows, 0);

  const historyWarning = await safeAppendRollbackHistory({
    'Mã lần import': input.maLanImport,
    'Ngày import': new Date().toISOString(),
    'Người import': input.actor,
    'Chi nhánh': 'Theo lần import gốc',
    'Tuần': 'Theo lần import gốc',
    'Số file': 0,
    'Tổng dòng mới': -updatedRows,
    'Tổng dòng trùng': 0,
    'Tổng dòng lệch': 0,
    'Tổng dòng lỗi': 0,
    'Trạng thái': remainingActiveRows ? 'Hoàn tác một phần' : 'Đã hoàn tác',
    'Ghi chú': `Hoàn tác mềm theo mã import. Lý do: ${input.reason}`
  });

  const auditWarning = await safeWriteRollbackAudit({
    eventType: AUDIT_EVENTS.IMPORT_ROLLBACK,
    actor: input.actor,
    target: input.maLanImport,
    note: `Rollback confirmed: ${input.reason}`,
    before: { affectedRows, sheets: preview },
    after: { updatedRows, remainingActiveRows, updates, updateErrors, historyWarning }
  });

  const warnings = [
    ...updateErrors.map((item) => `${item.sheetName}: ${item.message}`),
    historyWarning,
    auditWarning
  ].filter(Boolean);

  return {
    ok: remainingActiveRows === 0,
    mode: 'confirmed',
    maLanImport: input.maLanImport,
    affectedRows,
    updatedRows,
    remainingActiveRows,
    sheets: updates,
    warnings,
    message: remainingActiveRows
      ? `Đã hoàn tác một phần nhưng còn ${remainingActiveRows} dòng active. Kiểm tra cảnh báo chi tiết.`
      : updatedRows
        ? 'Đã hoàn tác mềm: đổi Trạng thái dữ liệu thành Đã hoàn tác. Không xóa cứng dòng dữ liệu.'
        : 'Không có dòng nào cần hoàn tác hoặc lần import đã được hoàn tác trước đó.'
  };
}
