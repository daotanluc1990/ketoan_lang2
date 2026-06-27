import Link from 'next/link';
import { FileInput, Send, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Card, CardTitle } from '@/components/ui/Card';
import { getDataStore } from '@/lib/data-store';

type SheetSpec = { name: string; label: string };

type V7ModulePageProps = { title: string; description?: string; statusWhenData?: 'Tốt' | 'Cần đối chiếu' | 'Cảnh báo'; sheets: SheetSpec[]; primaryHeaders?: string[]; emptyTitle?: string; emptyDescription?: string; notes?: string[][] };

function cell(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && String(value ?? '').trim()) return String(value ?? '');
  }
  return '—';
}
function previewRows(rows: Record<string, unknown>[], headers: string[]) { return rows.slice(0, 8).map((row) => headers.map((header) => cell(row, [header]))); }

function ActionLinks({ status }: { status: string }) {
  return <div className="flex flex-wrap gap-2"><Link href="/import-nhap-lieu" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-white px-2.5 text-[12px] font-bold text-lang-ink shadow-sm hover:bg-gray-50"><FileInput className="h-3.5 w-3.5" />Import</Link><Link href="/cai-dat-bot" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-white px-2.5 text-[12px] font-bold text-lang-ink shadow-sm hover:bg-gray-50"><Send className="h-3.5 w-3.5" />Bot</Link><Link href="/lich-su-chot-bao-cao" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-lang-red px-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-lang-redDark"><ShieldCheck className="h-3.5 w-3.5" />Chốt</Link><StatusBadge status={status} /></div>;
}

export async function V7ModulePage({ title, statusWhenData = 'Cần đối chiếu', sheets, primaryHeaders = ['Ngày', 'Chi nhánh', 'Kho', 'Mã hàng', 'Tên hàng', 'Số lượng', 'Giá trị', 'Trạng thái'], notes = [] }: V7ModulePageProps) {
  const store = getDataStore();
  const loaded = await Promise.all(sheets.map(async (sheet) => ({ sheet, rows: await store.read(sheet.name).catch(() => []) })));
  const totalRows = loaded.reduce((total, item) => total + item.rows.length, 0);
  const status = totalRows > 0 ? statusWhenData : 'Chưa đủ dữ liệu';
  const primary = loaded.find((item) => item.rows.length > 0) ?? loaded[0];
  const readinessRows = loaded.map((item) => [item.sheet.label, String(item.rows.length), item.rows.length > 0 ? 'Tốt' : 'Chưa đủ dữ liệu']);

  return (
    <div className="space-y-2.5">
      <section className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"><PageHeader title={title} status={status} /><ActionLinks status={status} /></section>
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><MetricCard label="Dòng dữ liệu" value={`${totalRows}`} status={totalRows > 0 ? 'good' : 'neutral'} compact /><MetricCard label="Nguồn sheet" value={`${sheets.length}`} status="good" compact /><MetricCard label="Sheet chính" value={primary?.sheet.label ?? '—'} status={primary?.rows.length ? 'good' : 'neutral'} compact /><MetricCard label="Trạng thái" value={status} status={totalRows > 0 ? 'warning' : 'neutral'} compact /></section>
      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-0"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-lang-line px-3 py-2"><CardTitle>{primary?.sheet.label ?? 'Dữ liệu chính'}</CardTitle><StatusBadge status={status} /></div><div className="p-2"><ReportTable headers={primaryHeaders} rows={primary?.rows.length ? previewRows(primary.rows, primaryHeaders) : [['—', '—', '—', '—', '—', '—', '—', 'Chưa đủ dữ liệu']]} maxHeight="max-h-[280px]" /></div></Card>
        <div className="space-y-2"><Card><CardTitle>Nguồn dữ liệu</CardTitle><div className="mt-2"><ReportTable headers={['Nguồn', 'Dòng', 'Trạng thái']} rows={readinessRows} maxHeight="max-h-[160px]" /></div></Card><Card><CardTitle>Ghi chú</CardTitle><div className="mt-2"><ReportTable headers={['Việc cần kiểm', 'Ý nghĩa', 'Trạng thái']} rows={notes.length ? notes : [['Schema', 'Đã map V7', 'Đạt']]} maxHeight="max-h-[150px]" /></div></Card></div>
      </section>
    </div>
  );
}
