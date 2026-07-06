'use client';

import { FormEvent, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import type { Role } from '@/lib/report-types';

const roles: Role[] = ['Kế toán', 'CEO', 'Admin', 'Quản lý cửa hàng'];

export function LoginForm({ nextPath, initialMessage }: { nextPath: string; initialMessage?: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<Role>('Kế toán');
  const [message, setMessage] = useState(initialMessage ?? '');
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    const response = await fetch('/api/auth/check', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password, otp, role, actor: role })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      setRequiresTwoFactor(Boolean(data?.requiresTwoFactor));
      setMessage(data?.message ?? 'Không đăng nhập được. Kiểm tra lại tài khoản.');
      setSubmitting(false);
      return;
    }
    window.location.assign(nextPath);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-lang-cream px-4 py-10 text-lang-ink">
      <div className="login-panel w-full">
        <div className="mb-5 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-lang-red text-white shadow-sm">
            <LockKeyhole className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-[22px] font-black leading-tight">Cơm Tấm Làng</h1>
            <p className="text-[13px] font-semibold text-lang-muted">ERP Mini Kế Toán</p>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-lg border border-lang-line bg-white p-5 shadow-card">
          <div className="mb-4 rounded-lg border border-lang-line bg-lang-cream2 px-3 py-2">
            <p className="text-[13px] font-black text-lang-ink">Đăng nhập nội bộ</p>
            <p className="mt-1 text-[12px] font-semibold text-lang-muted">Truy cập báo cáo kế toán và import dữ liệu thật.</p>
          </div>
          <div className="space-y-3">
            <label className="block">
              <span className="text-[12px] font-black text-black/70">Tài khoản</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-lang-line px-3 text-[14px] outline-none focus:border-lang-red" autoComplete="username" required />
            </label>
            <label className="block">
              <span className="text-[12px] font-black text-black/70">Mật khẩu</span>
              <input value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-lang-line px-3 text-[14px] outline-none focus:border-lang-red" type="password" autoComplete="current-password" required />
            </label>
            {requiresTwoFactor ? (
              <label className="block">
                <span className="text-[12px] font-black text-black/70">Mã 2FA</span>
                <input
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="mt-1 h-10 w-full rounded-lg border border-lang-line px-3 text-[14px] font-black tracking-[0.22em] outline-none focus:border-lang-red"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  required
                />
              </label>
            ) : null}
            <label className="block">
              <span className="text-[12px] font-black text-black/70">Vai trò</span>
              <select value={role} onChange={(event) => setRole(event.target.value as Role)} className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[14px] outline-none focus:border-lang-red">
                {roles.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          </div>
          {message ? <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[12px] font-bold text-red-700">{message}</p> : null}
          <button disabled={submitting} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-lang-red px-3 text-[13px] font-black text-white shadow-sm hover:bg-lang-redDark focus:outline-none focus:ring-2 focus:ring-lang-red/25 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
            <LogIn className="h-4 w-4" />
            {submitting ? 'Đang đăng nhập' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </main>
  );
}
