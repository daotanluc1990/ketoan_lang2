import { StatusBadge } from '@/components/report/StatusBadge';

export function PageHeader({ title, status }: { title: string; description?: string; status?: string }) {
  return (
    <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
      {/* C1.1: page title là h1 duy nhất trên trang — font-semibold nhẹ hơn extrabold */}
      <h1 className="text-2xl font-semibold tracking-tight text-lang-ink md:text-[28px]">{title}</h1>
      {status ? <StatusBadge status={status} /> : null}
    </div>
  );
}
