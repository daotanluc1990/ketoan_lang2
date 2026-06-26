'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationGroups, navigationItems } from './navigation';
import { clsx } from 'clsx';
import { ChevronLeft, ChevronRight, Menu, Sparkles } from 'lucide-react';

export function Sidebar({ collapsed, onToggle, role }: { collapsed: boolean; onToggle: () => void; role: import('@/lib/report-types').Role }) {
  const pathname = usePathname();

  return (
    <aside className={clsx('fixed inset-y-0 left-0 z-30 hidden h-screen flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-lang-redDeep via-lang-redDark to-[#2f0808] text-white shadow-glow transition-[width] duration-200 lg:flex', collapsed ? 'w-[86px]' : 'w-[280px]')}>
      <div className={clsx('shrink-0 border-b border-white/10', collapsed ? 'px-3 py-4' : 'px-4 py-4')}>
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-lang-yellow text-lg font-black text-lang-redDeep shadow-card ring-1 ring-white/30">
            L
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white ring-2 ring-lang-redDark" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lang-yellow">Cơm Tấm Làng</p>
              <h1 className="mt-1 truncate text-lg font-black leading-tight">ERP Kế Toán</h1>
              <p className="mt-0.5 truncate text-xs font-semibold text-white/62">Data Master V8 · CEO Control</p>
            </div>
          ) : null}
        </div>
        <button type="button" onClick={onToggle} className={clsx('mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white/10 text-xs font-bold text-white ring-1 ring-white/10 transition hover:bg-white/15', collapsed ? 'w-full' : 'w-full px-3')} aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed ? 'Thu gọn menu' : null}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sidebar-scroll" aria-label="Điều hướng chính">
        {navigationGroups.map((group) => {
          const items = navigationItems.filter((item) => item.group === group && item.allowedRoles.includes(role));
          if (!items.length) return null;
          return (
            <div key={group} className="mb-4">
              {!collapsed ? <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/42">{group}</p> : <div className="mb-2 h-px bg-white/10" />}
              <div className="space-y-1.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} className={clsx('group flex items-center rounded-2xl text-sm font-bold transition', collapsed ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-2.5', active ? 'bg-lang-yellow text-lang-redDeep shadow-card ring-1 ring-white/35' : 'text-white/76 hover:bg-white/10 hover:text-white')}>
                      <span className={clsx('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition', active ? 'bg-white/60 text-lang-redDeep' : 'bg-white/8 text-lang-yellow group-hover:bg-white/12')}><Icon className="h-4 w-4" /></span>
                      {!collapsed ? <span className="truncate">{item.label}</span> : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {!collapsed ? (
        <div className="sidebar-foot shrink-0 border-t border-white/10 p-4">
          <div className="rounded-2xl bg-white/8 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-lang-yellow"><Sparkles className="h-4 w-4" /><span className="text-xs font-black uppercase tracking-wide">Production Gate</span></div>
            <p className="mt-2 text-xs leading-5 text-white/62">Import thật · Chốt tuần · Audit log · Bot CEO</p>
          </div>
        </div>
      ) : <Menu className="mx-auto mb-4 h-5 w-5 shrink-0 text-white/45" />}
    </aside>
  );
}
