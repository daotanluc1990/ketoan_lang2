import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

/**
 * KpiDelta — hiển thị badge so sánh kỳ liên kề và cùng kỳ.
 * Ví dụ: "↑12% vs tuần trước · ↓5% vs cùng kỳ"
 *
 * Props:
 * - current: giá trị kỳ hiện tại
 * - previousPeriod: giá trị kỳ liên kề (tuần trước / tháng trước)
 * - samePeriodLastYear: giá trị cùng kỳ năm trước (optional)
 * - label: "tuần trước" / "tháng trước" / "năm trước"
 */
export function KpiDelta({
  current,
  previousPeriod,
  samePeriodLastYear,
  previousLabel = 'kỳ trước',
  sameLabel = 'cùng kỳ',
}: {
  current: number;
  previousPeriod?: number;
  samePeriodLastYear?: number;
  previousLabel?: string;
  sameLabel?: string;
}) {
  const calcDelta = (current: number, compare: number | undefined): { pct: number | null; direction: 'up' | 'down' | 'flat' } => {
    if (compare === undefined || compare === null || compare === 0) return { pct: null, direction: 'flat' };
    const pct = ((current - compare) / Math.abs(compare)) * 100;
    if (Math.abs(pct) < 0.1) return { pct: 0, direction: 'flat' };
    return { pct, direction: pct > 0 ? 'up' : 'down' };
  };

  const fmtPct = (pct: number) => `${pct > 0 ? '↑' : pct < 0 ? '↓' : '—'}${Math.abs(pct).toFixed(1).replace('.', ',')}%`;

  const prev = calcDelta(current, previousPeriod);
  const same = calcDelta(current, samePeriodLastYear);

  const colorFor = (direction: 'up' | 'down' | 'flat', positiveIsGood = true) => {
    if (direction === 'flat') return 'text-lang-muted';
    const isPositive = direction === 'up';
    if (positiveIsGood) return isPositive ? 'text-emerald-700' : 'text-red-700';
    return isPositive ? 'text-red-700' : 'text-emerald-700';
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-bold">
      {prev.pct !== null && (
        <span className={colorFor(prev.direction)}>
          {fmtPct(prev.pct)} <span className="font-medium text-lang-muted/70">vs {previousLabel}</span>
        </span>
      )}
      {same.pct !== null && (
        <>
          <span className="text-lang-line">·</span>
          <span className={colorFor(same.direction)}>
            {fmtPct(same.pct)} <span className="font-medium text-lang-muted/70">vs {sameLabel}</span>
          </span>
        </>
      )}
      {prev.pct === null && same.pct === null && (
        <span className="text-lang-muted/60">Chưa có dữ liệu so sánh</span>
      )}
    </div>
  );
}

/**
 * Helper tính giá trị kỳ trước và cùng kỳ từ raw rows.
 * Nhận vào rows theo ngày/tuần, trả về total của kỳ hiện tại, kỳ trước, cùng kỳ năm ngoái.
 */
export function computePeriodComparison(
  rows: Array<{ date?: string; week?: string; value: number }>,
  currentWeek?: string,
): {
  current: number;
  previousPeriod?: number;
  samePeriodLastYear?: number;
} {
  if (!rows.length) return { current: 0 };

  // Group by week
  const byWeek = new Map<string, number>();
  for (const row of rows) {
    const week = row.week ?? extractWeekFromDate(row.date);
    if (!week) continue;
    byWeek.set(week, (byWeek.get(week) ?? 0) + row.value);
  }

  if (!currentWeek) {
    // Lấy tuần mới nhất làm current
    const weeks = Array.from(byWeek.keys()).sort();
    if (!weeks.length) return { current: 0 };
    currentWeek = weeks[weeks.length - 1];
  }

  const current = byWeek.get(currentWeek) ?? 0;

  // Previous period = tuần liền kề trước đó
  const weekParts = currentWeek.match(/^(\d{4})-W(\d{2})$/);
  let previousPeriod: number | undefined;
  if (weekParts) {
    const year = parseInt(weekParts[1], 10);
    const weekNum = parseInt(weekParts[2], 10);
    const prevWeekNum = weekNum - 1;
    if (prevWeekNum >= 1) {
      previousPeriod = byWeek.get(`${year}-W${String(prevWeekNum).padStart(2, '0')}`);
    } else {
      // Tuần 1 → lấy tuần 52 năm trước
      previousPeriod = byWeek.get(`${year - 1}-W52`);
    }
  }

  // Same period last year
  if (weekParts) {
    const year = parseInt(weekParts[1], 10);
    const weekNum = parseInt(weekParts[2], 10);
    const samePeriodLastYear = byWeek.get(`${year - 1}-W${String(weekNum).padStart(2, '0')}`);
    return { current, previousPeriod, samePeriodLastYear };
  }

  return { current, previousPeriod };
}

function extractWeekFromDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  // Date format YYYY-MM-DD → compute ISO week
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const date = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (isNaN(date.getTime())) return undefined;
  // ISO week calculation
  const tmpDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = tmpDate.getUTCDay() || 7;
  tmpDate.setUTCDate(tmpDate.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmpDate.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((tmpDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${tmpDate.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}
