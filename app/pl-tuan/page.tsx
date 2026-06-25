import { NoPermission } from '@/components/rbac/NoPermission';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/report/ChartCard';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { canRole, getRoleFromServerCookies } from '@/lib/rbac/rbac';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { analyzeCashbookBusiness, filterCashbookBusiness } from '@/lib/reports/cashbook-business';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

async function readCashbookRows() {
  try {
    return await getDataStore().read(SHEET_NAMES.DL_SO_QUY);
  } catch {
    return [];
  }
}

export default async function PlTuanPage({ searchParams }: PageProps) {
  const rbac = await getRoleFromServerCookies();
  if (!canRole(rbac.role, 'view_pnl')) return <NoPermission role={rbac.role} permission="view_pnl" />;
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const cashbookRows = filterCashbookBusiness(await readCashbookRows(), filters);
  const business = analyzeCashbookBusiness(cashbookRows);
  const status = report.hasRealData ? (report.missingSources.length ? 'Cần đối chiếu' : 'Tốt') : 'Chưa đủ dữ liệu';

  return (
    <div className="space-y-3">
      <PageHeader title="P&L Tuần" description="P&L chỉ dùng dữ liệu thật. Sổ quỹ được tách riêng để không nhầm trả NCC, capex hoặc chi BTT thành chi phí vận hành cửa hàng." status={status} />
      {!report.hasRealData ? <EmptyState title="Chưa đủ dữ liệu để kết luận" description="Chưa có dữ liệu import thật trong Google Sheet. Hãy import doanh thu app, doanh thu cửa hàng, sổ quỹ, tồn kho và thất thoát trước." /> : null}

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {report.executiveKpis.slice(0, 8).map((kpi) => <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} trend={kpi.trend} status={kpi.status} compact />)}
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardTitle>Quy tắc P&L từ Sổ quỹ</CardTitle>
          <p className="mt-2 text-sm text-black/60">Các khoản trả NCC, capex và chi Bếp Trung Tâm không được tự động trộn vào chi phí vận hành Làng NVT.</p>
          <div className="mt-3"><ReportTable headers={['Nhóm', 'Chỉ số', 'Số tiền', 'Quy tắc', 'Trạng thái']} rows={business.pnlRows} maxHeight="max-h-[360px]" /></div>
        </Card>
        <Card>
          <CardTitle>Nhận xét kế toán bắt buộc</CardTitle>
          <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm text-black/70">
            <li>{report.hasRealData ? 'Báo cáo đang đọc dữ liệu import thật.' : 'Chưa đủ dữ liệu để kết luận.'}</li>
            <li>Không chốt P&L nếu còn thiếu doanh thu app, doanh thu cửa hàng, sổ quỹ, tồn kho hoặc thất thoát.</li>
            <li>Không đưa trả NCC/công nợ vào P&L nếu chưa đối chiếu thu mua và công nợ.</li>
            <li>Không trộn chi Bếp Trung Tâm vào chi phí vận hành Làng NVT.</li>
            <li>Thiếu nguồn hiện tại: {report.missingSources.length ? report.missingSources.join(', ') : 'Không thiếu nguồn chính'}.</li>
          </ol>
        </Card>
      </section>

      <Card>
        <CardTitle>Bảng P&L chính</CardTitle>
        <div className="mt-3"><ReportTable headers={['Nhóm', 'Chỉ số', 'Tuần này', 'Tuần trước', 'Chênh lệch', 'Tỷ lệ', 'Đánh giá']} rows={report.pnlRows} maxHeight="max-h-[360px]" /></div>
      </Card>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard title="Doanh thu theo nguồn" items={report.revenueByChannel.map((item) => ({ label: item.channel, value: item.value, caption: item.revenue }))} />
        <ChartCard title="Tỷ lệ chính" items={[{ label: 'COGS tạm tính', value: report.totals.cogsPercent * 100, caption: `${(report.totals.cogsPercent * 100).toFixed(1)}%` }, { label: 'App fee%', value: report.totals.appFeePercent * 100, caption: `${(report.totals.appFeePercent * 100).toFixed(1)}%` }]} />
      </section>

      <Card>
        <CardTitle>Tóm tắt Top 5 thất thoát đưa vào P&L</CardTitle>
        <div className="mt-3"><ReportTable headers={['NVL', 'ĐVT', 'Chênh SL', 'Giá trị lệch', 'Tỷ lệ', 'Định mức', 'Vượt', 'Trạng thái', 'Hành động']} rows={report.lossTop5Rows} maxHeight="max-h-[360px]" /></div>
      </Card>
    </div>
  );
}
