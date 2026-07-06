import { PageHeader } from "@/components/layout/PageHeader";
import { ChartCard } from "@/components/report/ChartCard";
import { MetricCard } from "@/components/report/MetricCard";
import { ReportTable } from "@/components/report/ReportTable";
import { Card, CardTitle } from "@/components/ui/Card";
import { buildDashboardReport } from "@/lib/reports/report-aggregator";
import { parsePageReportFilters } from "@/lib/reports/report-filters";
import { getDataStore } from "@/lib/data-store";
import { SHEET_NAMES } from "@/lib/google-sheets/sheet-names";
import { analyzeCashbookBusiness, filterCashbookBusiness } from "@/lib/reports/cashbook-business";
import { buildForecastReport } from "@/lib/forecast/forecast-engine";
import { filterRowsByReportFilters } from "@/lib/reports/report-filters";

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

async function readDebtRows() {
  try {
    return await getDataStore().read(SHEET_NAMES.DL_CONG_NO);
  } catch {
    try {
      return await getDataStore().read(SHEET_NAMES.DATA_CONG_NO);
    } catch {
      return [];
    }
  }
}

function formatMoneyVnd(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(".", ",")} tỷ`;
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".", ",")}tr`;
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function debtAmount(row: Record<string, unknown>) {
  const value = Number(String(row["Còn phải trả"] ?? row["Phải trả"] ?? row["Công nợ đến hạn"] ?? row["Quá hạn"] ?? row["Dư nợ"] ?? 0).replace(/\s/g, '').replace(/đ|vnd/gi, '').replace(/,/g, ''));
  return Number.isFinite(value) ? Math.abs(value) : 0;
}

