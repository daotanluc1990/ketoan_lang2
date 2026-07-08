import { ClipboardCheck, ShieldAlert } from 'lucide-react';
import { StatusBadge } from '@/components/report/StatusBadge';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { buildAccountingTasksFromReport, type AccountingTask } from '@/lib/option-c/task-engine';
import { buildOptionCDashboardSummary } from '@/lib/option-c/dashboard-report';
import { buildDashboardReport, type DashboardReport } from '@/lib/reports/report-aggregator';
import { TrendLineChart } from '@/components/charts/TrendLineChart';
import { TopMoversBarChart } from '@/components/charts/TopMoversBarChart';
import { generateAlerts, buildTrendData, buildTopMovers, buildExpenseStructure, buildLossTrend } from '@/lib/reports/dashboard-insights';
import type { Status } from '@/lib/report-types';

type SearchParams = Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;

// Format tiền đồng bộ với report-aggregator (1,3 tỷ / 963,4tr / 807.750đ)
function fmtMoney(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace('.', ',')} tỷ`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}tr`;
  return `${Math.round(value).toLocaleString('vi-VN')}đ`;
}

function alertRows(report: DashboardReport) {
  // Spec §4: mỗi cảnh báo cần Mức / Nhóm / Vấn đề / Hành động / Người phụ trách / Trạng thái
  const ownerByCategory: Record<string, string> = {
    'Tồn kho': 'Quản lý kho',
    'Thất thoát': 'Bếp trưởng',
    'App giao hàng': 'Kế toán',
    'Dòng tiền': 'Kế toán',
    'Biên lợi nhuận': 'Kế toán',
    'Data Quality': 'Kế toán',
    'Thanh khoản': 'CEO/CFO',
  };
  return generateAlerts(report).slice(0, 8).map((a) => {
    const muc = a.severity === 'critical' ? 'Đỏ' : a.severity === 'warning' ? 'Cam' : 'Thông tin';
    return [muc, a.category, a.title, a.suggestion, ownerByCategory[a.category] ?? 'Kế toán', 'Chưa xử lý'];
  });
}

function taskRows(tasks: AccountingTask[]) {
  return tasks
    .filter((task) => task.status !== 'Hoàn thành')
    .slice(0, 6)
    .map((task) => [task.priority, task.title, task.owner, task.deadline, task.action]);
}

// Placeholder card cho biểu đồ cần lịch sử nhiều tuần (chưa có data)
function ChartPlaceholder({ title, reason }: { title: string; reason: string }) {
  return (
    <Card>
      <CardTitle>{title}</CardTitle>
      <div className="mt-2 flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-lang-line bg-lang-mist/40 px-4 py-6 text-center">
        <span className="t-eyebrow">Sắp có</span>
        <p className="t-label max-w-[280px]">{reason}</p>
      </div>
    </Card>
  );
}

