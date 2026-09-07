import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { getCookie, getRequestUrl, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";

export const COOKIE_NAME = "chief_cal";
export const STARTER_PASSWORD = "wearechief";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30;

type SettingsRow = { password_hash: string; session_secret: string };

function hashPassword(password: string, salt = randomBytes(16).toString("hex")): string {
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function signToken(secret: string, exp: number): string {
  const payload = String(exp);
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function readToken(token: string, secret: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(payload);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function ensureSettings(): Promise<SettingsRow> {
  const sql = await getSql();
  const existing = await sql<SettingsRow>`
    select password_hash, session_secret from team_settings where id = 1
  `;
  if (existing[0]) return existing[0];
  const row: SettingsRow = {
    password_hash: hashPassword(STARTER_PASSWORD),
    session_secret: randomBytes(32).toString("hex"),
  };
  await sql`
    insert into team_settings (id, password_hash, session_secret)
    values (1, ${row.password_hash}, ${row.session_secret})
  `;
  return row;
}

export async function isDefaultPassword(): Promise<boolean> {
  const settings = await ensureSettings();
  return verifyPassword(STARTER_PASSWORD, settings.password_hash);
}

function cookieSecure(): boolean {
  try {
    const url = getRequestUrl({ xForwardedHost: true, xForwardedProto: true });
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function writeSessionCookie(token: string) {
  setCookie(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: TOKEN_TTL_MS / 1000,
    secure: cookieSecure(),
  });
}

export async function loginWithPassword(password: string): Promise<{ token: string }> {
  const settings = await ensureSettings();
  if (!verifyPassword(password, settings.password_hash)) {
    throw new Error("Wrong password");
  }
  const token = signToken(settings.session_secret, Date.now() + TOKEN_TTL_MS);
  writeSessionCookie(token);
  return { token };
}

export async function logoutSession() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

export async function verifySession(clientToken?: string): Promise<boolean> {
  const settings = await ensureSettings();
  const token = getCookie(COOKIE_NAME) || clientToken || "";
  if (!token) return false;
  return readToken(token, settings.session_secret);
}

export async function requireSession(clientToken?: string): Promise<void> {
  const ok = await verifySession(clientToken);
  if (!ok) {
    const err = new Error("Unauthorized");
    (err as Error & { status?: number }).status = 401;
    throw err;
  }
}

export async function changeTeamPassword(current: string, next: string): Promise<void> {
  if (next.trim().length < 6) {
    throw new Error("New password must be at least 6 characters");
  }
  const sql = await getSql();
  const settings = await ensureSettings();
  if (!verifyPassword(current, settings.password_hash)) {
    throw new Error("Current password is wrong");
  }
  const password_hash = hashPassword(next);
  await sql`
    update team_settings
    set password_hash = ${password_hash}, updated_at = now()
    where id = 1
  `;
}
