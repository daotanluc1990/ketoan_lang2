'use client';

import Link from 'next/link';
import type { Role } from '@/lib/report-types';
import { Bell, FileInput, HelpCircle, LogOut, Menu, Send, UserRound } from 'lucide-react';

export function TopBar({ role, onMenuClick }: { role: Role; onMenuClick: () => void; onRoleChange: (role: Role) => void }) {
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    try {
      window.localStorage.removeItem('ctl-ceo-role');
    } catch {}
    window.location.assign('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-[52px] border-b border-lang-redDeep bg-lang-redDeep text-white shadow-sm">
      <div className="flex h-full w-full items-center justify-between gap-2 px-3 lg:px-4">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onMenuClick} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/10 lg:hidden" aria-label="Mở menu"><Menu className="h-4 w-4" /></button>
          <span className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/65 lg:inline-flex"><Menu className="h-4 w-4" /></span>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[13px] font-black leading-tight">ERP Mini</p>
            <p className="text-[10px] font-semibold leading-tight text-white/70">Kế Toán Cơm Tấm Làng</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/import-nhap-lieu" className="hidden h-8 items-center gap-1.5 rounded-lg bg-lang-yellow px-2.5 text-[12px] font-black text-lang-redDeep shadow-sm hover:bg-yellow-300 md:inline-flex"><FileInput className="h-3.5 w-3.5" />Import</Link>
          <Link href="/tai-lieu/quy-trinh-checklist" className="hidden h-8 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-[12px] font-bold text-white ring-1 ring-white/20 hover:bg-white/15 md:inline-flex"><Send className="h-3.5 w-3.5 text-lang-yellow" />Tài liệu/AI</Link>
          <button className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Thông báo" title="Thông báo"><Bell className="h-3.5 w-3.5" /><span className="absolute right-1 top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-lang-red">3</span></button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Trợ giúp" title="Trợ giúp"><HelpCircle className="h-3.5 w-3.5" /></button>
          <div className="ml-1 hidden items-center gap-1.5 border-l border-white/15 pl-2 sm:flex">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/18"><UserRound className="h-4 w-4" /></span>
            <div className="hidden text-right md:block">
              <p className="text-[11px] font-black leading-tight">Người dùng</p>
              <p className="text-[10px] font-semibold leading-tight text-white/70">{role}</p>
            </div>
            <span className="inline-flex h-7 max-w-[150px] items-center rounded-lg border border-white/20 bg-white/10 px-2 text-[10px] font-black text-white" title="Đăng xuất rồi đăng nhập lại để đổi vai trò">{role}</span>
            <button onClick={logout} className="hidden h-8 items-center gap-1.5 rounded-lg border border-white/20 px-2.5 text-[12px] font-bold text-white/90 hover:bg-white/10 lg:inline-flex" aria-label="Đăng xuất"><LogOut className="h-3.5 w-3.5" />Đăng xuất</button>
          </div>
          <button onClick={logout} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 sm:hidden" aria-label="Đăng xuất" title="Đăng xuất"><LogOut className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </header>
  );
}
