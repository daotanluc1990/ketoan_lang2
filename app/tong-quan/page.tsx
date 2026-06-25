import { PageHeader } from '@/components/layout/PageHeader';
import { AccountingOverviewPage } from '@/components/dashboard/AccountingOverviewPage';
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
        title="Tổng quan kế toán ERP"
        description="Theo dõi dữ liệu nhập - xuất - tồn - bán - hủy - đối chiếu trước khi chốt báo cáo."
        status={status}
      />
      <AccountingOverviewPage report={report} />
    </div>
  );
}
