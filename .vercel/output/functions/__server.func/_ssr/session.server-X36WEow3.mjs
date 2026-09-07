import { a as getCookie, i as deleteCookie$1, o as getRequestUrl, s as setCookie$1 } from "./ssr.mjs";
import { n as getSql } from "./api-Cjt2ALPH.mjs";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/session.server-X36WEow3.js
var COOKIE_NAME = "chief_cal";
var STARTER_PASSWORD = "wearechief";
var TOKEN_TTL_MS = 2592e6;
function hashPassword(password, salt = randomBytes(16).toString("hex")) {
	return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}
function verifyPassword(password, stored) {
	const [salt, hash] = stored.split(":");
	if (!salt || !hash) return false;
	const next = scryptSync(password, salt, 32);
	const prev = Buffer.from(hash, "hex");
	if (next.length !== prev.length) return false;
	return timingSafeEqual(next, prev);
}
function signToken(secret, exp) {
	const payload = String(exp);
	return `${payload}.${createHmac("sha256", secret).update(payload).digest("hex")}`;
}
function readToken(token, secret) {
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
async function ensureSettings() {
	const sql = await getSql();
	const existing = await sql`
    select password_hash, session_secret from team_settings where id = 1
  `;
	if (existing[0]) return existing[0];
	const row = {
		password_hash: hashPassword(STARTER_PASSWORD),
		session_secret: randomBytes(32).toString("hex")
	};
	await sql`
    insert into team_settings (id, password_hash, session_secret)
    values (1, ${row.password_hash}, ${row.session_secret})
  `;
	return row;
}
async function isDefaultPassword() {
	return verifyPassword(STARTER_PASSWORD, (await ensureSettings()).password_hash);
}
function cookieSecure() {
	try {
		return getRequestUrl({
			xForwardedHost: true,
			xForwardedProto: true
		}).protocol === "https:";
	} catch {
		return false;
	}
}
function writeSessionCookie(token) {
	setCookie$1(COOKIE_NAME, token, {
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		maxAge: TOKEN_TTL_MS / 1e3,
		secure: cookieSecure()
	});
}
async function loginWithPassword(password) {
	const settings = await ensureSettings();
	if (!verifyPassword(password, settings.password_hash)) throw new Error("Wrong password");
	const token = signToken(settings.session_secret, Date.now() + TOKEN_TTL_MS);
	writeSessionCookie(token);
	return { token };
}
async function logoutSession() {
	deleteCookie$1(COOKIE_NAME, { path: "/" });
}
async function verifySession(clientToken) {
	const settings = await ensureSettings();
	const token = getCookie("chief_cal") || clientToken || "";
	if (!token) return false;
	return readToken(token, settings.session_secret);
}
async function requireSession(clientToken) {
	if (!await verifySession(clientToken)) {
		const err = /* @__PURE__ */ new Error("Unauthorized");
		err.status = 401;
		throw err;
	}
}
async function changeTeamPassword(current, next) {
	if (next.trim().length < 6) throw new Error("New password must be at least 6 characters");
	const sql = await getSql();
	if (!verifyPassword(current, (await ensureSettings()).password_hash)) throw new Error("Current password is wrong");
	await sql`
    update team_settings
    set password_hash = ${hashPassword(next)}, updated_at = now()
    where id = 1
  `;
}
//#endregion
export { STARTER_PASSWORD, changeTeamPassword, ensureSettings, isDefaultPassword, loginWithPassword, logoutSession, requireSession, verifySession };
