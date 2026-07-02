import { clsx } from 'clsx';
import type { Status } from '@/lib/report-types';
import { StatusBadge } from './StatusBadge';

export function MetricCard({ label, value, hint, trend, status = 'neutral', compact = false }: { label: string; value: string; hint?: string; trend?: string; status?: Status; compact?: boolean }) {
  const trendTone = status === 'good' ? 'text-emerald-800' : status === 'danger' ? 'text-red-800' : status === 'warning' ? 'text-amber-900' : 'text-lang-muted';
  const cardTone = status === 'danger'
    ? 'border-red-200 bg-red-50/60'
    : status === 'warning'
      ? 'border-amber-200 bg-amber-50/55'
      : status === 'good'
        ? 'border-emerald-200 bg-emerald-50/35'
        : 'border-lang-line bg-white';
  return (
    <div className={clsx('min-w-0 rounded-lg border shadow-soft transition-colors', cardTone, compact ? 'p-3' : 'p-4')}>
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 min-h-9 text-[12px] font-extrabold leading-[18px] text-lang-muted">{label}</p>
        <StatusBadge status={status} />
      </div>
      <div className="number mt-2 break-words text-[22px] font-black leading-tight text-lang-ink">{value}</div>
      {trend ? <p className={clsx('mt-1.5 line-clamp-1 text-[12px] font-bold leading-5', trendTone)}>{trend}</p> : null}
      {hint ? <p className="mt-0.5 line-clamp-1 text-[12px] leading-5 text-lang-muted">{hint}</p> : null}
    </div>
  );
}
