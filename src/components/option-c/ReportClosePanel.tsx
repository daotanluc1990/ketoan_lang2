'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import type { ReportCloseType } from '@/lib/option-c/report-close';

type PreviewPayload = {
  ok: boolean;
  data?: {
    status: string;
    canCleanClose: boolean;
    canCloseWithException: boolean;
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

function defaultPeriod(type: ReportCloseType) {
  if (type === 'day') return new Date().toISOString().slice(0, 10);
  if (type === 'month') return new Date().toISOString().slice(0, 7);
  return '2026-W25';
}

export function ReportClosePanel({ reportType, title }: { reportType: ReportCloseType; title: string }) {
  const [periodCode, setPeriodCode] = useState(defaultPeriod(reportType));
  const [branch, setBranch] = useState('Toàn hệ thống');
  const [note, setNote] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [missingDataReason, setMissingDataReason] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [responsibleOwner, setResponsibleOwner] = useState('');
  const [supplementDueDate, setSupplementDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [message, setMessage] = useState('Preview điều kiện trước khi chốt.');
  const canCleanClose = Boolean(preview?.data?.canCleanClose);
  const needsException = Boolean(preview?.data && !preview.data.canCleanClose);
  const exceptionReady = Boolean(exceptionReason.trim() && missingDataReason.trim() && responsibleOwner.trim() && supplementDueDate.trim());
  const rows = preview?.data?.checks?.map((check) => [check.label, check.status, check.detail]) ?? [['Chưa preview', '—', 'Bấm Preview để kiểm tra điều kiện chốt']];

  async function previewClose() {
    setLoading(true);
    setMessage('Đang preview điều kiện chốt...');
    try {
      const response = await fetch('/api/report-close/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ reportType, periodCode, branch })
      });
      const payload = await readJson(response);
      setPreview(payload);
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? 'Không preview được điều kiện chốt.');
      setMessage(payload.data?.canCleanClose ? 'Đủ điều kiện chốt sạch.' : 'Có thể chốt có ngoại lệ nếu ghi đủ nguyên nhân.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không preview được điều kiện chốt.');
    } finally {
      setLoading(false);
    }
  }

  async function confirmClose() {
    setLoading(true);
    setMessage(needsException ? 'Đang chốt có ngoại lệ...' : 'Đang chốt sạch...');
    try {
      const response = await fetch('/api/report-close/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          reportType,
          periodCode,
          branch,
          note,
          exceptionReason,
          missingDataReason,
          expectedImpact,
          responsibleOwner,
          supplementDueDate,
          force: needsException
        })
      });
      const payload = await readJson(response);
      if (!response.ok || !payload.ok) throw new Error(payload.error?.message ?? 'Không chốt báo cáo được.');
      setMessage(`Đã chốt báo cáo: ${payload.closeId ?? payload.data?.closeId ?? 'đã lưu'}`);
      await previewClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không chốt báo cáo được.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="grid gap-3 xl:grid-cols-[240px_1fr]">
        <div>
          <CardTitle>Chốt {title.toLowerCase()}</CardTitle>
          <p className="mt-1 text-[12px] font-semibold text-lang-muted">Chốt thật vào lịch sử báo cáo. Nếu thiếu dữ liệu, phải ghi ngoại lệ.</p>
        </div>
        <div className="grid gap-2 md:grid-cols-4">
          <label className="text-xs font-bold text-black/55">Kỳ báo cáo
            <input value={periodCode} onChange={(event) => setPeriodCode(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-white px-2 text-[12px] font-semibold" />
          </label>
          <label className="text-xs font-bold text-black/55">Cửa hàng/kho
            <input value={branch} onChange={(event) => setBranch(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-white px-2 text-[12px] font-semibold" />
          </label>
          <label className="text-xs font-bold text-black/55 md:col-span-2">Ghi chú
            <input value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-black/10 bg-white px-2 text-[12px] font-semibold" placeholder="Ghi chú khi chốt" />
          </label>
        </div>
      </div>

      {needsException ? (
        <div className="mt-3 grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 md:grid-cols-2">
          <label className="text-xs font-bold text-amber-900">Lý do chốt thiếu
            <input value={exceptionReason} onChange={(event) => setExceptionReason(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-[12px] font-semibold" placeholder="Ví dụ: chưa nhận kịp file kho cửa hàng" />
          </label>
          <label className="text-xs font-bold text-amber-900">Nguyên nhân thiếu dữ liệu
            <input value={missingDataReason} onChange={(event) => setMissingDataReason(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-[12px] font-semibold" placeholder="Nguồn nào thiếu, vì sao thiếu" />
          </label>
          <label className="text-xs font-bold text-amber-900">Ảnh hưởng dự kiến
            <input value={expectedImpact} onChange={(event) => setExpectedImpact(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-[12px] font-semibold" placeholder="Ảnh hưởng đến báo cáo/kho/dòng tiền" />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs font-bold text-amber-900">Người chịu trách nhiệm
              <input value={responsibleOwner} onChange={(event) => setResponsibleOwner(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-[12px] font-semibold" />
            </label>
            <label className="text-xs font-bold text-amber-900">Hạn bổ sung
              <input type="date" value={supplementDueDate} onChange={(event) => setSupplementDueDate(event.target.value)} className="mt-1 h-9 w-full rounded-lg border border-amber-200 bg-white px-2 text-[12px] font-semibold" />
            </label>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={previewClose} disabled={loading}>{loading ? 'Đang...' : 'Preview'}</Button>
        <Button variant={needsException ? 'danger' : 'secondary'} onClick={confirmClose} disabled={loading || !preview?.data || (needsException && !exceptionReady)}>
          {needsException ? 'Chốt có ngoại lệ' : 'Chốt đủ dữ liệu'}
        </Button>
        <span className="rounded-lg bg-lang-cream px-3 py-2 text-[12px] font-semibold text-lang-brown">{message}</span>
      </div>

      <div className="mt-3"><ReportTable headers={['Hạng mục', 'Trạng thái', 'Chi tiết']} rows={rows} maxHeight="max-h-[240px]" /></div>
    </Card>
  );
}
