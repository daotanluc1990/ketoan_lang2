'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ReportTable } from '@/components/report/ReportTable';

const IMPORT_UI_VERSION = 'IMPORT_UI_V8_5_20260627';

type ImportPreviewSummary = { dongMoi: number; duLieuTrung: number; duLieuLech: number; dongLoi: number };
type ImportErrorDetail = { maDongDuLieu: string; sheetDich: string; rowRef: string; column: string; value: string; message: string; status: string };
type ImportPreview = { maLanImport: string; loaiDuLieu: string; chiNhanh: string; tenFile: string; summary: ImportPreviewSummary; errorDetails?: ImportErrorDetail[] };
type BatchPreviewFile = { tenFile: string; loaiDuLieu: string; chiNhanh: string; warnings: string[]; preview: ImportPreview };
type BatchPreview = { maBatch: string; files: BatchPreviewFile[]; summary: { soFile: number; dongMoi: number; duLieuTrung: number; duLieuLech: number; dongLoi: number; soFileKhongNhanDien: number } };

function statusFromFile(file: BatchPreviewFile) {
  if (file.preview.summary.dongLoi > 0) return 'Có lỗi';
  if (file.preview.summary.duLieuLech > 0) return 'Cần đối chiếu';
  if (file.warnings.length || file.loaiDuLieu === 'Không nhận diện được') return 'Cảnh báo';
  return 'Đạt';
}

function nextActionFromFile(file: BatchPreviewFile) {
  const status = statusFromFile(file);
  if (status === 'Có lỗi') return file.warnings[0] || 'Sửa lỗi';
  if (status === 'Cần đối chiếu') return 'Đối chiếu';
  if (status === 'Cảnh báo') return file.warnings[0] || 'Kiểm tra';
  return file.preview.summary.duLieuTrung > 0 && file.preview.summary.dongMoi === 0 ? 'Đã có, bỏ qua' : 'Có thể import';
}

function payloadErrorMessage(payload: { message?: string; error?: { code?: string; message?: string } }, fallback: string, status?: number) {
  if (status === 401 || payload.error?.code === 'UNAUTHORIZED') return 'Phiên đăng nhập hết hạn hoặc chưa đăng nhập. Vào trang Login rồi thử import lại.';
  if (status === 403 || payload.error?.code === 'FORBIDDEN') return 'Tài khoản hiện tại không có quyền import. Dùng role CEO/Kế toán/Admin để upload dữ liệu.';
  return payload.error?.message ?? payload.message ?? fallback;
}
async function readImportResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text().catch(() => '');
  return { ok: false, message: text.trim() ? `Server không trả JSON: ${text.trim().slice(0, 160)}` : 'Server không trả dữ liệu preview.' };
}

