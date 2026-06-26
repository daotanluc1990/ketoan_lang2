import { V7ModulePage } from '@/components/dashboard/V7ModulePage';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

export default function KhoBepTrungTamPage() {
  return (
    <V7ModulePage
      title="Kho Bếp Trung Tâm"
      description="Kiểm soát nhập NCC, sản xuất/sơ chế, xuất cho cửa hàng, hủy BTT và lệch tồn BTT."
      statusWhenData="Cảnh báo"
      sheets={[{ name: SHEET_NAMES.DL_XNT_BEP_TRUNG_TAM, label: 'XNT Bếp Trung Tâm' }]}
      primaryHeaders={['Ngày', 'Chi nhánh', 'Kho', 'Mã hàng', 'Tên hàng', 'Tồn đầu', 'Nhập NCC', 'Sản xuất/sơ chế', 'Xuất cửa hàng', 'Hủy BTT', 'Tồn lý thuyết', 'Tồn thực tế', 'Lệch', 'Trạng thái']}
      notes={[
        ['Tách kho', 'BTT là một kho riêng, không trộn với cửa hàng', 'Đạt'],
        ['Xuất cửa hàng', 'Xuất BTT cho cửa hàng không phải hàng hủy', 'Đạt'],
        ['Dữ liệu', 'Đọc từ DL_XNT_BEP_TRUNG_TAM', 'Đạt']
      ]}
    />
  );
}
