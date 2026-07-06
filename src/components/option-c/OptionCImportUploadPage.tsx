import { FileInput, ShieldCheck } from 'lucide-react';
import { BatchUploadMock } from '@/components/forms/BatchUploadMock';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

async function importHistoryRows() {
  const rows = await getDataStore().read(SHEET_NAMES.IMPORT_LICH_SU).catch(() => [] as Record<string, unknown>[]);
  return rows.slice(-8).reverse().map((row) => [
    String(row['Mã lần import'] ?? row['Batch ID'] ?? row['ma_lan_import'] ?? ''),
    String(row['Ngày import'] ?? ''),
    String(row['Người import'] ?? ''),
    String(row['Loại dữ liệu'] ?? row['Loại file'] ?? ''),
    String(row['Trạng thái'] ?? ''),
    String(row['Tổng dòng mới'] ?? ''),
    String(row['Tổng dòng lỗi'] ?? ''),
    String(row['Trạng thái rollback'] ?? row['Rollback'] ?? 'Chưa rollback')
  ]);
}

export async function OptionCImportUploadPage() {
  const historyRows = await importHistoryRows();
  const ruleRows = [
    ['1', 'Chọn file Excel', 'Có thể chọn nhiều file cùng lúc'],
    ['2', 'Kiểm tra trước', 'Preview lỗi, trùng, lệch và loại dữ liệu'],
    ['3', 'Import vào Google Sheet', 'Chỉ mở khi tất cả file đạt điều kiện'],
    ['4', 'File lỗi', 'Tải file lỗi để sửa rồi upload lại']
  ];

  return (
    <div className="space-y-2.5">
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Trạng thái import" value="Preview trước" status="good" compact />
        <MetricCard label="Ghi dữ liệu" value="Google Sheet" status="good" compact />
        <MetricCard label="File lỗi / lệch" value="Bị chặn" status="warning" compact />
        <MetricCard label="Lịch sử import" value={`${historyRows.length}`} status={historyRows.length ? 'good' : 'neutral'} compact />
      </section>

      <div className="rounded-lg border border-lang-line bg-white px-3 py-2 shadow-soft">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-2">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lang-redSoft text-lang-red">
              <FileInput className="h-4 w-4" />
            </span>
            <div>
              <CardTitle>Import dữ liệu vào Google Sheet</CardTitle>
              <p className="mt-0.5 text-[12px] font-semibold text-lang-muted">Chọn file, kiểm tra preview, rồi bấm Import khi hệ thống báo đạt điều kiện.</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[12px] font-bold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Không ghi dữ liệu trước khi preview đạt
          </div>
        </div>
      </div>

      <BatchUploadMock />

      <section className="grid gap-2 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardTitle>Quy trình import</CardTitle>
          <div className="mt-2"><ReportTable headers={['Bước', 'Việc cần làm', 'Ghi chú']} rows={ruleRows} maxHeight="max-h-[180px]" /></div>
        </Card>
        <Card>
          <CardTitle>Lịch sử import / rollback</CardTitle>
          <div className="mt-2"><ReportTable headers={['Import ID', 'Ngày import', 'Người import', 'Loại dữ liệu', 'Trạng thái', 'Dòng mới', 'Dòng lỗi', 'Rollback']} rows={historyRows.length ? historyRows : [['—', '—', '—', '—', 'Chưa đủ dữ liệu', '0', '0', 'Chưa rollback']]} maxHeight="max-h-[180px]" /></div>
        </Card>
      </section>
    </div>
  );
}
