import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import { ReportClosePanel } from './ReportClosePanel';
import { ReportCopyActions } from './ReportCopyActions';
import type { OptionCPage } from '@/lib/option-c/catalog';
import { getSubtabDashboardSpec } from '@/lib/option-c/subtab-dashboard-spec';

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

export function ReportManagementPage({ page }: { page: OptionCPage }) {
  const closeType = page.closeType ?? 'week';
  const spec = getSubtabDashboardSpec(page);
  return (
    <div className="space-y-2.5">
      <ReportClosePanel reportType={closeType} title={page.title} />
      <ReportCopyActions alerts={spec.alertRows} tasks={spec.taskRows} templates={templates[closeType]} title={page.title} />
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
