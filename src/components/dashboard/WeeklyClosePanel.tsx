'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';

type PreviewPayload = {
  ok: boolean;
  data?: {
    status: string;
    canClose: boolean;
    blockingChecks: Array<{ code: string; label: string; status: string; detail: string }>;
    checks: Array<{ code: string; label: string; status: string; detail: string }>;
  };
  error?: { message?: string };
};

async function readJson(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();
  const text = await response.text().catch(() => '');
  return { ok: false, error: { message: text || 'Server không trả JSON.' } };
}

export function WeeklyClosePanel() {
  const [periodCode, setPeriodCode] = useState('2026-W25');
  const [branch, setBranch] = useState('Toàn hệ thống');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [message, setMessage] = useState('Preview trước khi chốt. CEO/Admin mới được xác nhận.');

  const rows = preview?.data?.checks?.map((check) => [check.label, check.status, check.detail]) ?? [['Chưa preview', '—', 'Bấm Preview chốt']];
  const canClose = Boolean(preview?.data?.canClose);

  async function previewClose() {
    setLoading(true);
    setMessage('Đang preview...');
    try {
      const response = await fetch('/api/weekly-close/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ periodCode, branch })
      });
      const payload = await readJson(response);
      setPreview(payload);
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? 'Không preview được điều kiện chốt.');
      setMessage(payload.data?.canClose ? 'Đủ điều kiện chốt.' : 'Chưa đủ điều kiện chốt.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không preview được điều kiện chốt.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmClose(force = false) {
    setLoading(true);
    setMessage(force ? 'Đang chốt đặc biệt...' : 'Đang chốt...');
    try {
      const response = await fetch('/api/weekly-close/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ periodCode, branch, note, force })
      });
      const payload = await readJson(response);
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? 'Không chốt báo cáo được.');
      setMessage(`Đã chốt: ${payload.closeId ?? payload.data?.closeId ?? 'đã lưu snapshot'}`);
      await previewClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không chốt báo cáo được.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="grid gap-2 xl:grid-cols-[220px_1fr] xl:items-end">
        <div><CardTitle>Chốt báo cáo tuần</CardTitle></div>
        <div className="grid gap-2 sm:grid-cols-[130px_160px_1fr_auto_auto_auto] sm:items-end">
          <label className="text-xs font-bold text-black/55">Kỳ
            <input value={periodCode} onChange={(event) => setPeriodCode(event.target.value)} className="mt-1 h-8 w-full rounded-lg border border-black/10 bg-white px-2 text-[12px] font-semibold" />
          </label>
          <label className="text-xs font-bold text-black/55">Chi nhánh
            <input value={branch} onChange={(event) => setBranch(event.target.value)} className="mt-1 h-8 w-full rounded-lg border border-black/10 bg-white px-2 text-[12px] font-semibold" />
          </label>
          <label className="text-xs font-bold text-black/55">Ghi chú
            <input value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 h-8 w-full rounded-lg border border-black/10 bg-white px-2 text-[12px] font-semibold" placeholder="Ghi chú chốt" />
          </label>
          <Button onClick={previewClose} disabled={loading}>{loading ? 'Đang...' : 'Preview'}</Button>
          <Button variant="secondary" onClick={() => confirmClose(false)} disabled={loading || !canClose}>Chốt</Button>
          <Button variant="danger" onClick={() => confirmClose(true)} disabled={loading}>Đặc biệt</Button>
        </div>
      </div>
      <div className="mt-2 rounded-lg bg-lang-cream px-3 py-1.5 text-[12px] font-semibold text-lang-brown">{message}</div>
      <div className="mt-2"><ReportTable headers={['Hạng mục', 'Trạng thái', 'Chi tiết']} rows={rows} maxHeight="max-h-[220px]" /></div>
    </Card>
  );
}
