import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { getDataStore } from '@/lib/data-store';
import { getServerEnv } from '@/lib/env/server-env';
import { SHEET_NAMES } from '@/lib/google-sheets/sheet-names';
import type { Role } from '@/lib/report-types';
import { normalizeRole } from '@/lib/rbac/rbac';
import { buildOtpAuthUrl, generateTotpSecret, verifyTotpCode } from './totp';

const USER_CONFIG_TYPE = 'APP_USER';
const HASH_ALGORITHM = 'pbkdf2_sha256';
const HASH_ITERATIONS = 120_000;
const HASH_KEY_LENGTH = 32;

export type AppUserStatus = 'active' | 'locked' | 'disabled';

export type SafeAppUser = {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  googleWorkspaceEmail: string;
  role: Role;
  branchScope: string[];
  status: AppUserStatus;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  failedLoginCount: number;
  lastLoginAt: string;
  updatedAt: string;
  updatedBy: string;
  lastPasswordChange: string;
  note: string;
};

type StoredUserSecret = {
  passwordHash: string;
  twoFactorSecret: string;
  backupCodesHash: string;
  lastPasswordChange: string;
};

type StoredUserValue = StoredUserSecret & {
  userId: string;
  username: string;
  displayName: string;
  email: string;
  googleWorkspaceEmail: string;
  role: Role;
  branchScope: string[];
  status: AppUserStatus;
  twoFactorEnabled: boolean;
  mustChangePassword: boolean;
  failedLoginCount: number;
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  note: string;
};

type LoginFailureReason =
  | 'not_found'
  | 'locked'
  | 'disabled'
  | 'bad_password'
  | 'otp_required'
  | 'bad_otp'
  | 'otp_setup_required';

function normalizeUsername(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase();
}

function nowIso() {
  return new Date().toISOString();
}

function safeStatus(value: unknown): AppUserStatus {
  if (value === 'locked' || value === 'disabled') return value;
  return 'active';
}

function parseBoolean(value: unknown) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'co', 'có', 'bat', 'bật'].includes(normalized);
}

function parseNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCsv(value: unknown) {
  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function serializeCsv(value: string[]) {
  return value.map((item) => item.trim()).filter(Boolean).join(', ');
}

function dedupeScope(value: unknown) {
  const raw = Array.isArray(value) ? value : parseCsv(value);
  return Array.from(new Set(raw.map((item) => String(item ?? '').trim()).filter(Boolean)));
}

function safeEqual(left: Buffer, right: Buffer) {
  return left.length === right.length && timingSafeEqual(left, right);
}

function toSafeUser(value: StoredUserValue): SafeAppUser {
  return {
    userId: value.userId,
    username: value.username,
    displayName: value.displayName,
    email: value.email,
    googleWorkspaceEmail: value.googleWorkspaceEmail,
    role: value.role,
    branchScope: value.branchScope,
    status: value.status,
    twoFactorEnabled: value.twoFactorEnabled,
    mustChangePassword: value.mustChangePassword,
    failedLoginCount: value.failedLoginCount,
    lastLoginAt: value.lastLoginAt,
    updatedAt: value.updatedAt,
    updatedBy: value.updatedBy,
    lastPasswordChange: value.lastPasswordChange,
    note: value.note
  };
}

function parseDedicatedUser(row: Record<string, unknown>): StoredUserValue | null {
  const username = normalizeUsername(row.username);
  const role = normalizeRole(row.role);
  if (!username || !role) return null;
  const updatedAt = String(row.updated_at ?? '').trim();
  const createdAt = String(row.created_at ?? '').trim();
  return {
    userId: String(row.user_id ?? username).trim() || username,
    username,
    displayName: String(row.display_name ?? username).trim() || username,
    email: normalizeEmail(row.email),
    googleWorkspaceEmail: normalizeEmail(row.google_workspace_email),
    role,
    branchScope: dedupeScope(row.branch_scope),
    status: safeStatus(row.status),
    passwordHash: String(row.password_hash ?? ''),
    twoFactorEnabled: parseBoolean(row.two_factor_enabled),
    twoFactorSecret: String(row.two_factor_secret ?? ''),
    backupCodesHash: String(row.backup_codes_hash ?? ''),
    mustChangePassword: parseBoolean(row.must_change_password),
    failedLoginCount: parseNumber(row.failed_login_count),
    lastLoginAt: String(row.last_login_at ?? ''),
    lastPasswordChange: String(row.last_password_change ?? ''),
    createdAt,
    updatedAt: updatedAt || createdAt,
    updatedBy: String(row.updated_by ?? ''),
    note: String(row.note ?? '')
  };
}

function parseLegacyUserValue(value: unknown, username: string, row: Record<string, unknown>): StoredUserValue | null {
  try {
    const parsed = JSON.parse(String(value ?? '{}')) as Partial<StoredUserValue>;
    const role = normalizeRole(parsed.role);
    if (!role || !parsed.passwordHash) return null;
    const updatedAt = String(parsed.updatedAt ?? row.ap_dung_tu_ngay ?? '');
    const displayName = String(parsed.displayName ?? row.ten ?? username).trim() || username;
    return {
      userId: username,
      username,
      displayName,
      email: normalizeEmail(parsed.email),
      googleWorkspaceEmail: normalizeEmail(parsed.googleWorkspaceEmail),
      role,
      branchScope: dedupeScope(parsed.branchScope),
      status: safeStatus(parsed.status),
      passwordHash: String(parsed.passwordHash),
      twoFactorEnabled: parseBoolean(parsed.twoFactorEnabled),
      twoFactorSecret: String(parsed.twoFactorSecret ?? ''),
      backupCodesHash: String(parsed.backupCodesHash ?? ''),
      mustChangePassword: parseBoolean(parsed.mustChangePassword),
      failedLoginCount: parseNumber(parsed.failedLoginCount),
      lastLoginAt: String(parsed.lastLoginAt ?? ''),
      lastPasswordChange: String(parsed.lastPasswordChange ?? ''),
      createdAt: updatedAt,
      updatedAt,
      updatedBy: String(parsed.updatedBy ?? row.nguoi_duyet ?? ''),
      note: String(parsed.note ?? row.ghi_chu ?? '')
    };
  } catch {
    return null;
  }
}

function newestByUsername(users: StoredUserValue[]) {
  const latest = new Map<string, StoredUserValue>();
  for (const user of users) {
    const current = latest.get(user.username);
    if (!current || String(user.updatedAt) >= String(current.updatedAt)) latest.set(user.username, user);
  }
  return Array.from(latest.values()).sort((a, b) => a.username.localeCompare(b.username));
}

async function readDedicatedUsers() {
  const rows = await getDataStore().read(SHEET_NAMES.DM_NGUOI_DUNG).catch(() => [] as Record<string, unknown>[]);
  return rows.map(parseDedicatedUser).filter((user): user is StoredUserValue => Boolean(user));
}

async function readLegacyUsers() {
  const rows = await getDataStore().read(SHEET_NAMES.CONFIG_MASTER).catch(() => [] as Record<string, unknown>[]);
  const users: StoredUserValue[] = [];
  for (const row of rows) {
    if (String(row.config_type ?? '').trim() !== USER_CONFIG_TYPE) continue;
    const username = normalizeUsername(row.ma);
    if (!username) continue;
    const value = parseLegacyUserValue(row.gia_tri, username, row);
    if (value) users.push(value);
  }
  return users;
}

async function readStoredUsers() {
  return newestByUsername([...(await readLegacyUsers()), ...(await readDedicatedUsers())]);
}

async function readStoredUser(username: string): Promise<StoredUserValue | null> {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;
  return (await readStoredUsers()).find((user) => user.username === normalized) ?? null;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, 'sha256').toString('base64url');
  return `${HASH_ALGORITHM}$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, iterationsRaw, salt, expectedHash] = encodedHash.split('$');
  const iterations = Number(iterationsRaw);
  if (algorithm !== HASH_ALGORITHM || !Number.isFinite(iterations) || !salt || !expectedHash) return false;
  const actual = pbkdf2Sync(password, salt, iterations, HASH_KEY_LENGTH, 'sha256');
  return safeEqual(actual, Buffer.from(expectedHash, 'base64url'));
}

export async function listAppUsers(): Promise<SafeAppUser[]> {
  return (await readStoredUsers()).map(toSafeUser);
}

export async function validateAppUserLogin(username: string, password: string, otp?: string) {
  const user = await readStoredUser(username);
  if (!user) return { ok: false as const, reason: 'not_found' as LoginFailureReason };
  if (user.status !== 'active') return { ok: false as const, reason: user.status };
  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) return { ok: false as const, reason: 'bad_password' as LoginFailureReason };
  if (user.twoFactorEnabled) {
    if (!user.twoFactorSecret) return { ok: false as const, reason: 'otp_setup_required' as LoginFailureReason };
    if (!String(otp ?? '').trim()) return { ok: false as const, reason: 'otp_required' as LoginFailureReason };
    if (!verifyTotpCode(user.twoFactorSecret, String(otp))) return { ok: false as const, reason: 'bad_otp' as LoginFailureReason };
  }
  return { ok: true as const, user: toSafeUser(user) };
}

export async function upsertAppUser(input: {
  username: string;
  password?: string;
  displayName: string;
  email?: string;
  role: Role;
  branchScope?: string[];
  status: AppUserStatus;
  twoFactorEnabled?: boolean;
  mustChangePassword?: boolean;
  actor: string;
  note?: string;
}) {
  const username = normalizeUsername(input.username);
  if (!username) throw new Error('Thiếu tài khoản.');
  const role = normalizeRole(input.role) ?? 'Kế toán';
  const existing = await readStoredUser(username);
  const timestamp = nowIso();
  const email = normalizeEmail(input.email);
  const googleWorkspaceEmail = existing?.googleWorkspaceEmail ?? '';
  const passwordHash = input.password ? hashPassword(input.password) : existing?.passwordHash ?? '';
  if (!passwordHash) throw new Error('Tài khoản nội bộ mới phải có mật khẩu.');

  let twoFactorSecret = existing?.twoFactorSecret ?? '';
  let twoFactorSetup: { secret: string; otpauthUrl: string } | undefined;
  if (input.twoFactorEnabled) {
    if (!existing?.twoFactorEnabled || !twoFactorSecret) {
      twoFactorSecret = generateTotpSecret();
      twoFactorSetup = {
        secret: twoFactorSecret,
        otpauthUrl: buildOtpAuthUrl({
          issuer: getServerEnv().twoFactorIssuer,
          accountName: email || username,
          secret: twoFactorSecret
        })
      };
    }
  } else {
    twoFactorSecret = '';
  }

  const payload: StoredUserValue = {
    userId: existing?.userId ?? username,
    username,
    displayName: input.displayName.trim() || username,
    email,
    googleWorkspaceEmail,
    role,
    branchScope: dedupeScope(input.branchScope),
    status: safeStatus(input.status),
    passwordHash,
    twoFactorEnabled: Boolean(input.twoFactorEnabled),
    twoFactorSecret,
    backupCodesHash: existing?.backupCodesHash ?? '',
    mustChangePassword: Boolean(input.mustChangePassword),
    failedLoginCount: existing?.failedLoginCount ?? 0,
    lastLoginAt: existing?.lastLoginAt ?? '',
    lastPasswordChange: input.password ? timestamp : existing?.lastPasswordChange ?? timestamp,
    createdAt: existing?.createdAt ?? timestamp,
    updatedAt: timestamp,
    updatedBy: input.actor,
    note: input.note?.trim() ?? ''
  };

  await getDataStore().append(SHEET_NAMES.DM_NGUOI_DUNG, [{
    user_id: payload.userId,
    username: payload.username,
    display_name: payload.displayName,
    email: payload.email,
    google_workspace_email: payload.googleWorkspaceEmail,
    role: payload.role,
    branch_scope: serializeCsv(payload.branchScope),
    status: payload.status,
    password_hash: payload.passwordHash,
    two_factor_enabled: payload.twoFactorEnabled ? 'true' : 'false',
    two_factor_secret: payload.twoFactorSecret,
    backup_codes_hash: payload.backupCodesHash,
    must_change_password: payload.mustChangePassword ? 'true' : 'false',
    failed_login_count: payload.failedLoginCount,
    last_login_at: payload.lastLoginAt,
    last_password_change: payload.lastPasswordChange,
    created_at: payload.createdAt,
    updated_at: payload.updatedAt,
    updated_by: payload.updatedBy,
    note: payload.note
  }]);

  return { user: toSafeUser(payload), twoFactorSetup };
}