export async function ExecutiveOverviewPage({ searchParams }: { searchParams?: SearchParams }) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildOptionCDashboardSummary(filters);
  const fullReport = await buildDashboardReport(filters);
  const tasks = buildAccountingTasksFromReport(report, filters);
  const pc = fullReport.periodComparison;
  const t = fullReport.totals;

  // === 8 thẻ chỉ số (spec §2) ===
  const grossProfit = t.revenue - t.appCogs - t.lossValue; // Lãi gộp = DT - giá vốn app - thất thoát
  const grossMargin = t.revenue > 0 ? grossProfit / t.revenue : 0;
  const statusOf = (good: boolean, warn: boolean): Status => (good ? 'good' : warn ? 'warning' : 'danger');
  const ff = report.financeForecast;

  // 8 KPI card theo spec §2 — thứ tự: DT, lãi gộp, LN vận hành, biên LN vận hành,
  // dòng tiền hiện tại, dòng tiền dự kiến, mức thiếu tiền, công nợ.
  const kpiCards = [
    {
      label: 'Tổng doanh thu',
      value: fmtMoney(t.revenue),
      status: statusOf(t.revenue > 0, false),
      current: pc?.revenue.current,
      previousPeriod: pc?.revenue.previousPeriod,
      samePeriodLastYear: pc?.revenue.samePeriodLastYear,
    },
    {
      label: 'Lãi gộp',
      value: fmtMoney(grossProfit),
      hint: `Biên ${grossMargin > 0 ? `${(grossMargin * 100).toFixed(0)}%` : '—'}`,
      status: statusOf(grossProfit > 0, grossProfit === 0),
    },
    {
      // LN vận hành = lãi gộp - chi phí vận hành. Code chưa tách chi phí vận hành
      // (nhân sự/mặt bằng lẫn trong sổ quỹ) → dùng tổng chi cố định dự toán làm xấp xỉ.
      label: 'LN vận hành (xấp xỉ)',
      value: fmtMoney(grossProfit - ff.chiCoDinhDuToan),
      hint: ff.hasData ? 'Lãi gộp - chi cố định dự toán' : 'Cần tách chi phí vận hành',
      status: ff.hasData ? statusOf(grossProfit - ff.chiCoDinhDuToan > 0, false) : ('neutral' as Status),
    },
    {
      label: 'Biên LN vận hành',
      value: ff.hasData && t.revenue > 0 ? `${(((grossProfit - ff.chiCoDinhDuToan) / t.revenue) * 100).toFixed(0)}%` : '—',
      hint: 'LN vận hành / doanh thu',
      status: ff.hasData ? statusOf((grossProfit - ff.chiCoDinhDuToan) / t.revenue > 0.1, true) : ('neutral' as Status),
    },
    {
      label: 'Dòng tiền hiện tại',
      value: fmtMoney(t.cashEnding),
      hint: 'Thu - chi từ sổ quỹ',
      status: statusOf(t.cashEnding > 0, t.cashEnding === 0),
    },
    {
      // Phase 1: dòng tiền dự kiến từ tab 14 (so_du_du_kien)
      label: 'Dòng tiền dự kiến',
      value: ff.hasData ? fmtMoney(ff.soDuDuKien) : '—',
      hint: ff.hasData ? 'Dự toán tuần tới' : 'Chưa có dữ liệu dự toán',
      status: ff.hasData ? statusOf(ff.soDuDuKien > 0, ff.soDuDuKien === 0) : ('neutral' as Status),
    },
    {
      // Phase 1: mức thiếu tiền = công nợ phải trả tuần tới (cong_no_can_tra_tuan_toi)
      label: 'Mức thiếu tiền dự kiến',
      value: ff.hasData ? fmtMoney(ff.congNoCanTraTuanToi) : '—',
      hint: ff.hasData ? 'Công nợ đến hạn tuần tới' : 'Chưa có dữ liệu',
      status: ff.hasData ? statusOf(ff.congNoCanTraTuanToi === 0, ff.congNoCanTraTuanToi > 0 && ff.congNoCanTraTuanToi < 50_000_000) : ('neutral' as Status),
    },
    {
      label: 'Công nợ',
      value: report.coreKpis.find((k) => k.code === 'CN001')?.displayValue ?? '—',
      hint: 'Nghĩa vụ phải trả NCC',
      status: 'neutral' as Status,
    },
  ];

  return (
    <div className="space-y-4">
      {/* TIÊU ĐỀ — 1 dòng, không eyebrow uppercase */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="t-hero">Tổng quan CEO/CFO</h1>
        <StatusBadge status={report.dataQualityScore >= 80 ? 'Tốt' : 'Cần đối chiếu'} />
      </div>

      {/* ZONE 1 — 8 thẻ chỉ số (spec §2) */}
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {kpiCards.map((kpi) => (
          <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} status={kpi.status} compact current={kpi.current} previousPeriod={kpi.previousPeriod} samePeriodLastYear={kpi.samePeriodLastYear} />
        ))}
      </section>

      {/* ZONE 2 — Biểu đồ chính (spec §15 hàng biểu đồ) */}
      <section className="grid gap-2 xl:grid-cols-2">
        <Card>
          <CardTitle>Doanh thu theo kênh</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildTopMovers(fullReport).channels} positiveIsGood height={240} />
          </div>
        </Card>
        <Card>
          <CardTitle>Dòng tiền 30 ngày</CardTitle>
          <div className="mt-2">
            <TrendLineChart
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
          <CardTitle>Cơ cấu chi phí</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildExpenseStructure(fullReport)} positiveIsGood={false} height={240} />
          </div>
        </Card>
        <Card>
          <CardTitle>Top thất thoát NVL</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart data={buildLossTrend(fullReport)} positiveIsGood={false} height={240} />
          </div>
        </Card>
      </section>

      {/* ZONE 3 — Bảng cảnh báo đỏ + Việc CEO xử lý (spec §15 bảng cảnh báo) */}
      <section className="grid gap-2 xl:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-lang-red" />
            <CardTitle>Bảng cảnh báo đỏ</CardTitle>
          </div>
          <ReportTable
            headers={['Mức', 'Nhóm', 'Vấn đề', 'Hành động', 'Phụ trách', 'Trạng thái']}
            rows={alertRows(fullReport).length ? alertRows(fullReport) : [['Tốt', '—', 'Không có cảnh báo', 'Tiếp tục theo dõi', '—', 'Hoàn thành']]}
            maxHeight="max-h-[280px]"
            embedded
          />
        </Card>
        <Card>
          <div className="mb-2 flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-lang-red" />
            <CardTitle>Việc CEO cần xử lý</CardTitle>
          </div>
          <ReportTable
            headers={['Mức', 'Việc', 'Phụ trách', 'Hạn', 'Hành động']}
            rows={taskRows(tasks).length ? taskRows(tasks) : [['Tốt', 'Không có việc mở', '—', '—', 'Theo dõi']]}
            maxHeight="max-h-[280px]"
            embedded
          />
        </Card>
      </section>

      {/* ZONE 4 — Thực vs dự toán + Dòng tiền thực/dự kiến (spec §3 biểu đồ 8+9, có data) */}
      <section className="grid gap-2 xl:grid-cols-2">
        <Card>
          <CardTitle>Thực tế so với dự toán</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart
              data={ff.hasData ? [
                { label: 'Doanh thu thực', value: ff.doanhThuThucTe, trend: 'up' },
                { label: 'Doanh thu dự toán', value: ff.doanhThuDuToanTuanToi, trend: 'flat' },
                { label: 'Chi biến đổi', value: ff.chiBienDoiDuToan, trend: 'down' },
                { label: 'Chi cố định', value: ff.chiCoDinhDuToan, trend: 'down' },
              ] : []}
              positiveIsGood
              height={240}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Dòng tiền hiện tại &amp; dự kiến</CardTitle>
          <div className="mt-2">
            <TopMoversBarChart
              data={ff.hasData ? [
                { label: 'Dòng tiền hiện tại', value: t.cashEnding, trend: t.cashEnding >= 0 ? 'up' : 'down' },
                { label: 'Dòng tiền dự kiến', value: ff.soDuDuKien, trend: ff.soDuDuKien >= 0 ? 'up' : 'down' },
                { label: 'Công nợ đến hạn', value: ff.congNoCanTraTuanToi, trend: 'down' },
              ] : []}
              positiveIsGood
              height={240}
            />
          </div>
          {ff.hasData && ff.congNoCanTraTuanToi > t.cashEnding ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800">
              ⚠ Công nợ đến hạn ({fmtMoney(ff.congNoCanTraTuanToi)}) vượt dòng tiền hiện tại ({fmtMoney(t.cashEnding)}) — rủi ro thiếu tiền.
            </p>
          ) : null}
        </Card>
      </section>

      {/* PLACEHOLDERS — chỉ số cần lịch sử nhiều tuần (spec §3, chưa có data) */}
      <section className="grid gap-2 xl:grid-cols-2">
        <ChartPlaceholder title="Lợi nhuận quản trị (theo tuần)" reason="Cần dữ liệu P&L nhiều kỳ: lãi gộp, LN vận hành, biên LN qua các tuần để vẽ waterfall/xu hướng." />
        <ChartPlaceholder title="Tỷ lệ chi phí chính (theo tuần)" reason="Cần dữ liệu tỷ lệ CP nguyên liệu, nhân sự, bao bì theo nhiều tuần để vẽ đường xu hướng." />
      </section>
    </div>
  );
}
