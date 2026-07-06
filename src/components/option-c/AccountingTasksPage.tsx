import Link from 'next/link';
import { Card, CardTitle } from '@/components/ui/Card';
import { ReportTable } from '@/components/report/ReportTable';
import { buildAccountingTasks, filterAccountingTasks } from '@/lib/option-c/task-engine';
import type { OptionCPage } from '@/lib/option-c/catalog';
import { getSubtabDashboardSpec } from '@/lib/option-c/subtab-dashboard-spec';
import type { AccountingTask } from '@/lib/option-c/task-engine';

type TaskView = 'all' | 'today' | 'overdue' | 'pending' | 'red';

export async function AccountingTasksPage({ page, searchParams }: { page: OptionCPage; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const spec = getSubtabDashboardSpec(page);
  const params = searchParams ? await searchParams : {};
  const allTasks = await buildAccountingTasks(searchParams);
  const requestedView = String(Array.isArray(params.view) ? params.view[0] : params.view ?? page.taskFilter ?? 'all');
  const activeView: TaskView = ['all', 'today', 'overdue', 'pending', 'red'].includes(requestedView) ? requestedView as TaskView : 'all';
  const taskBuckets = {
    all: filterAccountingTasks(allTasks),
    today: filterAccountingTasks(allTasks, 'today'),
    overdue: filterAccountingTasks(allTasks, 'overdue'),
    pending: filterAccountingTasks(allTasks, 'pending'),
    red: allTasks.filter((task) => task.priority === 'Đỏ')
  } satisfies Record<string, AccountingTask[]>;
  const tasks = taskBuckets[activeView];
  const filterTabs = [
    { key: 'all', label: 'Tất cả', count: taskBuckets.all.length },
    { key: 'today', label: 'Việc hôm nay', count: taskBuckets.today.length },
    { key: 'overdue', label: 'Quá hạn', count: taskBuckets.overdue.length },
    { key: 'pending', label: 'Chờ xác nhận', count: taskBuckets.pending.length },
    { key: 'red', label: 'Task đỏ', count: taskBuckets.red.length }
  ];

  return (
    <div className="space-y-2.5">
      <section className="rounded-lg border border-lang-line bg-white p-1 shadow-soft">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Bộ lọc nhiệm vụ kế toán">
        {filterTabs.map((item) => (
          <Link
            key={item.key}
            href={`/nhiem-vu-ke-toan?view=${item.key}`}
            aria-current={activeView === item.key ? 'page' : undefined}
            className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-[12px] font-black transition-colors ${activeView === item.key ? 'bg-lang-red text-white shadow-soft' : 'text-lang-muted hover:bg-lang-mist hover:text-lang-ink'}`}
          >
            <span>{item.label}</span>
            <span className={`number rounded-full px-2 py-0.5 text-[11px] font-black ${activeView === item.key ? 'bg-white/20 text-white' : 'bg-lang-mist text-lang-ink'}`}>{item.count}</span>
          </Link>
        ))}
        </div>
      </section>

      <Card>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{page.title}</CardTitle>
            <p className="mt-1 text-[12px] font-semibold text-lang-muted">{page.description}</p>
            <p className="mt-2 rounded-lg bg-lang-cream px-3 py-2 text-[12px] font-bold text-lang-brown">{spec.focus}</p>
          </div>
          <Link href="/bao-cao-quan-tri?period=week" className="inline-flex h-9 items-center justify-center rounded-lg bg-lang-red px-3 text-[12px] font-bold text-white">Chốt báo cáo</Link>
        </div>
        <div className="mt-3">
          <ReportTable
            headers={['Mức', 'Module', 'Việc cần làm', 'Phụ trách', 'Hạn', 'Trạng thái', 'Hành động']}
            rows={tasks.length ? tasks.map((task) => [task.priority, task.module, task.title, task.owner, task.deadline, task.status, task.action]) : [['Tốt', 'Nhiệm vụ kế toán', 'Chưa có task mở theo bộ lọc hiện tại', '—', '—', 'Hoàn thành', 'Tiếp tục theo dõi']]}
            maxHeight="max-h-[460px]"
          />
        </div>
      </Card>

      <section className="grid gap-2 lg:grid-cols-2">
        <Card>
          <CardTitle>Cảnh báo theo loại việc</CardTitle>
          <div className="mt-2"><ReportTable headers={['Mức', 'Nội dung', 'Phụ trách', 'Hành động']} rows={spec.alertRows} maxHeight="max-h-[220px]" /></div>
        </Card>
        <Card>
          <CardTitle>Nguồn sinh nhiệm vụ</CardTitle>
          <div className="mt-2"><ReportTable headers={['Nguồn', 'Việc cần làm', 'Phụ trách', 'Hạn xử lý', 'Mức độ']} rows={spec.taskRows} maxHeight="max-h-[220px]" /></div>
        </Card>
      </section>
    </div>
  );
}