export function BatchUploadMock() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<BatchPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState(`Bản ${IMPORT_UI_VERSION}`);

  const rows = useMemo(() => {
    if (!preview) return selectedFiles.map((file: File) => [file.name, 'Chưa kiểm tra', '—', '—', '—', '0', '0', '0', '0', 'Chưa đủ dữ liệu', 'Kiểm tra batch']);
    return preview.files.map((file: BatchPreviewFile) => {
      const totalRows = file.preview.summary.dongMoi + file.preview.summary.duLieuTrung + file.preview.summary.duLieuLech + file.preview.summary.dongLoi;
      const validRows = Math.max(0, totalRows - file.preview.summary.dongLoi);
      return [
        file.tenFile,
        file.loaiDuLieu,
        'Tự nhận diện',
        file.chiNhanh,
        String(totalRows),
        String(validRows),
        String(file.preview.summary.dongMoi),
        String(file.preview.summary.duLieuTrung),
        String(file.preview.summary.duLieuLech),
        String(file.preview.summary.dongLoi),
        statusFromFile(file),
        nextActionFromFile(file)
      ];
    });
  }, [preview, selectedFiles]);

  const errorRows = useMemo(() => {
    if (!preview) return [['—', '—', '—', '—', '—', 'Chưa chạy preview', 'Chưa đủ dữ liệu']];
    const detailRows = preview.files.flatMap((file: BatchPreviewFile) => (file.preview.errorDetails ?? []).map((detail) => [
      file.tenFile,
      detail.sheetDich || file.loaiDuLieu,
      detail.rowRef || detail.maDongDuLieu,
      detail.column,
      detail.value || '—',
      detail.message,
      detail.status
    ]));
    if (detailRows.length) return detailRows;
    const rows = preview.files.flatMap((file: BatchPreviewFile) => {
      const items: string[][] = [];
      if (file.preview.summary.dongLoi > 0) items.push([file.tenFile, file.loaiDuLieu, '—', 'Dòng lỗi', String(file.preview.summary.dongLoi), file.warnings[0] || 'Sửa dòng lỗi rồi upload lại', 'Dòng lỗi']);
      if (file.preview.summary.duLieuLech > 0) items.push([file.tenFile, file.loaiDuLieu, '—', 'Dữ liệu lệch', String(file.preview.summary.duLieuLech), 'Đối chiếu kỳ, chi nhánh, sheet đích', 'Dữ liệu lệch']);
      if (file.preview.summary.duLieuTrung > 0) items.push([file.tenFile, file.loaiDuLieu, '—', 'Dữ liệu trùng', String(file.preview.summary.duLieuTrung), file.preview.summary.dongMoi ? 'Chỉ import dòng mới' : 'Bỏ qua file nếu không có dòng mới', 'Dữ liệu trùng']);
      if (file.warnings.length && !items.length) items.push([file.tenFile, file.loaiDuLieu, '—', 'Cảnh báo', String(file.warnings.length), file.warnings[0], 'Cảnh báo']);
      return items;
    });
    return rows.length ? rows : [['Tất cả file', '—', '—', 'Không có lỗi/lệch', '0', 'Có thể import file đạt', 'Đạt']];
  }, [preview]);

  const importableFiles = preview?.files.filter((file) => file.preview.summary.dongMoi > 0 && file.preview.summary.dongLoi === 0 && file.preview.summary.duLieuLech === 0) ?? [];
  const blockedFiles = preview ? preview.files.length - importableFiles.length : 0;
  const canConfirm = importableFiles.length > 0;
  const confirmHint = !preview
    ? 'Import sẽ mở sau khi kiểm tra preview.'
    : canConfirm
      ? `${importableFiles.length} file đạt có thể import. ${blockedFiles ? `${blockedFiles} file lỗi/lệch sẽ bị bỏ qua để sửa sau.` : 'Không có file bị chặn.'}`
      : 'Chưa thể import: chưa có file đạt điều kiện hoặc toàn bộ file đang lỗi/lệch.';
  const summaryRows = preview ? [['File', String(preview.summary.soFile)], ['Dòng mới', String(preview.summary.dongMoi)], ['Trùng', String(preview.summary.duLieuTrung)], ['Lệch', String(preview.summary.duLieuLech)], ['Lỗi', String(preview.summary.dongLoi)], ['Kết luận', preview.summary.dongMoi ? (canConfirm ? 'Đạt' : 'Chưa thể import') : 'Không có dòng mới']] : [['Trạng thái', selectedFiles.length ? 'Đã chọn file' : 'Chưa chọn file'], ['Bản kiểm tra', IMPORT_UI_VERSION]];

  async function checkBatch() {
    if (!selectedFiles.length) { setMessage('Chưa chọn file.'); return; }
    setLoading(true); setPreview(null); setMessage('Đang kiểm tra batch...');
    try {
      const formData = new FormData();
      for (const file of selectedFiles) formData.append('files', file);
      formData.append('actor', 'web-ketoan');
      const response = await fetch('/api/import/preview', { method: 'POST', body: formData, cache: 'no-store' });
      const payload = await readImportResponse(response);
      if (!response.ok || !payload.ok) throw new Error(payloadErrorMessage(payload, 'Không preview được batch.', response.status));
      if (!payload.data?.files || !Array.isArray(payload.data.files)) throw new Error('API preview trả sai dạng batch. Deploy lại bản mới nhất và hard refresh.');
      setPreview(payload.data); setMessage('Đã kiểm tra batch.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không kiểm tra được batch.'); } finally { setLoading(false); }
  }

  async function confirmBatch() {
    if (!preview) return;
    setConfirming(true); setMessage('Đang ghi Google Sheet...');
    try {
      const response = await fetch('/api/import/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ batch: { ...preview, files: importableFiles }, actor: 'web-ketoan' }), cache: 'no-store' });
      const payload = await readImportResponse(response);
      if (!response.ok || !payload.ok) throw new Error(payloadErrorMessage(payload, 'Không import được batch.', response.status));
      const writtenRows = Array.isArray(payload.results) ? payload.results.reduce((total: number, item: { writtenRows?: number }) => total + (item.writtenRows ?? 0), 0) : 0;
      setMessage(`Đã import ${importableFiles.length} file đạt, ghi ${writtenRows} dòng mới.${blockedFiles ? ` ${blockedFiles} file lỗi/lệch chưa ghi.` : ''}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import file đạt thất bại.'); } finally { setConfirming(false); }
  }

  function cancelBatch() { setSelectedFiles([]); setPreview(null); setMessage(`Đã hủy batch. ${IMPORT_UI_VERSION}`); }
  function downloadErrorFile() {
    const headers = ['File', 'Sheet đích', 'Dòng/Cột', 'Cột', 'Giá trị', 'Lý do', 'Trạng thái'];
    const csvRows = [headers, ...errorRows].map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `import-loi-${Date.now()}.csv`; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-start">
        <label className="flex h-[58px] cursor-pointer items-center justify-center rounded-lg border border-dashed border-lang-red/40 bg-white px-3 text-center transition hover:border-lang-red hover:bg-lang-redSoft/20">
          <input className="sr-only" type="file" multiple accept=".xlsx,.xls,.csv" onChange={(event: ChangeEvent<HTMLInputElement>) => { setSelectedFiles(Array.from(event.target.files ?? [])); setPreview(null); setMessage(`Đã chọn file. ${IMPORT_UI_VERSION}`); }} />
          <span className="text-[13px] font-black text-lang-ink">Chọn nhiều file Excel</span>
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">Xem trước</span>
        </label>
        <div className="rounded-lg border border-lang-line bg-white p-2 shadow-soft"><ReportTable headers={['Chỉ số', 'Giá trị']} rows={summaryRows} maxHeight="max-h-[100px]" /></div>
      </div>
      {selectedFiles.length > 0 ? <div className="rounded-lg border border-lang-line bg-white p-2 text-[12px] shadow-soft"><span className="font-bold text-lang-ink">File:</span> <span className="text-lang-muted">{selectedFiles.map((file) => file.name).join(', ')}</span></div> : null}
      <div className="rounded-lg border border-lang-line bg-white p-2 text-[12px] font-semibold text-lang-muted shadow-soft">{message}</div>
      <div className="rounded-lg border border-lang-line bg-white p-2 shadow-soft">
        <div className="grid gap-2 md:grid-cols-[1fr_1.2fr_auto_auto]">
          <Button variant="secondary" onClick={checkBatch} disabled={loading}>{loading ? 'Đang kiểm tra...' : '1. Kiểm tra preview'}</Button>
          <Button variant="primary" onClick={confirmBatch} disabled={!canConfirm || confirming}>{confirming ? 'Đang ghi Google Sheet...' : '2. Import vào Google Sheet'}</Button>
          <Button variant="secondary" onClick={downloadErrorFile} disabled={!preview}>Tải file lỗi</Button>
          <Button variant="danger" onClick={cancelBatch}>Hủy</Button>
        </div>
        <p className="mt-2 text-[12px] font-bold text-lang-muted">{confirmHint}</p>
      </div>
      <ReportTable headers={['File', 'Loại dữ liệu', 'Kỳ', 'Chi nhánh', 'Tổng dòng', 'Dòng hợp lệ', 'Dòng mới', 'Trùng', 'Lệch', 'Lỗi', 'Trạng thái', 'Việc cần làm']} rows={rows} maxHeight="max-h-[300px]" />
      <ReportTable headers={['File', 'Sheet đích', 'Dòng/Cột', 'Cột', 'Giá trị', 'Lý do', 'Trạng thái']} rows={errorRows} maxHeight="max-h-[220px]" />
    </div>
  );
}
