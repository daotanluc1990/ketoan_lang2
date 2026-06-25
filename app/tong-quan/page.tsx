import { PageHeader } from '@/components/layout/PageHeader';
import { CeoCockpitPage } from '@/components/dashboard/CeoCockpitPage';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { parsePageReportFilters } from '@/lib/reports/report-filters';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TongQuanPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const status = report.hasRealData
    ? report.missingSources.length
      ? 'Cần đối chiếu'
      : 'Tốt'
    : 'Chưa đủ dữ liệu';

  return (
    <div className="space-y-3">
      <PageHeader
        title="CEO Cockpit"
        description="Màn hình điều hành gọn: trạng thái chốt báo cáo, KPI chính, cảnh báo sổ quỹ, dữ liệu thiếu và việc CEO cần xử lý."
        status={status}
      />
      <CeoCockpitPage report={report} />
    </div>
  );
}
