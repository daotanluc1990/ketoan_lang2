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

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function BanLamViecKeToanPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const history = await readHistory();
  const missingCount = report.missingSources.length;
  const canClose = missingCount === 0;
  const checklistRows = [
    ['1', 'Doanh thu app', report.sourceCounts.appRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.appRevenue} dòng`, report.sourceCounts.appRevenue ? 'Đối chiếu phí app và tiền về' : 'Import file app'],
    ['2', 'Doanh thu cửa hàng', report.sourceCounts.storeRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.storeRevenue} dòng`, report.sourceCounts.storeRevenue ? 'Đối chiếu tiền mặt và chuyển khoản' : 'Import file cửa hàng'],
    ['3', 'Sổ quỹ', report.sourceCounts.cashbook ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.cashbook} dòng`, report.sourceCounts.cashbook ? 'Phân loại chi và khoản lớn' : 'Import file sổ quỹ'],
    ['4', 'Tồn kho', report.sourceCounts.inventory ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.inventory} dòng`, report.sourceCounts.inventory ? 'Kiểm tồn âm và giá trị tồn' : 'Import file tồn kho'],
    ['5', 'Thất thoát NVL', report.sourceCounts.lossRows ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.lossRows} dòng`, report.sourceCounts.lossRows ? 'Kiểm NVL vượt định mức' : 'Import file thất thoát'],
    ['6', 'Chốt báo cáo CEO', canClose ? 'Đạt' : 'Chưa thể chốt', missingCount ? `Thiếu ${missingCount} nguồn` : 'Đủ nguồn chính', canClose ? 'Kiểm tra cuối và gửi báo cáo' : 'Xử lý nguồn thiếu trước']
  ];
  const workflowRows = [
    ['1', 'Kiểm nguồn dữ liệu', 'Kế toán', 'Xem nguồn nào thiếu hoặc có cảnh báo', missingCount ? 'Cảnh báo' : 'Đạt'],
    ['2', 'Upload file', 'Kế toán', 'Chọn nhiều file và bấm Kiểm tra batch', 'Đang làm'],
    ['3', 'Xử lý lỗi dữ liệu', 'Kế toán', 'Không import nếu còn lỗi hoặc lệch', 'Cần kiểm'],
    ['4', 'Phân loại khoản chi', 'Kế toán', 'Kiểm khoản chi lớn và khoản chưa rõ', report.cashbookWarningRows.length ? 'Cảnh báo' : 'Theo dõi'],
    ['5', 'Chốt báo cáo', 'Kế toán', 'Chỉ chốt khi đủ nguồn chính', canClose ? 'Đạt' : 'Chưa thể chốt'],
    ['6', 'Gửi báo cáo', 'Kế toán', 'Gửi sau khi báo cáo đã chốt', canClose ? 'Có thể gửi' : 'Không']
  ];
  const taskRows = report.issueRows.length
    ? report.issueRows.map((row) => [row[1]?.includes('Thiếu') ? 'Cảnh báo' : 'Theo dõi', row[1] ?? '', row[2] ?? '', 'Kế toán', 'Hôm nay', row[4] ?? 'Kiểm tra Google Sheet'])
    : [['Tốt', 'Chưa phát hiện việc cần xử lý', 'Không có cảnh báo trong dữ liệu hiện tại', 'Kế toán', 'Hôm nay', 'Theo dõi tiếp']];
  const historyRows = history.slice(-10).reverse().map((row) => [String(row['Ngày import'] ?? ''), String(row['Người import'] ?? ''), String(row['Trạng thái'] ?? ''), String(row['Ghi chú'] ?? '')]);

  return (
    <div className="space-y-4">
      <PageHeader title="Bàn làm việc kế toán" description="Màn hình kế toán dùng mỗi thứ 2: kiểm nguồn dữ liệu, import nhiều file, xử lý lỗi, phân loại khoản chi, chốt báo cáo và gửi CEO." status={canClose ? 'Tốt' : 'Chưa thể chốt'} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Trạng thái báo cáo" value={canClose ? 'Có thể chốt' : 'Chưa thể chốt'} status={canClose ? 'good' : 'warning'} trend={missingCount ? `Thiếu ${missingCount} nguồn` : 'Đủ nguồn chính'} />
        <MetricCard label="Nguồn dữ liệu đã có" value={`${5 - missingCount}/5`} status={missingCount ? 'warning' : 'good'} trend="App, cửa hàng, sổ quỹ, tồn kho, thất thoát" />
        <MetricCard label="Cảnh báo sổ quỹ" value={`${report.cashbookWarningRows.length}`} status={report.cashbookWarningRows.length ? 'warning' : 'good'} trend="Khoản chi lớn hoặc cần giải trình" />
        <MetricCard label="Lịch sử import" value={`${history.length}`} status={history.length ? 'good' : 'neutral'} trend="IMPORT_LICH_SU" />
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle>Luồng xử lý báo cáo thứ 2</CardTitle>
          <p className="mt-2 text-sm text-black/60">Kế toán làm theo thứ tự từ trên xuống. Chưa đạt bước trước thì không vội chốt báo cáo.</p>
          <div className="mt-3">
            <ReportTable headers={['Bước', 'Việc cần làm', 'Người xử lý', 'Kết quả cần có', 'Trạng thái']} rows={workflowRows} maxHeight="max-h-[360px]" />
          </div>
        </Card>

        <Card>
          <CardTitle>Checklist nguồn dữ liệu bắt buộc</CardTitle>
          <p className="mt-2 text-sm text-black/60">Nguồn thiếu sẽ khóa bước chốt và gửi báo cáo để tránh CEO nhận số chưa đủ bằng chứng.</p>
          <div className="mt-3">
            <ReportTable headers={['Thứ tự', 'Nguồn dữ liệu', 'Trạng thái', 'Bằng chứng', 'Hành động']} rows={checklistRows} maxHeight="max-h-[360px]" />
          </div>
        </Card>
      </section>

      <ReportStatusPanel />

      <Card>
        <CardTitle>Upload và kiểm tra batch nhiều file</CardTitle>
        <p className="mt-2 text-sm text-black/60">Đây là bước nhập liệu chính. Bấm Kiểm tra batch trước để preview, chỉ bấm Import file đạt khi lỗi/lệch bằng 0 và file được nhận diện đúng.</p>
        <div className="mt-3"><BatchUploadMock /></div>
      </Card>

      <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardTitle>Việc kế toán cần xử lý hôm nay</CardTitle>
          <p className="mt-2 text-sm text-black/60">Danh sách này giúp biết phải bổ sung file nào, giải trình khoản nào và xử lý gì trước khi chốt báo cáo.</p>
          <div className="mt-3"><ReportTable headers={['Mức độ', 'Vấn đề', 'Ảnh hưởng', 'Owner', 'Deadline', 'Cách kiểm tra']} rows={taskRows} maxHeight="max-h-[420px]" /></div>
        </Card>

        <Card>
          <CardTitle>Chốt báo cáo và gửi CEO</CardTitle>
          <p className="mt-2 text-sm text-black/60">Chỉ chốt khi đủ nguồn dữ liệu chính, không dùng số mẫu, không bỏ qua lỗi blocking.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button disabled={!canClose}>Chốt báo cáo tuần</Button>
            <Button variant="secondary" disabled={!canClose}>Gửi CEO</Button>
            <Button variant="secondary" disabled={!canClose}>Gửi Bot</Button>
          </div>
          <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{canClose ? 'Có thể chốt sau khi kế toán kiểm tra lần cuối.' : `Không thể chốt: còn thiếu ${report.missingSources.join(', ')}.`}</p>
          <div className="mt-3 rounded-xl bg-lang-cream p-4 text-sm text-black/65"><strong>Gợi ý vận hành:</strong> Nếu còn thiếu nguồn, chỉ gửi cảnh báo thiếu dữ liệu để CEO biết lý do chưa chốt.</div>
        </Card>
      </section>

      <Card>
        <CardTitle>Lịch sử thao tác kế toán</CardTitle>
        <div className="mt-3"><ReportTable headers={['Thời gian', 'Người xử lý', 'Hành động', 'Ghi chú']} rows={historyRows.length ? historyRows : [['—', '—', 'Chưa đủ dữ liệu', 'Chưa có lịch sử import thật']]} maxHeight="max-h-[320px]" /></div>
      </Card>

      <PermissionMatrix />
    </div>
  );
}
