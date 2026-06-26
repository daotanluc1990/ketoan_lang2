'use client';

import { Badge } from '@/components/ui/Badge';
import type { ChangeEvent } from 'react';
import type { Role } from '@/lib/report-types';

const roles: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (role: Role) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-lang-cream/95 backdrop-blur">
      <div className="flex min-h-14 w-full flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lang-red">Cơm Tấm Làng</p>
          <h1 className="truncate text-base font-bold text-lang-brown">ERP Mini Kế Toán · Data Master V7</h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Badge variant="warning">Production data strict</Badge>
          <Badge variant="neutral">RBAC: {role}</Badge>
          <select value={role} onChange={(event: ChangeEvent<HTMLSelectElement>) => onRoleChange(event.target.value as Role)} className="h-9 rounded-lg border border-black/10 bg-white px-2 text-xs font-semibold shadow-sm" aria-label="Chọn vai trò">
            {roles.map((item) => <option key={item} value={item}>Vai trò: {item}</option>)}
          </select>
          <button className="h-9 rounded-lg bg-lang-red px-3 text-xs font-semibold text-white shadow-sm hover:bg-lang-redDark" type="button">Gửi CEO/Bot</button>
        </div>
      </div>
    </header>
  );
}
