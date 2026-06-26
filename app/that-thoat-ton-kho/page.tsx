import { V7ModulePage } from '@/components/dashboard/V7ModulePage';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

export default function ThatThoatTonKhoPage() {
  return (
    <V7ModulePage
      title="Thất thoát tồn kho"
      description="Đo thiếu/dư giữa tồn lý thuyết và kiểm kê thực tế, quy ra tiền theo nguyên vật liệu và kho."
      statusWhenData="Cảnh báo"
      sheets={[{ name: SHEET_NAMES.KQ_THAT_THOAT_TON_KHO, label: 'Kết quả thất thoát tồn kho' }]}
      primaryHeaders={['Kho', 'NVL', 'ĐVT', 'Tồn đầu', 'Nhập', 'Tiêu hao lý thuyết', 'Hủy hợp lệ', 'Tồn lý thuyết', 'Tồn thực tế', 'Thiếu', 'Dư', 'Tỷ lệ thất thoát', 'Giá trị thất thoát', 'Trạng thái']}
      notes={[
        ['Tách chỉ số', 'Thất thoát tồn kho khác hao hụt/vượt định mức', 'Đạt'],
        ['Thiếu kho', 'Thiếu kho cần giải trình và kiểm kê lại', 'Cần kiểm'],
        ['Dữ liệu', 'Đọc từ KQ_THAT_THOAT_TON_KHO', 'Đạt']
      ]}
    />
  );
}
