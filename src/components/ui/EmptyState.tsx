import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; href?: string; onClick?: () => void };
};

// C1.4: nâng cấp empty state — icon + description + CTA, dùng tokens lang-*
export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-lang-line bg-lang-paper px-4 py-8 text-center shadow-soft">
      <div className="mx-auto mb-2.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-lang-line bg-lang-toolbar text-lang-red">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-[14px] font-extrabold text-lang-ink">{title}</h3>
      {description ? <p className="mx-auto mt-1 max-w-md text-[12px] font-semibold text-lang-muted">{description}</p> : null}
      {action ? (
        action.href ? (
          <a href={action.href} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-lang-paper px-3 text-[12px] font-bold text-lang-ink hover:bg-lang-mist">{action.label}</a>
        ) : (
          <button type="button" onClick={action.onClick} className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-lang-paper px-3 text-[12px] font-bold text-lang-ink hover:bg-lang-mist">{action.label}</button>
        )
      ) : null}
    </div>
  );
}
