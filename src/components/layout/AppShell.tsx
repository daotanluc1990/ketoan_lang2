'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalFilterBar } from './GlobalFilterBar';
import type { Role } from '@/lib/report-types';

const COLLAPSE_KEY = 'ctl-ceo-sidebar-collapsed';
const ROLE_KEY = 'ctl-ceo-role';

function readStoredBool(key: string, fallback: boolean) {
  if (typeof window === 'undefined') return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

function writeRoleCookie(role: Role) {
  if (typeof document === 'undefined') return;
  document.cookie = `ctl_role=${encodeURIComponent(role)}; path=/; max-age=2592000; samesite=lax`;
}

function readCookieRole(): Role | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )ctl_role=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1]) as Role;
  if (value === 'CEO' || value === 'Kế toán' || value === 'Admin' || value === 'Quản lý cửa hàng') return value;
  return null;
}

function readStoredRole(): Role {
  if (typeof window === 'undefined') return 'Kế toán';
  try {
    const cookieRole = readCookieRole();
    if (cookieRole) return cookieRole;
    const value = window.localStorage.getItem(ROLE_KEY) as Role | null;
    if (value === 'CEO' || value === 'Kế toán' || value === 'Admin' || value === 'Quản lý cửa hàng') return value;
  } catch {}
  return 'Kế toán';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => readStoredBool(COLLAPSE_KEY, true));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<Role>(() => readStoredRole());
  const shellStyle = { '--sidebar-width': collapsed ? '72px' : '240px' } as CSSProperties;

  const toggleCollapsed = () => {
    setCollapsed((current: boolean) => {
      const next = !current;
      try { window.localStorage.setItem(COLLAPSE_KEY, String(next)); } catch {}
      return next;
    });
  };

  const setSelectedRole = (nextRole: Role) => {
    setRole(nextRole);
    try { window.localStorage.setItem(ROLE_KEY, nextRole); } catch {}
    writeRoleCookie(nextRole);
  };

  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="app-bg min-h-screen overflow-x-hidden text-lang-ink">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onToggle={toggleCollapsed} role={role} />
      <div className="min-h-screen transition-[padding] duration-200 ease-out lg:pl-[var(--sidebar-width)]" style={shellStyle}>
        <TopBar role={role} onMenuClick={() => setMobileOpen(true)} onRoleChange={setSelectedRole} />
        <GlobalFilterBar />
        <main className="w-full px-2 py-2 lg:px-3">
          <div className="w-full space-y-2.5 pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
