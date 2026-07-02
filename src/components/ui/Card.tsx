import { clsx } from 'clsx';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-lg border border-lang-line bg-white p-3 shadow-soft', className)}>{children}</section>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[15px] font-extrabold leading-snug text-lang-ink">{children}</h3>;
}
