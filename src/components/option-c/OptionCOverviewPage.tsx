import Link from 'next/link';
import { AlertTriangle, CheckCircle2, FileInput, ShieldCheck } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import { StatusBadge } from '@/components/report/StatusBadge';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { buildAccountingTasksFromReport } from '@/lib/option-c/task-engine';
import { KPI_DICTIONARY_ALL, KPI_DICTIONARY_CORE } from '@/lib/option-c/catalog';
import { buildOptionCDashboardSummary } from '@/lib/option-c/dashboard-report';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { TopMoversBarChart } from '@/components/charts/TopMoversBarChart';
import { AlertPanel } from '@/components/charts/AlertPanel';
import { generateAlerts, buildTrendData, buildTopMovers } from '@/lib/reports/dashboard-insights';

function overviewKpiStatus(code: string, value: number, score: number) {
  if (code === 'DQ001') return score >= 80 ? 'Tốt' : score >= 60 ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu';
  if (value > 0) return 'Đỏ';
  return 'Tốt';
}

export async function OptionCOverviewPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildOptionCDashboardSummary(filters);
  const fullReport = await buildDashboardReport(filters);
  const tasks = buildAccountingTasksFromReport(report, filters);
  const redTasks = tasks.filter((task) => task.priority === 'Đỏ');
  const score = report.dataQualityScore;
  const status = score >= 80 && redTasks.length === 0 ? 'Tốt' : score >= 60 ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu';
  const dashboardKpiCodes = ['DQ001', 'DQ002', 'DT001', 'TM008', 'TM005', 'CN001', 'KH003', 'DM001', 'DM002', 'NV002'];
  const kpiDictionary = new Map(KPI_DICTIONARY_ALL.map((kpi) => [kpi.code, kpi]));
  const derivedKpis = new Map([
    ['DQ001', { value: `${score}/100`, status: overviewKpiStatus('DQ001', score, score) }],
    ['DQ002', { value: String(report.missingSources.length), status: overviewKpiStatus('DQ002', report.missingSources.length, score) }],
    ['NV002', { value: String(redTasks.length), status: overviewKpiStatus('NV002', redTasks.length, score) }]
  ]);
  const kpis = dashboardKpiCodes
    .map((code) => {
      const live = report.coreKpis.find((kpi) => kpi.code === code);
      if (live) return [live.name, live.displayValue, live.unit, live.status];
      const fallback = kpiDictionary.get(code);
      const derived = derivedKpis.get(code);
      if (!fallback) return null;
      return [fallback.name, derived?.value ?? '—', fallback.unit, derived?.status ?? 'Chưa đủ dữ liệu'];
    })
    .filter(Boolean)
    .map((kpi) => kpi as string[]);
  const alertRows = report.redAlerts.length ? report.redAlerts : redTasks.slice(0, 5).map((task) => [task.priority, task.module, task.title, task.owner, task.action]);
  const taskRows = tasks.slice(0, 8).map((task) => [task.priority, task.title, task.owner, task.deadline, task.status]);
  const reportRows = report.reportDueRows;

  return (
    <div className="space-y-2.5">
      <Card className="self-start">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start justify-between gap-2 lg:flex-1">
            <div className="min-w-0">
              <CardTitle>Điều kiện chốt</CardTitle>
              <p className="mt-1 text-[12px] font-extrabold leading-5 text-lang-muted">
                DQ <span className="number text-lang-ink">{score}/100</span> · Nguồn thiếu <span className="number text-lang-ink">{report.missingSources.length}</span> · Task đỏ <span className="number text-lang-ink">{redTasks.length}</span>
              </p>
            </div>
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-lang-red" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:w-[372px]">
            <Link className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-lang-red px-2 text-[12px] font-bold text-white" href="/bao-cao-quan-tri?period=week"><CheckCircle2 className="h-4 w-4" />Chốt báo cáo</Link>
            <Link className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-lang-line bg-lang-paper px-2 text-[12px] font-bold text-lang-ink" href="/nhap-lieu/upload"><FileInput className="h-4 w-4" />Upload</Link>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[12px] font-bold uppercase text-lang-redDark">Option C · Dashboard đọc nhanh</p>
            <h3 className="text-xl font-black text-lang-ink">Tổng quan kế toán điều hành</h3>
            <p className="mt-1 text-[12px] font-semibold text-lang-muted">Ưu tiên đọc 15_DASHBOARD_REPORT; nếu thiếu, app báo rõ nguồn dữ liệu cần bổ sung và cho chốt có ngoại lệ kèm nguyên nhân.</p>
          </div>
          <StatusBadge status={status} />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map(([label, value, unit, itemStatus]) => (
            <div key={label} className="rounded-xl border border-lang-line bg-lang-paper p-3 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] font-bold text-lang-muted">{label}</p>
                <StatusBadge status={itemStatus} />
              </div>
              <p className="number mt-2 text-xl font-black text-lang-ink">{value}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-lang-muted">{unit}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="mb-2 flex items-center justify-between"><CardTitle>Cảnh báo đỏ / cam</CardTitle><AlertTriangle className="h-4 w-4 text-red-600" /></div>
          <ReportTable headers={['Mức', 'Nhóm', 'Nội dung', 'Phụ trách', 'Hành động']} rows={alertRows.length ? alertRows : [['Tốt', 'Không có cảnh báo đỏ', 'Dữ liệu hiện tại không phát sinh cảnh báo đỏ', '—', 'Tiếp tục theo dõi']]} maxHeight="max-h-[260px]" />
        </Card>
        <Card>
          <CardTitle>Nhiệm vụ kế toán hôm nay</CardTitle>
          <div className="mt-2"><ReportTable headers={['Mức', 'Việc', 'Phụ trách', 'Hạn', 'Trạng thái']} rows={taskRows.length ? taskRows : [['Tốt', 'Chưa có task mở', '—', '—', 'Hoàn thành']]} maxHeight="max-h-[260px]" /></div>
        </Card>
      </section>

      <section className="grid gap-2 lg:grid-cols-2">
        <Card>
          <CardTitle>Báo cáo đến hạn</CardTitle>
          <div className="mt-2"><ReportTable headers={['Báo cáo', 'Trạng thái', 'Mở']} rows={reportRows.map(([name, state, href]) => [name, state, href])} maxHeight="max-h-[180px]" /></div>
        </Card>
        <Card>
          <CardTitle>Bảng dữ liệu nhanh</CardTitle>
          <div className="mt-2"><ReportTable headers={['Nguồn', 'Dòng hiện có', 'Ghi chú']} rows={report.quickRows} maxHeight="max-h-[180px]" /></div>
        </Card>
      </section>

      <Card>
        <CardTitle>KPI Dictionary chỉ số lõi</CardTitle>
        <div className="mt-2"><ReportTable headers={['Mã', 'Chỉ số', 'Nhóm', 'Đơn vị', 'Nguồn']} rows={KPI_DICTIONARY_CORE.map((kpi) => [kpi.code, kpi.name, kpi.group, kpi.unit, kpi.source])} maxHeight="max-h-[260px]" /></div>
      </Card>

      {/* Phase Charts: Xu hướng dòng tiền + Top kênh + Alert panel + Top thất thoát */}
      <section className="grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle>Xu hướng dòng tiền 30 ngày</CardTitle>
          <div className="mt-2">
            <TrendLineChart
              data={buildTrendData(fullReport)}
              series={[
                { key: 'cashIn', label: 'Tiền vào', color: '#059669' },
                { key: 'cashOut', label: 'Tiền ra', color: '#dc2626' },
                { key: 'net', label: 'Dòng ròng', color: '#3B82F6' },
              ]}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Doanh thu theo kênh</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildTopMovers(fullReport).channels} positiveIsGood />
          </div>
        </Card>
      </section>

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AlertPanel alerts={generateAlerts(fullReport)} compact />
        <Card>
          <CardTitle>Top thất thoát NVL</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildTopMovers(fullReport).losses} positiveIsGood={false} />
          </div>
        </Card>
      </section>
    </div>
  );
}
