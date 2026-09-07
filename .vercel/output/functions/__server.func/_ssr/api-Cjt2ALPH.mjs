import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-Cjt2ALPH.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var _0002_schema_default = "-- Shared team marketing calendar (unowned rows — no per-user accounts).\ncreate table if not exists team_settings (\n  id integer primary key check (id = 1),\n  password_hash text not null,\n  session_secret text not null,\n  updated_at timestamptz not null default now()\n);\n\ncreate table if not exists key_dates (\n  id serial primary key,\n  name text not null,\n  start_date date not null,\n  end_date date,\n  region text not null,\n  category text not null,\n  notes text not null default '',\n  is_system boolean not null default true,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists campaigns (\n  id serial primary key,\n  title text not null,\n  channel text not null,\n  send_date date not null,\n  send_time text not null default '',\n  market text not null,\n  status text not null default 'draft',\n  subject text not null default '',\n  audience text not null default '',\n  notes text not null default '',\n  key_date_id integer references key_dates(id) on delete set null,\n  created_at timestamptz not null default now(),\n  updated_at timestamptz not null default now()\n);\n\ncreate index if not exists key_dates_start_idx on key_dates (start_date);\ncreate index if not exists key_dates_region_idx on key_dates (region);\ncreate index if not exists campaigns_send_idx on campaigns (send_date);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_schema.sql": _0002_schema_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
function pad(n) {
	return String(n).padStart(2, "0");
}
function iso(year, month, day) {
	return `${year}-${pad(month)}-${pad(day)}`;
}
function nthWeekday(year, month, weekday, n) {
	return iso(year, month, 1 + (weekday - new Date(year, month - 1, 1).getDay() + 7) % 7 + (n - 1) * 7);
}
function lastWeekday(year, month, weekday) {
	const last = new Date(year, month, 0).getDate();
	return iso(year, month, last - (new Date(year, month - 1, last).getDay() - weekday + 7) % 7);
}
function firstSunday(year, month) {
	return nthWeekday(year, month, 0, 1);
}
/** Anonymous Gregorian algorithm — returns Easter Sunday. */
function easterSunday(year) {
	const a = year % 19;
	const b = Math.floor(year / 100);
	const c = year % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = (h + l - 7 * m + 114) % 31 + 1;
	return new Date(year, month - 1, day);
}
function shift(date, days) {
	const n = new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
	return iso(n.getFullYear(), n.getMonth() + 1, n.getDate());
}
function fromParts(isoDate) {
	const [y, m, d] = isoDate.split("-").map(Number);
	return new Date(y, m - 1, d);
}
var LUNAR = {
	2026: {
		cny: "2026-02-17",
		diwali: "2026-11-08"
	},
	2027: {
		cny: "2027-02-06",
		diwali: "2027-10-29"
	}
};
var SUPER_BOWL = {
	2026: "2026-02-08",
	2027: "2027-02-14"
};
function buildYear(year) {
	const easter = easterSunday(year);
	const lunar = LUNAR[year];
	const rows = [];
	const add = (name, start, opts) => {
		rows.push({
			name,
			start,
			end: opts?.end,
			region: opts?.region ?? "BOTH",
			category: opts?.category ?? "public",
			notes: opts?.notes
		});
	};
	add("New Year's Day", iso(year, 1, 1), { notes: "National public holiday" });
	add("New Year's resolutions window", iso(year, 1, 1), {
		end: iso(year, 1, 14),
		category: "retail",
		notes: "Health, protein, new-year reset campaigns"
	});
	add("Martin Luther King Jr. Day", nthWeekday(year, 1, 1, 3), {
		region: "US",
		notes: "3rd Monday in January"
	});
	add("Australia Day", iso(year, 1, 26), {
		region: "AU",
		notes: "National public holiday"
	});
	add("Back to school (AU)", iso(year, 1, 27), {
		end: iso(year, 2, 6),
		region: "AU",
		category: "school",
		notes: "Lunchbox / lunchbox bar window as NSW term 1 starts"
	});
	add("Chinese New Year", lunar?.cny ?? iso(year, 2, 1), {
		category: "cultural",
		notes: "Lunar new year — gifting and family meals"
	});
	add("Super Bowl", SUPER_BOWL[year] ?? nthWeekday(year, 2, 0, 2), {
		region: "US",
		category: "sporting",
		notes: "Snacking and party-food campaigns"
	});
	add("Valentine's Day", iso(year, 2, 14), {
		category: "retail",
		notes: "Gifting — bars, hampers, couples"
	});
	add("Presidents' Day", nthWeekday(year, 2, 1, 3), {
		region: "US",
		notes: "3rd Monday in February — long weekend sales"
	});
	add("Labour Day (WA)", nthWeekday(year, 3, 1, 1), {
		region: "AU",
		notes: "Western Australia — 1st Monday in March"
	});
	add("Labour Day (VIC / TAS)", nthWeekday(year, 3, 1, 2), {
		region: "AU",
		notes: "2nd Monday in March"
	});
	add("Canberra Day", nthWeekday(year, 3, 1, 2), {
		region: "AU",
		notes: "ACT public holiday"
	});
	add("International Women's Day", iso(year, 3, 8), { category: "cultural" });
	add("St Patrick's Day", iso(year, 3, 17), {
		region: "US",
		category: "cultural"
	});
	add("US spring break (typical)", iso(year, 3, 9), {
		end: iso(year, 3, 20),
		region: "US",
		category: "school",
		notes: "Timing varies by district — mid-March is the common window"
	});
	add("World Health Day", iso(year, 4, 7), {
		category: "cultural",
		notes: "Everyday nutrition, recovery, protein-as-food"
	});
	add("Earth Day", iso(year, 4, 22), {
		category: "cultural",
		notes: "Regen / organic / planet-led campaigns"
	});
	add("Good Friday", shift(easter, -2), { notes: "Public holiday AU + some US states" });
	add("Easter Saturday", shift(easter, -1), { region: "AU" });
	add("Easter Sunday", shift(easter, 0), {
		category: "retail",
		notes: "Gifting, family, long weekend"
	});
	add("Easter Monday", shift(easter, 1), { region: "AU" });
	add("Anzac Day", iso(year, 4, 25), {
		region: "AU",
		notes: "National day of remembrance"
	});
	add("US Tax Day", iso(year, 4, 15), {
		region: "US",
		category: "retail",
		notes: "Observed if it falls on a weekend"
	});
	add("Labour Day (QLD / NT)", nthWeekday(year, 5, 1, 1), {
		region: "AU",
		notes: "1st Monday in May"
	});
	add("Mother's Day", nthWeekday(year, 5, 0, 2), {
		category: "retail",
		notes: "2nd Sunday in May — same date in AU and US. Plan EDM 7–10 days prior."
	});
	add("National Sorry Day", iso(year, 5, 26), {
		region: "AU",
		category: "cultural"
	});
	add("National Reconciliation Week", iso(year, 5, 27), {
		end: iso(year, 6, 3),
		region: "AU",
		category: "cultural"
	});
	add("Memorial Day", lastWeekday(year, 5, 1), {
		region: "US",
		notes: "Last Monday in May — unofficial start of US summer"
	});
	add("WA Day", nthWeekday(year, 6, 1, 1), {
		region: "AU",
		notes: "Western Australia — 1st Monday in June"
	});
	add("King's Birthday (most states)", nthWeekday(year, 6, 1, 2), {
		region: "AU",
		notes: "NSW, VIC, SA, TAS, ACT, NT — 2nd Monday in June. QLD/WA differ."
	});
	add("Juneteenth", iso(year, 6, 19), { region: "US" });
	add("Father's Day (US)", nthWeekday(year, 6, 0, 3), {
		region: "US",
		category: "retail",
		notes: "3rd Sunday in June — different from AU"
	});
	add("Pride Month", iso(year, 6, 1), {
		end: iso(year, 6, 30),
		category: "cultural"
	});
	add("EOFY sale window (AU)", iso(year, 6, 15), {
		end: iso(year, 6, 30),
		region: "AU",
		category: "retail",
		notes: "End of financial year — promotions, stocktake, subscribe-and-save"
	});
	add("EOFY (AU)", iso(year, 6, 30), {
		region: "AU",
		category: "retail",
		notes: "Australian financial year ends"
	});
	add("US summer break starts (typical)", iso(year, 6, 1), {
		region: "US",
		category: "school",
		notes: "Districts vary; use as a planning marker not a hard date"
	});
	add("Independence Day", iso(year, 7, 4), {
		region: "US",
		notes: "US public holiday — BBQ / travel / snacking"
	});
	add("Dry July", iso(year, 7, 1), {
		end: iso(year, 7, 31),
		region: "AU",
		category: "retail",
		notes: "Alcohol-free July — health, recovery, swap-the-drink campaigns"
	});
	add("Amazon Prime Day (typical)", iso(year, 7, 8), {
		end: iso(year, 7, 11),
		category: "retail",
		notes: "Confirm dates each year — digital retail moment AU + US"
	});
	add("NAIDOC Week", nthWeekday(year, 7, 0, 1), {
		end: shift(fromParts(nthWeekday(year, 7, 0, 1)), 7),
		region: "AU",
		category: "cultural",
		notes: "First Sunday of July, seven days — confirm annually with the NAIDOC committee"
	});
	add("US summer break ends (typical)", iso(year, 8, 15), {
		region: "US",
		category: "school",
		notes: "Back-to-school US campaign window is mid-July through August"
	});
	add("Back to school (US)", iso(year, 8, 1), {
		end: iso(year, 8, 20),
		region: "US",
		category: "retail",
		notes: "Lunchbox, routine, family-health campaigns"
	});
	add("Women's Health Week (AU)", nthWeekday(year, 9, 1, 1), {
		end: shift(fromParts(nthWeekday(year, 9, 1, 1)), 6),
		region: "AU",
		category: "cultural",
		notes: "Jean Hailes week — first week of September"
	});
	add("Father's Day (AU)", firstSunday(year, 9), {
		region: "AU",
		category: "retail",
		notes: "1st Sunday in September — different from US. Plan EDM 7–10 days prior."
	});
	add("R U OK? Day", nthWeekday(year, 9, 4, 2), {
		region: "AU",
		category: "cultural",
		notes: "Second Thursday in September"
	});
	add("Labor Day (US)", nthWeekday(year, 9, 1, 1), {
		region: "US",
		notes: "1st Monday in September — unofficial end of US summer"
	});
	add("AFL Grand Final", lastWeekday(year, 9, 6), {
		region: "AU",
		category: "sporting",
		notes: "Last Saturday in September (typical). Confirm each year."
	});
	add("Grand Final Friday (VIC)", lastWeekday(year, 9, 5), {
		region: "AU",
		category: "sporting",
		notes: "Friday before the AFL Grand Final — VIC public holiday"
	});
	add("King's Birthday (WA)", lastWeekday(year, 9, 1), {
		region: "AU",
		notes: "Western Australia — last Monday in September"
	});
	add("NRL Grand Final", nthWeekday(year, 10, 0, 1), {
		region: "AU",
		category: "sporting",
		notes: "First Sunday in October (typical). Confirm each year."
	});
	add("Labour Day (NSW / ACT / SA)", nthWeekday(year, 10, 1, 1), {
		region: "AU",
		notes: "1st Monday in October. Also QLD King's Birthday."
	});
	add("Indigenous Peoples' Day / Columbus Day", nthWeekday(year, 10, 1, 2), { region: "US" });
	add("World Mental Health Day", iso(year, 10, 10), { category: "cultural" });
	add("National Nutrition Week (AU)", iso(year, 10, 11), {
		end: iso(year, 10, 17),
		region: "AU",
		category: "cultural",
		notes: "Typically the second week of October — Nutrition Australia"
	});
	add("Halloween", iso(year, 10, 31), {
		category: "retail",
		notes: "Treats, kids, seasonal flavours"
	});
	add("Melbourne Cup", nthWeekday(year, 11, 2, 1), {
		region: "AU",
		category: "sporting",
		notes: "First Tuesday in November — VIC public holiday, national cultural moment"
	});
	add("Veterans Day", iso(year, 11, 11), { region: "US" });
	add("Singles Day", iso(year, 11, 11), {
		category: "retail",
		notes: "11.11 — online gifting sales"
	});
	add("Movember", iso(year, 11, 1), {
		end: iso(year, 11, 30),
		category: "cultural",
		notes: "Men's health month"
	});
	add("Click Frenzy (AU)", iso(year, 11, 9), {
		end: iso(year, 11, 11),
		region: "AU",
		category: "retail",
		notes: "Timing varies — mid-November online sale. Confirm each year."
	});
	add("Diwali", lunar?.diwali ?? iso(year, 11, 1), {
		category: "cultural",
		notes: "Festival of lights — family, gifting"
	});
	add("Thanksgiving", nthWeekday(year, 11, 4, 4), {
		region: "US",
		notes: "4th Thursday in November"
	});
	add("Black Friday", (() => {
		return shift(fromParts(nthWeekday(year, 11, 4, 4)), 1);
	})(), {
		category: "retail",
		notes: "Day after US Thanksgiving — AU digital also participates"
	});
	add("Cyber Monday", (() => {
		return shift(fromParts(nthWeekday(year, 11, 4, 4)), 4);
	})(), {
		category: "retail",
		notes: "Monday after Thanksgiving"
	});
	add("Giving Tuesday", (() => {
		return shift(fromParts(nthWeekday(year, 11, 4, 4)), 5);
	})(), { category: "cultural" });
	add("Cyber week", (() => {
		return shift(fromParts(nthWeekday(year, 11, 4, 4)), 1);
	})(), {
		end: (() => {
			return shift(fromParts(nthWeekday(year, 11, 4, 4)), 6);
		})(),
		category: "retail",
		notes: "Black Friday through Cyber Monday week"
	});
	add("Christmas campaign window", iso(year, 12, 1), {
		end: iso(year, 12, 24),
		category: "retail",
		notes: "Hampers, gifting, last-order cutoffs. Plan first EDM in late November."
	});
	add("Christmas Eve", iso(year, 12, 24), { category: "retail" });
	add("Christmas Day", iso(year, 12, 25), { notes: "Public holiday" });
	add("Boxing Day", iso(year, 12, 26), {
		region: "AU",
		category: "retail",
		notes: "AU public holiday and major sale day"
	});
	add("New Year's Eve", iso(year, 12, 31), { category: "retail" });
	return rows;
}
var NSW_SCHOOL = [
	{
		name: "AU summer holidays (NSW)",
		start: "2025-12-22",
		end: "2026-01-26",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU autumn holidays (NSW)",
		start: "2026-04-07",
		end: "2026-04-17",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU winter holidays (NSW)",
		start: "2026-07-06",
		end: "2026-07-17",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU spring holidays (NSW)",
		start: "2026-09-28",
		end: "2026-10-09",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU summer holidays (NSW)",
		start: "2026-12-18",
		end: "2027-01-27",
		region: "AU",
		category: "school",
		notes: "NSW Eastern division. Western division runs to 3 Feb 2027."
	},
	{
		name: "AU autumn holidays (NSW)",
		start: "2027-04-12",
		end: "2027-04-23",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU winter holidays (NSW)",
		start: "2027-07-05",
		end: "2027-07-16",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU spring holidays (NSW)",
		start: "2027-09-27",
		end: "2027-10-08",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	},
	{
		name: "AU summer holidays (NSW)",
		start: "2027-12-21",
		end: "2028-01-28",
		region: "AU",
		category: "school",
		notes: "NSW dates — other states vary by a few days"
	}
];
function buildKeyDates() {
	return [
		...buildYear(2026),
		...buildYear(2027),
		...NSW_SCHOOL
	];
}
var api_exports = /* @__PURE__ */ __exportAll({
	changePassword_createServerFn_handler: () => changePassword_createServerFn_handler,
	checkSession_createServerFn_handler: () => checkSession_createServerFn_handler,
	createCampaign_createServerFn_handler: () => createCampaign_createServerFn_handler,
	createKeyDate_createServerFn_handler: () => createKeyDate_createServerFn_handler,
	deleteCampaign_createServerFn_handler: () => deleteCampaign_createServerFn_handler,
	deleteKeyDate_createServerFn_handler: () => deleteKeyDate_createServerFn_handler,
	loadBoard_createServerFn_handler: () => loadBoard_createServerFn_handler,
	login_createServerFn_handler: () => login_createServerFn_handler,
	logout_createServerFn_handler: () => logout_createServerFn_handler,
	moveCampaign_createServerFn_handler: () => moveCampaign_createServerFn_handler,
	unlockHint_createServerFn_handler: () => unlockHint_createServerFn_handler,
	updateCampaign_createServerFn_handler: () => updateCampaign_createServerFn_handler
});
var tokenSchema = object({ token: string().optional() });
var channelSchema = _enum(["EDM", "SMS"]);
var marketSchema = _enum([
	"AU",
	"US",
	"BOTH"
]);
var statusSchema = _enum([
	"draft",
	"scheduled",
	"sent"
]);
var regionSchema = _enum([
	"AU",
	"US",
	"BOTH"
]);
var categorySchema = _enum([
	"public",
	"school",
	"retail",
	"cultural",
	"sporting"
]);
var campaignInput = object({
	token: string().optional(),
	title: string().trim().min(1).max(120),
	channel: channelSchema,
	sendDate: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	sendTime: string().max(8).optional().default(""),
	market: marketSchema,
	status: statusSchema,
	subject: string().max(200).optional().default(""),
	audience: string().max(120).optional().default(""),
	notes: string().max(2e3).optional().default(""),
	keyDateId: number().int().nullable().optional().default(null)
});
function mapKeyDate(row) {
	return {
		id: row.id,
		name: row.name,
		startDate: row.start_date,
		endDate: row.end_date,
		region: row.region,
		category: row.category,
		notes: row.notes,
		isSystem: row.is_system
	};
}
function mapCampaign(row) {
	return {
		id: row.id,
		title: row.title,
		channel: row.channel,
		sendDate: row.send_date,
		sendTime: row.send_time,
		market: row.market,
		status: row.status,
		subject: row.subject,
		audience: row.audience,
		notes: row.notes,
		keyDateId: row.key_date_id
	};
}
async function requireTeam(token) {
	const { requireSession, ensureSettings } = await import("./session.server-X36WEow3.mjs");
	await ensureSettings();
	await requireSession(token);
}
async function ensureSeeded() {
	const sql = await getSql();
	const existing = await sql`
    select name, start_date from key_dates
  `;
	const have = new Set(existing.map((r) => `${r.name}|${r.start_date}`));
	for (const row of buildKeyDates()) {
		if (have.has(`${row.name}|${row.start}`)) continue;
		await sql`
      insert into key_dates (name, start_date, end_date, region, category, notes, is_system)
      values (
        ${row.name},
        ${row.start},
        ${row.end ?? null},
        ${row.region},
        ${row.category},
        ${row.notes ?? ""},
        true
      )
    `;
	}
}
var unlockHint_createServerFn_handler = createServerRpc({
	id: "ccfefeb42c7b2df259f7f00fa34faea9e72ff4235e4bdfa2d44c5ffa2a4fffc7",
	name: "unlockHint",
	filename: "src/lib/calendar/api.ts"
}, (opts) => unlockHint.__executeServer(opts));
var unlockHint = createServerFn({ method: "POST" }).handler(unlockHint_createServerFn_handler, async () => {
	const { ensureSettings, isDefaultPassword, STARTER_PASSWORD } = await import("./session.server-X36WEow3.mjs");
	await ensureSettings();
	return { starter: await isDefaultPassword() ? STARTER_PASSWORD : null };
});
var checkSession_createServerFn_handler = createServerRpc({
	id: "e87700c959c0f445f9a258333a7b2d0107d357be6440ab6ac971412719b83d8b",
	name: "checkSession",
	filename: "src/lib/calendar/api.ts"
}, (opts) => checkSession.__executeServer(opts));
var checkSession = createServerFn({ method: "POST" }).validator(tokenSchema).handler(checkSession_createServerFn_handler, async ({ data }) => {
	const { verifySession, ensureSettings } = await import("./session.server-X36WEow3.mjs");
	await ensureSettings();
	return { ok: await verifySession(data.token) };
});
var login_createServerFn_handler = createServerRpc({
	id: "eeacff82203dd0078b7c1ffa425abea96959211508b57065acc456c7ee0af58b",
	name: "login",
	filename: "src/lib/calendar/api.ts"
}, (opts) => login.__executeServer(opts));
var login = createServerFn({ method: "POST" }).validator(object({ password: string().min(1) })).handler(login_createServerFn_handler, async ({ data }) => {
	const { loginWithPassword, ensureSettings } = await import("./session.server-X36WEow3.mjs");
	await ensureSettings();
	await ensureSeeded();
	return loginWithPassword(data.password);
});
var logout_createServerFn_handler = createServerRpc({
	id: "18edbd381f577a5f5756ea2e8690dd76ed31364d8bb2f79a073594a61ef84447",
	name: "logout",
	filename: "src/lib/calendar/api.ts"
}, (opts) => logout.__executeServer(opts));
var logout = createServerFn({ method: "POST" }).handler(logout_createServerFn_handler, async () => {
	const { logoutSession } = await import("./session.server-X36WEow3.mjs");
	await logoutSession();
	return { ok: true };
});
var changePassword_createServerFn_handler = createServerRpc({
	id: "e8a2d874e4a3c876b2b385b836ca464074cf14f8246a18f08ff1d57e776d697b",
	name: "changePassword",
	filename: "src/lib/calendar/api.ts"
}, (opts) => changePassword.__executeServer(opts));
var changePassword = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	current: string().min(1),
	next: string().min(6).max(80)
})).handler(changePassword_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	const { changeTeamPassword } = await import("./session.server-X36WEow3.mjs");
	await changeTeamPassword(data.current, data.next);
	return { ok: true };
});
var loadBoard_createServerFn_handler = createServerRpc({
	id: "cc699db812cd28eada67a84d539842820d5132da9b4962f232a540507192230e",
	name: "loadBoard",
	filename: "src/lib/calendar/api.ts"
}, (opts) => loadBoard.__executeServer(opts));
var loadBoard = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	year: number().int()
})).handler(loadBoard_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	await ensureSeeded();
	const sql = await getSql();
	const yearStart = `${data.year}-01-01`;
	const yearEnd = `${data.year}-12-31`;
	const keyRows = await sql`
      select id, name, start_date, end_date, region, category, notes, is_system
      from key_dates
      where start_date <= ${yearEnd}
        and coalesce(end_date, start_date) >= ${yearStart}
      order by start_date, name
    `;
	const campRows = await sql`
      select id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id
      from campaigns
      where send_date >= ${yearStart} and send_date <= ${yearEnd}
      order by send_date, send_time, id
    `;
	return {
		keyDates: keyRows.map(mapKeyDate),
		campaigns: campRows.map(mapCampaign)
	};
});
var createCampaign_createServerFn_handler = createServerRpc({
	id: "4d5adb4f418b9edc94212c453087864d07b829baa45b8e6a792af675e6abc5b0",
	name: "createCampaign",
	filename: "src/lib/calendar/api.ts"
}, (opts) => createCampaign.__executeServer(opts));
var createCampaign = createServerFn({ method: "POST" }).validator(campaignInput).handler(createCampaign_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	const rows = await (await getSql())`
      insert into campaigns (
        title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id
      )
      values (
        ${data.title},
        ${data.channel},
        ${data.sendDate},
        ${data.sendTime ?? ""},
        ${data.market},
        ${data.status},
        ${data.subject ?? ""},
        ${data.audience ?? ""},
        ${data.notes ?? ""},
        ${data.keyDateId ?? null}
      )
      returning id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id
    `;
	if (!rows[0]) throw new Error("Could not create campaign");
	return mapCampaign(rows[0]);
});
var updateCampaign_createServerFn_handler = createServerRpc({
	id: "6c34141a67a2b14e429a2ee43a91a595eacf04a29ee098ff767644468ad6851e",
	name: "updateCampaign",
	filename: "src/lib/calendar/api.ts"
}, (opts) => updateCampaign.__executeServer(opts));
var updateCampaign = createServerFn({ method: "POST" }).validator(campaignInput.extend({ id: number().int() })).handler(updateCampaign_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	const rows = await (await getSql())`
      update campaigns
      set
        title = ${data.title},
        channel = ${data.channel},
        send_date = ${data.sendDate},
        send_time = ${data.sendTime ?? ""},
        market = ${data.market},
        status = ${data.status},
        subject = ${data.subject ?? ""},
        audience = ${data.audience ?? ""},
        notes = ${data.notes ?? ""},
        key_date_id = ${data.keyDateId ?? null},
        updated_at = now()
      where id = ${data.id}
      returning id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id
    `;
	if (!rows[0]) throw new Error("Campaign not found");
	return mapCampaign(rows[0]);
});
var moveCampaign_createServerFn_handler = createServerRpc({
	id: "b27431f510b1160bf38e37bff8630c095d9e01861c69f7b874fcf69cebaf845a",
	name: "moveCampaign",
	filename: "src/lib/calendar/api.ts"
}, (opts) => moveCampaign.__executeServer(opts));
var moveCampaign = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	id: number().int(),
	sendDate: string().regex(/^\d{4}-\d{2}-\d{2}$/)
})).handler(moveCampaign_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	const rows = await (await getSql())`
      update campaigns
      set send_date = ${data.sendDate}, updated_at = now()
      where id = ${data.id}
      returning id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id
    `;
	if (!rows[0]) throw new Error("Campaign not found");
	return mapCampaign(rows[0]);
});
var deleteCampaign_createServerFn_handler = createServerRpc({
	id: "e046b6893b61b16dac5cd631d14bb46eb3f484eefea2756cd0e93752bb0fdfc4",
	name: "deleteCampaign",
	filename: "src/lib/calendar/api.ts"
}, (opts) => deleteCampaign.__executeServer(opts));
var deleteCampaign = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	id: number().int()
})).handler(deleteCampaign_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	await (await getSql())`delete from campaigns where id = ${data.id}`;
	return { ok: true };
});
var createKeyDate_createServerFn_handler = createServerRpc({
	id: "28d7648d2151609d724d2010f61e50388ab68002e0afe66ccc1941815a33886c",
	name: "createKeyDate",
	filename: "src/lib/calendar/api.ts"
}, (opts) => createKeyDate.__executeServer(opts));
var createKeyDate = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	name: string().trim().min(1).max(120),
	startDate: string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
	region: regionSchema,
	category: categorySchema,
	notes: string().max(500).optional().default("")
})).handler(createKeyDate_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	const rows = await (await getSql())`
      insert into key_dates (name, start_date, end_date, region, category, notes, is_system)
      values (
        ${data.name},
        ${data.startDate},
        ${data.endDate ?? null},
        ${data.region},
        ${data.category},
        ${data.notes ?? ""},
        false
      )
      returning id, name, start_date, end_date, region, category, notes, is_system
    `;
	if (!rows[0]) throw new Error("Could not add date");
	return mapKeyDate(rows[0]);
});
var deleteKeyDate_createServerFn_handler = createServerRpc({
	id: "bc68a4b05c540ffaa718a08dbdf74fd5d2ff7c9bf105472a76c03abfce6576c0",
	name: "deleteKeyDate",
	filename: "src/lib/calendar/api.ts"
}, (opts) => deleteKeyDate.__executeServer(opts));
var deleteKeyDate = createServerFn({ method: "POST" }).validator(object({
	token: string().optional(),
	id: number().int()
})).handler(deleteKeyDate_createServerFn_handler, async ({ data }) => {
	await requireTeam(data.token);
	await (await getSql())`delete from key_dates where id = ${data.id} and is_system = false`;
	return { ok: true };
});
//#endregion
export { getSql as n, api_exports as t };
