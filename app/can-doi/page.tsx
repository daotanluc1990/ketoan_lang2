import { NoPermission } from '@/components/rbac/NoPermission';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { InsightListCard } from '@/components/report/InsightListCard';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { canRole, getRoleFromServerCookies } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function CanDoiPage({ searchParams }: PageProps) {
  const rbac = await getRoleFromServerCookies();
  if (!canRole(rbac.role, 'view_balance')) return <NoPermission role={rbac.role} permission="view_balance" />;
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const hasBalanceData = report.sourceCounts.cashbook > 0 || report.sourceCounts.inventory > 0 || report.sourceCounts.lossRows > 0;
  const moneyKpis = [
    { label: 'Dòng tiền tạm', value: report.executiveKpis.find((kpi) => kpi.label === 'Dòng tiền tạm')?.value ?? '—', note: 'Từ sổ quỹ' },
    { label: 'Tồn kho', value: report.executiveKpis.find((kpi) => kpi.label === 'Tồn kho')?.value ?? '—', note: `${report.totals.negativeStockCount} tồn âm` },
    { label: 'Thất thoát', value: report.executiveKpis.find((kpi) => kpi.label === 'Thất thoát quy tiền')?.value ?? '—', note: `${report.sourceCounts.lossRows} dòng NVL` },
    { label: 'Nguồn thiếu', value: `${report.missingSources.length}`, note: report.missingSources.length ? report.missingSources.join(', ') : 'Đủ nguồn chính' }
  ];
  const alertRows = [
    ['Dữ liệu', hasBalanceData ? 'Có dữ liệu' : 'Chưa đủ dữ liệu', report.message],
    ['Tồn âm', report.totals.negativeStockCount ? 'Cảnh báo' : 'Tốt', `${report.totals.negativeStockCount} mặt hàng`],
    ['Công nợ/TSCĐ', 'Cần đối chiếu', 'Chưa kết luận nếu chưa có nguồn import riêng']
  ];
  return (
    <div className="space-y-3">
      <PageHeader title="Cân đối rút gọn" description="Tiền, tồn kho, thất thoát và nguồn dữ liệu cần đối chiếu." status={hasBalanceData ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu'} />
      {!hasBalanceData ? <EmptyState title="Chưa đủ dữ liệu cân đối" description="Cần import sổ quỹ, tồn kho và thất thoát trước khi xem cân đối rút gọn." /> : null}
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Dòng tiền tạm" value={moneyKpis[0].value} status={report.totals.cashEnding < 0 ? 'danger' : hasBalanceData ? 'good' : 'neutral'} trend="Từ sổ quỹ" compact />
        <MetricCard label="Giá trị tồn kho" value={moneyKpis[1].value} status={report.totals.negativeStockCount ? 'warning' : hasBalanceData ? 'good' : 'neutral'} trend={moneyKpis[1].note} compact />
        <MetricCard label="Thất thoát quy tiền" value={moneyKpis[2].value} status={report.totals.lossValue ? 'warning' : 'neutral'} trend={moneyKpis[2].note} compact />
        <MetricCard label="Nguồn còn thiếu" value={moneyKpis[3].value} status={report.missingSources.length ? 'warning' : 'good'} trend={moneyKpis[3].note} compact />
      </section>
      <section className="grid gap-3 xl:grid-cols-[1.25fr_0.75fr]">
        <Card>
          <CardTitle>Bảng cân đối rút gọn</CardTitle>
          <div className="mt-2"><ReportTable headers={['Nhóm', 'Chỉ số', 'Số tiền', 'Tuần trước', 'Chênh lệch', 'Trạng thái', 'Ghi chú']} rows={report.balanceRows} maxHeight="max-h-[360px]" /></div>
        </Card>
        <Card>
          <CardTitle>Cảnh báo mất cân đối</CardTitle>
          <div className="mt-2"><ReportTable headers={['Mảng', 'Trạng thái', 'Ghi chú']} rows={alertRows} maxHeight="max-h-[240px]" /></div>
        </Card>
      </section>
      <InsightListCard title="Tóm tắt tiền và tồn kho" items={moneyKpis} />
    </div>
  );
}
