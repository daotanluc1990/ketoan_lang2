'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { ChangeEvent } from 'react';
import type { Role } from '@/lib/report-types';

const roles: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex min-h-16 w-full flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-4 lg:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-lang-red text-xs font-black text-white shadow-sm">L</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lang-red">Cơm Tấm Làng · Accounting Control</p>
              <h1 className="truncate text-base font-extrabold text-lang-brown">ERP Mini Kế Toán · Data Master V7</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="warning">Production data strict</Badge>
          <Badge variant="neutral">Vai trò: {role}</Badge>
          <select value={role} onChange={(event: ChangeEvent<HTMLSelectElement>) => onRoleChange(event.target.value as Role)} className="h-9 rounded-xl border border-black/10 bg-lang-cream px-2 text-xs font-bold text-lang-brown shadow-sm" aria-label="Chọn vai trò">
            {roles.map((item) => <option key={item} value={item}>Chế độ xem: {item}</option>)}
          </select>
          <Link href="/import-nhap-lieu" className="h-9 rounded-xl bg-white px-3 py-2 text-xs font-bold text-lang-brown shadow-sm ring-1 ring-black/10 hover:bg-lang-cream">Import dữ liệu</Link>
          <Link href="/lich-su-chot-bao-cao" className="h-9 rounded-xl bg-lang-red px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-lang-redDark">Chốt báo cáo</Link>
        </div>
      </div>
    </header>
  );
}
