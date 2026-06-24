import { PageHeader } from '@/components/layout/PageHeader';
import { BatchUploadMock } from '@/components/forms/BatchUploadMock';
import { ReportStatusPanel } from '@/components/report/ReportStatusPanel';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { PermissionMatrix } from '@/components/report/PermissionMatrix';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

async function readHistory() {
  try {
    return await getDataStore().read(SHEET_NAMES.IMPORT_LICH_SU);
  } catch {
    return [];
  }
}

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined> };

export default async function BanLamViecKeToanPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const history = await readHistory();
  const checklistRows = [
    ['Upload doanh thu app', report.sourceCounts.appRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', 'Kế toán', 'Thứ 2', 'Import file app'],
    ['Upload doanh thu cửa hàng', report.sourceCounts.storeRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', 'Kế toán', 'Thứ 2', 'Import file cửa hàng'],
    ['Upload sổ quỹ', report.sourceCounts.cashbook ? 'Đạt' : 'Chưa đủ dữ liệu', 'Kế toán', 'Thứ 2', 'Import file sổ quỹ'],
    ['Upload tồn kho', report.sourceCounts.inventory ? 'Đạt' : 'Chưa đủ dữ liệu', 'Kế toán', 'Thứ 2', 'Import file tồn kho'],
    ['Upload thất thoát NVL', report.sourceCounts.lossRows ? 'Đạt' : 'Chưa đủ dữ liệu', 'Kế toán', 'Thứ 2', 'Import file thất thoát'],
    ['Chốt báo cáo CEO', report.missingSources.length ? 'Chưa thể chốt' : 'Đạt', 'Kế toán', 'Sau khi đủ file', report.missingSources.length ? 'Còn thiếu dữ liệu' : 'Có thể chốt']
  ];
  const historyRows = history.slice(-10).reverse().map((row) => [String(row['Ngày import'] ?? ''), String(row['Người import'] ?? ''), String(row['Trạng thái'] ?? ''), String(row['Ghi chú'] ?? '')]);

  return (
    <div className="space-y-4">
      <PageHeader title="Bàn làm việc kế toán" description="Màn hình kế toán dùng thứ 2 hằng tuần: checklist, upload nhiều file, đối soát lỗi, chốt báo cáo và gửi CEO/Bot." status={report.missingSources.length ? 'Chưa thể chốt' : 'Tốt'} />
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Trạng thái báo cáo" value={report.missingSources.length ? 'Chưa thể chốt' : 'Có thể chốt'} status={report.missingSources.length ? 'warning' : 'good'} trend={report.missingSources.length ? `Thiếu ${report.missingSources.length} nguồn` : 'Đủ nguồn chính'} />
        <MetricCard label="File dữ liệu đã có" value={`${5 - report.missingSources.length}/5`} status={report.missingSources.length ? 'warning' : 'good'} trend="Nguồn chính" />
        <MetricCard label="Lịch sử import" value={`${history.length}`} status={history.length ? 'good' : 'neutral'} trend="IMPORT_LICH_SU" />
        <MetricCard label="Data Quality" value={report.hasRealData ? (report.missingSources.length ? 'Cảnh báo' : 'Đạt') : 'Trống'} status={report.hasRealData ? (report.missingSources.length ? 'warning' : 'good') : 'neutral'} trend="Không dùng dữ liệu mẫu" />
      </section>
      <ReportStatusPanel />
      <Card>
        <CardTitle>Checklist báo cáo thứ 2</CardTitle>
        <div className="mt-3"><ReportTable headers={['Việc cần làm', 'Trạng thái', 'Người phụ trách', 'Deadline', 'Hành động']} rows={checklistRows} /></div>
      </Card>
      <Card>
        <CardTitle>Upload và kiểm tra batch nhiều file</CardTitle>
        <p className="mt-2 text-sm text-black/60">Có thể chọn 4–5 file cùng lúc. Upload chỉ là bước kiểm tra; chỉ bấm Import file đạt khi lỗi/lệch bằng 0.</p>
        <div className="mt-3"><BatchUploadMock /></div>
      </Card>
      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Việc kế toán cần xử lý hôm nay</CardTitle>
          <div className="mt-3"><ReportTable headers={['Mức độ', 'Vấn đề', 'Owner', 'Deadline', 'Cách kiểm tra']} rows={report.issueRows.map((row) => [row[1]?.includes('Thiếu') ? 'Cảnh báo' : 'Tốt', row[1] ?? '', 'Kế toán', 'Hôm nay', row[4] ?? 'Kiểm tra Google Sheet'])} /></div>
        </Card>
        <Card>
          <CardTitle>Chốt báo cáo & gửi CEO/Bot</CardTitle>
          <p className="mt-2 text-sm text-black/60">Production strict: chỉ chốt khi đủ nguồn dữ liệu chính, không dùng số mẫu.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button disabled={Boolean(report.missingSources.length)}>Chốt báo cáo tuần</Button>
            <Button variant="secondary" disabled={Boolean(report.missingSources.length)}>Gửi CEO</Button>
            <Button variant="secondary" disabled={Boolean(report.missingSources.length)}>Gửi Bot</Button>
          </div>
          <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{report.missingSources.length ? `Không thể chốt: còn thiếu ${report.missingSources.join(', ')}.` : 'Có thể chốt sau khi kế toán kiểm tra lần cuối.'}</p>
        </Card>
      </section>
      <Card>
        <CardTitle>Lịch sử thao tác kế toán</CardTitle>
        <div className="mt-3"><ReportTable headers={['Thời gian', 'Người xử lý', 'Hành động', 'Ghi chú']} rows={historyRows.length ? historyRows : [['—', '—', 'Chưa đủ dữ liệu', 'Chưa có lịch sử import thật']]} /></div>
      </Card>
      <PermissionMatrix />
    </div>
  );
}
