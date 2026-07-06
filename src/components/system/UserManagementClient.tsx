'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle } from '@/components/ui/Card';
import type { SafeAppUser, AppUserStatus } from '@/lib/auth/app-users';
import type { Role } from '@/lib/report-types';

const roles: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];
const statuses: AppUserStatus[] = ['active', 'locked', 'disabled'];

const statusLabel: Record<AppUserStatus, string> = {
  active: 'Đang hoạt động',
  locked: 'Đang khóa',
  disabled: 'Tạm tắt'
};

const statusVariant: Record<AppUserStatus, 'good' | 'warning' | 'danger'> = {
  active: 'good',
  locked: 'warning',
  disabled: 'danger'
};

type FormState = {
  username: string;
  displayName: string;
  email: string;
  role: Role;
  branchScope: string;
  status: AppUserStatus;
  password: string;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  note: string;
};

function blankForm(): FormState {
  return {
    username: '',
    displayName: '',
    email: '',
    role: 'Kế toán',
    branchScope: '',
    status: 'active',
    password: '',
    twoFactorEnabled: false,
    mustChangePassword: false,
    note: ''
  };
}

function formatTime(value: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export function UserManagementClient({ initialUsers }: { initialUsers: SafeAppUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [form, setForm] = useState<FormState>(blankForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'good' | 'danger' | 'warning'; text: string } | null>(null);

  const selectedUser = useMemo(() => users.find((user) => user.username === form.username.trim().toLowerCase()), [form.username, users]);
  const isEditing = Boolean(selectedUser);

  function editUser(user: SafeAppUser) {
    setForm({
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      branchScope: user.branchScope.join(', '),
      status: user.status,
      password: '',
      twoFactorEnabled: user.twoFactorEnabled,
      mustChangePassword: user.mustChangePassword,
      note: user.note
    });
    setMessage({ tone: 'warning', text: 'Đang sửa tài khoản. Để trống mật khẩu nếu không muốn đổi.' });
  }

  async function saveUser() {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          branchScope: form.branchScope.split(',').map((item) => item.trim()).filter(Boolean)
        })
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) throw new Error(payload?.error?.message ?? 'Không lưu được tài khoản.');
      const nextUser = payload.data as SafeAppUser;
      setUsers((current) => {
        const without = current.filter((user) => user.username !== nextUser.username);
        return [...without, nextUser].sort((a, b) => a.username.localeCompare(b.username));
      });
      setForm(blankForm());
      const setupSecret = payload?.twoFactorSetup?.secret ? ` Secret 2FA: ${payload.twoFactorSetup.secret}` : '';
      setMessage({ tone: 'good', text: `Đã lưu tài khoản.${setupSecret}` });
    } catch (error) {
      setMessage({ tone: 'danger', text: error instanceof Error ? error.message : 'Không lưu được tài khoản.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-lang-line bg-lang-mist px-3 py-2">
            <div>
              <CardTitle>Danh sách tài khoản</CardTitle>
              <p className="mt-0.5 text-[12px] font-semibold text-lang-muted">Chỉ CEO/Admin được xem và chỉnh. Mật khẩu cũ không hiển thị.</p>
            </div>
            <Badge variant="neutral">{users.length} tài khoản</Badge>
          </div>
          <div className="table-scroll max-h-[460px] overflow-auto">
            <table className="min-w-[1240px] border-separate border-spacing-0 text-[12px]">
              <thead className="sticky top-0 z-10 bg-lang-mist text-left uppercase tracking-wide text-lang-muted">
                <tr>
                  {['Tài khoản', 'Tên hiển thị', 'Email', 'Vai trò', 'Phạm vi', '2FA', 'Trạng thái', 'Đổi mật khẩu', 'Cập nhật', 'Thao tác'].map((header) => (
                    <th key={header} className="border-b border-lang-line px-3 py-2 font-black">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(users.length ? users : []).map((user) => (
                  <tr key={user.username} className="odd:bg-white even:bg-lang-cream2/45 hover:bg-lang-cream2">
                    <td className="border-b border-lang-line px-3 py-2 font-black text-lang-ink">{user.username}</td>
                    <td className="border-b border-lang-line px-3 py-2 font-semibold text-lang-ink">{user.displayName}</td>
                    <td className="border-b border-lang-line px-3 py-2 font-semibold text-lang-muted">{user.email || '—'}</td>
                    <td className="border-b border-lang-line px-3 py-2 font-semibold text-lang-muted">{user.role}</td>
                    <td className="border-b border-lang-line px-3 py-2 font-semibold text-lang-muted">{user.branchScope.length ? user.branchScope.join(', ') : 'Tất cả'}</td>
                    <td className="border-b border-lang-line px-3 py-2"><Badge variant={user.twoFactorEnabled ? 'good' : 'neutral'}>{user.twoFactorEnabled ? 'Bật' : 'Tắt'}</Badge></td>
                    <td className="border-b border-lang-line px-3 py-2"><Badge variant={statusVariant[user.status]}>{statusLabel[user.status]}</Badge></td>
                    <td className="border-b border-lang-line px-3 py-2 font-semibold text-lang-muted">{formatTime(user.lastPasswordChange)}</td>
                    <td className="border-b border-lang-line px-3 py-2 font-semibold text-lang-muted">{formatTime(user.updatedAt)} bởi {user.updatedBy || '—'}</td>
                    <td className="border-b border-lang-line px-3 py-2">
                      <Button variant="secondary" onClick={() => editUser(user)}>Sửa</Button>
                    </td>
                  </tr>
                ))}
                {!users.length ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-[13px] font-semibold text-lang-muted">Chưa có tài khoản trong app. Dùng tài khoản rescue từ Vercel để tạo tài khoản đầu tiên.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{isEditing ? 'Cập nhật tài khoản' : 'Tạo tài khoản mới'}</CardTitle>
              <p className="mt-1 text-[12px] font-semibold text-lang-muted">Mật khẩu được lưu dạng mã hóa một chiều, không xem lại được.</p>
            </div>
            {isEditing ? <Badge variant="warning">Đang sửa</Badge> : <Badge variant="good">Mới</Badge>}
          </div>

          <label className="block text-[12px] font-black text-lang-muted">
            Tên đăng nhập
            <input
              className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="vd: ketoan01"
            />
          </label>

          <label className="block text-[12px] font-black text-lang-muted">
            Tên hiển thị
            <input
              className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
              value={form.displayName}
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              placeholder="vd: Kế toán ca sáng"
            />
          </label>

          <label className="block text-[12px] font-black text-lang-muted">
            Email
            <input
              className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="user@congty.vn"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="block text-[12px] font-black text-lang-muted">
              Vai trò
              <select
                className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
                value={form.role}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as Role }))}
              >
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>

            <label className="block text-[12px] font-black text-lang-muted">
              Trạng thái
              <select
                className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AppUserStatus }))}
              >
                {statuses.map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}
              </select>
            </label>
          </div>

          <label className="block text-[12px] font-black text-lang-muted">
            Phạm vi cửa hàng
            <input
              className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
              value={form.branchScope}
              onChange={(event) => setForm((current) => ({ ...current, branchScope: event.target.value }))}
              placeholder="vd: NVT, Q5"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-lang-line bg-white px-3 text-[12px] font-black text-lang-muted">
              <input
                type="checkbox"
                checked={form.twoFactorEnabled}
                onChange={(event) => setForm((current) => ({ ...current, twoFactorEnabled: event.target.checked }))}
              />
              Bật 2FA
            </label>
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-lang-line bg-white px-3 text-[12px] font-black text-lang-muted">
              <input
                type="checkbox"
                checked={form.mustChangePassword}
                onChange={(event) => setForm((current) => ({ ...current, mustChangePassword: event.target.checked }))}
              />
              Buộc đổi mật khẩu
            </label>
          </div>

          <label className="block text-[12px] font-black text-lang-muted">
            {isEditing ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
            <input
              className="mt-1 h-10 w-full rounded-lg border border-lang-line bg-white px-3 text-[13px] font-bold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Tối thiểu 8 ký tự"
            />
          </label>

          <label className="block text-[12px] font-black text-lang-muted">
            Ghi chú
            <textarea
              className="mt-1 min-h-[86px] w-full rounded-lg border border-lang-line bg-white px-3 py-2 text-[13px] font-semibold text-lang-ink outline-none focus:border-lang-red focus:ring-2 focus:ring-lang-red/15"
              value={form.note}
              onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              placeholder="vd: tài khoản cho quản lý cửa hàng..."
            />
          </label>

          {message ? <div className="break-words text-[12px] font-bold"><Badge variant={message.tone}>{message.text}</Badge></div> : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={saveUser} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu tài khoản'}</Button>
            <Button variant="secondary" onClick={() => { setForm(blankForm()); setMessage(null); }}>Tạo mới</Button>
          </div>
        </Card>
      </div>

      <Card className="grid gap-3 md:grid-cols-3">
        <div>
          <CardTitle>Cách dùng an toàn</CardTitle>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-lang-muted">Tài khoản rescue trong Vercel chỉ dùng để vào app lần đầu hoặc khi khóa nhầm admin.</p>
        </div>
        <div>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-lang-muted">Chọn Sửa, nhập mật khẩu mới, bấm Lưu. App không cho xem lại mật khẩu cũ.</p>
        </div>
        <div>
          <CardTitle>Khóa người dùng</CardTitle>
          <p className="mt-1 text-[12px] font-semibold leading-5 text-lang-muted">Chuyển trạng thái sang Đang khóa hoặc Tạm tắt để chặn đăng nhập ngay.</p>
        </div>
      </Card>
    </div>
  );
}
