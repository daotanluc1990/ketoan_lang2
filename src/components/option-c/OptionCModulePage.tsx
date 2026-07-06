import { getDataStore } from '@/lib/data-store';
import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import { StatusBadge } from '@/components/report/StatusBadge';
import { RelatedActionsPanel } from './RelatedActionsPanel';
import { KPI_DICTIONARY_ALL, type OptionCPage } from '@/lib/option-c/catalog';
import { buildModuleDashboardTable } from '@/lib/option-c/module-dashboard-tables';
import { getSubtabDashboardSpec } from '@/lib/option-c/subtab-dashboard-spec';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

type ModuleSources = {
  readinessRows: string[][];
  rowsBySheet: Record<string, Record<string, unknown>[]>;
};

async function loadModuleSources(sourceSheets: string[]): Promise<ModuleSources> {
  const store = getDataStore();
  const entries = await Promise.all(sourceSheets.map(async (sheet) => {
    const data = await store.read(sheet).catch(() => [] as Record<string, unknown>[]);
    return [sheet, data] as const;
  }));
  const rowsBySheet = Object.fromEntries(entries);
  const readinessRows = entries.map(([sheet, data]) => [
    sheet,
    data.length ? 'Có dữ liệu' : 'Chưa đủ dữ liệu',
    data.length ? `${data.length} dòng` : 'Chưa có tab/dòng dữ liệu hoặc chưa cấu hình Google Sheet'
  ]);
  return { readinessRows, rowsBySheet };
}

