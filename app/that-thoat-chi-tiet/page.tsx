import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { parsePageReportFilters } from '@/lib/reports/report-filters';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function ThatThoatChiTietPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const hasLoss = report.sourceCounts.lossRows > 0;
  const top = report.lossTop5Rows[0];
  const totalLoss = report.executiveKpis.find((kpi) => kpi.label === 'Thất thoát quy tiền')?.value ?? '—';
  const summaryRows = [
    ['Tổng thất thoát', totalLoss, `${report.sourceCounts.lossRows} dòng NVL`, report.totals.lossValue ? 'Cảnh báo' : 'Chưa đủ dữ liệu'],
    ['NVL cao nhất', top?.[0] ?? '—', top?.[3] ?? 'Chưa có dữ liệu', top ? 'Cần kiểm' : 'Chưa đủ dữ liệu'],
    ['Tỷ lệ cao nhất', top?.[4] ?? '—', top?.[7] ?? 'Chưa có dữ liệu', top ? 'Cần kiểm' : 'Chưa đủ dữ liệu'],
    ['Nguồn dữ liệu', hasLoss ? 'Thật' : 'Trống', 'Không dùng số mẫu', hasLoss ? 'Tốt' : 'Chưa đủ dữ liệu']
  ];
  return (
    <div className="space-y-3">
      <PageHeader title="Báo cáo thất thoát chi tiết" description="NVL lệch tồn, giá trị thất thoát và hành động cần xử lý." status={hasLoss ? 'Cảnh báo' : 'Chưa đủ dữ liệu'} />
      {!hasLoss ? <EmptyState title="Chưa đủ dữ liệu thất thoát" description="Chưa có dữ liệu trong DL_THAT_THOAT_NVL. Hãy import file thất thoát NVL tuần." /> : null}
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Tổng thất thoát" value={totalLoss} status={report.totals.lossValue ? 'warning' : 'neutral'} trend={`${report.sourceCounts.lossRows} dòng NVL`} compact />
        <MetricCard label="Số NVL có dữ liệu" value={`${report.sourceCounts.lossRows}`} status={hasLoss ? 'good' : 'neutral'} trend="Từ Google Sheet" compact />
        <MetricCard label="NVL cảnh báo nhất" value={top?.[0] ?? '—'} status={top ? 'warning' : 'neutral'} trend={top?.[3] ?? 'Chưa có'} compact />
        <MetricCard label="Nguồn dữ liệu" value={hasLoss ? 'Thật' : 'Trống'} status={hasLoss ? 'good' : 'neutral'} trend="Không dùng số mẫu" compact />
      </section>
      <section className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardTitle>NVL cần xử lý</CardTitle>
          <div className="mt-2"><ReportTable headers={['NVL', 'ĐVT', 'Chênh SL', 'Giá trị lệch', 'Tỷ lệ thất thoát', 'Định mức', 'Vượt định mức', 'Trạng thái', 'Hành động']} rows={report.lossTop5Rows} maxHeight="max-h-[360px]" /></div>
        </Card>
        <Card>
          <CardTitle>Tóm tắt thất thoát</CardTitle>
          <div className="mt-2"><ReportTable headers={['Chỉ số', 'Giá trị', 'Ghi chú', 'Trạng thái']} rows={summaryRows} maxHeight="max-h-[260px]" /></div>
        </Card>
      </section>
    </div>
  );
}
