import type { OptionCPage } from './catalog';

export type DashboardDisplayType = 'KPI_CARD' | 'DATA_TABLE' | 'ALERT_CARD' | 'TASK_LIST' | 'TREND_CHART' | 'BAR_CHART' | 'DONUT_CHART' | 'TOP_LIST' | 'RIGHT_PANEL';

export type SubtabDashboardSpec = {
  path: string;
  focus: string;
  kpiCodes: string[];
  displayTypes: DashboardDisplayType[];
  table: {
    title: string;
    headers: string[];
  };
  alertRows: string[][];
  taskRows: string[][];
  emptyState: string;
  noPermissionState: string;
};

const comparison = ['Kỳ trước', 'Chênh lệch', '% thay đổi'];

const SPECS: Record<string, SubtabDashboardSpec> = {
  '/tong-quan-ke-toan': {
    path: '/tong-quan-ke-toan',
    focus: 'Điều hành tình trạng tiền, kho, dữ liệu, công nợ và điều kiện chốt.',
    kpiCodes: ['DQ001', 'DT001', 'TM001', 'TM003', 'CN001', 'KH002', 'HH001', 'BC001'],
    displayTypes: ['KPI_CARD', 'ALERT_CARD', 'TASK_LIST', 'DATA_TABLE', 'RIGHT_PANEL'],
    table: { title: 'Bảng vấn đề điều hành', headers: ['Nhóm vấn đề', 'Nội dung', 'Mức độ', 'Người phụ trách', 'Deadline', 'Trạng thái', 'Hành động đề xuất'] },
    alertRows: [['Đỏ', 'Dữ liệu chưa đủ để chốt báo cáo', 'Kế toán', 'Upload dữ liệu hoặc chốt có ngoại lệ']],
    taskRows: [['Data quality', 'Bổ sung nguồn thiếu trước hạn chốt', 'Kế toán', 'Hôm nay', 'Đỏ']],
    emptyState: 'Chưa có dữ liệu dashboard tổng hợp. Cần import dữ liệu hoặc kiểm tra 15_DASHBOARD_REPORT.',
    noPermissionState: 'Vai trò hiện tại không được xem dashboard tổng quan kế toán.'
  },
  '/nhiem-vu-ke-toan/viec-hom-nay': {
    path: '/nhiem-vu-ke-toan/viec-hom-nay',
    focus: 'Danh sách việc kế toán cần xử lý trong ngày.',
    kpiCodes: ['NV001', 'CB001', 'DQ002'],
    displayTypes: ['KPI_CARD', 'TASK_LIST', 'ALERT_CARD', 'DATA_TABLE'],
    table: { title: 'Việc hôm nay', headers: ['Mã task', 'Ngày tạo', 'Module', 'Nội dung việc', 'Người phụ trách', 'Deadline', 'Mức độ', 'Trạng thái', 'Link dữ liệu'] },
    alertRows: [['Đỏ', 'Task đỏ trong ngày ảnh hưởng chốt báo cáo', 'Kế toán tổng hợp', 'Xử lý trước khi chốt']],
    taskRows: [['Task engine', 'Xử lý việc hôm nay', 'Kế toán', 'Hôm nay', 'Đỏ/Cam']],
    emptyState: 'Không có nhiệm vụ mở trong ngày.',
    noPermissionState: 'Vai trò hiện tại không được xem nhiệm vụ kế toán.'
  },
  '/nhiem-vu-ke-toan/viec-qua-han': {
    path: '/nhiem-vu-ke-toan/viec-qua-han',
    focus: 'Task trễ hạn, task đỏ và việc ảnh hưởng điều kiện chốt.',
    kpiCodes: ['NV002', 'CB001', 'BC002'],
    displayTypes: ['KPI_CARD', 'TASK_LIST', 'ALERT_CARD'],
    table: { title: 'Việc quá hạn', headers: ['Mã task', 'Module', 'Nội dung việc', 'Người phụ trách', 'Deadline', 'Số giờ trễ', 'Mức độ', 'Trạng thái'] },
    alertRows: [['Đỏ', 'Task đỏ quá hạn không được chốt sạch', 'Kế toán tổng hợp', 'Xử lý hoặc chốt có ngoại lệ']],
    taskRows: [['Task engine', 'Xử lý task quá hạn', 'Người phụ trách', 'Ngay', 'Đỏ']],
    emptyState: 'Không có nhiệm vụ quá hạn.',
    noPermissionState: 'Vai trò hiện tại không được xem nhiệm vụ quá hạn.'
  },
  '/nhiem-vu-ke-toan/viec-cho-xac-nhan': {
    path: '/nhiem-vu-ke-toan/viec-cho-xac-nhan',
    focus: 'Việc chờ cửa hàng, BTT, CEO hoặc kế toán xác nhận.',
    kpiCodes: ['NV001', 'KH004', 'DQ002'],
    displayTypes: ['KPI_CARD', 'TASK_LIST', 'DATA_TABLE'],
    table: { title: 'Việc chờ xác nhận', headers: ['Mã task', 'Module', 'Nội dung việc', 'Bên cần xác nhận', 'Người phụ trách', 'Deadline', 'Trạng thái', 'Link dữ liệu'] },
    alertRows: [['Cam', 'BTT xuất nhưng cửa hàng chưa xác nhận là việc cần ưu tiên', 'Kế toán kho', 'Đối chiếu phiếu xuất/nhận']],
    taskRows: [['Workflow', 'Nhắc bên xác nhận', 'Kế toán', 'Hôm nay', 'Cam']],
    emptyState: 'Không có nhiệm vụ chờ xác nhận.',
    noPermissionState: 'Vai trò hiện tại không được xem nhiệm vụ chờ xác nhận.'
  },
  '/nhap-lieu/upload': {
    path: '/nhap-lieu/upload',
    focus: 'Kiểm file trước khi ghi dữ liệu thật.',
    kpiCodes: ['DQ001', 'DQ002', 'DQ003', 'BC002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng file upload', headers: ['Tên file', 'Loại dữ liệu', 'Kỳ báo cáo', 'Người upload', 'Số dòng đọc được', 'Số dòng lỗi', 'Trạng thái import', 'Ghi chú lỗi'] },
    alertRows: [['Cam', 'File thiếu cột/ngày ngoài kỳ/file trùng kỳ phải dừng ở preview', 'Kế toán', 'Sửa file nguồn trước khi import']],
    taskRows: [['Import', 'Kiểm tra batch upload', 'Kế toán', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có file upload trong kỳ.',
    noPermissionState: 'Chỉ CEO/Kế toán/Admin được import dữ liệu.'
  },
  '/nhap-lieu/lich-su-import': {
    path: '/nhap-lieu/lich-su-import',
    focus: 'Theo dõi batch import và khả năng rollback.',
    kpiCodes: ['DQ003', 'DQ002', 'BC002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Lịch sử import', headers: ['Batch ID', 'Thời gian', 'Loại file', 'Người import', 'Trạng thái', 'Dòng hợp lệ', 'Dòng lỗi', 'Link log'] },
    alertRows: [['Vàng', 'Batch lỗi hoặc rollback cần có ghi chú xử lý', 'Kế toán', 'Đối chiếu log import']],
    taskRows: [['Import', 'Rà batch lỗi/rollback', 'Kế toán', 'Hôm nay', 'Vàng']],
    emptyState: 'Chưa có lịch sử import.',
    noPermissionState: 'Vai trò hiện tại không được xem lịch sử import.'
  },
  '/nhap-lieu/du-lieu-loi-thieu': {
    path: '/nhap-lieu/du-lieu-loi-thieu',
    focus: 'Tập trung nguồn thiếu, dòng lỗi và dữ liệu không phân loại.',
    kpiCodes: ['DQ001', 'DQ002', 'DQ003'],
    displayTypes: ['KPI_CARD', 'ALERT_CARD', 'TASK_LIST', 'DATA_TABLE'],
    table: { title: 'Dữ liệu lỗi / thiếu', headers: ['Nguồn dữ liệu', 'Module ảnh hưởng', 'Mức độ', 'Lý do thiếu/lỗi', 'Người phụ trách', 'Deadline', 'Trạng thái'] },
    alertRows: [['Đỏ', 'Thiếu nguồn dữ liệu chính sẽ chặn chốt sạch', 'Kế toán', 'Bổ sung hoặc ghi ngoại lệ']],
    taskRows: [['Data quality', 'Bổ sung nguồn thiếu', 'Kế toán', 'Hôm nay', 'Đỏ']],
    emptyState: 'Không ghi nhận lỗi/thiếu dữ liệu.',
    noPermissionState: 'Vai trò hiện tại không được xem dữ liệu lỗi.'
  },
  '/doanh-thu/tien-mat': {
    path: '/doanh-thu/tien-mat',
    focus: 'Đối soát tiền mặt hệ thống, thực đếm và sổ quỹ.',
    kpiCodes: ['DT002', 'DT004', 'TM001', 'TM002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST'],
    table: { title: 'Đối soát tiền mặt', headers: ['Ngày', 'Ca', 'Cửa hàng', 'Tiền hệ thống', 'Tiền thực đếm', 'Chênh lệch', ...comparison, 'Người chốt', 'Trạng thái xử lý', 'Biên bản'] },
    alertRows: [['Đỏ', 'Chênh lệch tiền mặt khác 0 hoặc thiếu biên bản', 'Thu ngân/Kế toán', 'Lập biên bản và đối chiếu sổ quỹ']],
    taskRows: [['Tiền mặt', 'Xử lý lệch tiền mặt', 'Kế toán doanh thu', 'Hôm nay', 'Đỏ']],
    emptyState: 'Chưa có dữ liệu tiền mặt/sổ quỹ.',
    noPermissionState: 'Vai trò hiện tại không được xem đối soát tiền mặt.'
  },
  '/doanh-thu/chuyen-khoan': {
    path: '/doanh-thu/chuyen-khoan',
    focus: 'Đối soát giao dịch chuyển khoản với báo cáo ca.',
    kpiCodes: ['TM001', 'TM002', 'DT001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Đối soát chuyển khoản', headers: ['Ngày', 'Mã giao dịch', 'Cửa hàng', 'Số tiền', 'Nội dung chuyển khoản', 'Đơn hàng liên quan', ...comparison, 'Trạng thái đối soát', 'Ghi chú'] },
    alertRows: [['Cam', 'Giao dịch chưa xác định hoặc lệch báo cáo ca', 'Kế toán doanh thu', 'Gán đơn hàng/ghi chú xử lý']],
    taskRows: [['Chuyển khoản', 'Phân loại giao dịch chưa xác định', 'Kế toán doanh thu', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có giao dịch chuyển khoản.',
    noPermissionState: 'Vai trò hiện tại không được xem chuyển khoản.'
  },
  '/doanh-thu/app-giao-hang': {
    path: '/doanh-thu/app-giao-hang',
    focus: 'Theo dõi doanh thu app, phí, tiền đã về/chưa về.',
    kpiCodes: ['DT003', 'DT004', 'DT005', 'TM003', 'TM004'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'DONUT_CHART'],
    table: { title: 'Doanh thu app giao hàng', headers: ['App', 'Ngày bán', 'Doanh thu app', 'Phí app', 'Tiền thực nhận', 'Ngày dự kiến về tiền', 'Tiền đã về', 'Chênh lệch', ...comparison, 'Trạng thái đối soát'] },
    alertRows: [['Cam', 'Tiền app quá hạn chưa về hoặc thiếu file đối soát', 'Kế toán doanh thu', 'Đối chiếu app và sao kê']],
    taskRows: [['App food', 'Kiểm tiền app chưa về', 'Kế toán doanh thu', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có dữ liệu app giao hàng.',
    noPermissionState: 'Vai trò hiện tại không được xem doanh thu app.'
  },
  '/kho-cua-hang/ton-kho': {
    path: '/kho-cua-hang/ton-kho',
    focus: 'Xem tồn lý thuyết, kiểm kê, lệch tồn và giá trị thất thoát.',
    kpiCodes: ['KH001', 'KH002', 'KH003', 'KH004', 'TT001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TOP_LIST'],
    table: { title: 'Bảng XNT kho cửa hàng', headers: ['Mã hàng', 'Tên hàng', 'ĐVT', 'Tồn đầu', 'Nhập BTT', 'Nhập NCC', 'Bán theo định mức', 'Hủy hợp lệ', 'Tồn lý thuyết', 'Kiểm kê thực tế', 'Chênh lệch', 'Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', ...comparison, 'Trạng thái'] },
    alertRows: [['Đỏ', 'Tồn âm/lệch vượt ngưỡng/chưa kiểm kê', 'Kế toán kho', 'Kiểm nhập - xuất - bán - hủy']],
    taskRows: [['Kho cửa hàng', 'Giải trình lệch tồn', 'Kế toán kho', 'Hôm nay', 'Đỏ']],
    emptyState: 'Chưa có dữ liệu tồn kho cửa hàng.',
    noPermissionState: 'Vai trò hiện tại không được xem tồn kho cửa hàng.'
  },
  '/kho-cua-hang/hang-huy-hu': {
    path: '/kho-cua-hang/hang-huy-hu',
    focus: 'Theo dõi hàng hủy thật, chứng từ và trạng thái duyệt.',
    kpiCodes: ['HH001', 'HH002', 'CB001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST'],
    table: { title: 'Bảng hàng hủy / hư cửa hàng', headers: ['Ngày', 'Kho/cửa hàng', 'Mặt hàng', 'Số lượng hủy', 'Giá trị', 'Lý do', 'Người ghi nhận', 'Chứng từ/ảnh', ...comparison, 'Trạng thái duyệt'] },
    alertRows: [['Đỏ', 'Hàng hủy không có ảnh/chứng từ hoặc vượt ngưỡng', 'Quản lý cửa hàng/Kế toán', 'Bổ sung chứng từ và duyệt giải trình']],
    taskRows: [['Hàng hủy', 'Bổ sung chứng từ hàng hủy', 'Quản lý cửa hàng', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có dữ liệu hàng hủy/hư.',
    noPermissionState: 'Vai trò hiện tại không được xem hàng hủy.'
  },
  '/kho-cua-hang/cong-thuc-dinh-muc': {
    path: '/kho-cua-hang/cong-thuc-dinh-muc',
    focus: 'Kiểm định mức món bán và NVL vượt chuẩn.',
    kpiCodes: ['DT004', 'DM001', 'DM002', 'SX001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TOP_LIST'],
    table: { title: 'Công thức / định mức món bán', headers: ['Món bán', 'NVL', 'Định mức chuẩn', 'Hao hụt hợp lệ', 'Số lượng bán', 'NVL đáng lẽ dùng', 'NVL được phép dùng', 'NVL thực tế dùng', 'Vượt định mức', 'Giá trị vượt', ...comparison, 'Trạng thái'] },
    alertRows: [['Cam', 'Món thiếu định mức, NVL thiếu giá vốn hoặc vượt định mức', 'Kế toán kho', 'Cập nhật danh mục nền/công thức']],
    taskRows: [['Định mức', 'Rà món/NVL vượt định mức', 'Kế toán kho', 'Tuần này', 'Cam']],
    emptyState: 'Chưa có dữ liệu công thức/định mức.',
    noPermissionState: 'Vai trò hiện tại không được xem định mức.'
  },
  '/kho-bep-trung-tam/nhap-ncc': {
    path: '/kho-bep-trung-tam/nhap-ncc',
    focus: 'Kiểm nhập NCC, chứng từ, chất lượng và biến động giá mua.',
    kpiCodes: ['NCC001', 'CN001', 'CN002', 'KH003'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng nhập NCC', headers: ['Ngày', 'NCC', 'Mặt hàng', 'Số lượng nhập', 'Đơn giá', 'Thành tiền', 'Chứng từ', ...comparison, 'Trạng thái kiểm hàng'] },
    alertRows: [['Cam', 'NCC giao thiếu, hàng không đạt hoặc giá mua tăng bất thường', 'Thu mua/Kế toán', 'Đối chiếu chứng từ và công nợ']],
    taskRows: [['Nhập NCC', 'Bổ sung chứng từ/đối chiếu nhập', 'Thu mua', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có dữ liệu nhập NCC.',
    noPermissionState: 'Vai trò hiện tại không được xem nhập NCC.'
  },
  '/kho-bep-trung-tam/san-xuat-cong-thuc': {
    path: '/kho-bep-trung-tam/san-xuat-cong-thuc',
    focus: 'Theo dõi mẻ sản xuất, đầu vào/đầu ra và hao hụt chế biến.',
    kpiCodes: ['SX001', 'DM001', 'DM002', 'TT001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TREND_CHART'],
    table: { title: 'Bảng sản xuất / sơ chế BTT', headers: ['Ngày', 'Mẻ sản xuất', 'NVL đầu vào', 'Thành phẩm', 'Hao hụt chuẩn', 'Hao hụt thực tế', 'Chênh lệch', 'Người phụ trách', ...comparison, 'Trạng thái'] },
    alertRows: [['Cam', 'Hao hụt chế biến vượt chuẩn hoặc thiếu dữ liệu mẻ', 'Trưởng sản xuất', 'Bổ sung đầu vào/đầu ra và lý do hao hụt']],
    taskRows: [['Sản xuất', 'Giải trình mẻ vượt hao hụt', 'Trưởng sản xuất', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có dữ liệu sản xuất/sơ chế.',
    noPermissionState: 'Vai trò hiện tại không được xem sản xuất BTT.'
  },
  '/kho-bep-trung-tam/ton-kho-hao-hut': {
    path: '/kho-bep-trung-tam/ton-kho-hao-hut',
    focus: 'Kiểm tồn BTT, xuất BTT cho cửa hàng, hủy BTT thật và lệch tồn.',
    kpiCodes: ['KH001', 'KH002', 'KH003', 'KH004', 'TT001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TOP_LIST'],
    table: { title: 'Bảng XNT BTT', headers: ['Mã hàng', 'Tên hàng', 'ĐVT', 'Tồn đầu', 'Nhập NCC', 'Xuất cửa hàng', 'Hủy BTT', 'Tồn lý thuyết', 'Tồn thực tế', 'Chênh lệch', 'Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', ...comparison, 'Trạng thái'] },
    alertRows: [['Đỏ', 'BTT xuất nhưng cửa hàng chưa xác nhận hoặc tồn âm BTT', 'Kế toán kho/BTT', 'Đối chiếu phiếu xuất và xác nhận cửa hàng']],
    taskRows: [['BTT', 'Đối chiếu xuất BTT cho cửa hàng', 'Kế toán kho', 'Hôm nay', 'Đỏ']],
    emptyState: 'Chưa có dữ liệu tồn kho BTT.',
    noPermissionState: 'Vai trò hiện tại không được xem tồn kho BTT.'
  },
  '/tai-chinh/tong-quan': {
    path: '/tai-chinh/tong-quan',
    focus: 'Tổng hợp thu, chi, công nợ, dòng tiền và chứng từ thiếu.',
    kpiCodes: ['TM001', 'CP001', 'CP002', 'CN001', 'CN002', 'BC002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng tổng quan tài chính', headers: ['Ngày', 'Loại nghiệp vụ', 'Nhóm khoản mục', 'Số tiền', 'Chứng từ', ...comparison, 'Trạng thái'] },
    alertRows: [['Cam', 'Chi chưa phân loại, công nợ quá hạn hoặc thiếu chứng từ', 'Kế toán tài chính', 'Bổ sung chứng từ/nhóm khoản mục']],
    taskRows: [['Tài chính', 'Rà chi chưa phân loại và công nợ', 'Kế toán tài chính', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có dữ liệu tài chính.',
    noPermissionState: 'Vai trò hiện tại không được xem tổng quan tài chính.'
  },
  '/tai-chinh/dong-tien': {
    path: '/tai-chinh/dong-tien',
    focus: 'Theo dõi tiền đầu kỳ, tiền vào, tiền ra và tiền cuối kỳ.',
    kpiCodes: ['TM001', 'CP001', 'CP002', 'CN001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'TREND_CHART', 'BAR_CHART'],
    table: { title: 'Bảng dòng tiền', headers: ['Ngày', 'Nhóm thu/chi', 'Số tiền', 'Tỷ trọng', ...comparison, 'Xu hướng', 'Trạng thái'] },
    alertRows: [['Cam', 'Dòng tiền âm, chi lớn bất thường hoặc thiếu chứng từ', 'Kế toán tài chính', 'Đối chiếu sổ quỹ']],
    taskRows: [['Dòng tiền', 'Kiểm chứng từ chi lớn', 'Kế toán tài chính', 'Hôm nay', 'Cam']],
    emptyState: 'Chưa có dữ liệu dòng tiền.',
    noPermissionState: 'Vai trò hiện tại không được xem dòng tiền.'
  },
  '/tai-chinh/can-doi': {
    path: '/tai-chinh/can-doi',
    focus: 'Cân đối tiền, tồn kho, phải thu, phải trả.',
    kpiCodes: ['TM001', 'KH003', 'CN001', 'CN002', 'TT001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng cân đối rút gọn', headers: ['Nhóm tài sản/công nợ', 'Giá trị', 'Ghi chú', ...comparison, 'Trạng thái'] },
    alertRows: [['Cam', 'Công nợ quá hạn hoặc số dư cần rà', 'Kế toán tài chính', 'Đối chiếu công nợ/tồn kho']],
    taskRows: [['Cân đối', 'Rà nhóm công nợ/tài sản cảnh báo', 'Kế toán tài chính', 'Tuần này', 'Cam']],
    emptyState: 'Chưa có dữ liệu cân đối.',
    noPermissionState: 'Vai trò hiện tại không được xem cân đối.'
  },
  '/tai-chinh/du-toan': {
    path: '/tai-chinh/du-toan',
    focus: 'Dự toán doanh thu, chi phí, công nợ cần trả và số dư dự kiến.',
    kpiCodes: ['DT001', 'CP001', 'CN001', 'LN003'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'TREND_CHART'],
    table: { title: 'Bảng dự toán', headers: ['Kỳ dự toán', 'Doanh thu dự kiến', 'Chi dự kiến', 'Công nợ đến hạn', 'Số dư đầu kỳ', 'Số dư cuối kỳ dự kiến', 'Chênh lệch thực tế/dự toán', 'Cảnh báo thiếu tiền'] },
    alertRows: [['Cam', 'Dự toán thiếu tiền hoặc độ tin cậy thấp', 'Kế toán tài chính', 'Cập nhật giả định dự toán']],
    taskRows: [['Dự toán', 'Rà số dư dự kiến và công nợ đến hạn', 'Kế toán tài chính', 'Tuần này', 'Cam']],
    emptyState: 'Chưa có dữ liệu dự toán.',
    noPermissionState: 'Vai trò hiện tại không được xem dự toán.'
  },
  '/luong-nhan-su/cham-cong': {
    path: '/luong-nhan-su/cham-cong',
    focus: 'Theo dõi công, ca làm, đi trễ, nghỉ và xác nhận công.',
    kpiCodes: ['NS001', 'LN002', 'NV001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng chấm công', headers: ['Nhân viên', 'Vai trò', 'Ngày', 'Ca', 'Giờ công', 'Đi trễ', ...comparison, 'Trạng thái'] },
    alertRows: [['Vàng', 'Thiếu công hoặc cần xác nhận ca', 'Quản lý cửa hàng/Kế toán lương', 'Xác nhận công trước chốt lương']],
    taskRows: [['Chấm công', 'Xác nhận công thiếu', 'Kế toán lương', 'Tuần này', 'Vàng']],
    emptyState: 'Chưa có dữ liệu chấm công.',
    noPermissionState: 'Vai trò hiện tại không được xem chấm công.'
  },
  '/luong-nhan-su/tam-ung-thuong-phat': {
    path: '/luong-nhan-su/tam-ung-thuong-phat',
    focus: 'Theo dõi tạm ứng, thưởng, phạt và trạng thái duyệt.',
    kpiCodes: ['NS002', 'NS003', 'LN002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng tạm ứng / thưởng phạt', headers: ['Nhân viên', 'Loại khoản', 'Số tiền', 'Lý do', 'Người duyệt', ...comparison, 'Trạng thái'] },
    alertRows: [['Vàng', 'Khoản thưởng/phạt chờ duyệt hoặc tạm ứng chưa trừ', 'Kế toán lương/CEO', 'Duyệt hoặc ghi chú trước chốt lương']],
    taskRows: [['Lương', 'Rà khoản chờ duyệt', 'Kế toán lương', 'Tuần này', 'Vàng']],
    emptyState: 'Chưa có dữ liệu tạm ứng/thưởng phạt.',
    noPermissionState: 'Vai trò hiện tại không được xem thưởng phạt.'
  },
  '/luong-nhan-su/bang-luong': {
    path: '/luong-nhan-su/bang-luong',
    focus: 'Theo dõi lương tạm tính, khấu trừ, thực nhận và duyệt lương.',
    kpiCodes: ['NS001', 'NS002', 'NS003', 'LN002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Bảng lương', headers: ['Nhân viên', 'Vai trò', 'Số công', 'Lương cơ bản', 'Phụ cấp', 'Thưởng', 'Tạm ứng', 'Khấu trừ', 'Thực nhận', ...comparison, 'Trạng thái duyệt'] },
    alertRows: [['Cam', 'Bảng lương thiếu công hoặc chưa duyệt', 'Kế toán lương/CEO', 'Bổ sung công và trình duyệt']],
    taskRows: [['Lương', 'Rà bảng lương trước duyệt', 'Kế toán lương', 'Cuối kỳ', 'Cam']],
    emptyState: 'Chưa có dữ liệu bảng lương.',
    noPermissionState: 'Vai trò hiện tại không được xem bảng lương.'
  },
  '/bao-cao-quan-tri/ngay': {
    path: '/bao-cao-quan-tri/ngay',
    focus: 'Báo cáo ngày gồm doanh thu, tiền, kho, cảnh báo, task và điều kiện chốt ngày.',
    kpiCodes: ['BC001', 'BC002', 'DQ001', 'DT001', 'TM001', 'HH001', 'CB001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST'],
    table: { title: 'Báo cáo ngày', headers: ['Ngày', 'Cửa hàng', 'Doanh thu', 'Tiền thực nhận', 'Hàng hủy', 'Cảnh báo đỏ', 'Trạng thái', 'Lý do thiếu dữ liệu'] },
    alertRows: [['Đỏ', 'Báo cáo ngày chưa đủ dữ liệu phải chốt có ngoại lệ', 'Kế toán', 'Ghi nguyên nhân và hạn bổ sung']],
    taskRows: [['Báo cáo ngày', 'Rà điều kiện chốt ngày', 'Kế toán tổng hợp', 'Cuối ngày', 'Đỏ/Cam']],
    emptyState: 'Chưa có dữ liệu báo cáo ngày.',
    noPermissionState: 'Vai trò hiện tại không được xem báo cáo ngày.'
  },
  '/bao-cao-quan-tri/tuan': {
    path: '/bao-cao-quan-tri/tuan',
    focus: 'Báo cáo tuần cho CEO: P&L, dòng tiền, kho, công nợ, dự toán và top vấn đề.',
    kpiCodes: ['BC001', 'BC002', 'DQ001', 'LN003', 'LN001', 'LN002', 'CN001'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST', 'TOP_LIST'],
    table: { title: 'Báo cáo tuần', headers: ['Tuần', 'Doanh thu', 'Giá vốn', 'Food cost', 'Labor cost', 'Lợi nhuận tạm tính', 'Cảnh báo CEO', 'Trạng thái gửi', 'Lý do thiếu dữ liệu'] },
    alertRows: [['Đỏ', 'Task đỏ, thiếu nguồn chính hoặc thiếu chứng từ sẽ chặn chốt sạch', 'Kế toán tổng hợp', 'Xử lý hoặc ghi ngoại lệ']],
    taskRows: [['Báo cáo tuần', 'Rà P&L/kho/công nợ trước khi gửi CEO', 'Kế toán tổng hợp', 'Cuối tuần', 'Đỏ/Cam']],
    emptyState: 'Chưa có dữ liệu báo cáo tuần.',
    noPermissionState: 'Vai trò hiện tại không được xem báo cáo tuần.'
  },
  '/bao-cao-quan-tri/thang': {
    path: '/bao-cao-quan-tri/thang',
    focus: 'Báo cáo tháng về kết quả kinh doanh, dòng tiền, kho, nhân sự và data quality.',
    kpiCodes: ['BC001', 'BC002', 'DQ001', 'DT001', 'LN003', 'LN001', 'LN002'],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST'],
    table: { title: 'Báo cáo tháng', headers: ['Tháng', 'Doanh thu', 'Chi phí', 'Lợi nhuận', 'Dòng tiền', 'Thất thoát', 'Đánh giá', 'Lý do thiếu dữ liệu'] },
    alertRows: [['Cam', 'Báo cáo tháng cần rà food cost, labor cost và dữ liệu thiếu', 'Kế toán tổng hợp', 'Hoàn thiện trước gửi CEO']],
    taskRows: [['Báo cáo tháng', 'Rà bộ số tháng và ngoại lệ', 'Kế toán tổng hợp', 'Cuối tháng', 'Cam']],
    emptyState: 'Chưa có dữ liệu báo cáo tháng.',
    noPermissionState: 'Vai trò hiện tại không được xem báo cáo tháng.'
  },
  '/tai-lieu/quy-trinh-checklist': {
    path: '/tai-lieu/quy-trinh-checklist',
    focus: 'Tra cứu quy trình và checklist theo nghiệp vụ.',
    kpiCodes: ['DQ002', 'BC002'],
    displayTypes: ['DATA_TABLE', 'RIGHT_PANEL'],
    table: { title: 'Danh sách quy trình & checklist', headers: ['Tên tài liệu', 'Module', 'Vai trò', 'Phiên bản', 'Trạng thái', 'Link mở'] },
    alertRows: [['Vàng', 'Tài liệu hết hiệu lực cần cập nhật', 'Admin', 'Rà version tài liệu']],
    taskRows: [['Tài liệu', 'Cập nhật checklist hết hiệu lực', 'Admin', 'Tháng này', 'Vàng']],
    emptyState: 'Chưa có danh mục tài liệu.',
    noPermissionState: 'Vai trò hiện tại không được xem tài liệu.'
  },
  '/tai-lieu/tinh-huong-phat-sinh': {
    path: '/tai-lieu/tinh-huong-phat-sinh',
    focus: 'Tra cứu tình huống phát sinh và cách xử lý đã duyệt.',
    kpiCodes: ['CB001', 'BC002'],
    displayTypes: ['DATA_TABLE', 'RIGHT_PANEL'],
    table: { title: 'Tình huống phát sinh', headers: ['Tình huống', 'Module', 'Mức độ', 'Cách xử lý', 'Khi nào báo CEO', 'Link tài liệu'] },
    alertRows: [['Vàng', 'Tình huống đỏ cần có điều kiện báo CEO rõ', 'Admin/CEO', 'Bổ sung quy định xử lý']],
    taskRows: [['Tài liệu', 'Rà tình huống thiếu hướng dẫn', 'Admin', 'Tháng này', 'Vàng']],
    emptyState: 'Chưa có tình huống phát sinh.',
    noPermissionState: 'Vai trò hiện tại không được xem tài liệu.'
  },
  '/tai-lieu/bieu-mau-bao-cao-mau': {
    path: '/tai-lieu/bieu-mau-bao-cao-mau',
    focus: 'Tra cứu biểu mẫu và báo cáo mẫu.',
    kpiCodes: ['BC001', 'BC002'],
    displayTypes: ['DATA_TABLE', 'RIGHT_PANEL'],
    table: { title: 'Biểu mẫu & báo cáo mẫu', headers: ['Tên biểu mẫu', 'Dùng khi nào', 'Module', 'Người dùng', 'Phiên bản', 'Link tải/mở'] },
    alertRows: [['Vàng', 'Biểu mẫu thiếu cập nhật cần rà version', 'Admin', 'Cập nhật biểu mẫu']],
    taskRows: [['Tài liệu', 'Rà biểu mẫu cũ', 'Admin', 'Tháng này', 'Vàng']],
    emptyState: 'Chưa có biểu mẫu.',
    noPermissionState: 'Vai trò hiện tại không được xem biểu mẫu.'
  },
  '/he-thong/nguoi-dung-phan-quyen': {
    path: '/he-thong/nguoi-dung-phan-quyen',
    focus: 'Quản lý user, role và quyền xem/sửa/chốt.',
    kpiCodes: ['HT001', 'CB001'],
    displayTypes: ['DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Người dùng & phân quyền', headers: ['Người dùng', 'Vai trò', 'Quyền xem', 'Quyền sửa', 'Quyền chốt', 'Trạng thái'] },
    alertRows: [['Đỏ', 'Role nhạy cảm phải giới hạn dữ liệu lợi nhuận và hệ thống', 'Admin', 'Rà ma trận quyền']],
    taskRows: [['Hệ thống', 'Rà user/role đang hoạt động', 'Admin', 'Tháng này', 'Cam']],
    emptyState: 'Chưa có danh mục người dùng.',
    noPermissionState: 'Chỉ CEO/Admin được xem phân quyền.'
  },
  '/he-thong/cua-hang-kho': {
    path: '/he-thong/cua-hang-kho',
    focus: 'Quản lý cửa hàng, kho, BTT và người phụ trách.',
    kpiCodes: ['HT002', 'KH004'],
    displayTypes: ['DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Cửa hàng & kho', headers: ['Mã cửa hàng/kho', 'Tên', 'Loại', 'Người phụ trách', 'Trạng thái'] },
    alertRows: [['Cam', 'Kho/cửa hàng thiếu người phụ trách sẽ ảnh hưởng task', 'Admin', 'Cập nhật master data']],
    taskRows: [['Hệ thống', 'Rà cửa hàng/kho thiếu phụ trách', 'Admin', 'Tháng này', 'Cam']],
    emptyState: 'Chưa có danh mục cửa hàng/kho.',
    noPermissionState: 'Chỉ CEO/Admin được xem cửa hàng/kho.'
  },
  '/he-thong/danh-muc-nen': {
    path: '/he-thong/danh-muc-nen',
    focus: 'Quản lý NVL, món bán, định mức, NCC, nhóm chi phí, ngưỡng cảnh báo.',
    kpiCodes: ['DM001', 'KH003', 'HT002'],
    displayTypes: ['DATA_TABLE', 'ALERT_CARD'],
    table: { title: 'Danh mục nền', headers: ['Loại danh mục', 'Mã', 'Tên', 'ĐVT', 'Giá vốn', 'Trạng thái', 'Ngày cập nhật'] },
    alertRows: [['Cam', 'NVL thiếu giá vốn/món thiếu định mức sẽ làm sai dashboard', 'Admin/Kế toán', 'Cập nhật danh mục nền']],
    taskRows: [['Hệ thống', 'Rà NVL/món/NCC thiếu thông tin', 'Admin', 'Tuần này', 'Cam']],
    emptyState: 'Chưa có danh mục nền.',
    noPermissionState: 'Chỉ CEO/Admin được xem danh mục nền.'
  }
};

export function getSubtabDashboardSpec(page: OptionCPage): SubtabDashboardSpec {
  return SPECS[page.path] ?? {
    path: page.path,
    focus: page.description,
    kpiCodes: [],
    displayTypes: ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'RIGHT_PANEL'],
    table: { title: 'Bảng dữ liệu chính', headers: ['Nguồn', 'Trạng thái', 'Kỳ trước', 'Chênh lệch', '% thay đổi'] },
    alertRows: [['Cần đối chiếu', 'Kiểm tra nguồn dữ liệu và trạng thái xử lý', 'Người phụ trách module', 'Cập nhật ghi chú xử lý']],
    taskRows: [['Module', 'Rà dữ liệu và cảnh báo', 'Kế toán', 'Hôm nay', 'Vàng']],
    emptyState: 'Chưa có dữ liệu cho màn hình này.',
    noPermissionState: 'Vai trò hiện tại không được xem màn hình này.'
  };
}

export function dashboardReportRequiredColumns() {
  return [
    'report_id',
    'ky_bao_cao',
    'ngay_cap_nhat',
    'module',
    'sub_module',
    'metric_key',
    'metric_name',
    'gia_tri',
    'don_vi',
    'chu_ky',
    'so_sanh_ky_truoc',
    'muc_canh_bao',
    'display_type',
    'display_order',
    'nguon_sheet',
    'nguon_du_lieu',
    'hanh_dong_de_xuat',
    'nguoi_phu_trach',
    'trang_thai',
    'link_chi_tiet',
    'updated_at'
  ];
}
