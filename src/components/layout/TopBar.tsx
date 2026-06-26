'use client';

import Link from 'next/link';
import type { ChangeEvent } from 'react';
import type { Role } from '@/lib/report-types';
import { Bell, ChevronDown, HelpCircle, Menu, Send, UserRound } from 'lucide-react';

const roles: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <header className="sticky top-0 z-20 h-[58px] border-b border-lang-redDark bg-gradient-to-r from-lang-redDark to-lang-red text-white shadow-sm">
      <div className="flex h-full w-full items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/85 hover:bg-white/10" aria-label="Menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden min-w-0 sm:block">
            <p className="text-sm font-black leading-tight">ERP Mini</p>
            <p className="text-[11px] font-semibold leading-tight text-white/75">Kế Toán Cơm Tấm Làng</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/import-nhap-lieu" className="hidden h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-black text-lang-red shadow-sm hover:bg-gray-50 md:inline-flex">Import dữ liệu</Link>
          <Link href="/cai-dat-bot" className="hidden h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-xs font-black text-white ring-1 ring-white/20 hover:bg-white/15 md:inline-flex"><Send className="h-4 w-4" />Gửi CEO/Bot</Link>
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Thông báo"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-lang-red">3</span></button>
          <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 hover:bg-white/10" aria-label="Trợ giúp"><HelpCircle className="h-4 w-4" /></button>
          <div className="ml-1 flex items-center gap-2 border-l border-white/15 pl-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/18"><UserRound className="h-5 w-5" /></span>
            <div className="hidden text-right md:block">
              <p className="text-xs font-black leading-tight">Người dùng</p>
              <p className="text-[11px] font-semibold leading-tight text-white/72">{role}</p>
            </div>
            <select value={role} onChange={(event: ChangeEvent<HTMLSelectElement>) => onRoleChange(event.target.value as Role)} className="h-8 max-w-[150px] rounded-lg border border-white/20 bg-white/10 px-2 text-[11px] font-bold text-white outline-none" aria-label="Chọn vai trò">
              {roles.map((item) => <option className="text-lang-ink" key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown className="hidden h-4 w-4 text-white/70 md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
