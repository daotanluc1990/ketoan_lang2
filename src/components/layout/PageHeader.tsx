import { StatusBadge } from '@/components/report/StatusBadge';

export function PageHeader({ title, description, status }: { title: string; description: string; status?: string }) {
  return (
    <div className="relative mb-3 overflow-hidden rounded-3xl border border-lang-line bg-gradient-to-br from-lang-paper via-white to-lang-cream2 p-5 shadow-card">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-lang-yellow/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-44 w-44 rounded-full bg-lang-red/8 blur-3xl" />
      <div className="relative flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lang-red">ERP Mini Kế Toán · Control Panel</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-lang-brown md:text-3xl">{title}</h2>
          <p className="mt-1 max-w-5xl text-sm font-semibold leading-6 text-lang-muted">{description}</p>
        </div>
        {status ? <StatusBadge status={status} /> : null}
      </div>
    </div>
  );
}
