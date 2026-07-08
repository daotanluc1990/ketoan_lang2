import { ClipboardCheck, Lightbulb, ShieldAlert, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Card, CardTitle } from '@/components/ui/Card';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { buildAccountingTasksFromReport, type AccountingTask } from '@/lib/option-c/task-engine';
import { buildOptionCDashboardSummary, type OptionCDashboardMetric, type OptionCDashboardSummary } from '@/lib/option-c/dashboard-report';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { TrendLineChart as TrendChart } from '@/components/charts/TrendLineChart';
import { TopMoversBarChart } from '@/components/charts/TopMoversBarChart';
import { AlertPanel as InsightsAlertPanel } from '@/components/charts/AlertPanel';
import { generateAlerts, buildTrendData, buildTopMovers, buildExpenseStructure, buildLossTrend, buildRevenueMix } from '@/lib/reports/dashboard-insights';

const KPI_GROUP_ORDER = [
  'Doanh thu',
  'Chi phí',
  'Tiền và đối soát',
  'Công nợ và nhà cung cấp',
  'Tồn kho',
  'Công thức / định mức / hao hụt',
  'Lợi nhuận quản trị',
  'Dự toán và dòng tiền'
];

type SearchParams = Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;

function toneKey(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-');
}

function statusRank(status: string) {
  const key = toneKey(status);
  if (key.includes('do') || key.includes('danger') || key.includes('nguy-hiem') || key.includes('qua-han')) return 0;
  if (key.includes('cam')) return 1;
  if (key.includes('vang') || key.includes('warning') || key.includes('can-doi-chieu') || key.includes('chua-du')) return 2;
  if (key.includes('tot') || key.includes('dat') || key.includes('good')) return 4;
  return 3;
}

function cardTone(status: string) {
  const rank = statusRank(status);
  if (rank === 0) return 'border-red-200 bg-red-50/70';
  if (rank === 1) return 'border-amber-200 bg-amber-50/70';
  if (rank === 2) return 'border-blue-200 bg-blue-50/40';
  if (rank === 4) return 'border-emerald-200 bg-emerald-50/35';
  return 'border-lang-line bg-white';
}

function kpiCardTone(status: string) {
  const rank = statusRank(status);
  if (rank === 0) return 'border-red-200 bg-lang-paper';
  if (rank === 1) return 'border-amber-200 bg-lang-paper';
  if (rank === 2) return 'border-blue-200 bg-lang-paper';
  if (rank === 4) return 'border-emerald-200 bg-lang-paper';
  return 'border-lang-line bg-lang-paper';
}

function miniStatus(status: string) {
  const rank = statusRank(status);
  if (rank === 0) return { label: 'Đỏ', className: 'border-red-200 bg-red-50 text-red-800 before:bg-red-600' };
  if (rank === 1) return { label: 'Cam', className: 'border-amber-200 bg-amber-50 text-amber-800 before:bg-lang-yellow' };
  if (rank === 2) return { label: 'Cần kiểm', className: 'border-blue-200 bg-blue-50 text-blue-900 before:bg-lang-red' };
  if (rank === 4) return { label: 'Tốt', className: 'border-emerald-200 bg-emerald-50 text-emerald-800 before:bg-lang-green' };
  return { label: status, className: 'border-lang-line bg-lang-mist/80 text-lang-muted before:bg-lang-muted' };
}

function executiveStatus(report: OptionCDashboardSummary, redTaskCount: number) {
  if (!report.hasDashboardReport && report.dataQualityScore < 60) return 'Chưa đủ dữ liệu';
  if (redTaskCount > 0 || report.redAlerts.some((alert) => statusRank(String(alert[0] ?? '')) === 0)) return 'Cần đối chiếu';
  return report.dataQualityScore >= 80 ? 'Tốt' : 'Cần đối chiếu';
}

function orderedKpis(kpis: OptionCDashboardMetric[]) {
  const groupOrder = new Map(KPI_GROUP_ORDER.map((group, index) => [group, index]));
  return [...kpis].sort((a, b) => {
    const aGroup = groupOrder.get(a.group) ?? KPI_GROUP_ORDER.length;
    const bGroup = groupOrder.get(b.group) ?? KPI_GROUP_ORDER.length;
    if (aGroup !== bGroup) return aGroup - bGroup;
    const statusDiff = statusRank(a.status) - statusRank(b.status);
    if (statusDiff !== 0) return statusDiff;
    return a.code.localeCompare(b.code, 'vi');
  });
}

