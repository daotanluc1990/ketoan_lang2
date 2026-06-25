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

function createCeoDecisionRows(report: Awaited<ReturnType<typeof buildDashboardReport>>) {
  return [
    [
      "1",
      "Có thể chốt báo cáo tuần?",
      report.missingSources.length ? "Chưa" : "Có thể chốt sau kiểm tra cuối",
      report.missingSources.length ? `Còn thiếu ${report.missingSources.length} nguồn dữ liệu` : "Đủ nguồn chính trong phạm vi lọc",
      report.missingSources.length ? "Yêu cầu kế toán bổ sung dữ liệu" : "CEO xem cảnh báo cuối rồi duyệt",
    ],
    [
      "2",
      "Dữ liệu có đủ tin cậy không?",
      report.hasRealData ? (report.missingSources.length ? "Cần đối chiếu" : "Tốt") : "Chưa đủ dữ liệu",
      report.hasRealData ? report.message : "Chưa có dữ liệu import thật",
      report.hasRealData ? "Xem bảng độ sẵn sàng dữ liệu" : "Vào Nhập liệu & Import",
    ],
    [
      "3",
      "Có khoản chi lớn cần hỏi ngay không?",
      report.cashbookWarningRows.length ? "Có" : "Chưa phát hiện",
      report.cashbookWarningRows.length ? `${report.cashbookWarningRows.length} khoản cần kiểm tra` : "Không có khoản vượt ngưỡng trong dữ liệu hiện tại",
      report.cashbookWarningRows.length ? "Mở Bàn làm việc kế toán để giao xử lý" : "Theo dõi tiếp",
    ],
    [
      "4",
      "Có thất thoát NVL nổi bật không?",
      report.lossTop5Rows.length ? "Có dữ liệu" : "Chưa đủ dữ liệu",
      report.lossTop5Rows[0]?.[0] ?? "Chưa có bảng thất thoát hợp lệ",
      report.lossTop5Rows.length ? "Xem Top 5 NVL bên dưới" : "Import dữ liệu thất thoát",
    ],
  ];
}

export default async function TongQuanPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const status = report.hasRealData
    ? report.missingSources.length
      ? "Cần đối chiếu"
      : "Tốt"
    : "Chưa đủ dữ liệu";
  const primaryKpis = report.executiveKpis.slice(0, 8);
  const ceoDecisionRows = createCeoDecisionRows(report);

  return (
    <div className="space-y-4">
      <PageHeader
        title="CEO Cockpit"
        description="Màn hình 10 giây cho CEO: tuần này tốt/xấu, dữ liệu đã đủ chưa, khoản nào cần hỏi kế toán và việc nào cần duyệt ngay."
        status={status}
      />

      {!report.hasRealData ? (
        <EmptyState
          title="Chưa đủ dữ liệu để kết luận"
          description="Google Sheet chưa có dữ liệu import thật. Hãy vào Bàn làm việc kế toán hoặc Nhập liệu & Import để kiểm tra batch trước khi chốt báo cáo."
        />
      ) : null}

      <section className="grid gap-3 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border-l-8 border-amber-500 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            CEO Cockpit · {report.dataMode}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-lang-brown">
            {report.hasRealData
              ? report.missingSources.length
                ? "Có dữ liệu nhưng chưa nên chốt ngay"
                : "Dữ liệu chính đã sẵn sàng để CEO xem xét"
              : "Chưa đủ dữ liệu để kết luận."}
          </h3>
          <p className="mt-2 text-sm text-black/60">{report.message}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-lang-cream px-3 py-1 text-lang-brown">
              Nguồn thiếu: {report.missingSources.length}
            </span>
            <span className="rounded-full bg-lang-cream px-3 py-1 text-lang-brown">
              Cảnh báo sổ quỹ: {report.cashbookWarningRows.length}
            </span>
            <span className="rounded-full bg-lang-cream px-3 py-1 text-lang-brown">
              Top thất thoát: {report.lossTop5Rows.length}
            </span>
          </div>
        </div>

        <Card>
          <CardTitle>Kết luận CEO cần nhớ</CardTitle>
          <div className="mt-3 space-y-2 text-sm text-black/70">
            <p>
              <strong>Trạng thái:</strong> {status}
            </p>
            <p>
              <strong>Việc tiếp theo:</strong> {report.missingSources.length ? "Giao kế toán bổ sung/đối chiếu dữ liệu còn thiếu." : "Xem cảnh báo cuối và duyệt chốt báo cáo."}
            </p>
            <p>
              <strong>Nguyên tắc:</strong> Không dùng dữ liệu mẫu để kết luận tài chính.
            </p>
          </div>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {primaryKpis.map((kpi) => (
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

      <section className="grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardTitle>Việc CEO cần quyết định ngay</CardTitle>
          <p className="mt-2 text-sm text-black/60">
            Bảng này gom lại câu hỏi điều hành quan trọng, tránh CEO phải mở nhiều tab để biết có nên chốt báo cáo hay không.
          </p>
          <div className="mt-3">
            <ReportTable
              headers={["Ưu tiên", "Câu hỏi", "Kết luận tạm", "Bằng chứng", "Hành động"]}
              rows={ceoDecisionRows}
              maxHeight="max-h-[360px]"
            />
          </div>
        </Card>

        <Card>
          <CardTitle>Độ sẵn sàng dữ liệu</CardTitle>
          <p className="mt-2 text-sm text-black/60">
            Nguồn nào thiếu thì CEO không nên chốt số cuối cùng.
          </p>
          <div className="mt-3">
            <ReportTable
              headers={["Mảng", "Trạng thái", "Bằng chứng", "Cách dùng"]}
              rows={report.dataReadinessRows}
              maxHeight="max-h-[360px]"
            />
          </div>
        </Card>
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
          description="Số dòng đã ghi vào các sheet dữ liệu gốc. Dữ liệu trống thì không kết luận."
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
          <CardTitle>Cảnh báo Sổ quỹ — khoản chi lớn</CardTitle>
          <p className="mt-2 text-sm text-black/60">
            Lấy trực tiếp từ DL_SO_QUY. Dùng để yêu cầu kế toán giải trình, không tự động kết luận thất thoát.
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

        <Card>
          <CardTitle>Top vấn đề cần CEO chú ý</CardTitle>
          <p className="mt-2 text-sm text-black/60">
            Chỉ hiển thị vấn đề có bằng chứng từ dữ liệu đã import.
          </p>
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
              maxHeight="max-h-[320px]"
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
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

        <AiAgentPanel report={report} />
      </section>
    </div>
  );
}
