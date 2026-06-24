import { PageHeader } from "@/components/layout/PageHeader";
import { AiAgentPanel } from "@/components/dashboard/AiAgentPanel";
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

export default async function TongQuanPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const status = report.hasRealData
    ? report.missingSources.length
      ? "Cần đối chiếu"
      : "Tốt"
    : "Chưa đủ dữ liệu";

  return (
    <div className="space-y-4">
      <PageHeader
        title="CEO Dashboard"
        description="Màn hình CEO xem nhanh dữ liệu thật từ Google Sheet: tuần này tốt/xấu, tiền về chưa, lời/lỗ tạm tính, thất thoát và hành động tiếp theo."
        status={status}
      />

      {!report.hasRealData ? (
        <EmptyState
          title="Chưa đủ dữ liệu để kết luận"
          description="Google Sheet chưa có dữ liệu import thật. Hãy vào Nhập liệu & Import, kiểm tra batch, sau đó xác nhận Import file đạt."
        />
      ) : null}

      <section className="rounded-2xl border-l-8 border-amber-500 bg-white p-4 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Executive Status · {report.dataMode}
        </p>
        <h3 className="mt-2 text-2xl font-bold text-lang-brown">
          {report.hasRealData
            ? "Đã có dữ liệu import thật"
            : "Chưa đủ dữ liệu để kết luận."}
        </h3>
        <p className="mt-2 text-sm text-black/60">{report.message}</p>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {report.executiveKpis.map((kpi) => (
          <MetricCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            hint={kpi.hint}
            trend={kpi.trend}
            status={kpi.status}
          />
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard
          title="Doanh thu theo nguồn thật"
          description="Doanh thu chốt lấy từ app/cửa hàng. Doanh thu trong sổ quỹ chỉ dùng để đối chiếu tiền đã về."
          items={[
            ...report.revenueByChannel.map((item) => ({
              label: item.channel,
              value: item.value,
              caption: item.revenue,
            })),
            ...(report.totals.cashbookRevenueIn > 0
              ? [
                  {
                    label: "Sổ quỹ: doanh thu đã thu",
                    value: report.totals.cashbookRevenueIn,
                    caption: report.executiveKpis.find(
                      (kpi) => kpi.label === "Doanh thu thu qua sổ quỹ",
                    )?.value,
                  },
                ]
              : []),
          ]}
        />
        <ChartCard
          title="Chất lượng dữ liệu"
          description="Số dòng đã ghi vào các sheet dữ liệu gốc."
          items={[
            {
              label: "Doanh thu app",
              value: report.sourceCounts.appRevenue,
              caption: `${report.sourceCounts.appRevenue} dòng`,
            },
            {
              label: "Doanh thu cửa hàng",
              value: report.sourceCounts.storeRevenue,
              caption: `${report.sourceCounts.storeRevenue} dòng`,
            },
            {
              label: "Sổ quỹ",
              value: report.sourceCounts.cashbook,
              caption: `${report.sourceCounts.cashbook} dòng`,
            },
            {
              label: "Tồn kho",
              value: report.sourceCounts.inventory,
              caption: `${report.sourceCounts.inventory} dòng`,
            },
            {
              label: "Thất thoát",
              value: report.sourceCounts.lossRows,
              caption: `${report.sourceCounts.lossRows} dòng`,
            },
          ]}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Độ sẵn sàng dữ liệu theo mảng</CardTitle>
          <div className="mt-3">
            <ReportTable
              headers={["Mảng", "Trạng thái", "Bằng chứng", "Cách dùng"]}
              rows={report.dataReadinessRows}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Cảnh báo Sổ quỹ — khoản chi lớn</CardTitle>
          <p className="mt-2 text-sm text-black/60">
            Lấy trực tiếp từ DL_SO_QUY. Dùng để yêu cầu kế toán giải trình,
            không tự động kết luận thất thoát.
          </p>
          <div className="mt-3">
            <ReportTable
              headers={[
                "Hạng",
                "Ngày",
                "Nhóm",
                "Diễn giải",
                "Số tiền",
                "Lý do cảnh báo",
                "Việc cần làm",
              ]}
              rows={
                report.cashbookWarningRows.length
                  ? report.cashbookWarningRows
                  : [
                      [
                        "—",
                        "—",
                        "—",
                        "Chưa có khoản chi vượt ngưỡng cảnh báo",
                        "—",
                        "—",
                        "Theo dõi tiếp",
                      ],
                    ]
              }
              maxHeight="max-h-[320px]"
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Top vấn đề cần CEO chú ý</CardTitle>
          <div className="mt-3">
            <ReportTable
              headers={[
                "Hạng",
                "Vấn đề",
                "Ảnh hưởng",
                "Nguyên nhân",
                "Đề xuất xử lý",
              ]}
              rows={report.issueRows}
            />
          </div>
        </Card>
        <Card>
          <CardTitle>Thất thoát NVL — Top 5 cần xử lý</CardTitle>
          <p className="mt-2 text-sm text-black/60">
            Không có dữ liệu thì bảng để trống, không dùng dữ liệu mẫu.
          </p>
          <div className="mt-3">
            <ReportTable
              headers={[
                "NVL",
                "ĐVT",
                "Chênh SL",
                "Giá trị lệch",
                "Tỷ lệ",
                "Định mức",
                "Vượt",
                "Trạng thái",
                "Hành động",
              ]}
              rows={report.lossTop5Rows}
              maxHeight="max-h-[340px]"
            />
          </div>
        </Card>
      </section>

      <AiAgentPanel report={report} />
    </div>
  );
}
