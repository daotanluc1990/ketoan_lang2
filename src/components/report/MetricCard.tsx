import { clsx } from 'clsx';
import type { Status } from '@/lib/report-types';
import { StatusBadge } from './StatusBadge';
import { KpiDelta } from '@/components/charts/KpiDelta';

export function MetricCard({ label, value, hint, trend, status = 'neutral', compact = false, current, previousPeriod, samePeriodLastYear }: { label: string; value: string; hint?: string; trend?: string; status?: Status; compact?: boolean; current?: number; previousPeriod?: number; samePeriodLastYear?: number }) {
  const trendTone = status === 'good' ? 'text-emerald-800' : status === 'danger' ? 'text-red-800' : status === 'warning' ? 'text-lang-redDark' : 'text-lang-muted';
  // Craft Modern: warning dùng viền xanh lạnh + nền toolbar trung tính
  const cardTone = status === 'danger'
    ? 'border-red-200 bg-red-50/70'
    : status === 'warning'
      ? 'border-blue-200 bg-lang-toolbar'
      : status === 'good'
        ? 'border-emerald-200 bg-emerald-50/35'
        : 'border-lang-line bg-lang-paper';
  return (
    <div className={clsx('min-h-[112px] min-w-0 rounded-lg border shadow-soft transition-colors', cardTone, compact ? 'p-3' : 'p-4')}>
      <div className="flex items-start justify-between gap-2">
        <p className="t-label line-clamp-2 min-h-8">{label}</p>
        <StatusBadge status={status} />
      </div>
      <div className="t-value mt-2 break-words">{value}</div>
      {trend ? <p className={clsx('mt-1.5 line-clamp-1 text-[12px] font-semibold leading-5', trendTone)}>{trend}</p> : null}
      {hint ? <p className="mt-0.5 line-clamp-1 text-[12px] leading-5 text-lang-muted">{hint}</p> : null}
      {current !== undefined ? <KpiDelta current={current} previousPeriod={previousPeriod} samePeriodLastYear={samePeriodLastYear} /> : null}
    </div>
  );
}
