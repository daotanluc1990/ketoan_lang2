'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { ChangeEvent } from 'react';
import type { Role } from '@/lib/report-types';
import { CalendarClock, FileInput, LockKeyhole, Send } from 'lucide-react';

const roles: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-lang-line/70 bg-lang-paper/92 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] w-full max-w-[1640px] flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5 lg:px-6 xl:px-7">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-lang-red to-lang-redDark text-sm font-black text-white shadow-card ring-1 ring-lang-yellow/30">CTL</span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lang-red">Accounting Control Center</p>
              <h1 className="truncate text-xl font-black leading-tight text-lang-brown">ERP Mini Kế Toán · Data Master V8</h1>
              <p className="mt-0.5 truncate text-xs font-semibold text-lang-muted">Kế toán nhập liệu · CEO xem số liệu · Bot gửi báo cáo</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="warning">Production strict</Badge>
          <Badge variant="good">Import sống</Badge>
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-xs font-black text-lang-brown shadow-sm ring-1 ring-lang-line"><LockKeyhole className="h-3.5 w-3.5 text-lang-red" />{role}</span>
          <select value={role} onChange={(event: ChangeEvent<HTMLSelectElement>) => onRoleChange(event.target.value as Role)} className="h-10 rounded-2xl border border-lang-line bg-white px-3 text-xs font-black text-lang-brown shadow-sm outline-none focus:border-lang-red/50 focus:ring-2 focus:ring-lang-red/10" aria-label="Chọn vai trò">
            {roles.map((item) => <option key={item} value={item}>Chế độ xem: {item}</option>)}
          </select>
          <Link href="/import-nhap-lieu" className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-3 text-xs font-black text-lang-brown shadow-sm ring-1 ring-lang-line hover:bg-lang-cream2"><FileInput className="h-4 w-4 text-lang-red" />Import</Link>
          <Link href="/lich-su-chot-bao-cao" className="inline-flex h-10 items-center gap-2 rounded-2xl bg-lang-red px-3 text-xs font-black text-white shadow-card hover:bg-lang-redDark"><CalendarClock className="h-4 w-4" />Chốt tuần</Link>
          <Link href="/cai-dat-bot" className="inline-flex h-10 items-center gap-2 rounded-2xl bg-lang-yellow px-3 text-xs font-black text-lang-redDeep shadow-card hover:bg-lang-yellowSoft"><Send className="h-4 w-4" />Bot CEO</Link>
        </div>
      </div>
    </header>
  );
}
