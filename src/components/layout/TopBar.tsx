'use client';

import Link from 'next/link';
import type { ChangeEvent } from 'react';
import type { Role } from '@/lib/report-types';
import { Bell, HelpCircle, LogOut, Menu, Send, UserRound } from 'lucide-react';

const roles: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);
    try {
      window.localStorage.removeItem('ctl-ceo-role');
    } catch {}
    window.location.assign('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-[52px] border-b border-lang-redDark bg-gradient-to-r from-lang-redDark to-lang-red text-white shadow-sm">
      <div className="flex h-full w-full items-center justify-between gap-2 px-3 lg:px-4">
        <div className="flex items-center gap-2">
          <button type="button" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/85 hover:bg-white/10" aria-label="Menu"><Menu className="h-4 w-4" /></button>
          <div className="hidden min-w-0 sm:block">
            <p className="text-[13px] font-black leading-tight">ERP Mini</p>
            <p className="text-[10px] font-semibold leading-tight text-white/70">Kế Toán Cơm Tấm Làng</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/import-nhap-lieu" className="hidden h-8 items-center gap-1.5 rounded-lg bg-white px-2.5 text-[12px] font-bold text-lang-red shadow-sm hover:bg-gray-50 md:inline-flex">Import</Link>
          <Link href="/cai-dat-bot" className="hidden h-8 items-center gap-1.5 rounded-lg bg-white/10 px-2.5 text-[12px] font-bold text-white ring-1 ring-white/20 hover:bg-white/15 md:inline-flex"><Send className="h-3.5 w-3.5" />CEO/Bot</Link>
          <button className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Thông báo"><Bell className="h-3.5 w-3.5" /><span className="absolute right-1 top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-white px-1 text-[9px] font-black text-lang-red">3</span></button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Trợ giúp"><HelpCircle className="h-3.5 w-3.5" /></button>
          <button onClick={logout} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Đăng xuất"><LogOut className="h-3.5 w-3.5" /></button>
          <div className="ml-1 flex items-center gap-1.5 border-l border-white/15 pl-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/18"><UserRound className="h-4 w-4" /></span>
            <div className="hidden text-right md:block">
              <p className="text-[11px] font-black leading-tight">Người dùng</p>
              <p className="text-[10px] font-semibold leading-tight text-white/70">{role}</p>
            </div>
            <select value={role} onChange={(event: ChangeEvent<HTMLSelectElement>) => onRoleChange(event.target.value as Role)} disabled className="h-7 max-w-[132px] rounded-lg border border-white/20 bg-white/10 px-2 text-[10px] font-bold text-white outline-none disabled:opacity-80" aria-label="Vai trò hiện tại" title="Đăng xuất rồi đăng nhập lại để đổi vai trò">
              {roles.map((item) => <option className="text-lang-ink" key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
