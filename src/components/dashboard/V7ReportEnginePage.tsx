import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import type { V7Report } from '@/lib/reports/v7/report-engines';

type Props = {
  report: V7Report;
};

export function V7ReportEnginePage({ report }: Props) {
  const hasRows = report.primary.rows.some((row) => row.some((cell) => cell !== '—' && cell !== 'Chưa đủ dữ liệu'));

  return (
    <div className="space-y-3">
      <PageHeader title={report.title} description={report.description} status={report.status} />

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {report.metrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} trend={metric.trend} status={metric.status ?? 'neutral'} compact />
        ))}
      </section>

      {!hasRows ? (
        <EmptyState
          title={report.emptyTitle ?? 'Chưa đủ dữ liệu để kết luận'}
          description={report.emptyDescription ?? 'Engine đã sẵn sàng đọc Data Master V7. Khi có dữ liệu thật, màn hình này sẽ tự tính chỉ số, cảnh báo và bảng chi tiết.'}
        />
      ) : null}

      <section className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardTitle>{report.primary.title}</CardTitle>
          <div className="mt-2">
            <ReportTable headers={report.primary.headers} rows={report.primary.rows} maxHeight="max-h-[420px]" />
          </div>
        </Card>
        <div className="space-y-3">
          <Card>
            <CardTitle>{report.secondary.title}</CardTitle>
            <div className="mt-2">
              <ReportTable headers={report.secondary.headers} rows={report.secondary.rows} maxHeight="max-h-[240px]" />
            </div>
          </Card>
          <Card>
            <CardTitle>{report.issues.title}</CardTitle>
            <div className="mt-2">
              <ReportTable headers={report.issues.headers} rows={report.issues.rows} maxHeight="max-h-[220px]" />
            </div>
          </Card>
        </div>
      </section>

      <Card>
        <CardTitle>{report.readiness.title}</CardTitle>
        <div className="mt-2">
          <ReportTable headers={report.readiness.headers} rows={report.readiness.rows} maxHeight="max-h-[220px]" />
        </div>
      </Card>
    </div>
  );
}
