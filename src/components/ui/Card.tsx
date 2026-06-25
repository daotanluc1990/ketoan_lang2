import { clsx } from 'clsx';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx('rounded-xl bg-white p-3 shadow-soft ring-1 ring-black/5', className)}>{children}</section>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-extrabold text-lang-brown">{children}</h3>;
}
