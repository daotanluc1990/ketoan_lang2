'use client';

import Link from 'next/link';
import type { Role } from '@/lib/report-types';
import { Bell, FileInput, FileText, HelpCircle, LogOut, Menu, UserRound } from 'lucide-react';

export function TopBar({ role, onMenuClick, onOpenPalette }: { role: Role; onMenuClick: () => void; onRoleChange: (role: Role) => void; onOpenPalette: () => void }) {
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    try {
      window.localStorage.removeItem('ctl-ceo-role');
    } catch {}
    window.location.assign('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-[52px] border-b border-lang-line bg-lang-cream/95 text-lang-ink shadow-sm backdrop-blur">
      <div className="flex h-full w-full items-center justify-between gap-2 px-3 lg:px-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onMenuClick} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-lang-muted hover:bg-lang-mist hover:text-lang-ink lg:hidden" aria-label="Mở menu"><Menu className="h-4 w-4" /></button>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[13px] font-semibold leading-tight text-lang-ink">ERP Mini</p>
            <p className="text-[10px] font-medium leading-tight text-lang-muted">Kế Toán Cơm Tấm Làng</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* C2.3: hint Cmd/Ctrl+K mở command palette */}
          <button type="button" onClick={onOpenPalette} className="hidden h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-lang-paper px-2.5 text-[12px] font-bold text-lang-muted shadow-sm hover:bg-lang-mist hover:text-lang-ink md:inline-flex" title="Mở bảng lệnh (⌘K)" aria-label="Mở bảng lệnh">
            <span>Tìm / chuyển trang</span>
            <kbd className="rounded border border-lang-line bg-lang-mist px-1 text-[10px] font-black text-lang-ink">⌘K</kbd>
          </button>
          <Link href="/import-nhap-lieu" className="hidden h-8 items-center gap-1.5 rounded-lg bg-lang-red px-2.5 text-[12px] font-black text-white shadow-sm hover:bg-lang-redDark md:inline-flex"><FileInput className="h-3.5 w-3.5" aria-hidden="true" />Import</Link>
          <Link href="/tai-lieu" className="hidden h-8 items-center gap-1.5 rounded-lg border border-lang-line bg-lang-paper px-2.5 text-[12px] font-bold text-lang-ink shadow-sm hover:bg-lang-mist md:inline-flex"><FileText className="h-3.5 w-3.5" aria-hidden="true" />Tài liệu</Link>
          <button className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-lang-muted hover:bg-lang-mist hover:text-lang-ink" aria-label="Thông báo" title="Thông báo"><Bell className="h-3.5 w-3.5" aria-hidden="true" /><span className="absolute right-1 top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-lang-red px-1 text-[9px] font-black text-white">3</span></button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lang-muted hover:bg-lang-mist hover:text-lang-ink" aria-label="Trợ giúp" title="Trợ giúp"><HelpCircle className="h-3.5 w-3.5" aria-hidden="true" /></button>
          <div className="ml-1 hidden items-center gap-1.5 border-l border-lang-line pl-2 sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lang-mist text-lang-red"><UserRound className="h-4 w-4" aria-hidden="true" /></span>
            <div className="hidden text-right md:block">
              <p className="text-[11px] font-black leading-tight text-lang-ink">Người dùng</p>
              <p className="text-[10px] font-semibold leading-tight text-lang-muted">{role}</p>
            </div>
            <span className="inline-flex h-7 max-w-[150px] items-center rounded-lg border border-lang-line bg-lang-mist px-2 text-[10px] font-black text-lang-ink" title="Đăng xuất rồi đăng nhập lại để đổi vai trò">{role}</span>
            <button onClick={logout} className="hidden h-8 items-center gap-1.5 rounded-lg border border-lang-line px-2.5 text-[12px] font-bold text-lang-muted hover:bg-lang-mist hover:text-lang-ink lg:inline-flex" aria-label="Đăng xuất"><LogOut className="h-3.5 w-3.5" aria-hidden="true" />Đăng xuất</button>
          </div>
          <button onClick={logout} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-lang-muted hover:bg-lang-mist hover:text-lang-ink sm:hidden" aria-label="Đăng xuất" title="Đăng xuất"><LogOut className="h-3.5 w-3.5" aria-hidden="true" /></button>
        </div>
      </div>
    </header>
  );
}
