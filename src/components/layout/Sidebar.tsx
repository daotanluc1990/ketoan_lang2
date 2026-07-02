'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Loader2, Menu, SquareStack, X } from 'lucide-react';
import { navigationGroups, navigationItems } from './navigation';
import type { Role } from '@/lib/report-types';

type SidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggle: () => void;
  role: Role;
};

function SidebarHeader({ collapsed, onClose, onToggle, mobile = false }: { collapsed: boolean; onClose?: () => void; onToggle?: () => void; mobile?: boolean }) {
  return (
    <div className={clsx('flex h-[58px] shrink-0 items-center border-b border-white/12', collapsed ? 'justify-center px-2' : 'justify-between px-4')}>
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-lang-red shadow-sm">
          <SquareStack className="h-4 w-4" />
        </span>
        {!collapsed ? (
          <div className="min-w-0">
            <h1 className="truncate text-sm font-black leading-tight text-white">ERP Mini</h1>
            <p className="truncate text-[11px] font-semibold text-white/70">Kế Toán Cơm Tấm Làng</p>
          </div>
        ) : null}
      </div>
      {!collapsed && !mobile ? (
        <button type="button" onClick={onToggle} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Thu gọn sidebar">
          <ChevronLeft className="h-4 w-4" />
        </button>
      ) : null}
      {mobile ? (
        <button type="button" onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/75 hover:bg-white/10 hover:text-white" aria-label="Đóng menu">
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

function SidebarNav({ collapsed, onNavigate, role }: { collapsed: boolean; onNavigate?: () => void; role: Role }) {
  const pathname = usePathname();
  const [pendingNav, setPendingNav] = useState<{ href: string; fromPath: string } | null>(null);

  return (
    <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto px-2 py-3" aria-label="Điều hướng chính">
      {navigationGroups.map((group) => {
        const items = navigationItems.filter((item) => item.group === group && item.allowedRoles.includes(role));
        if (!items.length) return null;
        const groupActive = items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
        return (
          <div key={group} className="mb-3">
            {!collapsed ? (
              <p className={clsx('mb-1.5 rounded-lg px-2 py-1 text-[11px] font-black uppercase tracking-wide', groupActive ? 'bg-white/12 text-lang-yellow' : 'text-white/76')}>{group}</p>
            ) : (
              <div className={clsx('mb-2 h-px', groupActive ? 'bg-lang-yellow' : 'bg-white/16')} />
            )}
            <div className="space-y-0.5">
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
                      'group flex min-h-10 items-center rounded-lg text-[13px] font-semibold transition',
                      collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-3 py-2.5',
                      active ? 'bg-lang-red text-white shadow-sm ring-1 ring-white/12' : pending ? 'bg-lang-yellow/18 text-lang-yellow ring-1 ring-lang-yellow/35' : 'text-white/88 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {pending ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-lang-yellow" /> : <Icon className={clsx('h-4 w-4 shrink-0', active ? 'text-lang-yellow' : 'text-white/60 group-hover:text-lang-yellow')} />}
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

export function Sidebar({ collapsed, mobileOpen, onCloseMobile, onToggle, role }: SidebarProps) {
  return (
    <>
      <aside className={clsx('fixed inset-y-0 left-0 z-30 hidden h-screen flex-col overflow-hidden border-r border-lang-redDeep/35 bg-lang-redDark text-white transition-[width] duration-200 lg:flex', collapsed ? 'w-[72px]' : 'w-60')}>
        <SidebarHeader collapsed={collapsed} onToggle={onToggle} />
        {collapsed ? (
          <button type="button" onClick={onToggle} className="mx-auto mt-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white" aria-label="Mở rộng sidebar">
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
        <SidebarNav collapsed={collapsed} role={role} />
        {!collapsed ? (
          <div className="sidebar-foot shrink-0 border-t border-white/12 px-4 py-3 text-[11px] font-semibold text-white/62">V8.4 Saigon F&B · Production</div>
        ) : (
          <Menu className="mx-auto mb-4 h-4 w-4 shrink-0 text-white/45" />
        )}
      </aside>

      <div className={clsx('fixed inset-0 z-40 bg-black/45 transition-opacity lg:hidden', mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')} onClick={onCloseMobile} aria-hidden="true" />
      <aside className={clsx('fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col overflow-hidden border-r border-lang-redDeep/35 bg-lang-redDark text-white shadow-card transition-transform duration-200 ease-out lg:hidden', mobileOpen ? 'translate-x-0' : '-translate-x-full')} aria-label="Menu di động" aria-hidden={!mobileOpen}>
        <SidebarHeader collapsed={false} mobile onClose={onCloseMobile} />
        <SidebarNav collapsed={false} onNavigate={onCloseMobile} role={role} />
        <div className="shrink-0 border-t border-white/12 px-4 py-3 text-[11px] font-semibold text-white/62">V8.4 Saigon F&B · Mobile</div>
      </aside>
    </>
  );
}
