import Link from 'next/link';
import { Download, FileInput, Send, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Card, CardTitle } from '@/components/ui/Card';
import type { V7Report } from '@/lib/reports/v7/report-engines';

type Props = { report: V7Report };

function ActionLinks({ status }: { status: string }) {
  return <div className="flex flex-wrap gap-2"><Link href="/import-nhap-lieu" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-white px-2.5 text-[12px] font-bold text-lang-ink shadow-sm hover:bg-gray-50"><FileInput className="h-3.5 w-3.5" />Import</Link><Link href="/cai-dat-bot" className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-white px-2.5 text-[12px] font-bold text-lang-ink shadow-sm hover:bg-gray-50"><Send className="h-3.5 w-3.5" />Bot</Link><Link href="/lich-su-chot-bao-cao" className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-lang-red px-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-lang-redDark"><ShieldCheck className="h-3.5 w-3.5" />Chốt</Link><span className="inline-flex h-8 items-center gap-1 rounded-lg border border-lang-line bg-gray-50 px-2.5 text-[12px] font-bold text-lang-muted"><Download className="h-3.5 w-3.5" />Xuất</span><StatusBadge status={status} /></div>;
}

export function V7ReportEnginePage({ report }: Props) {
  const visibleMetrics = report.metrics.slice(0, 6);
  return (
    <div className="space-y-2.5">
      <section className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between"><PageHeader title={report.title} status={report.status} /><ActionLinks status={report.status} /></section>
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">{visibleMetrics.map((metric) => <MetricCard key={metric.label} label={metric.label} value={metric.value} status={metric.status ?? 'neutral'} compact />)}</section>
      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-0"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-lang-line px-3 py-2"><CardTitle>{report.primary.title}</CardTitle><StatusBadge status={report.status} /></div><div className="p-2"><ReportTable headers={report.primary.headers} rows={report.primary.rows} maxHeight="max-h-[280px]" /></div></Card>
        <div className="space-y-2"><Card><CardTitle>{report.secondary.title}</CardTitle><div className="mt-2"><ReportTable headers={report.secondary.headers} rows={report.secondary.rows} maxHeight="max-h-[150px]" /></div></Card><Card><CardTitle>{report.issues.title}</CardTitle><div className="mt-2"><ReportTable headers={report.issues.headers} rows={report.issues.rows} maxHeight="max-h-[150px]" /></div></Card></div>
      </section>
      <Card><CardTitle>{report.readiness.title}</CardTitle><div className="mt-2"><ReportTable headers={report.readiness.headers} rows={report.readiness.rows} maxHeight="max-h-[140px]" /></div></Card>
    </div>
  );
}
