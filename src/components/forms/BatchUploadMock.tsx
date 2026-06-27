'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ReportTable } from '@/components/report/ReportTable';

const IMPORT_UI_VERSION = 'IMPORT_UI_V8_4_20260627';

type ImportPreviewSummary = { dongMoi: number; duLieuTrung: number; duLieuLech: number; dongLoi: number };
type ImportPreview = { maLanImport: string; loaiDuLieu: string; chiNhanh: string; tenFile: string; summary: ImportPreviewSummary };
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
  return 'Có thể import';
}

function payloadErrorMessage(payload: { message?: string; error?: { message?: string } }, fallback: string) { return payload.error?.message ?? payload.message ?? fallback; }
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
    if (!preview) return selectedFiles.map((file: File) => [file.name, 'Chưa kiểm tra', '—', '—', '—', '—', '—', '—', 'Chưa đủ dữ liệu', 'Kiểm tra batch']);
    return preview.files.map((file: BatchPreviewFile) => [file.tenFile, file.loaiDuLieu, 'Tự nhận diện', file.chiNhanh, String(file.preview.summary.dongMoi), String(file.preview.summary.duLieuTrung), String(file.preview.summary.duLieuLech), String(file.preview.summary.dongLoi), statusFromFile(file), nextActionFromFile(file)]);
  }, [preview, selectedFiles]);

  const canConfirm = Boolean(preview && preview.summary.dongLoi === 0 && preview.summary.duLieuLech === 0 && preview.summary.soFileKhongNhanDien === 0);
  const summaryRows = preview ? [['File', String(preview.summary.soFile)], ['Dòng mới', String(preview.summary.dongMoi)], ['Trùng', String(preview.summary.duLieuTrung)], ['Lệch', String(preview.summary.duLieuLech)], ['Lỗi', String(preview.summary.dongLoi)], ['Kết luận', canConfirm ? 'Đạt' : 'Chưa thể import']] : [['Trạng thái', selectedFiles.length ? 'Đã chọn file' : 'Chưa chọn file'], ['Bản import', IMPORT_UI_VERSION]];

  async function checkBatch() {
    if (!selectedFiles.length) { setMessage('Chưa chọn file.'); return; }
    setLoading(true); setPreview(null); setMessage('Đang kiểm tra batch...');
    try {
      const formData = new FormData();
      for (const file of selectedFiles) formData.append('files', file);
      formData.append('actor', 'web-ketoan');
      const response = await fetch('/api/import/preview', { method: 'POST', body: formData, cache: 'no-store' });
      const payload = await readImportResponse(response);
      if (!response.ok || !payload.ok) throw new Error(payloadErrorMessage(payload, 'Không preview được batch.'));
      if (!payload.data?.files || !Array.isArray(payload.data.files)) throw new Error('API preview trả sai dạng batch. Deploy lại bản mới nhất và hard refresh.');
      setPreview(payload.data); setMessage('Đã kiểm tra batch.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Không kiểm tra được batch.'); } finally { setLoading(false); }
  }

  async function confirmBatch() {
    if (!preview) return;
    setConfirming(true); setMessage('Đang ghi Google Sheet...');
    try {
      const response = await fetch('/api/import/confirm', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ batch: preview, actor: 'web-ketoan' }), cache: 'no-store' });
      const payload = await readImportResponse(response);
      if (!response.ok || !payload.ok) throw new Error(payloadErrorMessage(payload, 'Không import được batch.'));
      const writtenRows = Array.isArray(payload.results) ? payload.results.reduce((total: number, item: { writtenRows?: number }) => total + (item.writtenRows ?? 0), 0) : 0;
      setMessage(`Đã ghi ${writtenRows} dòng mới.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import file đạt thất bại.'); } finally { setConfirming(false); }
  }

  function cancelBatch() { setSelectedFiles([]); setPreview(null); setMessage(`Đã hủy batch. ${IMPORT_UI_VERSION}`); }
  function downloadErrorFile() {
    const errorRows = preview?.files.flatMap((file: BatchPreviewFile) => file.preview.summary.dongLoi || file.preview.summary.duLieuLech ? [{ file: file.tenFile, loaiDuLieu: file.loaiDuLieu, loi: file.preview.summary.dongLoi, lech: file.preview.summary.duLieuLech, warnings: file.warnings.join('; ') }] : []) ?? [];
    const blob = new Blob([JSON.stringify(errorRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `import-loi-${Date.now()}.json`; link.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-2.5">
      <div className="grid gap-2 xl:grid-cols-[1.1fr_0.9fr]">
        <label className="block rounded-lg border border-dashed border-lang-red/40 bg-white p-3 text-center transition hover:border-lang-red">
          <input className="sr-only" type="file" multiple accept=".xlsx,.xls,.csv" onChange={(event: ChangeEvent<HTMLInputElement>) => { setSelectedFiles(Array.from(event.target.files ?? [])); setPreview(null); setMessage(`Đã chọn file. ${IMPORT_UI_VERSION}`); }} />
          <span className="text-[13px] font-black text-lang-ink">Chọn nhiều file Excel</span>
          <span className="ml-2 rounded-full bg-lang-redSoft px-2 py-0.5 text-[11px] font-bold text-lang-red">Preview trước</span>
        </label>
        <div className="rounded-lg border border-lang-line bg-white p-2.5 shadow-soft"><ReportTable headers={['Chỉ số', 'Giá trị']} rows={summaryRows} maxHeight="max-h-[120px]" /></div>
      </div>
      {selectedFiles.length > 0 ? <div className="rounded-lg border border-lang-line bg-white p-2.5 text-[12px] shadow-soft"><span className="font-bold text-lang-ink">File:</span> <span className="text-lang-muted">{selectedFiles.map((file) => file.name).join(', ')}</span></div> : null}
      <div className="rounded-lg border border-lang-line bg-white p-2 text-[12px] font-semibold text-lang-muted shadow-soft">{message}</div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={checkBatch} disabled={loading}>{loading ? 'Đang kiểm tra...' : 'Kiểm tra batch'}</Button>
        <Button variant="secondary" onClick={confirmBatch} disabled={!canConfirm || confirming}>{confirming ? 'Đang import...' : 'Import file đạt'}</Button>
        <Button variant="secondary" onClick={downloadErrorFile} disabled={!preview}>Tải file lỗi</Button>
        <Button variant="danger" onClick={cancelBatch}>Hủy batch</Button>
      </div>
      <ReportTable headers={['File', 'Loại dữ liệu', 'Kỳ', 'Chi nhánh', 'Dòng mới', 'Trùng', 'Lệch', 'Lỗi', 'Trạng thái', 'Việc cần làm']} rows={rows} maxHeight="max-h-[300px]" />
    </div>
  );
}
