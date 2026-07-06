import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import { ReportClosePanel } from './ReportClosePanel';
import { ReportCopyActions } from './ReportCopyActions';
import type { OptionCPage } from '@/lib/option-c/catalog';
import { getSubtabDashboardSpec } from '@/lib/option-c/subtab-dashboard-spec';
import { buildManagementReportTables } from '@/lib/reports/management-report-engine';
import { parseReportFilters } from '@/lib/reports/report-filters';

const templates = {
  day: [
    ['Doanh thu', 'Tổng doanh thu, tiền mặt, chuyển khoản, app giao hàng, số đơn'],
    ['Tiền / sổ quỹ', 'Tiền thực nhận, chênh lệch tiền mặt, tổng thu/chi, chứng từ thiếu'],
    ['Kho cửa hàng', 'Tồn âm, hàng hủy/hư, lệch tồn, BTT xuất chưa xác nhận'],
    ['Data Quality / nhiệm vụ', 'Nguồn thiếu, file lỗi, task đỏ, cảnh báo đỏ'],
    ['Kết luận', 'Đủ/chưa đủ dữ liệu, vấn đề cần báo CEO, việc cần xử lý ngày mai']
  ],
  week: [
    ['Tổng quan tuần', 'Doanh thu, tiền thực nhận, tổng chi, dòng tiền tạm, lợi nhuận tạm'],
    ['P&L tuần', 'Food cost, labor cost, chi phí vận hành, biên lợi nhuận tạm'],
    ['Kho & thất thoát', 'Hàng hủy, vượt định mức, thất thoát tồn kho, top NVL lệch'],
    ['Công nợ / dự toán', 'Công nợ đến hạn, dự toán tuần tới, số dư dự kiến'],
    ['Top 3 CEO', 'Vấn đề, nguyên nhân, hành động, người phụ trách, deadline']
  ],
  month: [
    ['Kết quả kinh doanh', 'Doanh thu, giá vốn, food cost, labor cost, lợi nhuận tạm'],
    ['Dòng tiền', 'Tiền đầu tháng, tiền vào, tiền ra, tiền cuối tháng, công nợ'],
    ['Kho & thất thoát', 'Hàng hủy, vượt định mức, thất thoát, top NVL/món'],
    ['Nhân sự / lương', 'Tổng lương, thưởng, phạt, tạm ứng, tỷ lệ lương/doanh thu'],
    ['Đánh giá tháng', 'Tình hình tốt/xấu, vì sao, việc tháng tới, người phụ trách']
  ]
};

type SearchParams = Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
type ReportPeriod = 'day' | 'week' | 'month';

const periodLabels: Record<ReportPeriod, string> = {
  day: 'Báo cáo ngày',
  week: 'Báo cáo tuần',
  month: 'Báo cáo tháng'
};

