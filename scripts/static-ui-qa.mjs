import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const requiredRoutes = [
  'app/tong-quan/page.tsx',
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
  'src/components/layout/GlobalFilterBar.tsx',
  'src/components/layout/TopBar.tsx',
  'src/components/layout/PageHeader.tsx',
  'src/components/forms/BatchUploadMock.tsx',
  'src/components/report/MetricCard.tsx',
  'src/components/report/ReportTable.tsx',
  'src/components/dashboard/AccountingOverviewCompactPage.tsx',
  'src/components/dashboard/V7ReportEnginePage.tsx',
  'src/components/dashboard/V7ModulePage.tsx'
];
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }

for (const file of [...requiredRoutes, ...requiredFiles]) assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);

const navigation = read('src/components/layout/navigation.ts');
assert([...navigation.matchAll(/\{ href:/g)].length === 17, 'Navigation must keep 17 production tabs');
for (const text of ['Tổng quan kế toán', 'Nhập liệu & Import', 'Kho Bếp Trung Tâm', 'Thất thoát tồn kho', 'Lịch sử chốt báo cáo']) assert(navigation.includes(text), `Navigation missing ${text}`);

const topBar = read('src/components/layout/TopBar.tsx');
assert(topBar.includes('h-[52px]'), 'TopBar must stay compact at 52px');
assert(topBar.includes('Import') && topBar.includes('CEO/Bot'), 'TopBar must keep primary actions');

const pageHeader = read('src/components/layout/PageHeader.tsx');
assert(!pageHeader.includes('description}</p>'), 'PageHeader must not render long descriptions');
assert(pageHeader.includes('StatusBadge'), 'PageHeader must keep status badge');

const metric = read('src/components/report/MetricCard.tsx');
assert(metric.includes('compact'), 'MetricCard must support compact mode');
assert(!metric.includes('text-[26px]'), 'MetricCard must not use oversized old KPI values');

const table = read('src/components/report/ReportTable.tsx');
assert(table.includes('overflow-auto'), 'Tables must scroll internally');
assert(table.includes('text-[12px]'), 'Tables must remain dense');

const batch = read('src/components/forms/BatchUploadMock.tsx');
assert(batch.includes('multiple'), 'Batch upload input must support multiple files');
assert(batch.includes('Kiểm tra batch'), 'Batch upload must keep dry-run action');
assert(batch.includes('Import file đạt'), 'Batch upload must keep confirm action');

const overview = read('src/components/dashboard/AccountingOverviewCompactPage.tsx');
for (const text of ['Việc kế toán cần xử lý', 'Top vấn đề', 'Độ đủ dữ liệu']) assert(overview.includes(text), `Compact overview missing ${text}`);
assert(!overview.includes('Production rule'), 'Compact overview must not show long production-rule block');

const cashflow = read('app/dong-tien/page.tsx');
assert(!cashflow.includes('Chưa đủ dữ liệu dòng tiền'), 'Cashflow must not show large empty-state text');
assert(cashflow.includes('Bảng dòng tiền'), 'Cashflow must show compact table');

const importPage = read('app/import-nhap-lieu/page.tsx');
assert(importPage.includes('Batch upload'), 'Import page must prioritize batch upload');
assert(importPage.includes('Hoàn tác import'), 'Import page must include rollback');

const parser = read('src/lib/import/parsers/v7-parsers.ts');
assert(parser.includes("filename.includes('soquy')"), 'Parser must force SoQuy files to Sổ quỹ');
assert(parser.includes("SHEET_NAMES.DL_SO_QUY"), 'Parser must target DL_SO_QUY');
assert(parser.includes("filename.includes('congno')"), 'Parser must force Công nợ files to Công nợ');

const allUi = [...requiredRoutes, ...requiredFiles].map(read).join('\n');
assert(!allUi.includes('rounded-2xl bg-white p-5'), 'Old large card spacing should be removed');
assert(!allUi.includes('không dùng dữ liệu mẫu'), 'Long explanatory copy should not dominate UI');

console.log('Static UI QA passed: 17 tabs, compact shell, dense KPI/table layout, compact import, forced SoQuy/CongNo parsing, and reduced empty-state copy.');
