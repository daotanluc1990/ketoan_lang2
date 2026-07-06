import { clsx } from 'clsx';

const variants = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800 before:bg-lang-green',
  warning: 'border-amber-200 bg-amber-50 text-amber-900 before:bg-lang-yellow',
  danger: 'border-red-200 bg-red-50 text-red-800 before:bg-red-600',
  // C-balance: neutral từ mist kem → toolbar trung tính ấm, đỡ đơn tông vàng
  neutral: 'border-lang-line bg-lang-toolbar text-lang-muted before:bg-lang-muted'
};

export function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: keyof typeof variants }) {
  return <span className={clsx('inline-flex min-h-6 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-bold leading-4 before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full', variants[variant])}>{children}</span>;
}