function pick(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function formatDashboardValue(value: unknown, unit: string) {
  const numeric = Number(String(value ?? '').replace(/,/g, '').replace(/%/g, '').replace(/đ/g, '').trim());
  if (Number.isFinite(numeric) && String(value ?? '').trim() !== '') {
    if (unit.toLowerCase().includes('vnd')) return new Intl.NumberFormat('vi-VN').format(Math.round(numeric));
    if (unit.includes('%')) return `${numeric}%`;
    return String(numeric);
  }
  return String(value ?? '').trim() || '—';
}

async function dashboardMetricMap() {
  const rows = await getDataStore().read(SHEET_NAMES.DASHBOARD_REPORT).catch(() => [] as Record<string, unknown>[]);
  const map = new Map<string, { value: unknown; status: string }>();
  for (const row of rows) {
    const item = {
      value: pick(row, ['gia_tri', 'Giá trị', 'value', 'so_lieu', 'Số liệu']),
      status: String(pick(row, ['muc_canh_bao', 'trang_thai', 'Trạng thái', 'Mức cảnh báo', 'status']) || 'Chưa đủ dữ liệu')
    };
    const code = String(pick(row, ['metric_key', 'metric_code', 'ma_chi_so', 'Mã KPI', 'Mã chỉ số', 'code'])).trim();
    const name = String(pick(row, ['metric_name', 'ten_chi_so', 'Tên KPI', 'Tên chỉ số', 'name'])).trim();
    if (code) map.set(code, item);
    if (name) map.set(name, item);
  }
  return map;
}

export async function OptionCModulePage({ page }: { page: OptionCPage }) {
  const Icon = page.icon;
  const spec = getSubtabDashboardSpec(page);
  const [{ readinessRows, rowsBySheet }, liveMetrics] = await Promise.all([
    loadModuleSources(page.sourceSheets),
    dashboardMetricMap()
  ]);
  const mainTable = buildModuleDashboardTable(page, rowsBySheet);
  const kpiByCode = new Map(KPI_DICTIONARY_ALL.map((kpi) => [kpi.code, kpi]));
  const kpis = (spec.kpiCodes.length
    ? spec.kpiCodes.map((code) => kpiByCode.get(code)).filter((kpi): kpi is (typeof KPI_DICTIONARY_ALL)[number] => Boolean(kpi))
    : KPI_DICTIONARY_ALL.filter((kpi) => page.kpiGroups.includes(kpi.group))
  ).slice(0, 12);
  const missingSourceRows = readinessRows
    .filter((row) => row[1] !== 'Có dữ liệu')
    .map((row) => ['Đỏ', `Thiếu nguồn ${row[0]}`, 'Kế toán', 'Upload dữ liệu hoặc chốt có ngoại lệ']);
  const alertRows = [...missingSourceRows, ...spec.alertRows];
  const actionRows = [
    ...alertRows.map((row) => [row[0], row[1], row[2], 'Hôm nay', row[3]]),
    ...(page.sourceSheets.includes('10_DATA_XUAT_BTT_CUA_HANG') ? [['Cần đối chiếu', 'Xuất Hủy = BTT xuất cho cửa hàng, không ghi vào hàng hủy/hư', 'Kế toán kho', 'Hôm nay', 'Đối chiếu phiếu xuất và cửa hàng xác nhận']] : []),
    ...spec.taskRows.map((row) => [row[4], row[1], row[2], row[3], row[0]])
  ];

  return (
    <div className="space-y-2.5">
      <section>
        <Card>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-lang-redSoft text-lang-red"><Icon className="h-5 w-5" /></span>
            <div className="min-w-0">
              <p className="text-[12px] font-bold uppercase text-lang-redDark">{page.group}</p>
              <h3 className="text-xl font-extrabold text-lang-ink">{page.title}</h3>
              <p className="mt-1 text-[12px] font-semibold text-lang-muted">{page.description}</p>
            </div>
            </div>
            <RelatedActionsPanel docs={page.relatedDocs} />
          </div>
          <div className="mt-3 rounded-lg border border-lang-line bg-lang-cream px-3 py-2 text-[12px] font-bold text-lang-brown">
            {spec.focus}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {(kpis.length ? kpis : [{ code: 'DOC', name: 'Tài liệu liên quan', unit: 'mục', group: 'Tài liệu', source: 'Module tài liệu', formula: 'Theo danh mục nội bộ' }]).map((kpi) => {
              const live = liveMetrics.get(kpi.code) ?? liveMetrics.get(kpi.name);
              return (
              <div key={kpi.code} className="rounded-lg border border-lang-line bg-white p-3">
                <p className="text-[12px] font-bold text-lang-muted">{kpi.name}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-lg font-black text-lang-ink">{live ? formatDashboardValue(live.value, kpi.unit) : '—'}</p>
                  <StatusBadge status={live?.status ?? 'Chưa đủ dữ liệu'} />
                </div>
                <p className="mt-1 line-clamp-2 text-[11px] font-semibold text-lang-muted">{kpi.unit} · {kpi.source}</p>
              </div>
            );})}
          </div>
        </Card>
      </section>

      <Card className="p-0">
        <div className="flex flex-col gap-1 border-b border-lang-line px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{mainTable.title}</CardTitle>
            <p className="mt-0.5 text-[11px] font-semibold text-lang-muted">{page.sourceSheets.join(' + ')}</p>
          </div>
          <StatusBadge status={readinessRows.every((row) => row[1] === 'Có dữ liệu') ? 'Tốt' : 'Chưa đủ dữ liệu'} />
        </div>
        <div className="p-2"><ReportTable headers={mainTable.headers} rows={mainTable.rows} maxHeight="max-h-[420px]" /></div>
      </Card>

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Việc cần xử lý trong module</CardTitle>
            <StatusBadge status={missingSourceRows.length ? 'Đỏ' : actionRows.some((row) => row[0] === 'Cam' || row[0] === 'Cần đối chiếu') ? 'Cần đối chiếu' : 'Tốt'} />
          </div>
          <div className="mt-2"><ReportTable headers={['Mức', 'Vấn đề / việc cần làm', 'Phụ trách', 'Hạn xử lý', 'Hành động / nguồn']} rows={actionRows} maxHeight="max-h-[300px]" /></div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardTitle>Nguồn dữ liệu</CardTitle>
            <StatusBadge status={readinessRows.every((row) => row[1] === 'Có dữ liệu') ? 'Tốt' : 'Chưa đủ dữ liệu'} />
          </div>
          <div className="mt-2"><ReportTable headers={['Sheet', 'Trạng thái', 'Chi tiết']} rows={readinessRows} maxHeight="max-h-[300px]" /></div>
        </Card>
      </section>
    </div>
  );
}
