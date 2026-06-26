import { clsx } from 'clsx';
import type { Status } from '@/lib/report-types';
import { StatusBadge } from './StatusBadge';

export function MetricCard({ label, value, hint, trend, status = 'neutral', compact = false }: { label: string; value: string; hint?: string; trend?: string; status?: Status; compact?: boolean }) {
  const trendTone = status === 'good' ? 'text-emerald-700' : status === 'danger' ? 'text-red-700' : status === 'warning' ? 'text-orange-700' : 'text-lang-muted';
  const iconTone = status === 'good' ? 'bg-emerald-50 text-emerald-600' : status === 'danger' ? 'bg-red-50 text-red-600' : status === 'warning' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600';
  return (
    <div className={clsx('rounded-xl border border-lang-line bg-white shadow-soft', compact ? 'p-3' : 'p-4')}>
      <div className="flex items-start justify-between gap-2">
        <span className={clsx('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black', iconTone)}>{label.charAt(0)}</span>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2 line-clamp-1 text-[12px] font-semibold text-lang-ink">{label}</p>
      <div className="number mt-1 text-2xl font-black leading-none tracking-tight text-lang-ink">{value}</div>
      {trend ? <p className={clsx('mt-2 line-clamp-1 text-[11px] font-semibold leading-4', trendTone)}>{trend}</p> : null}
      {hint ? <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-lang-muted">{hint}</p> : null}
    </div>
  );
}
