import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, '.gstack', 'qa-reports');
const reportPath = path.join(reportDir, 'erp-mini-master-qa.md');

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

const checks = [];

function check(category, label, condition, fix) {
  checks.push({ category, label, ok: Boolean(condition), fix });
}

function includesAll(content, values) {
  return values.every((value) => content.includes(value));
}

function matchAll(content, regex) {
  return [...content.matchAll(regex)].map((match) => match[1]);
}

const navigation = read('src/components/layout/navigation.ts');
const catalog = read('src/lib/option-c/catalog.ts');
const subtabSpec = read('src/lib/option-c/subtab-dashboard-spec.ts');
const rbac = read('src/lib/rbac/rbac.ts');
const optionCPage = read('app/[...optionCSlug]/page.tsx');
const reportClose = read('src/lib/option-c/report-close.ts');
const reportClosePanel = read('src/components/option-c/ReportClosePanel.tsx');
const moduleTables = read('src/lib/option-c/module-dashboard-tables.ts');
const sheetMapping = read('src/lib/option-c/sheet-mapping.ts');
const sheetNames = read('src/lib/google-sheets/sheet-names.ts');
const schema = read('src/lib/google-sheets/schema.ts');
const parser = read('src/lib/import/parsers/v7-parsers.ts');
const optionCModule = read('src/components/option-c/OptionCModulePage.tsx');
const overview = read('src/components/option-c/OptionCOverviewPage.tsx');
const tasksPage = read('src/components/option-c/AccountingTasksPage.tsx');
const importPage = read('app/import-nhap-lieu/page.tsx');
const batchUpload = read('src/components/forms/BatchUploadMock.tsx');
const appUsers = read('src/lib/auth/app-users.ts');
const authCheck = read('app/api/auth/check/route.ts');
const userApi = read('app/api/users/route.ts');
const userUi = read('src/components/system/UserManagementClient.tsx');

const expectedGroups = [
  'TỔNG QUAN KẾ TOÁN',
  'NHIỆM VỤ KẾ TOÁN',
  'NHẬP LIỆU & DỮ LIỆU',
  'DOANH THU',
  'KHO CỬA HÀNG',
  'KHO BẾP TRUNG TÂM',
  'TÀI CHÍNH',
  'LƯƠNG & NHÂN SỰ',
  'BÁO CÁO QUẢN TRỊ',
  'TÀI LIỆU',
  'HỆ THỐNG'
];

const expectedPages = [
  '/tong-quan-ke-toan',
  '/nhiem-vu-ke-toan/viec-hom-nay',
  '/nhiem-vu-ke-toan/viec-qua-han',
  '/nhiem-vu-ke-toan/viec-cho-xac-nhan',
  '/nhap-lieu/upload',
  '/nhap-lieu/lich-su-import',
  '/nhap-lieu/du-lieu-loi-thieu',
  '/doanh-thu/tien-mat',
  '/doanh-thu/chuyen-khoan',
  '/doanh-thu/app-giao-hang',
  '/kho-cua-hang/ton-kho',
  '/kho-cua-hang/hang-huy-hu',
  '/kho-cua-hang/cong-thuc-dinh-muc',
  '/kho-bep-trung-tam/nhap-ncc',
  '/kho-bep-trung-tam/san-xuat-cong-thuc',
  '/kho-bep-trung-tam/ton-kho-hao-hut',
  '/tai-chinh/tong-quan',
  '/tai-chinh/dong-tien',
  '/tai-chinh/can-doi',
  '/tai-chinh/du-toan',
  '/luong-nhan-su/cham-cong',
  '/luong-nhan-su/tam-ung-thuong-phat',
  '/luong-nhan-su/bang-luong',
  '/bao-cao-quan-tri/ngay',
  '/bao-cao-quan-tri/tuan',
  '/bao-cao-quan-tri/thang',
  '/tai-lieu/quy-trinh-checklist',
  '/tai-lieu/tinh-huong-phat-sinh',
  '/tai-lieu/bieu-mau-bao-cao-mau',
  '/he-thong/nguoi-dung-phan-quyen',
  '/he-thong/cua-hang-kho',
  '/he-thong/danh-muc-nen'
];

const optionCSheets = [
  '01_CONFIG_MASTER',
  '02_DM_CONG_THUC_DINH_MUC',
  '03_IMPORT_LOG_SYSTEM_LOG',
  '04_DATA_DOANH_THU',
  '05_DATA_SO_QUY',
  '06_DATA_CONG_NO',
  '07_DATA_NHAN_SU_LUONG',
  '08_DATA_KHO_CUA_HANG',
  '09_DATA_KHO_BTT',
  '10_DATA_XUAT_BTT_CUA_HANG',
  '11_DATA_HANG_HUY_KIEM_KE',
  '12_CALC_TON_KHO',
  '13_CALC_HAO_HUT_THAT_THOAT',
  '14_CALC_TAI_CHINH_DU_TOAN',
  '15_DASHBOARD_REPORT'
];

