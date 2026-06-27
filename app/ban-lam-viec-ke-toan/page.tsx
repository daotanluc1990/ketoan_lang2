import Link from 'next/link';
import { FileInput, Send, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { buildDashboardReport } from '@/lib/reports/report-aggregator';
import { parsePageReportFilters } from '@/lib/reports/report-filters';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

async function readHistory() { try { return await getDataStore().read(SHEET_NAMES.IMPORT_LICH_SU); } catch { return []; } }

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function BanLamViecKeToanPage({ searchParams }: PageProps) {
  const filters = await parsePageReportFilters(searchParams);
  const report = await buildDashboardReport(filters);
  const history = await readHistory();
  const missingCount = report.missingSources.length;
  const canClose = missingCount === 0;
  const checklistRows = [
    ['1', 'Doanh thu app', report.sourceCounts.appRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.appRevenue} dòng`, report.sourceCounts.appRevenue ? 'Đối chiếu' : 'Import file app'],
    ['2', 'Doanh thu cửa hàng', report.sourceCounts.storeRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.storeRevenue} dòng`, report.sourceCounts.storeRevenue ? 'Đối chiếu' : 'Import file cửa hàng'],
    ['3', 'Sổ quỹ', report.sourceCounts.cashbook ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.cashbook} dòng`, report.sourceCounts.cashbook ? 'Phân loại chi' : 'Import file sổ quỹ'],
    ['4', 'Tồn kho', report.sourceCounts.inventory ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.inventory} dòng`, report.sourceCounts.inventory ? 'Kiểm tồn âm' : 'Import file tồn kho'],
    ['5', 'Thất thoát NVL', report.sourceCounts.lossRows ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.lossRows} dòng`, report.sourceCounts.lossRows ? 'Kiểm vượt định mức' : 'Import file thất thoát'],
    ['6', 'Chốt báo cáo CEO', canClose ? 'Đạt' : 'Chưa thể chốt', missingCount ? `Thiếu ${missingCount} nguồn` : 'Đủ nguồn chính', canClose ? 'Gửi báo cáo' : 'Xử lý nguồn thiếu']
  ];
  const taskRows = report.issueRows.length ? report.issueRows.slice(0, 8).map((row) => [row[1]?.includes('Thiếu') ? 'Cảnh báo' : 'Theo dõi', row[1] ?? '', row[2] ?? '', 'Kế toán', 'Hôm nay', row[4] ?? 'Kiểm tra Google Sheet']) : [['Tốt', 'Chưa phát hiện việc cần xử lý', 'Không có cảnh báo', 'Kế toán', 'Hôm nay', 'Theo dõi tiếp']];
  const historyRows = history.slice(-8).reverse().map((row) => [String(row['Ngày import'] ?? ''), String(row['Người import'] ?? ''), String(row['Trạng thái'] ?? ''), String(row['Ghi chú'] ?? '')]);

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title="Bàn làm việc kế toán" description="Kiểm nguồn, xử lý lỗi, chốt và gửi báo cáo." status={canClose ? 'Tốt' : 'Chưa thể chốt'} />
        <div className="flex flex-wrap gap-2">
          <Link href="/import-nhap-lieu" className="inline-flex h-9 items-center gap-2 rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink shadow-sm hover:bg-gray-50"><FileInput className="h-4 w-4" />Import</Link>
          <Link href="/cai-dat-bot" className="inline-flex h-9 items-center gap-2 rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink shadow-sm hover:bg-gray-50"><Send className="h-4 w-4" />Gửi CEO/Bot</Link>
          <Link href="/lich-su-chot-bao-cao" className="inline-flex h-9 items-center gap-2 rounded-lg bg-lang-red px-3 text-[13px] font-bold text-white shadow-sm hover:bg-lang-redDark"><ShieldCheck className="h-4 w-4" />Chốt</Link>
        </div>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Trạng thái báo cáo" value={canClose ? 'Có thể chốt' : 'Chưa thể chốt'} status={canClose ? 'good' : 'warning'} trend={missingCount ? `Thiếu ${missingCount} nguồn` : 'Đủ nguồn chính'} compact />
        <MetricCard label="Nguồn dữ liệu" value={`${5 - missingCount}/5`} status={missingCount ? 'warning' : 'good'} trend="Nguồn bắt buộc" compact />
        <MetricCard label="Cảnh báo sổ quỹ" value={`${report.cashbookWarningRows.length}`} status={report.cashbookWarningRows.length ? 'warning' : 'good'} trend="Khoản chi lớn" compact />
        <MetricCard label="Lịch sử import" value={`${history.length}`} status={history.length ? 'good' : 'neutral'} trend="IMPORT_LICH_SU" compact />
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="p-0"><div className="flex items-center justify-between border-b border-lang-line px-4 py-3"><CardTitle>Việc kế toán cần xử lý hôm nay</CardTitle><StatusBadge status={canClose ? 'Tốt' : 'Cảnh báo'} /></div><div className="p-3"><ReportTable headers={['Mức độ', 'Vấn đề', 'Ảnh hưởng', 'Owner', 'Deadline', 'Cách kiểm tra']} rows={taskRows} maxHeight="max-h-[390px]" /></div></Card>
        <div className="space-y-4">
          <Card><CardTitle>Checklist báo cáo thứ 2</CardTitle><div className="mt-3"><ReportTable headers={['#', 'Nguồn', 'Trạng thái', 'Bằng chứng', 'Hành động']} rows={checklistRows} maxHeight="max-h-[280px]" /></div></Card>
          <Card>
            <CardTitle>Chốt và gửi báo cáo</CardTitle>
            <div className="mt-3 flex flex-wrap gap-2"><Button disabled={!canClose}>Chốt tuần</Button><Button variant="secondary" disabled={!canClose}>Gửi CEO</Button><Button variant="secondary" disabled={!canClose}>Gửi Bot</Button></div>
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-[13px] font-semibold text-lang-muted">{canClose ? 'Có thể chốt sau khi kiểm tra cuối.' : `Chưa thể chốt: thiếu ${report.missingSources.join(', ')}.`}</div>
          </Card>
        </div>
      </section>
      <Card><CardTitle>Lịch sử thao tác kế toán</CardTitle><div className="mt-3"><ReportTable headers={['Thời gian', 'Người xử lý', 'Hành động', 'Ghi chú']} rows={historyRows.length ? historyRows : [['—', '—', 'Chưa đủ dữ liệu', 'Chưa có lịch sử import thật']]} maxHeight="max-h-[240px]" /></div></Card>
    </div>
  );
}
