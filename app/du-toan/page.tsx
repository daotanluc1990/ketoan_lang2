import { NoPermission } from '@/components/rbac/NoPermission';
import { PageHeader } from '@/components/layout/PageHeader';
import { ChartCard } from '@/components/report/ChartCard';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { buildForecastReport } from '@/lib/forecast/forecast-engine';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { canRole, getRoleFromServerCookies } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined> };

function money(value: number) {
  if (!Number.isFinite(value) || value === 0) return '—';
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} tỷ`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}tr`;
  return `${Math.round(value).toLocaleString('vi-VN')}đ`;
}

export default async function DuToanPage({ searchParams }: PageProps) {
  const rbac = await getRoleFromServerCookies();
  if (!canRole(rbac.role, 'view_forecast')) return <NoPermission role={rbac.role} permission="view_forecast" />;
  const filters = await parsePageReportFilters(searchParams);
  const forecast = await buildForecastReport(filters);
  const base = forecast.scenarios.find((scenario) => scenario.id === 'co_so');
  const conservative = forecast.scenarios.find((scenario) => scenario.id === 'than_trong');
  const growth = forecast.scenarios.find((scenario) => scenario.id === 'tang_truong');
  const chartItems = forecast.scenarios.length
    ? forecast.scenarios.map((scenario) => ({ label: scenario.name, value: scenario.revenue, caption: money(scenario.revenue) }))
    : [{ label: 'Chưa đủ dữ liệu', value: 0, caption: '—' }];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Dự toán tuần tới"
        description="V5.0: code tính số dự toán, Forecast Agent chỉ giải thích giả định/rủi ro. Chưa ghi DU_TOAN_TUAN_TOI nếu CEO chưa duyệt."
        status={forecast.canForecast ? (forecast.status === 'du_du_lieu' ? 'Đủ dữ liệu' : 'Cần đối chiếu') : 'Chưa đủ dữ liệu'}
      />
      {!forecast.canForecast ? (
        <EmptyState
          title="Chưa đủ dữ liệu để lập dự toán"
          description={`Cần tối thiểu ${forecast.minimumHistoryWeeks} tuần lịch sử hợp lệ. Hiện có ${forecast.historyWeekCount} tuần dùng được. Hệ thống không dùng dữ liệu mẫu và không tự bịa số.`}
        />
      ) : null}

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Dự toán cơ sở" value={base ? money(base.revenue) : '—'} status={forecast.status === 'du_du_lieu' ? 'good' : forecast.canForecast ? 'warning' : 'neutral'} trend="Calculation engine" />
        <MetricCard label="Chi cơ sở" value={base ? money(base.cashOut) : '—'} status={base?.needsCeoApproval ? 'warning' : forecast.canForecast ? 'good' : 'neutral'} trend="Theo lịch sử chi" />
        <MetricCard label="Dòng tiền cơ sở" value={base ? money(base.netCashflow) : '—'} status={base && base.netCashflow < 0 ? 'danger' : forecast.canForecast ? 'good' : 'neutral'} trend="Thu dự kiến - chi dự kiến" />
        <MetricCard label="Độ tin cậy" value={`${forecast.dataQuality.score}/100`} status={forecast.dataQuality.score >= 80 ? 'good' : forecast.dataQuality.score >= 60 ? 'warning' : 'neutral'} trend={forecast.dataQuality.label} />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Ba kịch bản dự toán</CardTitle>
          <div className="mt-3">
            <ReportTable headers={['Kịch bản', 'Doanh thu dự kiến', 'Chi dự kiến', 'Dòng tiền', 'Khoảng dự toán', 'Duyệt']} rows={forecast.rows.scenarioRows.length ? forecast.rows.scenarioRows : [['Chưa đủ dữ liệu', '—', '—', '—', '—', 'Không chốt']]} />
          </div>
        </Card>
        <Card>
          <CardTitle>Bằng chứng lịch sử</CardTitle>
          <div className="mt-3">
            <ReportTable headers={['Tuần', 'Doanh thu', 'Tiền vào', 'Tiền ra', 'Dòng tiền', 'Nguồn']} rows={forecast.rows.historyRows.length ? forecast.rows.historyRows : [['Chưa đủ dữ liệu', '—', '—', '—', '—', 'Cần import thêm']]} />
          </div>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard title="So sánh doanh thu theo kịch bản" items={chartItems} />
        <Card>
          <CardTitle>Điều kiện dữ liệu</CardTitle>
          <div className="mt-3">
            <ReportTable headers={['Điều kiện', 'Giá trị', 'Trạng thái']} rows={forecast.rows.evidenceRows} />
          </div>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Công thức tính</CardTitle>
          <div className="mt-3">
            <ReportTable headers={['STT', 'Công thức / quy tắc']} rows={forecast.calculationFormula.map((item, index) => [String(index + 1), item])} />
          </div>
        </Card>
        <Card>
          <CardTitle>Việc cần làm trước khi chốt</CardTitle>
          <div className="mt-3">
            <ReportTable headers={['Owner', 'Việc cần làm', 'Deadline']} rows={forecast.rows.actionRows} />
          </div>
        </Card>
      </section>

      <Card>
        <CardTitle>Ghi chú kiểm soát</CardTitle>
        <div className="mt-3 text-sm text-slate-600">
          <p>{forecast.message}</p>
          <p className="mt-2">Nguồn doanh thu baseline: {forecast.baseline.revenueSource}. Công thức: {forecast.baseline.weightedFormula}</p>
          <p className="mt-2">Chỉ sau khi CEO duyệt mới được ghi bản chốt vào {forecast.approval.targetSheet}. V5.0 hiện là dự toán nháp/read-only.</p>
          {conservative?.needsCeoApproval || growth?.needsCeoApproval ? <p className="mt-2 text-amber-700">Có kịch bản cần CEO duyệt vì rủi ro dòng tiền hoặc chi phí.</p> : null}
        </div>
      </Card>
    </div>
  );
}
