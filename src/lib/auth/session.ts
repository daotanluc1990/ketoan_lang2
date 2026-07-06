import type { Role } from '@/lib/report-types';

const SESSION_COOKIE = 'ctl_auth';
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type AuthSession = {
  role: Role;
  actor: string;
  username?: string;
  email?: string;
  branchScope?: string[];
  provider?: 'password' | 'google_workspace' | 'rescue';
  expiresAt: number;
};

const ROLES: Role[] = ['CEO', 'Kế toán', 'Admin', 'Quản lý cửa hàng'];

export function getAuthCookieName() {
  return SESSION_COOKIE;
}

export function getAuthSecret() {
  return process.env.APP_SESSION_SECRET ?? process.env.AUTH_SESSION_SECRET ?? process.env.APP_PASSWORD ?? 'dev-session-secret';
}

export function getSessionMaxAgeSeconds() {
  const hours = Number(process.env.APP_SESSION_MAX_AGE_HOURS ?? process.env.AUTH_SESSION_MAX_AGE_HOURS ?? 12);
  return Math.max(1, Math.min(24 * 30, Number.isFinite(hours) ? hours : 12)) * 60 * 60;
}

function normalizeSessionRole(value: unknown): Role | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return ROLES.includes(trimmed as Role) ? trimmed as Role : null;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function signature(payload: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return bytesToHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return diff === 0;
}

function cleanOptionalString(value: unknown) {
  const text = String(value ?? '').trim();
  return text || undefined;
}

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item ?? '').trim()).filter(Boolean)
    : undefined;
}

function normalizeProvider(value: unknown): AuthSession['provider'] {
  return value === 'google_workspace' || value === 'rescue' || value === 'password' ? value : undefined;
}

export async function createAuthSessionCookie(input: {
  role: Role;
  actor?: string;
  username?: string;
  email?: string;
  branchScope?: string[];
  provider?: AuthSession['provider'];
}, now = Date.now()) {
  const session: AuthSession = {
    role: input.role,
    actor: input.actor?.trim() || input.role,
    username: cleanOptionalString(input.username),
    email: cleanOptionalString(input.email),
    branchScope: cleanStringArray(input.branchScope),
    provider: input.provider,
    expiresAt: now + getSessionMaxAgeSeconds() * 1000
  };
  const payload = bytesToBase64Url(encoder.encode(JSON.stringify(session)));
  const sig = await signature(payload, getAuthSecret());
  return `v1.${payload}.${sig}`;
}

export async function verifyAuthSessionCookie(value?: string | null, now = Date.now()): Promise<AuthSession | null> {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') return null;
  const [, payload, sig] = parts;
  const expected = await signature(payload, getAuthSecret());
  if (!safeEqual(sig, expected)) return null;
  try {
    const parsed = JSON.parse(decoder.decode(base64UrlToBytes(payload))) as Partial<AuthSession>;
    const role = normalizeSessionRole(parsed.role);
    if (!role || !parsed.expiresAt || parsed.expiresAt < now) return null;
    return {
      role,
      actor: String(parsed.actor ?? role),
      username: cleanOptionalString(parsed.username),
      email: cleanOptionalString(parsed.email),
      branchScope: cleanStringArray(parsed.branchScope),
      provider: normalizeProvider(parsed.provider),
      expiresAt: parsed.expiresAt
    };
  } catch {
    return null;
  }
}