function groupedKpis(kpis: OptionCDashboardMetric[]) {
  const groups = new Map<string, OptionCDashboardMetric[]>();
  for (const kpi of kpis) {
    const rows = groups.get(kpi.group) ?? [];
    rows.push(kpi);
    groups.set(kpi.group, rows);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const aIndex = KPI_GROUP_ORDER.indexOf(a);
    const bIndex = KPI_GROUP_ORDER.indexOf(b);
    return (aIndex === -1 ? KPI_GROUP_ORDER.length : aIndex) - (bIndex === -1 ? KPI_GROUP_ORDER.length : bIndex);
  });
}

function recommendationRows(report: OptionCDashboardSummary, tasks: AccountingTask[]) {
  const rows: string[][] = [];
  const redTasks = tasks.filter((task) => task.priority === 'Đỏ');
  const redAlerts = report.redAlerts.filter((alert) => statusRank(String(alert[0] ?? '')) === 0);

  if (report.missingSources.length > 0) {
    rows.push(['Dữ liệu', `${report.missingSources.length} nguồn còn thiếu`, 'Giao kế toán bổ sung nguồn hoặc ghi nguyên nhân thiếu dữ liệu.']);
  }
  if (redAlerts.length > 0) {
    rows.push(['Cảnh báo', `${redAlerts.length} cảnh báo đỏ`, 'Ưu tiên xử lý các cảnh báo đỏ trước quyết định tuần/tháng.']);
  }
  if (redTasks.length > 0) {
    rows.push(['Hành động', `${redTasks.length} task đỏ`, 'Giao owner và deadline rõ cho từng việc, theo dõi đến khi hết quá hạn.']);
  }
  if (report.dataQualityScore < 80) {
    rows.push(['Data Quality', `${report.dataQualityScore}/100`, 'Không dùng số liệu để kết luận sạch khi điểm dữ liệu dưới ngưỡng 80.']);
  }
  if (!rows.length) {
    rows.push(['Theo dõi', 'Không có cảnh báo đỏ', 'Giữ nhịp kiểm tra KPI theo kỳ và xử lý sớm khi phát sinh trạng thái cam/đỏ.']);
  }

  return rows.slice(0, 5);
}

function SummaryTile({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className={clsx('rounded-xl border px-3 py-2 shadow-soft', cardTone(status))}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] font-black text-lang-muted">{label}</p>
        <StatusBadge status={status} />
      </div>
      <p className="number mt-1 text-[22px] font-black leading-none text-lang-ink">{value}</p>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: OptionCDashboardMetric }) {
  const status = miniStatus(kpi.status);
  return (
    <article className={clsx('h-[92px] min-w-0 overflow-hidden rounded-xl border px-2.5 py-2 shadow-soft transition-colors hover:bg-white', kpiCardTone(kpi.status))}>
      <div className="flex items-start justify-between gap-1.5">
        <h4 className="line-clamp-2 min-w-0 text-[11px] font-black leading-[14px] text-lang-ink" title={kpi.name}>{kpi.name}</h4>
        <span className={clsx('inline-flex h-5 shrink-0 items-center gap-1 rounded-md border px-1.5 text-[10px] font-black leading-none before:h-1 before:w-1 before:shrink-0 before:rounded-full', status.className)}>{status.label}</span>
      </div>
      <div className="mt-1 flex min-w-0 items-baseline gap-1.5">
        <p className="number truncate text-[17px] font-black leading-5 text-lang-ink" title={kpi.displayValue}>{kpi.displayValue}</p>
        <span className="shrink-0 text-[9px] font-black text-lang-muted">{kpi.unit}</span>
      </div>
      <p className="mt-0.5 truncate text-[9px] font-bold leading-3 text-lang-muted" title={kpi.group}>{kpi.group}</p>
    </article>
  );
}

