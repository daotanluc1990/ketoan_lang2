import { PageHeader } from "@/components/layout/PageHeader";
import { ChartCard } from "@/components/report/ChartCard";
import { MetricCard } from "@/components/report/MetricCard";
import { ReportTable } from "@/components/report/ReportTable";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildDashboardReport } from "@/lib/reports/report-aggregator";
import { parsePageReportFilters } from "@/lib/reports/report-filters";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DongTienPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const hasCashbook = report.sourceCounts.cashbook > 0;
  return (
    <div className="space-y-4">
      <PageHeader
        title="Dòng tiền Tuần"
        description="Tiền thật vào/ra từ Google Sheet. Nếu chưa import sổ quỹ thì không hiển thị số mẫu."
        status={hasCashbook ? "Tốt" : "Chưa đủ dữ liệu"}
      />
      {!hasCashbook ? (
        <EmptyState
          title="Chưa đủ dữ liệu dòng tiền"
          description="Chưa có dữ liệu trong DL_SO_QUY. Hãy import file Sổ quỹ và xác nhận ghi Google Sheet."
        />
      ) : null}
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tổng tiền vào"
          value={
            report.executiveKpis.find((kpi) => kpi.label === "Tiền vào")
              ?.value ?? "—"
          }
          status={hasCashbook ? "good" : "neutral"}
          trend={`${report.sourceCounts.cashbook} dòng sổ quỹ`}
        />
        <MetricCard
          label="Tổng tiền ra"
          value={
            report.executiveKpis.find((kpi) => kpi.label === "Tiền ra")
              ?.value ?? "—"
          }
          status={hasCashbook ? "warning" : "neutral"}
          trend="Tính từ số tiền âm"
        />
        <MetricCard
          label="Dòng tiền tạm"
          value={
            report.executiveKpis.find((kpi) => kpi.label === "Dòng tiền tạm")
              ?.value ?? "—"
          }
          status={
            report.totals.cashEnding < 0
              ? "danger"
              : hasCashbook
                ? "good"
                : "neutral"
          }
          trend="Thu - chi"
        />
        <MetricCard
          label="Doanh thu đã thu"
          value={
            report.executiveKpis.find(
              (kpi) => kpi.label === "Doanh thu thu qua sổ quỹ",
            )?.value ?? "—"
          }
          status={report.totals.cashbookRevenueIn > 0 ? "good" : "neutral"}
          trend="Để đối chiếu app/cửa hàng"
        />
      </section>
      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard
          title="Thu - chi theo sổ quỹ"
          items={[
            {
              label: "Tiền vào",
              value: report.totals.cashIn,
              caption: report.executiveKpis.find(
                (kpi) => kpi.label === "Tiền vào",
              )?.value,
            },
            {
              label: "Tiền ra",
              value: report.totals.cashOut,
              caption: report.executiveKpis.find(
                (kpi) => kpi.label === "Tiền ra",
              )?.value,
            },
          ]}
        />
        <ChartCard
          title="Nguồn dữ liệu dòng tiền"
          items={[
            {
              label: "Sổ quỹ",
              value: report.sourceCounts.cashbook,
              caption: `${report.sourceCounts.cashbook} dòng`,
            },
            {
              label: "Lịch sử import",
              value: report.sourceCounts.importHistory,
              caption: `${report.sourceCounts.importHistory} batch`,
            },
          ]}
        />
      </section>
      <Card>
        <CardTitle>Bảng dòng tiền tuần</CardTitle>
        <div className="mt-3">
          <ReportTable
            headers={[
              "Nhóm",
              "Chỉ số",
              "Số tiền",
              "Tuần trước",
              "Chênh lệch",
              "Đối chiếu",
              "Ghi chú",
            ]}
            rows={report.cashflowRows}
          />
        </div>
      </Card>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Top khoản chi lớn từ Sổ quỹ</CardTitle>
          <div className="mt-3">
            <ReportTable
              headers={[
                "Ngày",
                "Nhóm",
                "Diễn giải",
                "Số tiền",
                "Chi nhánh",
                "Trạng thái",
              ]}
              rows={report.cashbookTopOutRows}
              maxHeight="max-h-[380px]"
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Top khoản thu từ Sổ quỹ</CardTitle>
          <div className="mt-3">
            <ReportTable
              headers={[
                "Ngày",
                "Nhóm",
                "Diễn giải",
                "Số tiền",
                "Chi nhánh",
                "Trạng thái",
              ]}
              rows={report.cashbookTopInRows}
              maxHeight="max-h-[380px]"
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Thu/chi theo nhóm</CardTitle>
          <div className="mt-3">
            <ReportTable
              headers={[
                "Nhóm",
                "Số dòng",
                "Tiền vào",
                "Tiền ra",
                "Ròng",
                "Trạng thái",
                "Ghi chú",
              ]}
              rows={report.cashbookGroupRows}
              maxHeight="max-h-[360px]"
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Thu/chi theo ngày</CardTitle>
          <div className="mt-3">
            <ReportTable
              headers={[
                "Ngày",
                "Số dòng",
                "Tiền vào",
                "Tiền ra",
                "Ròng",
                "Trạng thái",
              ]}
              rows={report.cashbookDailyRows}
              maxHeight="max-h-[360px]"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
