import { StatusBadge } from '@/components/report/StatusBadge';

export function PageHeader({ title, description, status }: { title: string; description: string; status?: string }) {
  return (
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
      <div className="min-w-0">
        <h2 className="text-2xl font-black tracking-tight text-lang-ink md:text-[28px]">{title}</h2>
        <p className="mt-1 text-sm font-medium leading-5 text-lang-muted">{description}</p>
      </div>
      {status ? <StatusBadge status={status} /> : null}
    </div>
  );
}
