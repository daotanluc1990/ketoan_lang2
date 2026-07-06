import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredRoutes = [
  'app/[...optionCSlug]/page.tsx',
  'app/tong-quan/page.tsx',
  'app/tong-quan/ceo-cfo/page.tsx',
  'app/ban-lam-viec-ke-toan/page.tsx',
  'app/import-nhap-lieu/page.tsx',
  'app/pl-tuan/page.tsx',
  'app/dong-tien/page.tsx',
  'app/can-doi/page.tsx',
  'app/du-toan/page.tsx',
  'app/kho-cua-hang/page.tsx',
  'app/kho-bep-trung-tam/page.tsx',
  'app/doi-chieu-btt-cua-hang/page.tsx',
  'app/hang-huy/page.tsx',
  'app/hao-hut-vuot-dinh-muc/page.tsx',
  'app/that-thoat-ton-kho/page.tsx',
  'app/dinh-muc-mon-ban/page.tsx',
  'app/cong-no/page.tsx',
  'app/cai-dat-bot/page.tsx',
  'app/lich-su-chot-bao-cao/page.tsx'
];
const requiredFiles = [
  'src/components/layout/Sidebar.tsx',
  'src/components/layout/FloatingAiButton.tsx',
  'src/components/layout/GlobalFilterBar.tsx',
  'src/components/layout/TopBar.tsx',
  'src/components/layout/PageHeader.tsx',
  'src/components/forms/BatchUploadMock.tsx',
  'src/components/report/MetricCard.tsx',
  'src/components/report/ReportTable.tsx',
  'src/components/dashboard/AccountingOverviewCompactPage.tsx',
  'src/components/option-c/OptionCOverviewPage.tsx',
  'src/components/option-c/ExecutiveOverviewPage.tsx',
  'src/components/option-c/AccountingTasksPage.tsx',
  'src/components/option-c/ReportManagementPage.tsx',
  'src/components/option-c/ReportClosePanel.tsx',
  'src/components/system/RuleFormulaSheetMapPage.tsx',
  'src/components/system/UserManagementPage.tsx',
  'src/components/system/UserManagementClient.tsx',
  'src/lib/auth/app-users.ts',
  'src/lib/option-c/subtab-dashboard-spec.ts',
  'src/lib/reports/management-report-engine.ts',
  'src/components/dashboard/V7ReportEnginePage.tsx',
  'src/components/dashboard/V7ModulePage.tsx'
];
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

for (const file of [...requiredRoutes, ...requiredFiles]) assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);

