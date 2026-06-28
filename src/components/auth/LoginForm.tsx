'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import type { Role } from '@/lib/report-types';

const roles: Role[] = ['Kế toán', 'CEO', 'Admin', 'Quản lý cửa hàng'];

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('Kế toán');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    const response = await fetch('/api/auth/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password, role, actor: role })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      setMessage(data?.message ?? 'Không đăng nhập được. Kiểm tra lại tài khoản.');
      setSubmitting(false);
      return;
    }
    window.location.assign(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#f8f4ef] px-4 py-10 text-lang-ink">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-[420px] flex-col justify-center">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-lang-red text-white shadow-sm">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[22px] font-black leading-tight">Cơm Tấm Làng</h1>
            <p className="text-[13px] font-semibold text-black/55">ERP Mini Kế Toán</p>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-lg border border-lang-line bg-white p-4 shadow-soft">
          <div className="space-y-3">
            <label className="block">
              <span className="text-[12px] font-black text-black/70">Tài khoản</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-lang-line px-3 text-[14px] outline-none focus:border-lang-red" autoComplete="username" required />
            </label>
            <label className="block">
              <span className="text-[12px] font-black text-black/70">Mật khẩu</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-lang-line px-3 text-[14px] outline-none focus:border-lang-red" type="password" autoComplete="current-password" required />
            </label>
            <label className="block">
              <span className="text-[12px] font-black text-black/70">Vai trò</span>
              <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[14px] outline-none focus:border-lang-red">
                {roles.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          {message ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">{message}</p> : null}
          <button disabled={submitting} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-lang-red px-3 text-[13px] font-black text-white shadow-sm hover:bg-lang-redDark disabled:cursor-not-allowed disabled:opacity-60" type="submit">
            <LogIn className="h-4 w-4" />
            {submitting ? 'Đang đăng nhập' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  );
}
