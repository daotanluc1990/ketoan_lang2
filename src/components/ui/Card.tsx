import { clsx } from 'clsx';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-xl border border-lang-line bg-lang-paper p-3 shadow-soft', className)}>{children}</section>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  // font-semibold thay extrabold — nhẹ mắt hơn
  return <h3 className="text-[15px] font-semibold leading-snug text-lang-ink text-balance">{children}</h3>;
}
