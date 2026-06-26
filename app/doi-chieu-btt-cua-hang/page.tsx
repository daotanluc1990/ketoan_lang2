import { V7ModulePage } from '@/components/dashboard/V7ModulePage';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

export default function DoiChieuBttCuaHangPage() {
  return (
    <V7ModulePage
      title="Đối chiếu BTT - Cửa hàng"
      description="So sánh Bếp Trung Tâm xuất bao nhiêu và cửa hàng xác nhận nhận bao nhiêu."
      statusWhenData="Cảnh báo"
      sheets={[
        { name: SHEET_NAMES.DL_XUAT_BTT_CHO_CUA_HANG, label: 'BTT xuất cho cửa hàng' },
        { name: SHEET_NAMES.DL_CUA_HANG_NHAN_TU_BTT, label: 'Cửa hàng nhận từ BTT' }
      ]}
      primaryHeaders={['Ngày', 'Mã phiếu', 'Cửa hàng', 'Kho xuất', 'Kho nhận', 'Mã hàng', 'Tên hàng', 'Số lượng xuất', 'Số lượng nhận', 'Lệch', 'Trạng thái']}
      notes={[
        ['Không tính hủy', 'Lệch xuất/nhận là nghiệp vụ đối chiếu chuyển kho', 'Đạt'],
        ['Chưa xác nhận', 'BTT xuất nhưng cửa hàng chưa nhận phải cảnh báo', 'Cần kiểm'],
        ['Dữ liệu', 'Đọc từ 2 sheet xuất và nhận BTT', 'Đạt']
      ]}
    />
  );
}
