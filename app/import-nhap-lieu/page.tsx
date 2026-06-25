import { NoPermission } from '@/components/rbac/NoPermission';
import { PageHeader } from '@/components/layout/PageHeader';
import { BatchUploadMock } from '@/components/forms/BatchUploadMock';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import { getDataStore } from '@/lib/data-store';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import { canRole, getRoleFromServerCookies } from '@/lib/rbac/rbac';

export const dynamic = 'force-dynamic';

async function readImportHistory() {
  try { return await getDataStore().read(SHEET_NAMES.IMPORT_LICH_SU); } catch { return []; }
}

export default async function ImportNhapLieuPage() {
  const rbac = await getRoleFromServerCookies();
  if (!canRole(rbac.role, 'view_import')) return <NoPermission role={rbac.role} permission="view_import" />;
  const history = await readImportHistory();
  const historyRows = history.slice(-12).reverse().map((row) => [
    String(row['Ngày import'] ?? ''),
    String(row['Người import'] ?? ''),
    String(row['Trạng thái'] ?? ''),
    String(row['Tổng dòng mới'] ?? ''),
    String(row['Tổng dòng lỗi'] ?? ''),
    String(row['Ghi chú'] ?? '')
  ]);
  const ruleRows = [
    ['Preview trước', 'Upload chỉ đọc, chưa ghi Google Sheet', 'Đạt'],
    ['Chặn lỗi', 'Có lỗi/lệch thì không import', 'Cảnh báo'],
    ['Ghi log', 'Ghi IMPORT_LICH_SU và AUDIT_LOG', 'Đạt'],
    ['Rollback mềm', 'Hoàn tác theo mã lần import, không xóa cứng', 'Cần kiểm']
  ];
  return (
    <div className="space-y-3">
      <PageHeader title="Nhập liệu & Import" description="Upload nhiều file, preview lỗi/trùng/lệch, rồi mới xác nhận ghi dữ liệu." status="Cần đối chiếu" />
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Lịch sử import" value={`${history.length}`} status={history.length ? 'good' : 'neutral'} trend="IMPORT_LICH_SU" compact />
        <MetricCard label="Quy tắc ghi" value="Confirm" status="good" trend="Preview không ghi" compact />
        <MetricCard label="Dòng lỗi" value="Chặn" status="warning" trend="Lỗi/lệch không import" compact />
        <MetricCard label="Nguồn dữ liệu" value="Google Sheet" status="good" trend="Data store thật" compact />
      </section>
      <Card>
        <CardTitle>Batch upload nhiều file</CardTitle>
        <div className="mt-2"><BatchUploadMock /></div>
      </Card>
      <section className="grid gap-3 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardTitle>Quy tắc import</CardTitle>
          <div className="mt-2"><ReportTable headers={['Quy tắc', 'Ý nghĩa', 'Trạng thái']} rows={ruleRows} maxHeight="max-h-[260px]" /></div>
        </Card>
        <Card>
          <CardTitle>Lịch sử import gần nhất</CardTitle>
          <div className="mt-2"><ReportTable headers={['Ngày import', 'Người import', 'Trạng thái', 'Dòng mới', 'Dòng lỗi', 'Ghi chú']} rows={historyRows.length ? historyRows : [['—', '—', 'Chưa đủ dữ liệu', '0', '0', 'Chưa có lần import thật']]} maxHeight="max-h-[320px]" /></div>
        </Card>
      </section>
    </div>
  );
}