const navHrefs = matchAll(navigation, /href: '([^']+)'/g);
const catalogPaths = matchAll(catalog, /path: '([^']+)'/g);

check('Sidebar', 'Có đúng 11 nhóm sidebar chính', expectedGroups.every((group) => navigation.includes(group)), 'Giữ đúng 11 nhóm, không thêm cảnh báo/AI/đối soát thành nhóm riêng.');
check('Sidebar', 'Có đủ 32 màn hình/tab con Option C', expectedPages.every((href) => navHrefs.includes(href) && catalogPaths.includes(href)), 'Bổ sung route vào navigation và OPTION_C_PAGES.');
check('Sidebar', 'Không tạo tab riêng cho Cảnh báo/Đối soát/AI/Data Quality', !["label: 'Cảnh báo'", "label: 'Đối soát'", "label: 'AI nội bộ'", "label: 'Data Quality Score'"].some((text) => navigation.includes(text)), 'Đưa cảnh báo/task/data quality vào dashboard hoặc task list.');

check('Dashboard spec', 'Mỗi màn hình Option C có dashboard spec', expectedPages.every((href) => subtabSpec.includes(`'${href}'`)), 'Thêm spec cho màn hình còn thiếu trong subtab-dashboard-spec.ts.');
check('Dashboard spec', 'Spec có KPI/bảng/cảnh báo/task/right panel/no-permission', includesAll(subtabSpec, ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST', 'RIGHT_PANEL', 'emptyState', 'noPermissionState']), 'Chuẩn hóa spec theo blueprint dashboard từng tab.');
check('Dashboard spec', 'Dashboard chính có Data Quality, task, báo cáo đến hạn, điều kiện chốt', includesAll(overview, ['Data Quality', 'Nhiệm vụ kế toán hôm nay', 'Báo cáo đến hạn', 'Điều kiện chốt']), 'Trang tổng quan phải là cockpit điều hành, không phải trang chào mừng.');

check('Data contract', 'Option C giới hạn 15 Google Sheets lõi', optionCSheets.every((sheet) => sheetNames.includes(sheet) && schema.includes(sheet)), 'Bổ sung sheet thiếu hoặc bỏ sheet ngoài V1 nếu không dùng vận hành.');
check('Data contract', '15_DASHBOARD_REPORT có cột dashboard bắt buộc', includesAll(schema, ['report_id', 'metric_key', 'display_type', 'display_order', 'nguon_sheet', 'nguoi_phu_trach', 'link_chi_tiet']), 'Bổ sung cột còn thiếu trong schema.');
check('Data contract', 'Module tables có so sánh kỳ trước và doanh thu theo kênh', includesAll(moduleTables, ['Kỳ trước', 'Chênh lệch', '% thay đổi', 'Offline', 'Grab', 'ShopeeFood', 'BeFood', 'Xanh', 'AOV', 'Tỷ trọng %']), 'Bổ sung bảng so sánh và tách kênh doanh thu.');

check('Kho/BTT', 'Xuất Hủy được hiểu là BTT xuất cho cửa hàng', includesAll(parser, ["filename.includes('xuat huy')", 'DL_XUAT_BTT_CHO_CUA_HANG']) && includesAll(sheetMapping, ['DL_XUAT_BTT_CHO_CUA_HANG', 'DATA_XUAT_BTT_CUA_HANG']), 'Không đưa file Xuất Hủy vào hàng hủy/hư.');
check('Kho/BTT', 'Hàng hủy thật được tách khỏi xuất BTT', includesAll(sheetMapping, ['DL_HUY_HANG_CUA_HANG', 'DATA_HANG_HUY_KIEM_KE']), 'Giữ waste thật ở sheet 11, xuất BTT ở sheet 10.');
check('Kho/BTT', 'Tồn kho có giá trị thất thoát và tỷ lệ thất thoát', includesAll(moduleTables, ['Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)']), 'Bổ sung cột thất thoát vào XNT kho cửa hàng/BTT.');

check('Import', 'Import có preview/dry-run, lỗi dòng, rollback/log', includesAll(importPage, ['Batch upload', 'Hoàn tác import', 'Lịch sử gần nhất']) && includesAll(batchUpload, ['multiple', 'Kiểm tra preview', 'Import vào Google Sheet', 'Tải file lỗi', 'importableFiles']) && includesAll(schema, ['03_IMPORT_LOG_SYSTEM_LOG']), 'Import thật phải có preview trước khi ghi và lịch sử để rollback.');
check('Report close', 'Chốt báo cáo có ngoại lệ khi thiếu dữ liệu', includesAll(reportClose, ['REPORT_CLOSE_EXCEPTION_REQUIRED', 'missingDataReason', 'responsibleOwner', 'supplementDueDate', 'ĐÃ CHỐT CÓ NGOẠI LỆ']) && includesAll(reportClosePanel, ['Lý do chốt thiếu', 'Nguyên nhân thiếu dữ liệu', 'Người chịu trách nhiệm', 'Hạn bổ sung']), 'Không cho chốt sạch khi còn thiếu dữ liệu/cảnh báo đỏ.');

check('RBAC', 'Route Option C tự kiểm quyền theo PAGE_PERMISSIONS', includesAll(optionCPage, ['PAGE_PERMISSIONS', 'getRoleFromServerCookies', 'canRole', 'NoPermission']), 'Không chỉ ẩn sidebar; route nhập trực tiếp cũng phải bị chặn.');
check('RBAC', 'Mọi page Option C có permission mapping', expectedPages.every((href) => rbac.includes(`'${href}'`)), 'Thêm route còn thiếu vào PAGE_PERMISSIONS.');
check('RBAC', 'Role nhạy cảm không xem P&L/lương/hệ thống nếu thiếu quyền', includesAll(rbac, ['view_pnl', 'view_payroll', 'view_settings', 'Quản lý cửa hàng']) && rbac.includes("view_pnl: FULL_FINANCE_ROLES"), 'Giới hạn lợi nhuận, lương và hệ thống cho CEO/Kế toán/Admin.');
check('User management', 'Tài khoản app được lưu hash và không hiện mật khẩu', includesAll(appUsers, ['APP_USER', 'hashPassword', 'verifyPassword', 'passwordHash', 'pbkdf2_sha256']) && !userUi.includes('passwordHash'), 'Quản lý user phải lưu hash một chiều, không trả hoặc render hash/mật khẩu.');
check('User management', 'Đăng nhập ưu tiên tài khoản trong app và giữ env rescue fallback', includesAll(authCheck, ['validateAppUserLogin', "mode: userLogin.ok ? 'app_user' : 'basic_auth'", "runtime = 'nodejs'"]), 'Giữ tài khoản Vercel làm đường cứu hộ, nhưng vận hành bằng tài khoản trong app.');
check('User management', 'API quản lý người dùng chỉ cho CEO/Admin', includesAll(userApi, ["requireApiPermission(request, 'view_settings')", "requireApiPermission(request, 'manage_settings')", 'upsertAppUser']), 'GET/POST user phải đi qua quyền hệ thống.');

check('Tài liệu', 'Tài liệu là module tra cứu riêng, không lẫn đối soát dữ liệu', includesAll(subtabSpec, ['Danh sách quy trình & checklist', 'Tình huống phát sinh', 'Biểu mẫu & báo cáo mẫu']) && !subtabSpec.includes("'/tai-lieu/quy-trinh-checklist': {\n    path: '/tai-lieu/quy-trinh-checklist',\n    focus: 'Đối soát"), 'Tab Tài liệu phải tập trung tài liệu, checklist, biểu mẫu và AI có trích nguồn.');
check('Task', 'Nhiệm vụ kế toán có hôm nay/quá hạn/chờ xác nhận', includesAll(tasksPage, ['Việc hôm nay', 'Việc quá hạn', 'Việc chờ xác nhận']) || includesAll(catalog, ['viec-hom-nay', 'viec-qua-han', 'viec-cho-xac-nhan']), 'Task phải có owner, deadline, mức độ và trạng thái.');
check('Module UX', 'Mỗi module hiển thị bảng chính, việc cần xử lý, nguồn dữ liệu, tài liệu/AI', includesAll(optionCModule, ['mainTable.title', 'Việc cần xử lý trong module', 'Nguồn dữ liệu', 'Tài liệu / AI', 'Hỏi AI nội bộ']), 'Module phải đủ nơi xem số liệu, cảnh báo/task và tài liệu liên quan.');

const failed = checks.filter((item) => !item.ok);
const lines = [
  '# QA tổng thể ERP mini kế toán',
  '',
  `Thời gian chạy: ${new Date().toISOString()}`,
  `Kết quả: ${checks.length - failed.length}/${checks.length} kiểm tra đạt`,
  failed.length ? 'Trạng thái: CHƯA ĐẠT' : 'Trạng thái: ĐẠT',
  '',
  '| Nhóm | Kiểm tra | Kết quả | Cách sửa nếu lỗi |',
  '|---|---|---|---|',
  ...checks.map((item) => `| ${item.category} | ${item.label} | ${item.ok ? 'Đạt' : 'Lỗi'} | ${item.ok ? '' : item.fix} |`)
];

fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);

if (failed.length) {
  console.error(`QA master failed: ${failed.length}/${checks.length} checks failed.`);
  for (const item of failed) console.error(`- [${item.category}] ${item.label}: ${item.fix}`);
  console.error(`Report written to ${reportPath}`);
  process.exit(1);
}

console.log(`QA master passed: ${checks.length}/${checks.length} checks. Report written to ${reportPath}`);
