import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { Card, CardTitle } from '@/components/ui/Card';
import type { DashboardReport } from '@/lib/reports/report-aggregator';

function statusRows(report: DashboardReport) {
  const canClose = report.hasRealData && report.missingSources.length === 0;
  return [
    ['1', 'Trạng thái báo cáo tuần', canClose ? 'Có thể chốt' : 'Chưa thể chốt', report.missingSources.length ? `Thiếu ${report.missingSources.length} nguồn` : 'Đủ nguồn chính', canClose ? 'Kiểm tra cuối rồi gửi CEO/Bot' : 'Bổ sung dữ liệu trước'],
    ['2', 'Cửa hàng', report.sourceCounts.storeRevenue || report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Bán hàng, tồn kho, hủy hàng', 'Kiểm nhập - xuất - tồn - bán - hủy'],
    ['3', 'Bếp Trung Tâm', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Tồn kho/xuất cho cửa hàng cần tách riêng', 'Kiểm BTT xuất ↔ cửa hàng nhận'],
    ['4', 'Sổ quỹ & công nợ', report.sourceCounts.cashbook ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', `${report.sourceCounts.cashbook} dòng sổ quỹ`, 'Phân loại chi BTT, chi cửa hàng, trả NCC'],
    ['5', 'Thất thoát & hủy hàng', report.sourceCounts.lossRows ? 'Cảnh báo' : 'Chưa đủ dữ liệu', `${report.sourceCounts.lossRows} dòng NVL`, 'Xử lý tồn âm, lệch tồn, hủy/hư hỏng']
  ];
}

function storeRows(report: DashboardReport) {
  return [
    ['Nhập kho cửa hàng', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', `${report.sourceCounts.inventory} dòng tồn kho`, 'Tách nhập từ BTT và nhập NCC trực tiếp'],
    ['Xuất kho cửa hàng', 'Cần đối chiếu', 'Chưa có bảng xuất riêng', 'Bổ sung nguồn xuất/hủy/điều chỉnh'],
    ['Bán hàng', report.sourceCounts.storeRevenue || report.sourceCounts.appRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.storeRevenue + report.sourceCounts.appRevenue} dòng doanh thu`, 'Dùng để tính tiêu hao định mức'],
    ['Hủy/hư hỏng', report.sourceCounts.lossRows ? 'Cảnh báo' : 'Chưa đủ dữ liệu', `${report.sourceCounts.lossRows} dòng thất thoát`, 'Không nhầm với xuất BTT cho cửa hàng'],
    ['Kiểm kê tồn', report.totals.negativeStockCount ? 'Cảnh báo' : 'Cần đối chiếu', `${report.totals.negativeStockCount} tồn âm`, 'So sánh tồn lý thuyết và tồn thực tế']
  ];
}

function centralKitchenRows(report: DashboardReport) {
  return [
    ['Nhập kho BTT', 'Chưa đủ dữ liệu', 'Cần nguồn nhập BTT riêng', 'Không gộp với cửa hàng'],
    ['Xuất BTT cho cửa hàng', 'Cần đối chiếu', 'File Xuất hủy nếu bản chất là chuyển kho', 'Map vào BTT xuất cho cửa hàng'],
    ['Sản xuất/sơ chế', 'Chưa đủ dữ liệu', 'Cần lệnh sản xuất nếu triển khai sâu', 'Tính hao hụt sản xuất'],
    ['Hủy/hư hỏng BTT', 'Chưa đủ dữ liệu', 'Cần nguồn hủy BTT riêng', 'Không trộn với hủy cửa hàng'],
    ['Kiểm kê BTT', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', `${report.sourceCounts.inventory} dòng tồn tổng`, 'Tách tồn BTT và tồn cửa hàng']
  ];
}

function reconciliationRows(report: DashboardReport) {
  return [
    ['BTT xuất ↔ Cửa hàng nhận', 'Cần đối chiếu', 'Mã phiếu, mã hàng, số lượng, ngày', 'Chặn chốt nếu lệch lớn'],
    ['Bán hàng ↔ Định mức', report.sourceCounts.storeRevenue || report.sourceCounts.appRevenue ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Món bán, số lượng, định mức NVL', 'Thiếu định mức thì không tính thất thoát chuẩn'],
    ['Tồn lý thuyết ↔ Tồn thực tế', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Tồn đầu, nhập, xuất, bán, hủy, tồn cuối', 'Tồn âm là lỗi nghiêm trọng'],
    ['Sổ quỹ ↔ Công nợ', report.sourceCounts.cashbook ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Trả NCC, công nợ, thu mua', 'Không tự đưa trả NCC vào P&L'],
    ['Chi BTT ↔ Chi cửa hàng', report.cashbookWarningRows.length ? 'Cảnh báo' : 'Cần đối chiếu', `${report.cashbookWarningRows.length} khoản chi lớn`, 'Không trộn chi BTT vào chi cửa hàng']
  ];
}

export function AccountingOverviewPage({ report }: { report: DashboardReport }) {
  const canClose = report.hasRealData && report.missingSources.length === 0;
  return (
    <div className="space-y-3">
      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <MetricCard label="Trạng thái báo cáo" value={canClose ? 'Có thể chốt' : 'Chưa thể chốt'} status={canClose ? 'good' : 'warning'} trend={report.missingSources.length ? `Thiếu ${report.missingSources.length} nguồn` : 'Đủ nguồn chính'} compact />
        <MetricCard label="Doanh thu" value={`${report.sourceCounts.storeRevenue + report.sourceCounts.appRevenue}`} status={report.sourceCounts.storeRevenue || report.sourceCounts.appRevenue ? 'good' : 'neutral'} trend="Dòng bán hàng" compact />
        <MetricCard label="Sổ quỹ" value={`${report.sourceCounts.cashbook}`} status={report.sourceCounts.cashbook ? 'good' : 'neutral'} trend="Dòng thu/chi" compact />
        <MetricCard label="Tồn kho" value={`${report.sourceCounts.inventory}`} status={report.totals.negativeStockCount ? 'warning' : report.sourceCounts.inventory ? 'good' : 'neutral'} trend={`${report.totals.negativeStockCount} tồn âm`} compact />
        <MetricCard label="Thất thoát" value={`${report.sourceCounts.lossRows}`} status={report.sourceCounts.lossRows ? 'warning' : 'neutral'} trend="NVL lệch/hủy" compact />
        <MetricCard label="Chi lớn" value={`${report.cashbookWarningRows.length}`} status={report.cashbookWarningRows.length ? 'warning' : 'good'} trend="Cần giải trình" compact />
        <MetricCard label="Nguồn thiếu" value={`${report.missingSources.length}`} status={report.missingSources.length ? 'warning' : 'good'} trend={report.missingSources.length ? report.missingSources.join(', ') : 'Không thiếu'} compact />
        <MetricCard label="Data mode" value={report.dataMode} status={report.hasRealData ? 'good' : 'neutral'} trend="Không dùng số mẫu" compact />
      </section>

      <section className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-l-8 border-amber-500">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Tổng quan kế toán ERP · {report.dataMode}</p>
          <h3 className="mt-1 text-xl font-extrabold text-lang-brown">{canClose ? 'Dữ liệu chính đã đủ để kiểm tra chốt' : 'Chưa đủ điều kiện chốt báo cáo'}</h3>
          <p className="mt-1.5 text-xs leading-5 text-black/60">Tách riêng cửa hàng và Bếp Trung Tâm theo logic nhập - xuất - tồn - bán - hủy - đối chiếu.</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div className="rounded-xl bg-lang-cream px-2 py-2 text-lang-brown">Cửa hàng<br />Cần kiểm</div>
            <div className="rounded-xl bg-lang-cream px-2 py-2 text-lang-brown">BTT<br />Cần tách</div>
            <div className="rounded-xl bg-lang-cream px-2 py-2 text-lang-brown">Đối chiếu<br />{report.missingSources.length}</div>
          </div>
        </Card>
        <Card><CardTitle>Việc cần xử lý trước khi chốt</CardTitle><div className="mt-2"><ReportTable headers={['Ưu tiên', 'Mảng', 'Trạng thái', 'Bằng chứng', 'Hành động']} rows={statusRows(report)} maxHeight="max-h-[300px]" /></div></Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card><CardTitle>Cửa hàng · Nhập - xuất - tồn - bán - hủy</CardTitle><div className="mt-2"><ReportTable headers={['Nghiệp vụ', 'Trạng thái', 'Bằng chứng', 'Việc cần làm']} rows={storeRows(report)} maxHeight="max-h-[320px]" /></div></Card>
        <Card><CardTitle>Bếp Trung Tâm · Nhập - xuất - tồn - sản xuất - hủy</CardTitle><div className="mt-2"><ReportTable headers={['Nghiệp vụ', 'Trạng thái', 'Bằng chứng', 'Việc cần làm']} rows={centralKitchenRows(report)} maxHeight="max-h-[320px]" /></div></Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <Card><CardTitle>Đối chiếu ERP bắt buộc</CardTitle><div className="mt-2"><ReportTable headers={['Đối chiếu', 'Trạng thái', 'Kiểm tra', 'Quy tắc']} rows={reconciliationRows(report)} maxHeight="max-h-[340px]" /></div></Card>
        <Card><CardTitle>Nguồn dữ liệu hiện có</CardTitle><div className="mt-2"><ReportTable headers={['Mảng', 'Trạng thái', 'Bằng chứng', 'Cách dùng']} rows={report.dataReadinessRows} maxHeight="max-h-[340px]" /></div></Card>
      </section>
    </div>
  );
}
