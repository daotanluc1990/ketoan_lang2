import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import { MetricCard } from '@/components/report/MetricCard';

const ruleRows = [
  ['Tồn âm > 0', 'Đỏ', 'Tạo task kiểm kho', 'Kho cửa hàng / Kho BTT', 'Kế toán kho'],
  ['File import lỗi', 'Cam', 'Tạo task sửa file', 'Nhập liệu & Dữ liệu', 'Kế toán'],
  ['Công nợ quá hạn > 0', 'Đỏ', 'Tạo task kiểm thanh toán', 'Tài chính', 'Kế toán tài chính'],
  ['BTT xuất nhưng cửa hàng chưa xác nhận', 'Cam', 'Tạo task đối chiếu', 'Kho BTT / Kho cửa hàng', 'Kế toán kho'],
  ['Còn task đỏ', 'Đỏ', 'Chưa được chốt báo cáo sạch', 'Báo cáo quản trị', 'Kế toán tổng hợp'],
  ['Hàng hủy thiếu chứng từ', 'Cam', 'Yêu cầu bổ sung chứng từ', 'Kho cửa hàng', 'Quản lý cửa hàng'],
  ['Tỷ lệ thất thoát tồn kho vượt ngưỡng', 'Đỏ', 'Yêu cầu giải trình', 'Kho', 'Kế toán kho'],
  ['Tỷ lệ vượt định mức vượt ngưỡng', 'Cam / Đỏ', 'Kiểm công thức, thao tác, ca phụ trách', 'Công thức / định mức', 'Kế toán kho'],
  ['Số ngày tồn kho dưới lead time', 'Đỏ', 'Đề xuất nhập hàng', 'Kho', 'Kế toán kho'],
  ['Số dư tiền dự kiến âm', 'Đỏ', 'Cảnh báo thiếu tiền', 'Tài chính / Dự toán', 'Kế toán tài chính']
];

const formulaRows = [
  ['Tồn lý thuyết', 'Tồn đầu + Nhập - Xuất bán theo định mức - Hủy hợp lệ', 'theo ĐVT', 'Kho cửa hàng / BTT'],
  ['Lệch tồn', 'Kiểm kê thực tế - Tồn lý thuyết', 'theo ĐVT', 'Kho'],
  ['Tỷ lệ thất thoát', 'Thiếu kho / Tiêu hao lý thuyết', '%', 'Kho'],
  ['Vượt định mức', 'Thực tế dùng - Được phép dùng', 'theo ĐVT', 'Công thức / định mức'],
  ['Tỷ lệ vượt định mức', 'Vượt định mức / Được phép dùng', '%', 'Công thức / định mức'],
  ['Số ngày tồn kho', 'Tồn hiện tại / Tiêu hao bình quân ngày', 'ngày', 'Kho'],
  ['Điểm đặt hàng lại', 'Tiêu hao bình quân ngày x Lead time + Tồn an toàn', 'theo ĐVT', 'Kho / mua hàng'],
  ['Đề xuất nhập', 'Tồn mục tiêu - Tồn hiện tại', 'theo ĐVT', 'Kho / mua hàng'],
  ['Số dư dự kiến', 'Số dư đầu kỳ + Thu dự kiến - Chi dự kiến - Công nợ đến hạn', 'VND', 'Tài chính'],
  ['Food cost', 'Giá vốn / Doanh thu', '%', 'Báo cáo quản trị'],
  ['Labor cost', 'Chi phí nhân sự / Doanh thu', '%', 'Lương & Nhân sự'],
  ['AOV', 'Doanh thu / Số đơn', 'VND/đơn', 'Doanh thu']
];

