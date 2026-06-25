import { StatusBadge } from '@/components/report/StatusBadge';

export function PageHeader({ title, description, status }: { title: string; description: string; status?: string }) {
  return (
    <div className="mb-2 flex flex-col justify-between gap-2 rounded-xl bg-white p-3 shadow-soft ring-1 ring-black/5 md:flex-row md:items-center">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lang-red">CEO Report Dashboard</p>
        <h2 className="mt-0.5 text-lg font-extrabold text-lang-brown md:text-xl">{title}</h2>
        <p className="mt-0.5 max-w-5xl line-clamp-1 text-xs leading-5 text-black/55">{description}</p>
      </div>
      {status ? <StatusBadge status={status} /> : null}
    </div>
  );
}
