import { PageHeader } from "@/components/layout/PageHeader";
import { ChartCard } from "@/components/report/ChartCard";
import { MetricCard } from "@/components/report/MetricCard";
import { ReportTable } from "@/components/report/ReportTable";
import { Card, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { buildDashboardReport } from "@/lib/reports/report-aggregator";
import { parsePageReportFilters } from "@/lib/reports/report-filters";
import { getDataStore } from "@/lib/data-store";
import { SHEET_NAMES } from "@/lib/google-sheets/sheet-names";
import { analyzeCashbookBusiness, filterCashbookBusiness } from "@/lib/reports/cashbook-business";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function readCashbookRows() {
  try {
    return await getDataStore().read(SHEET_NAMES.DL_SO_QUY);
  } catch {
    return [];
  }
}

export default async function DongTienPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const cashbookRows = filterCashbookBusiness(await readCashbookRows(), filters);
  const business = analyzeCashbookBusiness(cashbookRows);
  const hasCashbook = cashbookRows.length > 0;

  return (
    <div className="space-y-3">
      <PageHeader
        title="Dòng tiền Tuần"
        description="Tiền thật vào/ra từ Sổ quỹ, đã tách doanh thu, chi cửa hàng, chi BTT, trả NCC, capex và khoản cần phân loại."
        status={hasCashbook ? "Tốt" : "Chưa đủ dữ liệu"}
      />
      {!hasCashbook ? (
        <EmptyState
          title="Chưa đủ dữ liệu dòng tiền"
          description="Chưa có dữ liệu trong DL_SO_QUY. Hãy import file Sổ quỹ và xác nhận ghi Google Sheet."
        />
      ) : null}

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
        <MetricCard label="Doanh thu từ sổ quỹ" value={business.cashRows[0]?.[2] ?? "—"} status={business.summary.revenue ? "good" : "neutral"} trend="Dùng để đối chiếu" compact />
        <MetricCard label="Chi vận hành cửa hàng" value={business.cashRows[2]?.[2] ?? "—"} status={business.summary.storeCost ? "warning" : "neutral"} trend="Có thể xét P&L" compact />
        <MetricCard label="Chi Bếp Trung Tâm" value={business.cashRows[3]?.[2] ?? "—"} status={business.summary.bttCost ? "warning" : "good"} trend="Không trộn vào Làng NVT" compact />
        <MetricCard label="Trả NCC / công nợ" value={business.cashRows[4]?.[2] ?? "—"} status={business.summary.supplierPay ? "warning" : "good"} trend="Không tự đưa vào P&L" compact />
        <MetricCard label="Chi cần phân loại" value={business.cashRows[6]?.[2] ?? "—"} status={business.summary.unknown ? "warning" : "good"} trend="Chặn chốt nếu còn lớn" compact />
        <MetricCard label="Dòng tiền thuần" value={business.cashRows[7]?.[2] ?? "—"} status={report.totals.cashEnding < 0 ? "danger" : hasCashbook ? "good" : "neutral"} trend="Tổng thu - tổng chi" compact />
      </section>

      <Card>
        <CardTitle>Bảng dòng tiền theo nghiệp vụ</CardTitle>
        <p className="mt-2 text-sm text-black/60">Bảng này dùng để tránh nhầm: trả NCC là dòng tiền trả nợ, capex là đầu tư tài sản, chi BTT theo dõi riêng.</p>
        <div className="mt-3">
          <ReportTable
            headers={["Nhóm", "Chỉ số", "Số tiền", "Ý nghĩa", "Quy tắc P&L", "Trạng thái"]}
            rows={business.cashRows}
            maxHeight="max-h-[360px]"
          />
        </div>
      </Card>

      <section className="grid gap-3 xl:grid-cols-2">
        <ChartCard
          title="Thu - chi theo Sổ quỹ"
          items={[
            { label: "Tiền vào", value: report.totals.cashIn, caption: report.executiveKpis.find((kpi) => kpi.label === "Tiền vào")?.value },
            { label: "Tiền ra", value: report.totals.cashOut, caption: report.executiveKpis.find((kpi) => kpi.label === "Tiền ra")?.value }
          ]}
        />
        <ChartCard
          title="Nguồn dữ liệu dòng tiền"
          items={[
            { label: "Sổ quỹ", value: cashbookRows.length, caption: `${cashbookRows.length} dòng` },
            { label: "Lịch sử import", value: report.sourceCounts.importHistory, caption: `${report.sourceCounts.importHistory} batch` }
          ]}
        />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Top khoản chi lớn từ Sổ quỹ</CardTitle>
          <div className="mt-3">
            <ReportTable headers={["Ngày", "Nhóm", "Diễn giải", "Số tiền", "Chi nhánh", "Trạng thái"]} rows={report.cashbookTopOutRows} maxHeight="max-h-[360px]" />
          </div>
        </Card>
        <Card>
          <CardTitle>Thu/chi theo nhóm gốc</CardTitle>
          <div className="mt-3">
            <ReportTable headers={["Nhóm", "Số dòng", "Tiền vào", "Tiền ra", "Ròng", "Trạng thái", "Ghi chú"]} rows={report.cashbookGroupRows} maxHeight="max-h-[360px]" />
          </div>
        </Card>
      </section>
    </div>
  );
}
