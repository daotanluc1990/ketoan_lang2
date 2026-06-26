import { V7ModulePage } from '@/components/dashboard/V7ModulePage';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

export default function HangHuyPage() {
  return (
    <V7ModulePage
      title="Hàng hủy"
      description="Tách riêng hàng hủy cửa hàng và hàng hủy Bếp Trung Tâm, không gộp vào thất thoát tồn kho."
      statusWhenData="Cảnh báo"
      sheets={[
        { name: SHEET_NAMES.DL_HUY_HANG_CUA_HANG, label: 'Hủy hàng cửa hàng' },
        { name: SHEET_NAMES.DL_HUY_HANG_BTT, label: 'Hủy hàng BTT' }
      ]}
      primaryHeaders={['Ngày hủy', 'Kho', 'Chi nhánh', 'Mã hàng', 'Tên hàng', 'Số lượng', 'ĐVT', 'Giá trị', 'Lý do', 'Người ghi nhận', 'Trạng thái']}
      notes={[
        ['Tách nghiệp vụ', 'Hàng hủy không phải thất thoát tồn kho', 'Đạt'],
        ['Tách kho', 'Hủy cửa hàng và hủy BTT là 2 nguồn riêng', 'Đạt'],
        ['Dữ liệu', 'Đọc từ DL_HUY_HANG_CUA_HANG và DL_HUY_HANG_BTT', 'Đạt']
      ]}
    />
  );
}
