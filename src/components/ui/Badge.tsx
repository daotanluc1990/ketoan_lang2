import { clsx } from 'clsx';

const variants = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-red-200 bg-red-50 text-red-700',
  neutral: 'border-lang-line bg-lang-cream2 text-lang-muted'
};

export function Badge({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: keyof typeof variants }) {
  return <span className={clsx('inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-black leading-none shadow-sm', variants[variant])}>{children}</span>;
}