function paramValue(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function ReportManagementPage({ page, searchParams }: { page: OptionCPage; searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : {};
  const requestedPeriod = paramValue(params, 'period');
  const requestedMode = paramValue(params, 'mode');
  const closeType = (['day', 'week', 'month'].includes(String(requestedPeriod)) ? requestedPeriod : page.closeType ?? 'week') as ReportPeriod;
  const activeMode = requestedMode === 'exception' || requestedMode === 'history' ? requestedMode : closeType;
  const spec = getSubtabDashboardSpec(page);
  const filters = parseReportFilters(params);
  const managementTables = await buildManagementReportTables(closeType, filters);
  const activeTitle = activeMode === 'exception' ? 'Chốt có ngoại lệ' : activeMode === 'history' ? 'Lịch sử chốt' : periodLabels[closeType];
  const switchTabs = [
    { key: 'day', label: 'Báo cáo ngày', href: '/bao-cao-quan-tri?period=day' },
    { key: 'week', label: 'Báo cáo tuần', href: '/bao-cao-quan-tri?period=week' },
    { key: 'month', label: 'Báo cáo tháng', href: '/bao-cao-quan-tri?period=month' },
    { key: 'exception', label: 'Chốt có ngoại lệ', href: '/bao-cao-quan-tri?period=week&mode=exception' },
    { key: 'history', label: 'Lịch sử chốt', href: '/bao-cao-quan-tri?mode=history' }
  ];

  return (
    <div className="space-y-2.5">
      <section className="rounded-lg border border-lang-line bg-white p-1 shadow-soft">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Bộ lọc báo cáo quản trị">
        {switchTabs.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            aria-current={activeMode === item.key ? 'page' : undefined}
            className={`inline-flex h-9 items-center rounded-md px-3 text-[12px] font-black transition-colors ${activeMode === item.key ? 'bg-lang-red text-white shadow-soft' : 'text-lang-muted hover:bg-lang-mist hover:text-lang-ink'}`}
          >
            {item.label}
          </Link>
        ))}
        </div>
      </section>

      {activeMode === 'history' ? (
        <Card>
          <CardTitle>Lịch sử chốt báo cáo</CardTitle>
          <div className="mt-2">
            <ReportTable
              headers={['Thời gian', 'Kỳ báo cáo', 'Trạng thái', 'Người chốt', 'Ghi chú']}
              rows={[['—', 'Chưa có lịch sử chốt trong màn hình gộp', 'Chưa đủ dữ liệu', '—', 'Dữ liệu lịch sử thật vẫn xem ở log chốt/audit khi có nguồn']]}
              maxHeight="max-h-[220px]"
            />
          </div>
        </Card>
      ) : (
        <ReportClosePanel reportType={closeType} title={activeTitle} />
      )}
      {activeMode !== 'history' ? <ReportCopyActions alerts={spec.alertRows} tasks={spec.taskRows} templates={templates[closeType]} title={activeTitle} /> : null}

      {activeMode !== 'history' ? (
        <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card>
            <CardTitle>Trạng thái báo cáo cần chốt</CardTitle>
            <div className="mt-2">
              <ReportTable
                headers={['Báo cáo', 'Kỳ', 'Trạng thái', 'Nguồn cần có', 'Người phụ trách', 'Hành động đề xuất']}
                rows={managementTables.statusRows}
                maxHeight="max-h-[220px]"
              />
            </div>
          </Card>
          <Card>
            <CardTitle>So sánh kỳ trước</CardTitle>
            <div className="mt-2">
              <ReportTable
                headers={['Nhóm', 'Chỉ số', 'Đơn vị', 'Kỳ này', 'Kỳ trước', 'Chênh lệch', '% thay đổi', 'Trạng thái']}
                rows={managementTables.comparisonRows}
                maxHeight="max-h-[220px]"
              />
            </div>
          </Card>
        </section>
      ) : null}

      {activeMode !== 'history' ? (
        <section className="grid gap-2 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Card>
            <CardTitle>Điều kiện chốt theo dữ liệu thật</CardTitle>
            <div className="mt-2">
              <ReportTable headers={['Điều kiện', 'Giá trị', 'Trạng thái', 'Ghi chú']} rows={managementTables.closeConditionRows} maxHeight="max-h-[220px]" />
            </div>
          </Card>
          <Card>
            <CardTitle>Hành động cần xử lý</CardTitle>
            <div className="mt-2">
              <ReportTable headers={['Ưu tiên', 'Việc cần làm', 'Phụ trách', 'Hạn xử lý', 'Hành động đề xuất']} rows={managementTables.actionRows} maxHeight="max-h-[220px]" />
            </div>
          </Card>
        </section>
      ) : null}

      <section className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px_340px]">
        <Card>
          <CardTitle>Mẫu nội dung báo cáo</CardTitle>
          <div className="mt-2"><ReportTable headers={['Phần', 'Nội dung cần có']} rows={templates[closeType]} maxHeight="max-h-[320px]" /></div>
        </Card>
        <Card>
          <CardTitle>Quy tắc chốt có ngoại lệ</CardTitle>
          <div className="mt-2 space-y-2 text-[12px] font-semibold text-lang-muted">
            <p className="rounded-lg bg-lang-mist/70 p-2 text-lang-ink/80">Cho phép chốt khi thiếu dữ liệu, nhưng phải ghi nguyên nhân, người chịu trách nhiệm, ảnh hưởng dự kiến và hạn bổ sung.</p>
            <p className="rounded-lg bg-lang-mist/70 p-2 text-lang-ink/80">Báo cáo chốt có ngoại lệ không được hiển thị như báo cáo đủ dữ liệu.</p>
            <p className="rounded-lg bg-lang-mist/70 p-2 text-lang-ink/80">Mỗi lần chốt được ghi vào lịch sử chốt báo cáo và audit log.</p>
          </div>
        </Card>
        <Card>
          <CardTitle>Cảnh báo & nhiệm vụ báo cáo</CardTitle>
          <div className="mt-2 space-y-2">
            <ReportTable headers={['Mức', 'Nội dung', 'Phụ trách', 'Hành động']} rows={spec.alertRows} maxHeight="max-h-[150px]" />
            <ReportTable headers={['Nguồn', 'Việc cần làm', 'Phụ trách', 'Hạn xử lý', 'Mức độ']} rows={spec.taskRows} maxHeight="max-h-[150px]" />
          </div>
        </Card>
      </section>
    </div>
  );
}
