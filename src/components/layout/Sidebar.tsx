'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Menu, SquareStack, UtensilsCrossed, X } from 'lucide-react';
import { navigationGroups, navigationItems } from './navigation';
import type { NavigationGroup } from './navigation';
import type { Role } from '@/lib/report-types';

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggle: () => void;
  role: Role;
  density: 'compact' | 'comfortable';
  onToggleDensity: () => void;
};

function SidebarHeader({ collapsed, onClose, onToggle, mobile = false }: { collapsed: boolean; onClose?: () => void; onToggle?: () => void; mobile?: boolean }) {
  return (
    <div className={clsx('flex h-[58px] shrink-0 items-center border-b border-white/15 bg-transparent', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lang-red to-violet-500 text-white shadow-sm" style={{ boxShadow: '0 2px 8px rgba(59,130,246,.25)' }}>
          <UtensilsCrossed className="h-4 w-4" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            {/* C1.1: không dùng h1 cho brand — để h1 duy nhất là page title */}
            <p className="truncate text-sm font-bold leading-tight text-lang-ink">ERP Mini</p>
            <p className="truncate text-[11px] font-medium text-lang-muted">Kế Toán Cơm Tấm Làng</p>
          </div>
        ) : null}
      </div>
      {!collapsed && !mobile ? (
        <button type="button" onClick={onToggle} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/72 hover:bg-white/12 hover:text-white" aria-label="Thu gọn sidebar">
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}
      {mobile ? (
        <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/72 hover:bg-white/12 hover:text-white" aria-label="Đóng menu">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function SidebarNav({ collapsed, onNavigate, role }: { collapsed: boolean; onNavigate?: () => void; role: Role }) {
  const pathname = usePathname();
  const [pendingNav, setPendingNav] = useState<{ href: string; fromPath: string } | null>(null);
  const [openGroups, setOpenGroups] = useState<Set<NavigationGroup>>(() => new Set());

  const toggleGroup = (group: NavigationGroup) => {
    setOpenGroups((current) => {
      const next = new Set(current);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Điều hướng chính">
      {navigationGroups.map((group) => {
        const items = navigationItems.filter((item) => item.group === group && item.allowedRoles.includes(role));
        if (!items.length) return null;
        const groupActive = items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
        const groupOpen = collapsed || groupActive || openGroups.has(group);
        return (
          <div key={group} className="mb-3">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className={clsx(
                  'mb-1.5 flex w-full items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/8 px-2 py-1.5 text-left text-[11px] font-extrabold uppercase text-white/72',
                  groupActive && 'border-lang-line bg-lang-mist text-lang-ink ring-1 ring-lang-line'
                )}
                aria-expanded={groupOpen}
              >
                <span className="truncate">{group}</span>
                <ChevronDown className={clsx('h-3.5 w-3.5 shrink-0 transition-transform', groupOpen && 'rotate-180')} />
              </button>
            ) : (
              <div className={clsx('mb-2 h-px', groupActive ? 'bg-lang-red' : 'bg-slate-200')} />
            )}
            <div className={clsx('space-y-0.5', !groupOpen && 'hidden')}>
              {items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const pending = pendingNav?.href === item.href && pendingNav.fromPath === pathname && !active;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    title={collapsed ? item.label : undefined}
                    onClick={() => {
                      setPendingNav({ href: item.href, fromPath: pathname });
                      onNavigate?.();
                    }}
                    className={clsx(
                      'group flex min-h-10 items-center rounded-lg border text-[13px] font-semibold transition',
                      collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5',
                      active
                        ? 'border-transparent bg-lang-ink text-white shadow-sm'
                        : pending
                          ? 'border-lang-line bg-lang-mist text-lang-muted'
                          : 'border-transparent text-lang-muted hover:border-lang-line hover:bg-lang-hover hover:text-lang-ink'
                    )}
                  >
                    {pending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-lang-muted" /> : <Icon className={clsx('h-4 w-4 shrink-0', active ? 'text-white' : 'text-lang-muted group-hover:text-lang-ink')} />}
                    {!collapsed ? <span className="truncate">{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggle, role, density, onToggleDensity }: SidebarProps) {
  return (
    <>
      <aside className={clsx('fixed inset-y-0 left-0 z-30 hidden h-screen flex-col overflow-hidden border-r border-lang-line bg-white text-lang-ink shadow-soft transition-[width] duration-200 lg:flex', collapsed ? 'w-[72px]' : 'w-60')}>
        <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
        {collapsed ? (
          <button type="button" onClick={onToggle} className="mx-auto mt-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/72 hover:bg-white/12 hover:text-white" aria-label="Mở rộng sidebar">
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
        <SidebarNav collapsed={collapsed} role={role} />
        {!collapsed ? (
          // C3: density toggle ở footer sidebar
          <div className="sidebar-foot shrink-0 border-t border-white/15 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-white/62">V9 Accounting V3</span>
              <button type="button" onClick={onToggleDensity} className="inline-flex h-7 items-center gap-1 rounded-md border border-white/20 bg-white/8 px-2 text-[10px] font-bold text-white hover:bg-white/15" title={`Mật độ bảng: ${density === 'compact' ? 'Compact' : 'Comfortable'}`} aria-label={`Đổi mật độ bảng (${density})`}>
                {density === 'compact' ? 'Compact' : 'Comfortable'}
              </button>
            </div>
          </div>
        ) : (
          <Menu className="mx-auto mb-4 h-4 w-4 shrink-0 text-white/62" />
        )}
      </aside>

      <div className={clsx('fixed inset-0 z-40 bg-black/45 transition-opacity lg:hidden', mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')} onClick={onCloseMobile} aria-hidden="true" />
      <aside className={clsx('fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col overflow-hidden border-r border-lang-line bg-white text-lang-ink shadow-card transition-transform duration-200 ease-out lg:hidden', mobileOpen ? 'translate-x-0' : '-translate-x-full')} aria-label="Menu di động" aria-hidden={!mobileOpen}>
        <SidebarHeader collapsed={false} mobile onClose={onCloseMobile} />
        <SidebarNav collapsed={false} onNavigate={onCloseMobile} role={role} />
        <div className="shrink-0 border-t border-white/15 px-4 py-3 text-[11px] font-semibold text-white/62">V9 Accounting V3 · Mobile</div>
      </aside>
    </>
  );
}