export default async function DongTienPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const cashbookRows = filterCashbookBusiness(await readCashbookRows(), filters);
  const debtRows = filterRowsByReportFilters(await readDebtRows(), SHEET_NAMES.DL_CONG_NO, filters);
  const forecast = await buildForecastReport(filters);
  const baseForecast = forecast.scenarios.find((scenario) => scenario.id === "co_so");
  const business = analyzeCashbookBusiness(cashbookRows);
  const hasCashbook = cashbookRows.length > 0;
  const currentCashflow = business.summary.revenue + business.summary.otherIn - business.summary.storeCost - business.summary.bttCost - business.summary.supplierPay - business.summary.capex - business.summary.unknown;
  const forecastCashflow = baseForecast?.netCashflow ?? 0;
  const forecastShortage = Math.max(0, -forecastCashflow);
  const debtDue = debtRows.reduce((total, row) => total + debtAmount(row), 0);
  const pnlRows = business.pnlRows.map((row) => [row[0], row[1], "VND", row[2], "—", "—", "—", row[3], row[4]]);
  const forecastRows = [
    ["Dòng tiền hiện tại", "VND", business.cashRows[7]?.[2] ?? "—", "—", "—", "Theo sổ quỹ hiện có", business.cashRows[7]?.[5] ?? "Chưa đủ dữ liệu"],
    ["Dòng tiền dự kiến", "VND", baseForecast ? formatMoneyVnd(forecastCashflow) : "—", "—", "—", forecast.baseline.weightedFormula, baseForecast ? (forecastCashflow < 0 ? "Cảnh báo" : "Tốt") : "Chưa đủ dữ liệu"],
    ["Mức thiếu tiền dự kiến", "VND", baseForecast ? formatMoneyVnd(forecastShortage) : "—", "—", "—", forecastShortage ? "Cần CEO duyệt phương án bù tiền" : "Không thiếu theo kịch bản cơ sở", baseForecast ? (forecastShortage ? "Nguy hiểm" : "Tốt") : "Chưa đủ dữ liệu"],
    ["Công nợ đến hạn", "VND", debtRows.length ? formatMoneyVnd(debtDue) : business.cashRows[4]?.[2] ?? "—", "—", "—", debtRows.length ? "Đọc từ DL_CONG_NO/06_DATA_CONG_NO" : "Theo nhóm trả NCC/công nợ trong sổ quỹ", debtRows.length || business.summary.supplierPay ? "Cần đối chiếu" : "Chưa đủ dữ liệu"],
    ["Chênh lệch hiện tại/dự kiến", "VND", baseForecast ? formatMoneyVnd(forecastCashflow - currentCashflow) : "—", "—", "—", "Dòng tiền dự kiến - dòng tiền hiện tại", baseForecast ? "Cần đối chiếu" : "Chưa đủ dữ liệu"]
  ];

  return (
    <div className="space-y-2.5">
      <PageHeader title="Dòng tiền Tuần" status={hasCashbook ? "Tốt" : "Chưa đủ dữ liệu"} />

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
        <MetricCard label="Doanh thu sổ quỹ" value={business.cashRows[0]?.[2] ?? "—"} status={business.summary.revenue ? "good" : "neutral"} compact />
        <MetricCard label="Chi cửa hàng" value={business.cashRows[2]?.[2] ?? "—"} status={business.summary.storeCost ? "warning" : "neutral"} compact />
        <MetricCard label="Chi BTT" value={business.cashRows[3]?.[2] ?? "—"} status={business.summary.bttCost ? "warning" : "good"} compact />
        <MetricCard label="Trả NCC" value={business.cashRows[4]?.[2] ?? "—"} status={business.summary.supplierPay ? "warning" : "good"} compact />
        <MetricCard label="Chưa phân loại" value={business.cashRows[6]?.[2] ?? "—"} status={business.summary.unknown ? "warning" : "good"} compact />
        <MetricCard label="Dòng tiền thuần" value={business.cashRows[7]?.[2] ?? "—"} status={report.totals.cashEnding < 0 ? "danger" : hasCashbook ? "good" : "neutral"} compact />
      </section>

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_330px]">
        <Card>
          <CardTitle>Bảng dòng tiền</CardTitle>
          <div className="mt-2">
            <ReportTable headers={["Nhóm", "Chỉ số", "Đơn vị", "Số tiền", "Kỳ trước", "Chênh lệch", "% thay đổi", "Xu hướng", "Trạng thái"]} rows={business.cashRows.map((row) => [row[0], row[1], "VND", row[2], "—", "—", "—", "—", row[5]])} maxHeight="max-h-[280px]" />
          </div>
        </Card>
        <Card>
          <CardTitle>Nguồn dữ liệu</CardTitle>
          <div className="mt-2">
            <ReportTable headers={["Nguồn", "Số dòng"]} rows={[["Sổ quỹ", String(cashbookRows.length)], ["Lịch sử import", String(report.sourceCounts.importHistory)]]} maxHeight="max-h-[140px]" />
          </div>
        </Card>
      </section>

      <section className="grid gap-2 xl:grid-cols-2">
        <Card>
          <CardTitle>P&L quản trị từ sổ quỹ</CardTitle>
          <div className="mt-2">
            <ReportTable headers={["Nhóm", "Khoản mục", "Đơn vị", "Kỳ này", "Kỳ trước", "Chênh lệch", "% thay đổi", "Ghi chú", "Trạng thái"]} rows={pnlRows} maxHeight="max-h-[240px]" />
          </div>
        </Card>
        <Card>
          <CardTitle>Dự toán / công nợ / thiếu tiền</CardTitle>
          <div className="mt-2">
            <ReportTable headers={["Chỉ số", "Đơn vị", "Kỳ này", "Kỳ trước", "Chênh lệch", "Ghi chú", "Trạng thái"]} rows={forecastRows} maxHeight="max-h-[240px]" />
          </div>
        </Card>
      </section>

      <section className="grid gap-2 xl:grid-cols-2">
        <ChartCard title="Thu - chi" items={[{ label: "Tiền vào", value: report.totals.cashIn, caption: report.executiveKpis.find((kpi) => kpi.label === "Tiền vào")?.value }, { label: "Tiền ra", value: report.totals.cashOut, caption: report.executiveKpis.find((kpi) => kpi.label === "Tiền ra")?.value }]} />
        <Card>
          <CardTitle>Khoản chi lớn</CardTitle>
          <div className="mt-2">
            <ReportTable headers={["Ngày", "Nhóm", "Diễn giải", "Số tiền", "Trạng thái"]} rows={report.cashbookTopOutRows.map((row) => [row[0], row[1], row[2], row[3], row[5]])} maxHeight="max-h-[240px]" />
          </div>
        </Card>
      </section>
    </div>
  );
}