const navigation = read('src/components/layout/navigation.ts');
const pkg = JSON.parse(read('package.json'));
const designDoc = read('DESIGN.md');
for (const text of ['Accounting V3 Warm Operations', 'Saigon F&B Operations', 'Operations Control Room', 'Accounting Workbench Dense', 'Tables are the primary workspace', 'warm cream/yellow']) assert(designDoc.includes(text), `DESIGN.md missing ${text}`);
assert(pkg.scripts?.dev === 'next dev --webpack', 'Local dev must use webpack so /api routes and import preview match production');
assert([...navigation.matchAll(/\{ href:/g)].length >= 30, 'Navigation must expose compact Option C production tabs');
for (const text of ['TỔNG QUAN KẾ TOÁN', 'NHIỆM VỤ KẾ TOÁN', 'NHẬP LIỆU & DỮ LIỆU', 'BÁO CÁO QUẢN TRỊ', 'TÀI LIỆU']) assert(navigation.includes(text), `Navigation missing ${text}`);
for (const text of ['/tong-quan/ceo-cfo', '/nhiem-vu-ke-toan', '/bao-cao-quan-tri', '/kho-bep-trung-tam/ton-kho-hao-hut', '/he-thong/rule-formula-sheet-map']) assert(navigation.includes(text), `Navigation missing ${text}`);
assert(navigation.includes("label: 'CEO'") && !navigation.includes("label: 'CEO/CFO'"), 'Executive overview navigation label must stay CEO-only');
for (const forbidden of ["label: 'Cảnh báo'", "label: 'Đối soát'", "label: 'Data Quality Score'", "label: 'Hỏi AI nội bộ'", "label: 'Việc hôm nay'", "label: 'Việc quá hạn'", "label: 'Việc chờ xác nhận'", "label: 'Báo cáo ngày'", "label: 'Báo cáo tuần'", "label: 'Báo cáo tháng'"]) assert(!navigation.includes(forbidden), `Navigation must not create standalone tab ${forbidden}`);

const topBar = read('src/components/layout/TopBar.tsx');
assert(topBar.includes('h-[52px]'), 'TopBar must stay compact at 52px');
assert(topBar.includes('Import') && topBar.includes('Tài liệu'), 'TopBar must keep primary actions');

const appShell = read('src/components/layout/AppShell.tsx');
assert(appShell.includes('--sidebar-width') && appShell.includes('lg:pl-[var(--sidebar-width)]'), 'App shell must reserve desktop width for expanded/collapsed sidebar');
assert(appShell.includes('FloatingAiButton'), 'App shell must expose global floating AI');
const finalOverrides = read('src/styles/final-overrides.css');
assert(!finalOverrides.includes('padding-left: 60px !important'), 'Final overrides must not force desktop content under expanded sidebar');

const sidebar = read('src/components/layout/Sidebar.tsx');
for (const text of ['openGroups', 'toggleGroup', 'aria-expanded', 'ChevronDown']) assert(sidebar.includes(text), `Sidebar accordion missing ${text}`);

const pageHeader = read('src/components/layout/PageHeader.tsx');
assert(!pageHeader.includes('description}</p>'), 'PageHeader must not render long descriptions');
assert(pageHeader.includes('StatusBadge'), 'PageHeader must keep status badge');

const metric = read('src/components/report/MetricCard.tsx');
assert(metric.includes('compact'), 'MetricCard must support compact mode');
assert(!metric.includes('text-[26px]'), 'MetricCard must not use oversized old KPI values');
assert(metric.includes('border-red-200') && metric.includes('#F1D09B'), 'MetricCard must visibly distinguish danger/warning cards with V3 warm warning');

const table = read('src/components/report/ReportTable.tsx');
assert(table.includes('overflow-auto'), 'Tables must scroll internally');
assert(table.includes('text-[12px]'), 'Tables must remain dense');
assert(table.includes('visibleRows') && table.includes('dòng'), 'Tables must show row count and empty-state rows');

const batch = read('src/components/forms/BatchUploadMock.tsx');
assert(batch.includes('multiple'), 'Batch upload input must support multiple files');
assert(batch.includes('Kiểm tra batch'), 'Batch upload must keep dry-run action');
assert(batch.includes('Import vào Google Sheet') && batch.includes('importableFiles'), 'Batch upload must keep a clear partial-safe confirm action');
assert(batch.includes('UNAUTHORIZED') && batch.includes('FORBIDDEN'), 'Batch upload must explain auth/permission failures clearly');
for (const text of ['Tổng dòng', 'Dòng hợp lệ', 'Dòng mới', 'Trùng', 'Lệch', 'Lỗi', 'Dòng/Cột', 'Cột', 'Giá trị', 'Lý do']) assert(batch.includes(text), `Batch upload V3 preview table missing ${text}`);
for (const text of ['errorDetails', 'text/csv;charset=utf-8', 'import-loi-', 'Dòng/Cột', 'Lý do']) assert(batch.includes(text), `Batch upload detailed error export missing ${text}`);

const dataStore = read('src/lib/data-store/index.ts');
assert(dataStore.includes('READ_CACHE_TTL_MS') && dataStore.includes('clearReadCache'), 'Data store must keep short read cache and invalidate after writes');

const overview = read('src/components/option-c/OptionCOverviewPage.tsx');
for (const text of ['Tổng quan kế toán điều hành', 'Nhiệm vụ kế toán hôm nay', 'KPI Dictionary chỉ số lõi']) assert(overview.includes(text), `Option C overview missing ${text}`);
assert(overview.includes('15_DASHBOARD_REPORT'), 'Option C overview must mention the fast dashboard source');
for (const text of ['Điều kiện chốt', 'lg:flex-row', 'Nguồn thiếu', 'grid-cols-2', '/bao-cao-quan-tri?period=week', 'bg-[#FFFFFB]']) assert(overview.includes(text), `Overview close-condition panel must stay top compact PA2: ${text}`);

const accountingTasks = read('src/components/option-c/AccountingTasksPage.tsx');
for (const text of ['filterTabs', 'role="tablist"', "key: 'all'", "key: 'today'", "key: 'overdue'", "key: 'pending'", "key: 'red'", '/nhiem-vu-ke-toan?view=']) assert(accountingTasks.includes(text), `Accounting task page missing compact filter tab ${text}`);
assert(!accountingTasks.includes('StatusBadge'), 'Accounting task filter must look like tabs, not KPI cards with status badges');

const reportManagement = read('src/components/option-c/ReportManagementPage.tsx');
for (const text of ['switchTabs', 'role="tablist"', '/bao-cao-quan-tri?period=day', '/bao-cao-quan-tri?period=week', '/bao-cao-quan-tri?period=month', 'mode=exception', 'mode=history']) assert(reportManagement.includes(text), `Report management page missing compact report tabs ${text}`);
assert(!reportManagement.includes('StatusBadge'), 'Report switcher must look like tabs, not KPI cards with status badges');
for (const text of ['Trạng thái báo cáo cần chốt', 'So sánh kỳ trước', 'Nguồn cần có', 'Hành động đề xuất', 'Kỳ này', 'Kỳ trước', 'Chênh lệch', '% thay đổi']) assert(reportManagement.includes(text), `Report management V3 table missing ${text}`);
for (const text of ['buildManagementReportTables', 'Điều kiện chốt theo dữ liệu thật', 'Hành động cần xử lý']) assert(reportManagement.includes(text), `Report management real engine UI missing ${text}`);

const executiveOverview = read('src/components/option-c/ExecutiveOverviewPage.tsx');
for (const text of ['KPI_GROUP_ORDER', 'Cảnh báo', 'Hành động', 'Đề xuất', 'Data Quality', 'Dự toán và dòng tiền']) assert(executiveOverview.includes(text), `Executive overview missing ${text}`);
for (const text of ['h-[92px]', 'rounded-xl', 'bg-[#FFFFFB]', 'groupedKpis', 'KpiGroupFrame', 'xl:grid-cols-2', '2xl:grid-cols-5', 'xl:pr-24']) assert(executiveOverview.includes(text), `Executive overview grouped CEO KPI layout missing ${text}`);
assert(!executiveOverview.includes('>{kpi.code}</p>'), 'Executive KPI cards must show business names, not internal codes like DT001');
assert(!executiveOverview.includes('/nhap-lieu/upload'), 'Executive overview must not add import controls');
assert(!executiveOverview.includes('/bao-cao-quan-tri/tuan'), 'Executive overview must not add report close controls');

const optionCatalog = read('src/lib/option-c/catalog.ts');
for (const text of ['Tổng doanh thu tuần/tháng', 'Biên lợi nhuận vận hành', 'Dòng tiền hiện tại', 'Chênh lệch thực tế so với dự toán', 'Tổng chi cửa hàng', 'Tổng chi bếp trung tâm', 'Tỷ lệ chênh lệch thực tế so với dự toán']) assert(optionCatalog.includes(text), `CEO KPI catalog missing ${text}`);
for (const forbidden of ["'VND / %'", "'kg/cái/VND'"]) assert(!optionCatalog.includes(forbidden), `KPI catalog must not merge units in one card: ${forbidden}`);

const rbac = read('src/lib/rbac/rbac.ts');
assert(rbac.includes("view_executive_dashboard: ['CEO', 'Admin']"), 'Executive dashboard must be CEO/Admin only');
assert(rbac.includes("'/tong-quan/ceo-cfo': 'view_executive_dashboard'"), 'Executive dashboard direct URL must be protected');
assert(rbac.includes("'/nhiem-vu-ke-toan': 'view_tasks'") && rbac.includes("'/bao-cao-quan-tri': 'view_management_reports'"), 'Canonical compact task/report routes must be protected');
assert(rbac.includes("'/he-thong/rule-formula-sheet-map': 'view_settings'"), 'Rule/Formula/Sheet map direct URL must be protected');

const cashflow = read('app/dong-tien/page.tsx');
assert(!cashflow.includes('Chưa đủ dữ liệu dòng tiền'), 'Cashflow must not show large empty-state text');
assert(cashflow.includes('Bảng dòng tiền'), 'Cashflow must show compact table');
for (const text of ['P&L quản trị từ sổ quỹ', 'Dự toán / công nợ / thiếu tiền', 'Đơn vị', 'Dòng tiền hiện tại', 'Dòng tiền dự kiến', 'Mức thiếu tiền dự kiến']) assert(cashflow.includes(text), `Cashflow V3 finance table missing ${text}`);
for (const text of ['buildForecastReport', 'baseForecast', 'forecastShortage', 'debtDue']) assert(cashflow.includes(text), `Cashflow real forecast/debt engine missing ${text}`);

const importPage = read('app/import-nhap-lieu/page.tsx');
assert(importPage.includes('Batch upload'), 'Import page must prioritize batch upload');
assert(importPage.includes('Hoàn tác import'), 'Import page must include rollback');

const parser = read('src/lib/import/parsers/v7-parsers.ts');
assert(parser.includes("filename.includes('soquy')"), 'Parser must force SoQuy files to Sổ quỹ');
assert(parser.includes("SHEET_NAMES.DL_SO_QUY"), 'Parser must target DL_SO_QUY');
assert(parser.includes("filename.includes('congno')"), 'Parser must force Công nợ files to Công nợ');
assert(parser.includes("filename.includes('xuat huy')") && parser.includes('DL_XUAT_BTT_CHO_CUA_HANG'), 'Parser must treat Xuất Hủy as BTT export to stores');

const sheetNames = read('src/lib/google-sheets/sheet-names.ts');
for (const text of ['15_DASHBOARD_REPORT', '10_DATA_XUAT_BTT_CUA_HANG', '03_IMPORT_LOG_SYSTEM_LOG']) assert(sheetNames.includes(text), `Option C sheet missing ${text}`);

const schema = read('src/lib/google-sheets/schema.ts');
for (const text of ['15_DASHBOARD_REPORT', '10_DATA_XUAT_BTT_CUA_HANG', '03_IMPORT_LOG_SYSTEM_LOG']) assert(schema.includes(text), `Option C schema missing ${text}`);
for (const text of ['ngay_cap_nhat', 'sub_module', 'display_type', 'display_order', 'nguon_sheet', 'link_chi_tiet']) assert(schema.includes(text), `Dashboard report schema missing ${text}`);

const sheetMapping = read('src/lib/option-c/sheet-mapping.ts');
assert(sheetMapping.includes('DL_XUAT_BTT_CHO_CUA_HANG') && sheetMapping.includes('DATA_XUAT_BTT_CUA_HANG'), 'Sheet mapping must route BTT export into Option C transfer sheet');
assert(sheetMapping.includes('DL_HUY_HANG_CUA_HANG') && sheetMapping.includes('DATA_HANG_HUY_KIEM_KE'), 'Sheet mapping must keep real waste separate from BTT export');

const moduleTables = read('src/lib/option-c/module-dashboard-tables.ts');
for (const text of ['Offline', 'Grab', 'ShopeeFood', 'BeFood', 'Xanh', 'Số đơn', 'AOV', 'Tỷ trọng %']) assert(moduleTables.includes(text), `Revenue channel table missing ${text}`);
for (const text of ['Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', 'Kỳ trước', 'Chênh lệch', '% thay đổi']) assert(moduleTables.includes(text), `Module comparison table missing ${text}`);
for (const text of ['Sheet đích', 'Dòng hợp lệ', 'Dòng trùng', 'Cửa hàng nhận', 'Xác nhận CH', 'Dòng tiền hiện tại', 'Dòng tiền dự kiến', 'Tỷ lệ chênh lệch thực tế/dự toán (%)']) assert(moduleTables.includes(text), `V3 module table alias missing ${text}`);
for (const text of ['buildTheoreticalIngredientRows', 'theoreticalIngredientTable', 'NVL dùng từ số lượng bán x công thức']) assert(moduleTables.includes(text), `Formula-to-ingredient module table missing ${text}`);

const managementEngine = read('src/lib/reports/management-report-engine.ts');
for (const text of ['buildManagementReportTables', 'previousKey', 'comparisonRows', 'closeConditionRows', 'Dòng tiền hiện tại', 'Giá trị thất thoát định mức']) assert(managementEngine.includes(text), `Management report real period engine missing ${text}`);

const subtabSpec = read('src/lib/option-c/subtab-dashboard-spec.ts');
for (const text of ['/doanh-thu/tien-mat', '/doanh-thu/chuyen-khoan', '/doanh-thu/app-giao-hang', '/kho-cua-hang/ton-kho', '/kho-bep-trung-tam/ton-kho-hao-hut', '/tai-chinh/dong-tien', '/luong-nhan-su/bang-luong', '/he-thong/danh-muc-nen']) assert(subtabSpec.includes(text), `Subtab dashboard spec missing ${text}`);
for (const text of ['KPI_CARD', 'DATA_TABLE', 'ALERT_CARD', 'TASK_LIST', 'RIGHT_PANEL', 'dashboardReportRequiredColumns']) assert(subtabSpec.includes(text), `Subtab dashboard spec missing ${text}`);
for (const text of ['File thiếu cột', 'Chênh lệch tiền mặt', 'BTT xuất nhưng cửa hàng chưa xác nhận', 'NVL thiếu giá vốn', 'chốt có ngoại lệ']) assert(subtabSpec.includes(text), `Subtab dashboard spec missing business rule ${text}`);
for (const text of ['Tổng dòng', 'Dòng hợp lệ', 'Cửa hàng nhận', 'Xác nhận CH', 'Người xử lý', 'P&L', 'Dòng tiền hiện tại', 'Mức thiếu tiền dự kiến', 'Phải thu', 'Phải trả']) assert(subtabSpec.includes(text), `Subtab V3 checklist column missing ${text}`);

const optionCModule = read('src/components/option-c/OptionCModulePage.tsx');
for (const text of ['getSubtabDashboardSpec', 'Việc cần xử lý trong module', 'mainTable.title', 'RelatedActionsPanel']) assert(optionCModule.includes(text), `Option C module renderer missing ${text}`);
assert(!optionCModule.includes('Hỏi AI nội bộ'), 'Option C module renderer must not keep the old AI label inside work tables');
assert(optionCModule.includes('kpiByCode') && optionCModule.includes('slice(0, 12)'), 'Option C module renderer must keep ordered KPI cards and allow split-unit KPI pairs');

const relatedActions = read('src/components/option-c/RelatedActionsPanel.tsx');
for (const text of ['Tài liệu liên quan', 'Mở tài liệu', 'Tình huống']) assert(relatedActions.includes(text), `Related actions header missing ${text}`);
assert(!relatedActions.includes('/api/ai/report-analysis'), 'Related actions must not keep module-level AI call');

const ruleFormulaSheetMap = read('src/components/system/RuleFormulaSheetMapPage.tsx');
for (const text of ['Rule cảnh báo', 'Formula map', 'Google Sheet map', 'Tồn lý thuyết', '15_SYSTEM_LOG']) assert(ruleFormulaSheetMap.includes(text), `Rule/Formula/Sheet map page missing ${text}`);

const floatingAi = read('src/components/layout/FloatingAiButton.tsx');
for (const text of ['Trợ lý AI CEO', 'Hỏi tự do về dashboard', '/api/ai/report-analysis']) assert(floatingAi.includes(text), `Floating AI missing ${text}`);

const reportClosePanel = read('src/components/option-c/ReportClosePanel.tsx');
for (const text of ['Lý do chốt thiếu', 'Nguyên nhân thiếu dữ liệu', 'Người chịu trách nhiệm', 'Hạn bổ sung', 'Chốt có ngoại lệ']) assert(reportClosePanel.includes(text), `Report close panel missing ${text}`);
const reportClose = read('src/lib/option-c/report-close.ts');
for (const text of ['REPORT_CLOSE_EXCEPTION_REQUIRED', 'missingDataReason', 'responsibleOwner', 'supplementDueDate', 'ĐÃ CHỐT CÓ NGOẠI LỆ']) assert(reportClose.includes(text), `Report close engine missing ${text}`);

const appUsers = read('src/lib/auth/app-users.ts');
for (const text of ['hashPassword', 'verifyPassword', 'APP_USER', 'passwordHash', 'pbkdf2_sha256']) assert(appUsers.includes(text), `App user auth missing ${text}`);
const authCheck = read('app/api/auth/check/route.ts');
for (const text of ['validateAppUserLogin', 'mode: userLogin.ok ? \'app_user\' : \'basic_auth\'', 'runtime = \'nodejs\'']) assert(authCheck.includes(text), `Auth check must support app users and env rescue fallback: ${text}`);
const userApi = read('app/api/users/route.ts');
for (const text of ['requireApiPermission(request, \'manage_settings\')', 'upsertAppUser', 'listAppUsers']) assert(userApi.includes(text), `User API missing ${text}`);
const userUi = read('src/components/system/UserManagementClient.tsx');
for (const text of ['Danh sách tài khoản', 'Mật khẩu mới', 'Đang khóa', 'Tạm tắt']) assert(userUi.includes(text), `User management UI missing ${text}`);
assert(!userUi.includes('passwordHash'), 'User management UI must not render password hashes');

const v7Engines = read('src/lib/reports/v7/report-engines.ts');
for (const text of ['Giá trị thất thoát (VND)', 'Tỷ lệ TT (%)', 'Tồn TT kỳ trước', '% thay đổi']) assert(v7Engines.includes(text), `V7 inventory engines missing ${text}`);
assert(v7Engines.includes('Giá trị T24') && v7Engines.includes('Giá trị vượt T24'), 'V7 waste/loss engines must include previous-period value columns');
for (const text of ['Cửa hàng nhận', 'Xác nhận CH', 'Người xử lý', 'CH chưa xác nhận', 'Đối chiếu BTT-CH']) assert(v7Engines.includes(text), `V7 BTT V3 table missing ${text}`);
for (const text of ['NVL suy ra từ bán', 'Số bán x công thức', 'NVL dùng từ số bán x định mức']) assert(v7Engines.includes(text), `V7 formula-derived inventory output missing ${text}`);

const allUi = [...requiredRoutes, ...requiredFiles].map(read).join('\n');
assert(!allUi.includes('rounded-2xl bg-white p-5'), 'Old large card spacing should be removed');
assert(!allUi.includes('không dùng dữ liệu mẫu'), 'Long explanatory copy should not dominate UI');

console.log('Static UI QA passed: Option C sidebar, compact shell, dense KPI/table layout, task module, report close panel, compact import, forced SoQuy/CongNo/Xuat Huy parsing, 15-sheet config, and reduced empty-state copy.');
