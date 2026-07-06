'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { GlobalFilterBar } from './GlobalFilterBar';
import { FloatingAiButton } from './FloatingAiButton';
import { CommandPalette } from './CommandPalette';
import type { Role } from '@/lib/report-types';

const COLLAPSE_KEY = 'ctl-ceo-sidebar-collapsed';
const ROLE_KEY = 'ctl-ceo-role';
// C3: density mode persist
const DENSITY_KEY = 'ctl-density';

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
  // C2: command palette
  const [paletteOpen, setPaletteOpen] = useState(false);
  // C3: density mode ('compact' | 'comfortable')
  const [density, setDensity] = useState<'compact' | 'comfortable'>(() => readStoredBool(DENSITY_KEY, false) ? 'compact' : 'comfortable');
  const shellStyle = { '--sidebar-width': collapsed ? '72px' : '240px' } as CSSProperties;

  // C2: global Cmd/Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // C3: apply density class
  useEffect(() => {
    document.body.classList.toggle('density-compact', density === 'compact');
  }, [density]);

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

  const toggleDensity = () => {
    setDensity((current) => {
      const next = current === 'compact' ? 'comfortable' : 'compact';
      try { window.localStorage.setItem(DENSITY_KEY, String(next === 'compact')); } catch {}
      return next;
    });
  };

  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="app-bg min-h-screen overflow-x-hidden text-lang-ink">
      <Sidebar collapsed={collapsed} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} onToggle={toggleCollapsed} role={role} density={density} onToggleDensity={toggleDensity} />
      <div className="min-h-screen transition-[padding] duration-200 ease-out lg:pl-[var(--sidebar-width)]" style={shellStyle}>
        <TopBar role={role} onMenuClick={() => setMobileOpen(true)} onRoleChange={setSelectedRole} onOpenPalette={() => setPaletteOpen(true)} />
        <GlobalFilterBar />
        <main className="w-full px-2 py-2 lg:px-3">
          <div className="w-full space-y-2.5 pb-8">
            {children}
          </div>
        </main>
        <FloatingAiButton />
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} role={role} />
    </div>
  );
}
