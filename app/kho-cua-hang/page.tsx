import { V7ModulePage } from '@/components/dashboard/V7ModulePage';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

export default function KhoCuaHangPage() {
  return (
    <V7ModulePage
      title="Kho cửa hàng"
      description="Theo dõi xuất nhập tồn, bán, hủy, kiểm kê và lệch tồn riêng từng cửa hàng."
      statusWhenData="Cảnh báo"
      sheets={[{ name: SHEET_NAMES.DL_XNT_CUA_HANG, label: 'XNT cửa hàng' }]}
      primaryHeaders={['Ngày', 'Chi nhánh', 'Kho', 'Mã hàng', 'Tên hàng', 'Tồn đầu', 'Nhập từ BTT', 'Xuất bán lý thuyết', 'Hủy', 'Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Trạng thái']}
      notes={[
        ['Tách kho', 'Cửa hàng không trộn với Bếp Trung Tâm', 'Đạt'],
        ['Tồn âm', 'Tồn âm phải cảnh báo đỏ và yêu cầu giải trình', 'Cần kiểm'],
        ['Dữ liệu', 'Đọc từ DL_XNT_CUA_HANG', 'Đạt']
      ]}
    />
  );
}
