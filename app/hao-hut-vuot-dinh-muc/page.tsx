import { V7ModulePage } from '@/components/dashboard/V7ModulePage';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';

export const dynamic = 'force-dynamic';

export default function HaoHutVuotDinhMucPage() {
  return (
    <V7ModulePage
      title="Hao hụt / Vượt định mức"
      description="Đo món, ca hoặc bộ phận đang dùng nguyên vật liệu quá tay so với công thức chuẩn."
      statusWhenData="Cảnh báo"
      sheets={[
        { name: SHEET_NAMES.DL_CHE_BIEN_THUC_TE, label: 'Chế biến thực tế' },
        { name: SHEET_NAMES.KQ_HAO_HUT_CHE_BIEN, label: 'Kết quả hao hụt chế biến' },
        { name: SHEET_NAMES.DM_CONG_THUC_CHE_BIEN, label: 'Công thức chế biến' },
        { name: SHEET_NAMES.DM_HAO_HUT_HOP_LE, label: 'Hao hụt hợp lệ' }
      ]}
      primaryHeaders={['Ngày', 'Món/Nhóm chế biến', 'NVL', 'Sản lượng', 'Định mức', 'Hao hụt hợp lệ', 'Được phép dùng', 'Thực tế dùng', 'Vượt SL', 'Tỷ lệ vượt', 'Giá trị vượt', 'Trạng thái']}
      notes={[
        ['Không kết luận mất hàng', 'Hao hụt chế biến đo thao tác/công thức, không phải thất thoát kho', 'Đạt'],
        ['Công thức', 'Cần DM_CONG_THUC_CHE_BIEN và DM_HAO_HUT_HOP_LE', 'Cần kiểm'],
        ['Dữ liệu', 'Đọc từ dữ liệu chế biến thực tế và kết quả tính', 'Đạt']
      ]}
    />
  );
}