function KpiGroupFrame({ group, kpis }: { group: string; kpis: OptionCDashboardMetric[] }) {
  const dangerCount = kpis.filter((kpi) => statusRank(kpi.status) === 0).length;
  const warningCount = kpis.filter((kpi) => statusRank(kpi.status) > 0 && statusRank(kpi.status) <= 2).length;
  return (
    <div className="rounded-xl border border-lang-line bg-lang-mist/50 p-2.5 shadow-soft">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-[13px] font-black text-lang-ink">{group}</h4>
          <p className="text-[11px] font-bold text-lang-muted">{kpis.length} KPI trong nhóm</p>
        </div>
        <div className="flex items-center gap-1.5">
          {dangerCount ? <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-black text-red-800">Đỏ {dangerCount}</span> : null}
          {warningCount ? <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-black text-blue-900">Cần kiểm {warningCount}</span> : null}
          {!dangerCount && !warningCount ? <StatusBadge status="Tốt" /> : null}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 min-[700px]:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {kpis.map((kpi) => <KpiCard key={kpi.code} kpi={kpi} />)}
      </div>
    </div>
  );
}

function AlertPanel({ alerts }: { alerts: string[][] }) {
  const rows = alerts.length ? alerts.slice(0, 5) : [['Tốt', 'Không có cảnh báo đỏ/cam', 'Dữ liệu hiện tại không phát sinh cảnh báo cần xử lý.', 'CEO/Admin', 'Tiếp tục theo dõi']];
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-lang-line px-3 py-2">
        <CardTitle>Cảnh báo</CardTitle>
        <ShieldAlert className="h-4 w-4 text-lang-red" />
      </div>
      <div className="divide-y divide-lang-line">
        {rows.map((row, index) => (
          <div key={`${row[1]}-${index}`} className="px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-2 text-[12px] font-black text-lang-ink">{row[1]}</p>
              <StatusBadge status={row[0]} />
            </div>
            <p className="mt-1 line-clamp-2 text-[12px] font-semibold text-lang-muted">{row[2]}</p>
            <p className="mt-1 line-clamp-1 text-[11px] font-bold text-lang-redDark">{row[3]} - {row[4]}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionPanel({ tasks }: { tasks: AccountingTask[] }) {
  const rows = tasks.length ? tasks.slice(0, 5) : [];
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-lang-line px-3 py-2">
        <CardTitle>Hành động</CardTitle>
        <ClipboardCheck className="h-4 w-4 text-lang-red" />
      </div>
      {rows.length ? (
        <div className="divide-y divide-lang-line">
          {rows.map((task) => (
            <div key={task.id} className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-2 text-[12px] font-black text-lang-ink">{task.title}</p>
                <StatusBadge status={task.priority} />
              </div>
              <p className="mt-1 line-clamp-1 text-[12px] font-semibold text-lang-muted">{task.owner} - {task.deadline}</p>
              <p className="mt-1 line-clamp-2 text-[11px] font-bold text-lang-redDark">{task.action}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-3 py-4 text-[12px] font-semibold text-lang-muted">Không có hành động mở trong kỳ lọc hiện tại.</p>
      )}
    </Card>
  );
}

function RecommendationPanel({ rows }: { rows: string[][] }) {
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-lang-line px-3 py-2">
        <CardTitle>Đề xuất</CardTitle>
        <Lightbulb className="h-4 w-4 text-lang-red" />
      </div>
      <div className="divide-y divide-lang-line">
        {rows.map((row, index) => (
          <div key={`${row[0]}-${index}`} className="px-3 py-2.5">
            <p className="text-[12px] font-black text-lang-ink">{row[0]}</p>
            <p className="mt-1 text-[12px] font-bold text-lang-redDark">{row[1]}</p>
            <p className="mt-1 line-clamp-2 text-[12px] font-semibold text-lang-muted">{row[2]}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

export async function ExecutiveOverviewPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildOptionCDashboardSummary(filters);
  const fullReport = await buildDashboardReport(filters);
  const tasks = buildAccountingTasksFromReport(report, filters).filter((task) => task.status !== 'Hoàn thành');
  const redTasks = tasks.filter((task) => task.priority === 'Đỏ');
  const alertCount = report.redAlerts.length;
  const status = executiveStatus(report, redTasks.length);
  const recommendations = recommendationRows(report, tasks);
  const kpis = orderedKpis(report.coreKpis);
  const kpiGroups = groupedKpis(kpis);
  const dangerKpis = kpis.filter((kpi) => statusRank(kpi.status) === 0).length;
  const warningKpis = kpis.filter((kpi) => statusRank(kpi.status) > 0 && statusRank(kpi.status) <= 2).length;

  return (
    <div className="space-y-2.5">
      <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="KPI lõi" value={`${report.coreKpis.length}`} status="Tốt" />
        <SummaryTile label="Cảnh báo" value={`${alertCount}`} status={alertCount ? 'Cần đối chiếu' : 'Tốt'} />
        <SummaryTile label="Hành động" value={`${tasks.length}`} status={redTasks.length ? 'Đỏ' : tasks.length ? 'Cần đối chiếu' : 'Tốt'} />
        <SummaryTile label="Data Quality" value={`${report.dataQualityScore}/100`} status={status} />
      </section>

      <section className="rounded-xl border border-lang-line bg-white p-2 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-lang-line px-1 pb-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-lang-redSoft text-lang-red">
              <TrendingUp className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-black text-lang-ink">Toàn bộ KPI lõi</h3>
              <p className="text-[11px] font-bold text-lang-muted">{kpis.length} KPI - sắp xếp theo nhóm nghiệp vụ</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={dangerKpis ? 'Đỏ' : warningKpis ? 'Cần đối chiếu' : 'Tốt'} />
            <span className="rounded-md border border-lang-line bg-lang-mist/70 px-2 py-1 text-[11px] font-black text-lang-muted">Đỏ {dangerKpis}</span>
            <span className="rounded-md border border-lang-line bg-lang-mist/70 px-2 py-1 text-[11px] font-black text-lang-muted">Cần kiểm {warningKpis}</span>
          </div>
        </div>
        <div className="mt-2 grid gap-2 xl:grid-cols-2">
          {kpiGroups.map(([group, groupKpis]) => <KpiGroupFrame key={group} group={group} kpis={groupKpis} />)}
        </div>
      </section>

      <section className="grid gap-2 xl:grid-cols-3 xl:pr-24">
        <AlertPanel alerts={report.redAlerts} />
        <RecommendationPanel rows={recommendations} />
        <ActionPanel tasks={tasks} />
      </section>

      {/* Phase Charts: Xu hướng dòng tiền + Top kênh + Insights AlertPanel + Top thất thoát */}
      <section className="grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle>Xu hướng dòng tiền 30 ngày</CardTitle>
          <div className="mt-2">
            <TrendChart
              data={buildTrendData(fullReport)}
              series={[
                { key: 'cashIn', label: 'Tiền vào', color: '#059669' },
                { key: 'cashOut', label: 'Tiền ra', color: '#dc2626' },
                { key: 'net', label: 'Dòng ròng', color: '#3B82F6' },
              ]}
              height={260}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Doanh thu theo kênh</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildTopMovers(fullReport).channels} positiveIsGood height={260} />
          </div>
        </Card>
      </section>

      <section className="grid gap-2 xl:grid-cols-2">
        <InsightsAlertPanel alerts={generateAlerts(fullReport)} compact />
        <Card>
          <CardTitle>Top thất thoát NVL</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildTopMovers(fullReport).losses} positiveIsGood={false} height={220} />
          </div>
        </Card>
      </section>

      {/* Phase 2 Charts: 4 xu hướng mới — chi phí, doanh thu kênh, NVL thất thoát, dòng tiền */}
      <section className="grid gap-2 xl:grid-cols-2">
        <Card>
          <CardTitle>Cơ cấu chi phí theo nhóm</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildExpenseStructure(fullReport)} positiveIsGood={false} height={220} />
          </div>
        </Card>
        <Card>
          <CardTitle>Cơ cấu doanh thu theo kênh</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildRevenueMix(fullReport)} positiveIsGood height={220} />
          </div>
        </Card>
      </section>

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardTitle>Xu hướng dòng tiền 30 ngày</CardTitle>
          <div className="mt-2">
            <TrendChart
              data={buildTrendData(fullReport)}
              series={[
                { key: 'cashIn', label: 'Tiền vào', color: '#059669' },
                { key: 'cashOut', label: 'Tiền ra', color: '#dc2626' },
                { key: 'net', label: 'Dòng ròng', color: '#3B82F6' },
              ]}
              height={240}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Xu hướng NVL thất thoát/hao hụt</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildLossTrend(fullReport)} positiveIsGood={false} height={240} />
          </div>
        </Card>
      </section>
    </div>
  );
}
