import { clsx } from 'clsx';
import type { Status } from '@/lib/report-types';
import { StatusBadge } from './StatusBadge';

export function MetricCard({ label, value, hint, trend, status = 'neutral', compact = false }: { label: string; value: string; hint?: string; trend?: string; status?: Status; compact?: boolean }) {
  const trendTone = status === 'good' ? 'text-emerald-700' : status === 'danger' ? 'text-red-700' : status === 'warning' ? 'text-amber-800' : 'text-lang-muted';
  const accent = status === 'good' ? 'from-emerald-500/18' : status === 'danger' ? 'from-red-500/18' : status === 'warning' ? 'from-amber-400/22' : 'from-lang-yellow/22';
  return (
    <div className={clsx('relative overflow-hidden rounded-3xl border border-lang-line bg-lang-paper shadow-card', compact ? 'p-3' : 'p-4')}>
      <div className={clsx('pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b to-transparent', accent)} />
      <div className="relative flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[11px] font-black uppercase tracking-[0.16em] text-lang-muted">{label}</p>
        <StatusBadge status={status} />
      </div>
      <div className="number relative mt-3 text-[26px] font-black leading-none tracking-tight text-lang-brown">{value}</div>
      {trend ? <p className={clsx('relative mt-2 line-clamp-1 text-[11px] font-black leading-4', trendTone)}>{trend}</p> : null}
      {hint ? <p className="relative mt-1 line-clamp-1 text-[11px] font-semibold leading-4 text-lang-muted">{hint}</p> : null}
    </div>
  );
}
