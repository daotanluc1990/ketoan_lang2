import { StatusBadge } from '@/components/report/StatusBadge';

export function PageHeader({ title, status }: { title: string; description?: string; status?: string }) {
  return (
    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-lang-ink md:text-[28px]">{title}</h2>
      {status ? <StatusBadge status={status} /> : null}
    </div>
  );
}