const sheetRows = [
  ['01_CONFIG_MASTER', 'Danh mục nền, ngưỡng, mapping', 'Hệ thống / filter'],
  ['02_DATA_DOANH_THU', 'Dữ liệu doanh thu', 'Doanh thu chi tiết'],
  ['03_DATA_TIEN_DOI_SOAT', 'Tiền mặt, chuyển khoản, app', 'Doanh thu / Tài chính'],
  ['04_DATA_KHO_CUA_HANG', 'Tồn, nhập, bán, hủy, kiểm kê cửa hàng', 'Kho cửa hàng'],
  ['05_DATA_KHO_BTT', 'Tồn, nhập, sản xuất, kiểm kê BTT', 'Kho BTT'],
  ['06_DATA_XUAT_BTT_CUA_HANG', 'Xuất BTT cho cửa hàng, không phải hàng hủy', 'Kho BTT / Kho cửa hàng'],
  ['07_DATA_HANG_HUY', 'Hàng hủy thật ở cửa hàng/BTT', 'Kho'],
  ['08_DATA_CONG_NO_NCC', 'Công nợ NCC', 'Tài chính'],
  ['09_DATA_SO_QUY_CHI_PHI', 'Sổ quỹ, chi phí', 'Tài chính'],
  ['10_DATA_NHAN_SU_LUONG', 'Chấm công, lương, thưởng/phạt', 'Lương & Nhân sự'],
  ['11_DATA_IMPORT_LOG', 'Lịch sử upload, preview lỗi', 'Nhập liệu'],
  ['12_CALC_ENGINE', 'Công thức, tính toán trung gian', 'Không đọc trực tiếp trên dashboard'],
  ['13_WARNING_TASK_ENGINE', 'Cảnh báo và task tự sinh', 'Tổng quan / Nhiệm vụ'],
  ['14_DASHBOARD_REPORT', 'KPI đã tính sẵn để app đọc nhanh', 'Tổng quan kế toán'],
  ['15_SYSTEM_LOG', 'Log thao tác, sửa, duyệt', 'Hệ thống']
];

export function RuleFormulaSheetMapPage() {
  return (
    <div className="space-y-2.5">
      <Card>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-[12px] font-bold uppercase text-lang-redDark">Hệ thống</p>
            <h2 className="mt-1 text-xl font-black text-lang-ink">Rule / Formula / Google Sheet Map</h2>
            <p className="mt-1 text-[13px] font-semibold leading-6 text-lang-muted">
              Khối tham chiếu theo HTML V3: rule cảnh báo tạo task, công thức tính lõi và bản đồ 15 sheet để biết app đọc dữ liệu ở đâu.
            </p>
          </div>
          <div className="grid min-w-[360px] gap-2 sm:grid-cols-3">
            <MetricCard compact label="Rule cảnh báo" value="10" hint="rule lõi" status="warning" />
            <MetricCard compact label="Formula map" value="12" hint="công thức" status="good" />
            <MetricCard compact label="Sheet map" value="15" hint="sheet lõi" status="good" />
          </div>
        </div>
      </Card>

      <section className="grid gap-2 xl:grid-cols-2">
        <Card className="p-0">
          <div className="border-b border-lang-line px-3 py-2">
            <CardTitle>Rule cảnh báo</CardTitle>
            <p className="mt-0.5 text-[11px] font-semibold text-lang-muted">Rule sinh cảnh báo, task và điều kiện chặn chốt.</p>
          </div>
          <div className="p-2">
            <ReportTable headers={['Rule', 'Mức độ', 'Hành động', 'Module ảnh hưởng', 'Phụ trách']} rows={ruleRows} maxHeight="max-h-[420px]" />
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-b border-lang-line px-3 py-2">
            <CardTitle>Formula map</CardTitle>
            <p className="mt-0.5 text-[11px] font-semibold text-lang-muted">Công thức lõi, tách rõ đơn vị cho KPI và bảng chi tiết.</p>
          </div>
          <div className="p-2">
            <ReportTable headers={['Công thức', 'Nội dung', 'Đơn vị', 'Dùng ở tab']} rows={formulaRows} maxHeight="max-h-[420px]" />
          </div>
        </Card>
      </section>

      <Card className="p-0">
        <div className="border-b border-lang-line px-3 py-2">
          <CardTitle>Google Sheet map - phương án C 15 sheet</CardTitle>
          <p className="mt-0.5 text-[11px] font-semibold text-lang-muted">Nguyên tắc đọc dữ liệu để đối chiếu app với Google Sheet master.</p>
        </div>
        <div className="p-2">
          <ReportTable headers={['Tên sheet', 'Vai trò', 'App đọc khi nào']} rows={sheetRows} maxHeight="max-h-[520px]" />
        </div>
      </Card>
    </div>
  );
}
