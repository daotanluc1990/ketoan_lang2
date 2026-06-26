import { clsx } from 'clsx';

export function Button({ children, variant = 'primary', onClick, disabled = false }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger'; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      className={clsx(
        'inline-flex h-10 items-center justify-center rounded-2xl px-4 text-xs font-black shadow-sm ring-offset-2 transition focus:outline-none focus:ring-2 focus:ring-lang-red/20 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-lang-red text-white shadow-card hover:bg-lang-redDark',
        variant === 'secondary' && 'bg-white text-lang-brown ring-1 ring-lang-line hover:bg-lang-cream2',
        variant === 'danger' && 'bg-red-600 text-white shadow-card hover:bg-red-700'
      )}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
