import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDataStore } from '@/lib/data-store';

type SheetSpec = {
  name: string;
  label: string;
};

type V7ModulePageProps = {
  title: string;
  description: string;
  statusWhenData?: 'Tốt' | 'Cần đối chiếu' | 'Cảnh báo';
  sheets: SheetSpec[];
  primaryHeaders?: string[];
  emptyTitle?: string;
  emptyDescription?: string;
  notes?: string[][];
};

function cell(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && String(value ?? '').trim()) return String(value ?? '');
  }
  return '—';
}

function previewRows(rows: Record<string, unknown>[], headers: string[]) {
  return rows.slice(0, 12).map((row) => headers.map((header) => cell(row, [header])));
}

export async function V7ModulePage({
  title,
  description,
  statusWhenData = 'Cần đối chiếu',
  sheets,
  primaryHeaders = ['Ngày', 'Chi nhánh', 'Kho', 'Mã hàng', 'Tên hàng', 'Số lượng', 'Giá trị', 'Trạng thái'],
  emptyTitle = 'Chưa đủ dữ liệu để kết luận',
  emptyDescription = 'Data Master V7 đã có cấu trúc sheet, nhưng kỳ này chưa có dòng dữ liệu hợp lệ cho màn hình này.',
  notes = []
}: V7ModulePageProps) {
  const store = getDataStore();
  const loaded = await Promise.all(sheets.map(async (sheet) => ({ sheet, rows: await store.read(sheet.name) })));
  const totalRows = loaded.reduce((total, item) => total + item.rows.length, 0);
  const status = totalRows > 0 ? statusWhenData : 'Chưa đủ dữ liệu';
  const primary = loaded.find((item) => item.rows.length > 0) ?? loaded[0];

  const readinessRows = loaded.map((item) => [
    item.sheet.label,
    item.sheet.name,
    String(item.rows.length),
    item.rows.length > 0 ? 'Có dữ liệu' : 'Chưa đủ dữ liệu'
  ]);

  return (
    <div className="space-y-3">
      <PageHeader title={title} description={description} status={status} />

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Tổng dòng dữ liệu" value={`${totalRows}`} status={totalRows > 0 ? 'good' : 'neutral'} trend="Đọc từ Data Master V7" compact />
        <MetricCard label="Nguồn sheet" value={`${sheets.length}`} status="good" trend="Đã khai báo trong code" compact />
        <MetricCard label="Sheet chính" value={primary?.sheet.label ?? '—'} status={primary?.rows.length ? 'good' : 'neutral'} trend={primary?.sheet.name ?? '—'} compact />
        <MetricCard label="Trạng thái" value={status} status={totalRows > 0 ? 'warning' : 'neutral'} trend="Không dùng số mẫu" compact />
      </section>

      {totalRows === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null}

      <section className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardTitle>{primary?.sheet.label ?? 'Dữ liệu chính'}</CardTitle>
          <div className="mt-2">
            <ReportTable
              headers={primaryHeaders}
              rows={primary?.rows.length ? previewRows(primary.rows, primaryHeaders) : [['—', '—', '—', '—', '—', '—', '—', 'Chưa đủ dữ liệu']]}
              maxHeight="max-h-[360px]"
            />
          </div>
        </Card>
        <div className="space-y-3">
          <Card>
            <CardTitle>Độ sẵn sàng dữ liệu</CardTitle>
            <div className="mt-2"><ReportTable headers={['Nguồn', 'Sheet', 'Dòng', 'Trạng thái']} rows={readinessRows} maxHeight="max-h-[260px]" /></div>
          </Card>
          <Card>
            <CardTitle>Ghi chú triển khai V7.1</CardTitle>
            <div className="mt-2"><ReportTable headers={['Việc cần kiểm', 'Ý nghĩa', 'Trạng thái']} rows={notes.length ? notes : [['Schema', 'Đã map tên sheet V7', 'Đạt'], ['Dữ liệu', 'Chưa đủ thì không kết luận', 'Cần kiểm']]} maxHeight="max-h-[220px]" /></div>
          </Card>
        </div>
      </section>
    </div>
  );
}
