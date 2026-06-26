import { AlertTriangle, ArrowRight, Bot, CheckCircle2, Database, FileInput, LockKeyhole, RefreshCcw, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { MetricCard } from '@/components/report/MetricCard';
import { ReportTable } from '@/components/report/ReportTable';
import { StatusBadge } from '@/components/report/StatusBadge';
import { Card, CardTitle } from '@/components/ui/Card';
import type { DashboardReport } from '@/lib/reports/report-aggregator';

function statusRows(report: DashboardReport) {
  const canClose = report.hasRealData && report.missingSources.length === 0;
  return [
    ['1', 'Trạng thái báo cáo tuần', canClose ? 'Có thể chốt' : 'Chưa thể chốt', report.missingSources.length ? `Thiếu ${report.missingSources.length} nguồn` : 'Đủ nguồn chính', canClose ? 'Kiểm tra cuối rồi gửi CEO/Bot' : 'Bổ sung dữ liệu trước'],
    ['2', 'Cửa hàng', report.sourceCounts.storeRevenue || report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Bán hàng, tồn kho, hủy hàng', 'Kiểm nhập - xuất - tồn - bán - hủy'],
    ['3', 'Bếp Trung Tâm', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Tồn kho/xuất cho cửa hàng cần tách riêng', 'Kiểm BTT xuất ↔ cửa hàng nhận'],
    ['4', 'Sổ quỹ & công nợ', report.sourceCounts.cashbook ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', `${report.sourceCounts.cashbook} dòng sổ quỹ`, 'Phân loại chi BTT, chi cửa hàng, trả NCC'],
    ['5', 'Thất thoát & hủy hàng', report.sourceCounts.lossRows ? 'Cảnh báo' : 'Chưa đủ dữ liệu', `${report.sourceCounts.lossRows} dòng NVL`, 'Xử lý tồn âm, lệch tồn, hủy/hư hỏng']
  ];
}

function storeRows(report: DashboardReport) {
  return [
    ['Nhập kho cửa hàng', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', `${report.sourceCounts.inventory} dòng tồn kho`, 'Tách nhập từ BTT và nhập NCC trực tiếp'],
    ['Xuất kho cửa hàng', 'Cần đối chiếu', 'Chưa có bảng xuất riêng', 'Bổ sung nguồn xuất/hủy/điều chỉnh'],
    ['Bán hàng', report.sourceCounts.storeRevenue || report.sourceCounts.appRevenue ? 'Đạt' : 'Chưa đủ dữ liệu', `${report.sourceCounts.storeRevenue + report.sourceCounts.appRevenue} dòng doanh thu`, 'Dùng để tính tiêu hao định mức'],
    ['Hủy/hư hỏng', report.sourceCounts.lossRows ? 'Cảnh báo' : 'Chưa đủ dữ liệu', `${report.sourceCounts.lossRows} dòng thất thoát`, 'Không nhầm với xuất BTT cho cửa hàng'],
    ['Kiểm kê tồn', report.totals.negativeStockCount ? 'Cảnh báo' : 'Cần đối chiếu', `${report.totals.negativeStockCount} tồn âm`, 'So sánh tồn lý thuyết và tồn thực tế']
  ];
}

function centralKitchenRows(report: DashboardReport) {
  return [
    ['Nhập kho BTT', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Tồn kho BTT đã import cần kiểm giá trị', 'Không gộp với cửa hàng'],
    ['Xuất BTT cho cửa hàng', 'Cần đối chiếu', 'Mã hàng, số lượng, ngày', 'Map vào BTT xuất cho cửa hàng'],
    ['Sản xuất/sơ chế', 'Chưa đủ dữ liệu', 'Cần lệnh sản xuất nếu triển khai sâu', 'Tính hao hụt sản xuất'],
    ['Hủy/hư hỏng BTT', 'Chưa đủ dữ liệu', 'Cần nguồn hủy BTT riêng', 'Không trộn với hủy cửa hàng'],
    ['Kiểm kê BTT', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', `${report.sourceCounts.inventory} dòng tồn tổng`, 'Tách tồn BTT và tồn cửa hàng']
  ];
}

function reconciliationRows(report: DashboardReport) {
  return [
    ['BTT xuất ↔ Cửa hàng nhận', 'Cần đối chiếu', 'Mã phiếu, mã hàng, số lượng, ngày', 'Chặn chốt nếu lệch lớn'],
    ['Bán hàng ↔ Định mức', report.sourceCounts.storeRevenue || report.sourceCounts.appRevenue ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Món bán, số lượng, định mức NVL', 'Thiếu định mức thì không tính thất thoát chuẩn'],
    ['Tồn lý thuyết ↔ Tồn thực tế', report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Tồn đầu, nhập, xuất, bán, hủy, tồn cuối', 'Tồn âm là lỗi nghiêm trọng'],
    ['Sổ quỹ ↔ Công nợ', report.sourceCounts.cashbook ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu', 'Trả NCC, công nợ, thu mua', 'Không tự đưa trả NCC vào P&L'],
    ['Chi BTT ↔ Chi cửa hàng', report.cashbookWarningRows.length ? 'Cảnh báo' : 'Cần đối chiếu', `${report.cashbookWarningRows.length} khoản chi lớn`, 'Không trộn chi BTT vào chi cửa hàng']
  ];
}

function sourceTiles(report: DashboardReport) {
  return [
    ['Doanh thu cửa hàng', report.sourceCounts.storeRevenue, 'DL_DOANH_THU_CUA_HANG'],
    ['Doanh thu app', report.sourceCounts.appRevenue, 'DL_DOANH_THU_APP'],
    ['Sổ quỹ', report.sourceCounts.cashbook, 'DL_SO_QUY'],
    ['Tồn kho', report.sourceCounts.inventory, 'DL_TON_KHO / XNT'],
    ['Thất thoát', report.sourceCounts.lossRows, 'DL_THAT_THOAT_NVL'],
    ['Lịch sử import', report.sourceCounts.importHistory, 'IMPORT_LICH_SU']
  ] as const;
}

function nextActionCards(report: DashboardReport) {
  const canClose = report.hasRealData && report.missingSources.length === 0;
  return [
    {
      title: canClose ? 'Có thể preview chốt tuần' : 'Bổ sung nguồn còn thiếu',
      detail: canClose ? 'Dữ liệu chính đã đủ. Vào lịch sử chốt để preview và kiểm tra lần cuối.' : report.missingSources.length ? report.missingSources.join(', ') : 'Chưa đủ dữ liệu thật.',
      href: canClose ? '/lich-su-chot-bao-cao' : '/import-nhap-lieu',
      cta: canClose ? 'Đi chốt báo cáo' : 'Import thêm dữ liệu',
      icon: canClose ? ShieldCheck : FileInput,
      status: canClose ? 'Tốt' : 'Cần đối chiếu'
    },
    {
      title: 'Kiểm khoản chi lớn',
      detail: `${report.cashbookWarningRows.length} khoản chi cần kế toán giải trình trước khi CEO xem.`,
      href: '/dong-tien',
      cta: 'Xem dòng tiền',
      icon: AlertTriangle,
      status: report.cashbookWarningRows.length ? 'Cảnh báo' : 'Tốt'
    },
    {
      title: 'Kiểm tồn kho & BTT',
      detail: `${report.sourceCounts.inventory} dòng tồn, ${report.totals.negativeStockCount} dòng tồn âm/cần kiểm.`,
      href: '/kho-bep-trung-tam',
      cta: 'Xem kho BTT',
      icon: Database,
      status: report.sourceCounts.inventory ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu'
    }
  ];
}

function sourceStatus(count: number) {
  return count > 0 ? 'Tốt' : 'Chưa đủ dữ liệu';
}

export function AccountingOverviewPage({ report }: { report: DashboardReport }) {
  const canClose = report.hasRealData && report.missingSources.length === 0;
  const totalRows = report.sourceCounts.storeRevenue + report.sourceCounts.appRevenue + report.sourceCounts.cashbook + report.sourceCounts.inventory + report.sourceCounts.lossRows;
  const readinessPercent = Math.round(((5 - report.missingSources.length) / 5) * 100);
  const kpis = report.executiveKpis.length ? report.executiveKpis.slice(0, 8) : [];

  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-3xl border border-lang-line bg-gradient-to-br from-lang-redDeep via-lang-redDark to-lang-red p-5 text-white shadow-glow">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-lang-yellow/22 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={canClose ? 'Tốt' : report.hasRealData ? 'Cần đối chiếu' : 'Chưa đủ dữ liệu'} />
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-white/80">{report.dataMode}</span>
              {report.filterActive ? <span className="rounded-full border border-lang-yellow/40 bg-lang-yellow/18 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-lang-yellow">Đang lọc</span> : null}
            </div>
            <h2 className="mt-4 max-w-4xl text-3xl font-black tracking-tight md:text-4xl">{canClose ? 'Dữ liệu đã sẵn sàng để kiểm tra chốt tuần' : 'Control tower kế toán: nhìn nhanh nguồn thiếu, rủi ro và việc cần xử lý'}</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/72">Tách rõ cửa hàng và Bếp Trung Tâm theo luồng nhập - xuất - tồn - bán - hủy - đối chiếu. Không hiển thị số mẫu, không kết luận khi thiếu nguồn.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/import-nhap-lieu" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-lang-yellow px-4 text-xs font-black text-lang-redDeep shadow-card hover:bg-lang-yellowSoft"><FileInput className="h-4 w-4" />Import dữ liệu</Link>
              <Link href="/lich-su-chot-bao-cao" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/12 px-4 text-xs font-black text-white ring-1 ring-white/18 hover:bg-white/16"><LockKeyhole className="h-4 w-4" />Preview chốt tuần</Link>
              <Link href="/cai-dat-bot" className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/12 px-4 text-xs font-black text-white ring-1 ring-white/18 hover:bg-white/16"><Bot className="h-4 w-4" />Bot CEO</Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lang-yellow">Data readiness</p>
                <p className="mt-1 text-4xl font-black">{readinessPercent}%</p>
              </div>
              <TrendingUp className="h-10 w-10 text-lang-yellow" />
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-lang-yellow" style={{ width: `${readinessPercent}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] font-black uppercase text-white/50">Dòng dữ liệu</p><p className="number mt-1 text-xl font-black">{totalRows}</p></div>
              <div className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] font-black uppercase text-white/50">Nguồn thiếu</p><p className="number mt-1 text-xl font-black">{report.missingSources.length}</p></div>
              <div className="rounded-2xl bg-white/10 p-3"><p className="text-[10px] font-black uppercase text-white/50">Audit</p><p className="number mt-1 text-xl font-black">{report.sourceCounts.auditRows}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {kpis.map((kpi) => <MetricCard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} trend={kpi.trend} status={kpi.status} compact />)}
      </section>

      <section className="grid gap-3 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-lang-line bg-lang-cream2 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-lang-red">Việc cần xử lý trước khi chốt</p>
            <h3 className="mt-1 text-xl font-black text-lang-brown">{canClose ? 'Đủ điều kiện kiểm tra lần cuối' : 'Chưa đủ điều kiện chốt báo cáo'}</h3>
            <p className="mt-1 text-sm font-semibold text-lang-muted">Ưu tiên xử lý theo dữ liệu thật đang có trong Google Sheet.</p>
          </div>
          <div className="p-4"><ReportTable headers={['Ưu tiên', 'Mảng', 'Trạng thái', 'Bằng chứng', 'Hành động']} rows={statusRows(report)} maxHeight="max-h-[330px]" /></div>
        </Card>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
          {nextActionCards(report).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.title} href={item.href} className="group glass-surface rounded-3xl p-4 transition hover:-translate-y-0.5 hover:shadow-glow">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-lang-red text-white shadow-card"><Icon className="h-5 w-5" /></span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="mt-4 text-base font-black text-lang-brown">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-lang-muted">{item.detail}</p>
                <p className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-lang-red">{item.cta}<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        {sourceTiles(report).map(([label, count, sheet]) => (
          <div key={label} className="rounded-3xl border border-lang-line bg-lang-paper p-4 shadow-card">
            <div className="flex items-start justify-between gap-2"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-lang-muted">{label}</p><StatusBadge status={sourceStatus(count)} /></div>
            <p className="number mt-3 text-3xl font-black text-lang-brown">{count}</p>
            <p className="mt-1 truncate text-xs font-semibold text-lang-muted">{sheet}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <Card><CardTitle>Cửa hàng · Nhập - xuất - tồn - bán - hủy</CardTitle><div className="mt-3"><ReportTable headers={['Nghiệp vụ', 'Trạng thái', 'Bằng chứng', 'Việc cần làm']} rows={storeRows(report)} maxHeight="max-h-[320px]" /></div></Card>
        <Card><CardTitle>Bếp Trung Tâm · Nhập - xuất - tồn - sản xuất - hủy</CardTitle><div className="mt-3"><ReportTable headers={['Nghiệp vụ', 'Trạng thái', 'Bằng chứng', 'Việc cần làm']} rows={centralKitchenRows(report)} maxHeight="max-h-[320px]" /></div></Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <Card><CardTitle>Đối chiếu ERP bắt buộc</CardTitle><div className="mt-3"><ReportTable headers={['Đối chiếu', 'Trạng thái', 'Kiểm tra', 'Quy tắc']} rows={reconciliationRows(report)} maxHeight="max-h-[340px]" /></div></Card>
        <Card><CardTitle>Nguồn dữ liệu hiện có</CardTitle><div className="mt-3"><ReportTable headers={['Mảng', 'Trạng thái', 'Bằng chứng', 'Cách dùng']} rows={report.dataReadinessRows} maxHeight="max-h-[340px]" /></div></Card>
      </section>

      <section className="grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardTitle>Cảnh báo kế toán nổi bật</CardTitle>
          <div className="mt-3"><ReportTable headers={['STT', 'Vấn đề', 'Bằng chứng', 'Nguyên nhân', 'Hành động']} rows={report.issueRows.length ? report.issueRows : [['1', 'Chưa có cảnh báo nổi bật', 'Tốt', 'Không phát hiện vấn đề', 'Tiếp tục kiểm tra trước chốt']]} maxHeight="max-h-[340px]" /></div>
        </Card>
        <Card>
          <CardTitle>Khoản chi lớn cần giải trình</CardTitle>
          <div className="mt-3"><ReportTable headers={['STT', 'Ngày', 'Nhóm', 'Diễn giải', 'Số tiền', 'Lý do cảnh báo', 'Hành động']} rows={report.cashbookWarningRows.length ? report.cashbookWarningRows : [['—', '—', '—', 'Không có khoản chi lớn vượt ngưỡng', '—', 'Tốt', 'Tiếp tục theo dõi']]} maxHeight="max-h-[340px]" /></div>
        </Card>
      </section>

      <section className="rounded-3xl border border-lang-line bg-lang-paper p-4 shadow-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><CheckCircle2 className="h-5 w-5" /></span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-lang-red">Production rule</p>
              <h3 className="mt-1 text-lg font-black text-lang-brown">Không dùng số mẫu · Không kết luận khi thiếu nguồn · Luôn có audit trail</h3>
              <p className="mt-1 text-sm font-semibold text-lang-muted">Dashboard này chỉ phản ánh dữ liệu thật đã import, còn thiếu sẽ hiển thị “Chưa đủ dữ liệu”.</p>
            </div>
          </div>
          <Link href="/ban-lam-viec-ke-toan" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-lang-red px-4 text-xs font-black text-white shadow-card hover:bg-lang-redDark"><RefreshCcw className="h-4 w-4" />Đi bàn làm việc</Link>
        </div>
      </section>
    </div>
  );
}
