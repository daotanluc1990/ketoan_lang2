import {
  AlertTriangle,
  Archive,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ClipboardCheck,
  ClipboardList,
  Database,
  DollarSign,
  FileInput,
  FileText,
  Home,
  Scale,
  Settings,
  ShieldCheck,
  Store,
  Truck,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const OPTION_C_SHEETS = {
  CONFIG_MASTER: '01_CONFIG_MASTER',
  DM_CONG_THUC_DINH_MUC: '02_DM_CONG_THUC_DINH_MUC',
  IMPORT_LOG_SYSTEM_LOG: '03_IMPORT_LOG_SYSTEM_LOG',
  DATA_DOANH_THU: '04_DATA_DOANH_THU',
  DATA_SO_QUY: '05_DATA_SO_QUY',
  DATA_CONG_NO: '06_DATA_CONG_NO',
  DATA_NHAN_SU_LUONG: '07_DATA_NHAN_SU_LUONG',
  DATA_KHO_CUA_HANG: '08_DATA_KHO_CUA_HANG',
  DATA_KHO_BTT: '09_DATA_KHO_BTT',
  DATA_XUAT_BTT_CUA_HANG: '10_DATA_XUAT_BTT_CUA_HANG',
  DATA_HANG_HUY_KIEM_KE: '11_DATA_HANG_HUY_KIEM_KE',
  CALC_TON_KHO: '12_CALC_TON_KHO',
  CALC_HAO_HUT_THAT_THOAT: '13_CALC_HAO_HUT_THAT_THOAT',
  CALC_TAI_CHINH_DU_TOAN: '14_CALC_TAI_CHINH_DU_TOAN',
  DASHBOARD_REPORT: '15_DASHBOARD_REPORT'
} as const;

export type OptionCPageKind = 'overview' | 'task' | 'module' | 'report' | 'document' | 'system' | 'import';

export type OptionCPage = {
  path: string;
  title: string;
  group: string;
  kind: OptionCPageKind;
  icon: LucideIcon;
  module: string;
  description: string;
  sourceSheets: string[];
  kpiGroups: string[];
  relatedDocs: string[];
  closeType?: 'day' | 'week' | 'month';
  taskFilter?: 'today' | 'overdue' | 'pending';
};

type KpiTuple = [code: string, name: string, group: string, unit: string, source: string, formula: string];

const KPI_DICTIONARY_CORE_ROWS: KpiTuple[] = [
  ['DT001', 'Tổng doanh thu tuần/tháng', 'Doanh thu', 'VND', '04_DATA_DOANH_THU + 15_DASHBOARD_REPORT', 'Tổng doanh thu theo kỳ lọc tuần/tháng'],
  ['DT006', 'Tỷ lệ doanh thu theo kênh: offline/app', 'Doanh thu', '%', '04_DATA_DOANH_THU + 15_DASHBOARD_REPORT', 'Doanh thu từng kênh / tổng doanh thu'],
  ['DT007', 'Doanh thu theo kênh: offline/app', 'Doanh thu', 'VND', '04_DATA_DOANH_THU + 15_DASHBOARD_REPORT', 'Doanh thu offline và app theo giá trị tiền'],
  ['LN005', 'Lãi gộp', 'Lợi nhuận quản trị', 'VND', '04_DATA_DOANH_THU + giá vốn + 15_DASHBOARD_REPORT', 'Doanh thu - giá vốn'],
  ['LN004', 'Biên lợi nhuận gộp', 'Lợi nhuận quản trị', '%', '04_DATA_DOANH_THU + giá vốn + 15_DASHBOARD_REPORT', 'Lãi gộp / doanh thu'],
  ['LN003', 'Lợi nhuận vận hành', 'Lợi nhuận quản trị', 'VND', '15_DASHBOARD_REPORT', 'Doanh thu - giá vốn - chi phí vận hành'],
  ['LN006', 'Biên lợi nhuận vận hành', 'Lợi nhuận quản trị', '%', '15_DASHBOARD_REPORT', 'Lợi nhuận vận hành / doanh thu'],
  ['LN001', 'Tỷ lệ chi phí nguyên liệu', 'Chi phí', '%', '04_DATA_DOANH_THU + giá vốn + 15_DASHBOARD_REPORT', 'Chi phí nguyên liệu / doanh thu'],
  ['LN002', 'Tỷ lệ chi phí nhân sự', 'Chi phí', '%', '07_DATA_NHAN_SU_LUONG + 15_DASHBOARD_REPORT', 'Chi phí nhân sự / doanh thu'],
  ['CP004', 'Tỷ lệ bao bì', 'Chi phí', '%', '05_DATA_SO_QUY + 15_DASHBOARD_REPORT', 'Chi phí bao bì / doanh thu'],
  ['CP006', 'Tổng chi cửa hàng', 'Chi phí', 'VND', '05_DATA_SO_QUY + 08_DATA_KHO_CUA_HANG + 15_DASHBOARD_REPORT', 'Tổng chi phát sinh tại cửa hàng theo kỳ'],
  ['CP007', 'Tổng chi bếp trung tâm', 'Chi phí', 'VND', '05_DATA_SO_QUY + 09_DATA_KHO_BTT + 15_DASHBOARD_REPORT', 'Tổng chi phát sinh tại BTT theo kỳ'],
  ['DM001', 'Giá trị thất thoát định mức', 'Công thức / định mức / hao hụt', 'VND', 'CHẾ BIẾN + DATA BÁN TRONG KỲ + 13_CALC_HAO_HUT_THAT_THOAT', 'Số bán x định mức/chế biến so với NVL thực tế, vượt x giá vốn'],
  ['DM002', 'Tỷ lệ thất thoát định mức', 'Công thức / định mức / hao hụt', '%', 'CHẾ BIẾN + DATA BÁN TRONG KỲ + 13_CALC_HAO_HUT_THAT_THOAT', 'Giá trị thất thoát định mức / giá trị NVL được phép dùng'],
  ['KH003', 'Giá trị tồn kho', 'Tồn kho', 'VND', '12_CALC_TON_KHO', 'Tồn thực tế x giá vốn'],
  ['TM005', 'Chênh lệch đối soát app', 'Tiền và đối soát', 'VND', '04_DATA_DOANH_THU + sao kê app + 15_DASHBOARD_REPORT', 'Doanh thu app phải thu - tiền app đã về'],
  ['CN001', 'Công nợ', 'Công nợ và nhà cung cấp', 'VND', '06_DATA_CONG_NO + 15_DASHBOARD_REPORT', 'Tổng công nợ cần theo dõi trong kỳ'],
  ['NCC002', 'NCC tăng giá', 'Công nợ và nhà cung cấp', '%', '09_DATA_KHO_BTT + 06_DATA_CONG_NO + 15_DASHBOARD_REPORT', 'Tỷ lệ tăng giá mua của NCC so với kỳ trước hoặc bảng giá chuẩn'],
  ['CP005', 'Chi phí phát sinh bất thường', 'Chi phí', 'VND', '05_DATA_SO_QUY + 15_DASHBOARD_REPORT', 'Khoản chi vượt ngưỡng hoặc không theo nhóm chi thường kỳ'],
  ['DT008', 'Dòng tiền dự kiến', 'Dự toán và dòng tiền', 'VND', '14_CALC_TAI_CHINH_DU_TOAN + 15_DASHBOARD_REPORT', 'Số dư tiền dự kiến sau thu/chi/công nợ theo kỳ'],
  ['DT009', 'Mức thiếu tiền dự kiến', 'Dự toán và dòng tiền', 'VND', '14_CALC_TAI_CHINH_DU_TOAN + 15_DASHBOARD_REPORT', 'Phần tiền thiếu so với mức tiền tối thiểu cần giữ'],
  ['DT010', 'Chênh lệch thực tế so với dự toán', 'Dự toán và dòng tiền', 'VND', '14_CALC_TAI_CHINH_DU_TOAN + 15_DASHBOARD_REPORT', 'Thực tế - dự toán theo giá trị tiền'],
  ['DT011', 'Tỷ lệ chênh lệch thực tế so với dự toán', 'Dự toán và dòng tiền', '%', '14_CALC_TAI_CHINH_DU_TOAN + 15_DASHBOARD_REPORT', 'Chênh lệch thực tế so với dự toán / dự toán'],
  ['TM008', 'Dòng tiền hiện tại', 'Tiền và đối soát', 'VND', '05_DATA_SO_QUY + 15_DASHBOARD_REPORT', 'Số dư tiền hiện tại sau thu chi đã ghi nhận']
];

const KPI_DICTIONARY_EXTENDED_ROWS: KpiTuple[] = [
  ['DT002', 'Doanh thu offline', 'Doanh thu', 'VND', '04_DATA_DOANH_THU', 'Bán tại quầy / mang đi / tại chỗ'],
  ['DT003', 'Doanh thu app food', 'Doanh thu', 'VND', '04_DATA_DOANH_THU', 'Grab + ShopeeFood + Be + app khác'],
  ['DT004', 'Tổng đơn', 'Doanh thu', 'đơn', '04_DATA_DOANH_THU', 'Tổng đơn đã bán'],
  ['DT005', 'Giá trị đơn trung bình', 'Doanh thu', 'VND/đơn', '04_DATA_DOANH_THU', 'Tổng doanh thu / tổng đơn'],
  ['TM001', 'Tiền thực nhận', 'Tiền và đối soát', 'VND', '04_DATA_DOANH_THU + 05_DATA_SO_QUY', 'Tiền đã thật sự về'],
  ['TM002', 'Chênh lệch tiền mặt', 'Tiền và đối soát', 'VND', '05_DATA_SO_QUY', 'Tiền thực đếm - tiền hệ thống'],
  ['TM003', 'Tiền app chưa về', 'Tiền và đối soát', 'VND', '04_DATA_DOANH_THU + sao kê', 'Doanh thu app - tiền app đã về'],
  ['TM004', 'Số ngày tiền app chưa về', 'Tiền và đối soát', 'ngày', '04_DATA_DOANH_THU', 'Ngày hiện tại - ngày phát sinh'],
  ['CP001', 'Tổng chi', 'Chi phí', 'VND', '05_DATA_SO_QUY', 'Tổng các khoản chi'],
  ['CP002', 'Chi chưa phân loại', 'Chi phí', 'VND', '05_DATA_SO_QUY', 'Khoản chi chưa gán nhóm'],
  ['CN002', 'Công nợ quá hạn', 'Công nợ và nhà cung cấp', 'VND', '06_DATA_CONG_NO', 'Công nợ đã quá hạn'],
  ['KH001', 'Tồn âm', 'Tồn kho', 'mặt hàng', '12_CALC_TON_KHO', 'Số mặt hàng có tồn lý thuyết < 0 sau tồn đầu + nhập - NVL dùng theo số bán'],
  ['KH002', 'Lệch tồn kho', 'Tồn kho', 'mặt hàng', '12_CALC_TON_KHO', 'Số mặt hàng có kiểm kê thực tế lệch tồn lý thuyết từ số bán x định mức'],
  ['KH005', 'Giá trị lệch tồn kho', 'Tồn kho', 'VND', '12_CALC_TON_KHO', 'Giá trị chênh lệch tồn kho quy đổi theo giá vốn'],
  ['HH001', 'Giá trị hàng hủy/hư', 'Hàng hủy / hư', 'VND', '11_DATA_HANG_HUY_KIEM_KE', 'Số lượng hủy x giá vốn'],
  ['TT001', 'Giá trị thất thoát tồn kho', 'Thất thoát tồn kho', 'VND', 'BC THẤT THOÁT CN NVT + 13_CALC_HAO_HUT_THAT_THOAT', 'Nếu tồn thực tế < tồn lý thuyết thì thiếu kho x giá vốn'],
  ['TT002', 'Tỷ lệ thất thoát tồn kho', 'Thất thoát tồn kho', '%', 'BC THẤT THOÁT CN NVT + 13_CALC_HAO_HUT_THAT_THOAT', 'Giá trị thất thoát tồn kho / giá trị tồn lý thuyết'],
  ['DQ001', 'Data Quality Score', 'Data Quality / Import', '%', '03_IMPORT_LOG_SYSTEM_LOG', '100 - điểm phạt lỗi'],
  ['DQ002', 'Nguồn dữ liệu còn thiếu', 'Data Quality / Import', 'nguồn/file', '03_IMPORT_LOG_SYSTEM_LOG', 'Nguồn bắt buộc chưa upload'],
  ['DQ003', 'File import lỗi', 'Data Quality / Import', 'file', '03_IMPORT_LOG_SYSTEM_LOG', 'File không import được'],
  ['NV001', 'Task kế toán chưa xử lý', 'Nhiệm vụ kế toán', 'việc', 'Task engine', 'Task trạng thái chưa xử lý'],
  ['NV002', 'Task đỏ quá hạn', 'Nhiệm vụ kế toán', 'việc', 'Task engine', 'Task đỏ quá deadline'],
  ['BC001', 'Báo cáo trễ', 'Báo cáo ngày / tuần / tháng', 'báo cáo', 'Report close log', 'Báo cáo quá hạn gửi/chốt'],
  ['CB001', 'Cảnh báo đỏ', 'Cảnh báo tự động', 'cảnh báo', 'Rule engine', 'Cảnh báo đỏ chưa xử lý'],
  ['KH004', 'Mặt hàng cần kiểm kê', 'Tồn kho', 'mặt hàng', '12_CALC_TON_KHO', 'Mặt hàng lệch tồn hoặc chưa kiểm kê'],
  ['HH002', 'Hàng hủy thiếu ảnh', 'Hàng hủy / hư', 'phiếu', '11_DATA_HANG_HUY_KIEM_KE', 'Phiếu hủy chưa có chứng từ/ảnh'],
  ['NCC001', 'Giá trị nhập NCC', 'Công nợ và nhà cung cấp', 'VND', '09_DATA_KHO_BTT + 06_DATA_CONG_NO', 'Giá trị nhập nhà cung cấp trong kỳ'],
  ['SX002', 'Giá trị hao hụt chế biến thực tế', 'Công thức / định mức / hao hụt', 'VND', 'CHẾ BIẾN + 09_DATA_KHO_BTT + 13_CALC_HAO_HUT_THAT_THOAT', 'Giá trị NVL hao hụt thực tế vượt chuẩn trong chế biến'],
  ['SX001', 'Hao hụt chế biến thực tế', 'Công thức / định mức / hao hụt', '%', 'CHẾ BIẾN + 09_DATA_KHO_BTT + 13_CALC_HAO_HUT_THAT_THOAT', 'Số bán x định mức/chế biến, so với thực tế sử dụng'],
  ['NS001', 'Công chưa xác nhận', 'Nhân sự và lương', 'ca/công', '07_DATA_NHAN_SU_LUONG', 'Ca/công cần quản lý xác nhận'],
  ['NS002', 'Khoản chờ duyệt', 'Nhân sự và lương', 'khoản', '07_DATA_NHAN_SU_LUONG', 'Tạm ứng/thưởng/phạt đang chờ duyệt'],
  ['NS003', 'Lương dự kiến phải trả', 'Nhân sự và lương', 'VND', '07_DATA_NHAN_SU_LUONG', 'Tổng lương tạm tính sau khấu trừ'],
  ['BC002', 'Báo cáo chốt ngoại lệ', 'Báo cáo ngày / tuần / tháng', 'báo cáo', 'Report close log', 'Báo cáo đã chốt khi còn thiếu dữ liệu và có nguyên nhân'],
  ['HT001', 'User đang hoạt động', 'Hệ thống', 'user', '01_CONFIG_MASTER', 'Tài khoản còn hiệu lực'],
  ['HT002', 'Cửa hàng/kho thiếu phụ trách', 'Hệ thống', 'đơn vị', '01_CONFIG_MASTER', 'Cửa hàng/kho chưa gắn người phụ trách']
];

function mapKpiRows(rows: KpiTuple[]) {
  return rows.map(([code, name, group, unit, source, formula]) => ({ code, name, group, unit, source, formula }));
}

export const KPI_DICTIONARY_CORE = mapKpiRows(KPI_DICTIONARY_CORE_ROWS);
export const KPI_DICTIONARY_EXTENDED = mapKpiRows(KPI_DICTIONARY_EXTENDED_ROWS);
export const KPI_DICTIONARY_ALL = [...KPI_DICTIONARY_CORE, ...KPI_DICTIONARY_EXTENDED];

const revenueDocs = ['Quy trình đối soát doanh thu', 'Checklist tiền mặt/chuyển khoản', 'Tình huống app chưa về tiền'];
const inventoryDocs = ['Quy trình kiểm kho', 'Biểu mẫu hàng hủy/hư', 'Checklist đối chiếu BTT - cửa hàng'];
const financeDocs = ['Checklist sổ quỹ', 'Quy trình công nợ', 'Mẫu dự toán dòng tiền'];
const reportDocs = ['Checklist chốt báo cáo', 'Mẫu báo cáo ngày/tuần/tháng', 'Quy định chốt có ngoại lệ'];

export const OPTION_C_PAGES: OptionCPage[] = [
  { path: '/tong-quan-ke-toan', title: 'Tổng quan kế toán', group: 'TỔNG QUAN KẾ TOÁN', kind: 'overview', icon: Home, module: 'TONG_QUAN', description: 'Dashboard điều hành đọc nhanh từ DASHBOARD_REPORT, hiển thị KPI, cảnh báo, nhiệm vụ và trạng thái chốt.', sourceSheets: [OPTION_C_SHEETS.DASHBOARD_REPORT, OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Doanh thu', 'Tiền và đối soát', 'Data Quality / Import', 'Nhiệm vụ kế toán'], relatedDocs: reportDocs },
  { path: '/nhiem-vu-ke-toan', title: 'Nhiệm vụ kế toán', group: 'NHIỆM VỤ KẾ TOÁN', kind: 'task', icon: ClipboardCheck, module: 'NHIEM_VU', description: 'Một màn hình nhiệm vụ kế toán, lọc nhanh theo hôm nay, quá hạn, chờ xác nhận, task đỏ hoặc tất cả.', sourceSheets: [OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG, OPTION_C_SHEETS.DASHBOARD_REPORT], kpiGroups: ['Nhiệm vụ kế toán'], relatedDocs: ['Checklist việc kế toán ngày', 'Quy định xử lý cảnh báo đỏ'] },
  { path: '/nhiem-vu-ke-toan/viec-hom-nay', title: 'Việc hôm nay', group: 'NHIỆM VỤ KẾ TOÁN', kind: 'task', icon: ClipboardCheck, module: 'NHIEM_VU', description: 'Các việc kế toán cần xử lý trong ngày, sinh từ rule cảnh báo và dữ liệu thiếu.', sourceSheets: [OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG, OPTION_C_SHEETS.DASHBOARD_REPORT], kpiGroups: ['Nhiệm vụ kế toán'], relatedDocs: ['Checklist việc kế toán ngày', 'Quy định xử lý cảnh báo đỏ'], taskFilter: 'today' },
  { path: '/nhiem-vu-ke-toan/viec-qua-han', title: 'Việc quá hạn', group: 'NHIỆM VỤ KẾ TOÁN', kind: 'task', icon: AlertTriangle, module: 'NHIEM_VU', description: 'Các việc đã quá hạn, ưu tiên xử lý trước khi chốt báo cáo.', sourceSheets: [OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Nhiệm vụ kế toán'], relatedDocs: ['Quy trình xử lý việc quá hạn'], taskFilter: 'overdue' },
  { path: '/nhiem-vu-ke-toan/viec-cho-xac-nhan', title: 'Việc chờ xác nhận', group: 'NHIỆM VỤ KẾ TOÁN', kind: 'task', icon: ShieldCheck, module: 'NHIEM_VU', description: 'Các việc cần cửa hàng, BTT hoặc quản lý xác nhận.', sourceSheets: [OPTION_C_SHEETS.DATA_XUAT_BTT_CUA_HANG, OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Nhiệm vụ kế toán'], relatedDocs: ['Checklist xác nhận hàng nhận'], taskFilter: 'pending' },
  { path: '/nhap-lieu/upload', title: 'Upload dữ liệu', group: 'NHẬP LIỆU & DỮ LIỆU', kind: 'import', icon: FileInput, module: 'NHAP_LIEU', description: 'Upload file, nhận diện loại file, preview lỗi và chỉ ghi khi đạt điều kiện.', sourceSheets: [OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Data Quality / Import'], relatedDocs: ['Quy trình upload dữ liệu', 'Danh sách file bắt buộc'] },
  { path: '/nhap-lieu/lich-su-import', title: 'Lịch sử import', group: 'NHẬP LIỆU & DỮ LIỆU', kind: 'import', icon: Database, module: 'NHAP_LIEU', description: 'Theo dõi batch import, trạng thái ghi dữ liệu và khả năng rollback.', sourceSheets: [OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Data Quality / Import'], relatedDocs: ['Quy trình rollback import'] },
  { path: '/nhap-lieu/du-lieu-loi-thieu', title: 'Dữ liệu lỗi / thiếu', group: 'NHẬP LIỆU & DỮ LIỆU', kind: 'import', icon: AlertTriangle, module: 'NHAP_LIEU', description: 'Danh sách nguồn dữ liệu thiếu, dòng lỗi, file lỗi và hành động cần xử lý.', sourceSheets: [OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Data Quality / Import'], relatedDocs: ['Checklist sửa file nguồn'] },
  { path: '/doanh-thu/tien-mat', title: 'Tiền mặt', group: 'DOANH THU', kind: 'module', icon: DollarSign, module: 'DOANH_THU', description: 'Doanh thu tiền mặt, chênh lệch tiền mặt và đối soát sổ quỹ.', sourceSheets: [OPTION_C_SHEETS.DATA_DOANH_THU, OPTION_C_SHEETS.DATA_SO_QUY], kpiGroups: ['Doanh thu', 'Tiền và đối soát'], relatedDocs: revenueDocs },
  { path: '/doanh-thu/chuyen-khoan', title: 'Chuyển khoản', group: 'DOANH THU', kind: 'module', icon: DollarSign, module: 'DOANH_THU', description: 'Giao dịch chuyển khoản đã xác định, chưa xác định và lệch đối soát.', sourceSheets: [OPTION_C_SHEETS.DATA_DOANH_THU, OPTION_C_SHEETS.DATA_SO_QUY], kpiGroups: ['Doanh thu', 'Tiền và đối soát'], relatedDocs: revenueDocs },
  { path: '/doanh-thu/app-giao-hang', title: 'App giao hàng', group: 'DOANH THU', kind: 'module', icon: Truck, module: 'DOANH_THU', description: 'Doanh thu app food, phí app, tiền app đã về/chưa về và số ngày treo.', sourceSheets: [OPTION_C_SHEETS.DATA_DOANH_THU], kpiGroups: ['Doanh thu', 'Tiền và đối soát'], relatedDocs: revenueDocs },
  { path: '/kho-cua-hang/ton-kho', title: 'Tồn kho', group: 'KHO CỬA HÀNG', kind: 'module', icon: Store, module: 'KHO_CUA_HANG', description: 'Tồn đầu, nhập, bán theo định mức, kiểm kê, tồn lý thuyết và lệch tồn.', sourceSheets: [OPTION_C_SHEETS.DATA_KHO_CUA_HANG, OPTION_C_SHEETS.CALC_TON_KHO], kpiGroups: ['Tồn kho'], relatedDocs: inventoryDocs },
  { path: '/kho-cua-hang/hang-huy-hu', title: 'Hàng hủy / hư', group: 'KHO CỬA HÀNG', kind: 'module', icon: AlertTriangle, module: 'KHO_CUA_HANG', description: 'Hàng hủy thật, lý do, chứng từ, người ghi nhận và người duyệt.', sourceSheets: [OPTION_C_SHEETS.DATA_HANG_HUY_KIEM_KE], kpiGroups: ['Hàng hủy / hư'], relatedDocs: inventoryDocs },
  { path: '/kho-cua-hang/cong-thuc-dinh-muc', title: 'Công thức / định mức', group: 'KHO CỬA HÀNG', kind: 'module', icon: ClipboardList, module: 'KHO_CUA_HANG', description: 'Công thức món bán, định mức NVL và hao hụt hợp lệ được duyệt.', sourceSheets: [OPTION_C_SHEETS.DM_CONG_THUC_DINH_MUC], kpiGroups: ['Công thức / định mức / hao hụt'], relatedDocs: inventoryDocs },
  { path: '/kho-bep-trung-tam/nhap-ncc', title: 'Nhập NCC', group: 'KHO BẾP TRUNG TÂM', kind: 'module', icon: Truck, module: 'KHO_BTT', description: 'Nhập nhà cung cấp vào BTT, giá trị nhập và biến động giá mua.', sourceSheets: [OPTION_C_SHEETS.DATA_KHO_BTT], kpiGroups: ['Tồn kho', 'Công nợ và nhà cung cấp'], relatedDocs: inventoryDocs },
  { path: '/kho-bep-trung-tam/san-xuat-cong-thuc', title: 'Sản xuất / công thức', group: 'KHO BẾP TRUNG TÂM', kind: 'module', icon: Archive, module: 'KHO_BTT', description: 'Sản xuất, sơ chế, đầu vào/đầu ra và hao hụt hợp lệ tại BTT.', sourceSheets: [OPTION_C_SHEETS.DATA_KHO_BTT, OPTION_C_SHEETS.DM_CONG_THUC_DINH_MUC], kpiGroups: ['Công thức / định mức / hao hụt'], relatedDocs: inventoryDocs },
  { path: '/kho-bep-trung-tam/ton-kho-hao-hut', title: 'Tồn kho & hao hụt', group: 'KHO BẾP TRUNG TÂM', kind: 'module', icon: Archive, module: 'KHO_BTT', description: 'Tồn kho BTT, xuất BTT cho cửa hàng, kiểm kê và hao hụt.', sourceSheets: [OPTION_C_SHEETS.DATA_KHO_BTT, OPTION_C_SHEETS.DATA_XUAT_BTT_CUA_HANG, OPTION_C_SHEETS.CALC_TON_KHO], kpiGroups: ['Tồn kho', 'Thất thoát tồn kho'], relatedDocs: inventoryDocs },
  { path: '/tai-chinh/tong-quan', title: 'Tổng quan tài chính', group: 'TÀI CHÍNH', kind: 'module', icon: DollarSign, module: 'TAI_CHINH', description: 'Tổng quan tiền vào, tiền ra, công nợ, số dư và rủi ro dòng tiền.', sourceSheets: [OPTION_C_SHEETS.DATA_SO_QUY, OPTION_C_SHEETS.DATA_CONG_NO, OPTION_C_SHEETS.CALC_TAI_CHINH_DU_TOAN], kpiGroups: ['Tiền và đối soát', 'Công nợ và nhà cung cấp', 'Dự toán'], relatedDocs: financeDocs },
  { path: '/tai-chinh/dong-tien', title: 'Dòng tiền', group: 'TÀI CHÍNH', kind: 'module', icon: DollarSign, module: 'TAI_CHINH', description: 'Sổ quỹ, tổng thu, tổng chi, dòng tiền tạm và chứng từ thiếu.', sourceSheets: [OPTION_C_SHEETS.DATA_SO_QUY], kpiGroups: ['Tiền và đối soát', 'Chi phí'], relatedDocs: financeDocs },
  { path: '/tai-chinh/can-doi', title: 'Cân đối', group: 'TÀI CHÍNH', kind: 'module', icon: Scale, module: 'TAI_CHINH', description: 'Cân đối rút gọn, số dư, công nợ, tồn kho và trạng thái nguồn dữ liệu.', sourceSheets: [OPTION_C_SHEETS.DATA_SO_QUY, OPTION_C_SHEETS.DATA_CONG_NO, OPTION_C_SHEETS.CALC_TON_KHO], kpiGroups: ['Tiền và đối soát', 'Tồn kho'], relatedDocs: financeDocs },
  { path: '/tai-chinh/du-toan', title: 'Dự toán', group: 'TÀI CHÍNH', kind: 'module', icon: ClipboardList, module: 'TAI_CHINH', description: 'Dự toán doanh thu, chi phí, công nợ cần trả và số dư dự kiến.', sourceSheets: [OPTION_C_SHEETS.CALC_TAI_CHINH_DU_TOAN], kpiGroups: ['Dự toán'], relatedDocs: financeDocs },
  { path: '/luong-nhan-su/cham-cong', title: 'Chấm công', group: 'LƯƠNG & NHÂN SỰ', kind: 'module', icon: Users, module: 'LUONG', description: 'Số công, giờ làm, đi trễ, nghỉ và dữ liệu chấm công theo cửa hàng.', sourceSheets: [OPTION_C_SHEETS.DATA_NHAN_SU_LUONG], kpiGroups: ['Nhân sự và lương'], relatedDocs: ['Quy trình chấm công', 'Mẫu bảng công'] },
  { path: '/luong-nhan-su/tam-ung-thuong-phat', title: 'Tạm ứng / thưởng phạt', group: 'LƯƠNG & NHÂN SỰ', kind: 'module', icon: Users, module: 'LUONG', description: 'Tạm ứng, thưởng, phạt, phụ cấp, khấu trừ và trạng thái duyệt.', sourceSheets: [OPTION_C_SHEETS.DATA_NHAN_SU_LUONG], kpiGroups: ['Nhân sự và lương'], relatedDocs: ['Quy trình duyệt tạm ứng', 'Biểu mẫu thưởng phạt'] },
  { path: '/luong-nhan-su/bang-luong', title: 'Bảng lương', group: 'LƯƠNG & NHÂN SỰ', kind: 'module', icon: Users, module: 'LUONG', description: 'Lương tạm tính, thực nhận, chi phí nhân sự và trạng thái duyệt.', sourceSheets: [OPTION_C_SHEETS.DATA_NHAN_SU_LUONG], kpiGroups: ['Nhân sự và lương'], relatedDocs: ['Mẫu bảng lương', 'Checklist chốt lương'] },
  { path: '/bao-cao-quan-tri', title: 'Báo cáo quản trị', group: 'BÁO CÁO QUẢN TRỊ', kind: 'report', icon: FileText, module: 'BAO_CAO', description: 'Một màn hình báo cáo quản trị, chuyển nhanh giữa báo cáo ngày, tuần, tháng, chốt có ngoại lệ và lịch sử chốt.', sourceSheets: [OPTION_C_SHEETS.DASHBOARD_REPORT, OPTION_C_SHEETS.CALC_TAI_CHINH_DU_TOAN], kpiGroups: ['Báo cáo ngày / tuần / tháng'], relatedDocs: reportDocs, closeType: 'week' },
  { path: '/bao-cao-quan-tri/ngay', title: 'Báo cáo ngày', group: 'BÁO CÁO QUẢN TRỊ', kind: 'report', icon: FileText, module: 'BAO_CAO', description: 'Báo cáo ngày gồm doanh thu, tiền, kho cửa hàng, data quality và cảnh báo đỏ.', sourceSheets: [OPTION_C_SHEETS.DASHBOARD_REPORT, OPTION_C_SHEETS.IMPORT_LOG_SYSTEM_LOG], kpiGroups: ['Báo cáo ngày / tuần / tháng'], relatedDocs: reportDocs, closeType: 'day' },
  { path: '/bao-cao-quan-tri/tuan', title: 'Báo cáo tuần', group: 'BÁO CÁO QUẢN TRỊ', kind: 'report', icon: FileText, module: 'BAO_CAO', description: 'Báo cáo tuần gồm P&L, dòng tiền, kho, công nợ, dự toán và top vấn đề CEO.', sourceSheets: [OPTION_C_SHEETS.DASHBOARD_REPORT, OPTION_C_SHEETS.CALC_TAI_CHINH_DU_TOAN], kpiGroups: ['Báo cáo ngày / tuần / tháng'], relatedDocs: reportDocs, closeType: 'week' },
  { path: '/bao-cao-quan-tri/thang', title: 'Báo cáo tháng', group: 'BÁO CÁO QUẢN TRỊ', kind: 'report', icon: FileText, module: 'BAO_CAO', description: 'Báo cáo tháng về kết quả kinh doanh, dòng tiền, kho, nhân sự và data quality.', sourceSheets: [OPTION_C_SHEETS.DASHBOARD_REPORT], kpiGroups: ['Báo cáo ngày / tuần / tháng'], relatedDocs: reportDocs, closeType: 'month' },
  { path: '/tai-lieu/quy-trinh-checklist', title: 'Quy trình & Checklist', group: 'TÀI LIỆU', kind: 'document', icon: BookOpen, module: 'TAI_LIEU', description: 'Thư viện quy trình và checklist theo nhóm nghiệp vụ.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: reportDocs },
  { path: '/tai-lieu/tinh-huong-phat-sinh', title: 'Tình huống phát sinh', group: 'TÀI LIỆU', kind: 'document', icon: BookOpen, module: 'TAI_LIEU', description: 'Các tình huống phát sinh và cách xử lý đã duyệt.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: ['Tình huống thiếu dữ liệu', 'Tình huống lệch tiền', 'Tình huống lệch kho'] },
  { path: '/tai-lieu/bieu-mau-bao-cao-mau', title: 'Biểu mẫu & Báo cáo mẫu', group: 'TÀI LIỆU', kind: 'document', icon: BookOpen, module: 'TAI_LIEU', description: 'Biểu mẫu import, kiểm kê, hàng hủy và báo cáo mẫu.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: ['Mẫu báo cáo ngày', 'Mẫu báo cáo tuần', 'Mẫu báo cáo tháng'] },
  { path: '/he-thong/nguoi-dung-phan-quyen', title: 'Người dùng & phân quyền', group: 'HỆ THỐNG', kind: 'system', icon: Settings, module: 'HE_THONG', description: 'Vai trò, quyền xem module và quyền chốt báo cáo.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: ['Ma trận phân quyền'] },
  { path: '/he-thong/cua-hang-kho', title: 'Cửa hàng & kho', group: 'HỆ THỐNG', kind: 'system', icon: Store, module: 'HE_THONG', description: 'Danh mục cửa hàng, kho cửa hàng, BTT và trạng thái áp dụng.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: ['Danh mục cửa hàng/kho'] },
  { path: '/he-thong/danh-muc-nen', title: 'Danh mục nền', group: 'HỆ THỐNG', kind: 'system', icon: Database, module: 'HE_THONG', description: 'Nhóm chi phí, NCC, ngưỡng cảnh báo, kỳ báo cáo và cấu hình nền.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: ['Danh mục nền Option C'] },
  { path: '/he-thong/rule-formula-sheet-map', title: 'Rule / Formula / Sheet map', group: 'HỆ THỐNG', kind: 'system', icon: ClipboardList, module: 'HE_THONG', description: 'Rule cảnh báo, công thức tính lõi và mapping 15 sheet theo thiết kế HTML V3.', sourceSheets: [OPTION_C_SHEETS.CONFIG_MASTER], kpiGroups: [], relatedDocs: ['Rule cảnh báo', 'Formula map', 'Google Sheet map'] }
];

const LEGACY_OPTION_C_PATHS: Record<string, string> = {
  '/he-thong/nguoi-dung': '/he-thong/nguoi-dung-phan-quyen',
  '/he-thong/phan-quyen': '/he-thong/nguoi-dung-phan-quyen',
  '/he-thong/cua-hang': '/he-thong/cua-hang-kho'
};

export function findOptionCPage(slug: string[]) {
  const path = `/${slug.join('/')}`;
  const canonicalPath = LEGACY_OPTION_C_PATHS[path] ?? path;
  return OPTION_C_PAGES.find((page) => page.path === canonicalPath);
}

export function optionCPagesByGroup(group: string) {
  return OPTION_C_PAGES.filter((page) => page.group === group);
}
