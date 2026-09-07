import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { weeklyDates } from "./dates";
import { buildKeyDates } from "./seed-data";
import type { BoardData, Campaign, KeyDate } from "./types";

const tokenSchema = z.object({ token: z.string().optional() });

const channelSchema = z.enum(["EDM", "SMS"]);
const marketSchema = z.enum(["AU", "US", "BOTH"]);
const statusSchema = z.enum(["draft", "scheduled", "sent"]);
const regionSchema = z.enum(["AU", "US", "BOTH"]);
const categorySchema = z.enum(["public", "school", "retail", "cultural", "sporting"]);

const campaignInput = z.object({
  token: z.string().optional(),
  title: z.string().trim().min(1).max(120),
  channel: channelSchema,
  sendDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  sendTime: z.string().max(8).optional().default(""),
  market: marketSchema,
  status: statusSchema,
  subject: z.string().max(200).optional().default(""),
  audience: z.string().max(120).optional().default(""),
  notes: z.string().max(2000).optional().default(""),
  keyDateId: z.number().int().nullable().optional().default(null),
  repeat: z.enum(["none", "weekly"]).optional().default("none"),
  repeatUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional()
    .default(null),
  applyTo: z.enum(["this", "remaining"]).optional().default("this"),
});

type KeyDateRow = {
  id: number;
  name: string;
  start_date: string;
  end_date: string | null;
  region: KeyDate["region"];
  category: KeyDate["category"];
  notes: string;
  is_system: boolean;
};

type CampaignRow = {
  id: number;
  title: string;
  channel: Campaign["channel"];
  send_date: string;
  send_time: string;
  market: Campaign["market"];
  status: Campaign["status"];
  subject: string;
  audience: string;
  notes: string;
  key_date_id: number | null;
  series_id: number | null;
};

function mapKeyDate(row: KeyDateRow): KeyDate {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    region: row.region,
    category: row.category,
    notes: row.notes,
    isSystem: row.is_system,
  };
}

function mapCampaign(row: CampaignRow): Campaign {
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
    keyDateId: row.key_date_id,
    seriesId: row.series_id ?? null,
  };
}

async function requireTeam(token?: string) {
  const { requireSession, ensureSettings } = await import("./session.server");
  await ensureSettings();
  await requireSession(token);
}

async function ensureSeeded() {
  const sql = await getSql();
  const existing = await sql<{ name: string; start_date: string }>`
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

async function insertCampaign(
  sql: Awaited<ReturnType<typeof getSql>>,
  data: {
    title: string;
    channel: Campaign["channel"];
    sendDate: string;
    sendTime: string;
    market: Campaign["market"];
    status: Campaign["status"];
    subject: string;
    audience: string;
    notes: string;
    keyDateId: number | null;
    seriesId: number | null;
  },
): Promise<CampaignRow> {
  const rows = await sql<CampaignRow>`
    insert into campaigns (
      title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id, series_id
    )
    values (
      ${data.title},
      ${data.channel},
      ${data.sendDate},
      ${data.sendTime},
      ${data.market},
      ${data.status},
      ${data.subject},
      ${data.audience},
      ${data.notes},
      ${data.keyDateId},
      ${data.seriesId}
    )
    returning id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id, series_id
  `;
  if (!rows[0]) throw new Error("Could not create campaign");
  return rows[0];
}

export const unlockHint = createServerFn({ method: "POST" }).handler(async () => {
  const { ensureSettings, isDefaultPassword, STARTER_PASSWORD } = await import("./session.server");
  await ensureSettings();
  const isDefault = await isDefaultPassword();
  return { starter: isDefault ? STARTER_PASSWORD : null };
});

export const checkSession = createServerFn({ method: "POST" })
  .validator(tokenSchema)
  .handler(async ({ data }) => {
    const { verifySession, ensureSettings } = await import("./session.server");
    await ensureSettings();
    const ok = await verifySession(data.token);
    return { ok };
  });

export const login = createServerFn({ method: "POST" })
  .validator(z.object({ password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { loginWithPassword, ensureSettings } = await import("./session.server");
    await ensureSettings();
    await ensureSeeded();
    return loginWithPassword(data.password);
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutSession } = await import("./session.server");
  await logoutSession();
  return { ok: true as const };
});

export const changePassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().optional(),
      current: z.string().min(1),
      next: z.string().min(6).max(80),
    }),
  )
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const { changeTeamPassword } = await import("./session.server");
    await changeTeamPassword(data.current, data.next);
    return { ok: true as const };
  });

export const loadBoard = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().optional(), year: z.number().int() }))
  .handler(async ({ data }): Promise<BoardData> => {
    await requireTeam(data.token);
    await ensureSeeded();
    const sql = await getSql();
    const yearStart = `${data.year}-01-01`;
    const yearEnd = `${data.year}-12-31`;
    const keyRows = await sql<KeyDateRow>`
      select id, name, start_date, end_date, region, category, notes, is_system
      from key_dates
      where start_date <= ${yearEnd}
        and coalesce(end_date, start_date) >= ${yearStart}
      order by start_date, name
    `;
    const campRows = await sql<CampaignRow>`
      select id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id, series_id
      from campaigns
      where send_date >= ${yearStart} and send_date <= ${yearEnd}
      order by send_date, send_time, id
    `;
    return {
      keyDates: keyRows.map(mapKeyDate),
      campaigns: campRows.map(mapCampaign),
    };
  });

export const createCampaign = createServerFn({ method: "POST" })
  .validator(campaignInput)
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const sql = await getSql();
    const payload = {
      title: data.title,
      channel: data.channel,
      sendTime: data.sendTime ?? "",
      market: data.market,
      status: data.status,
      subject: data.subject ?? "",
      audience: data.audience ?? "",
      notes: data.notes ?? "",
      keyDateId: data.keyDateId ?? null,
    };

    const dates =
      data.repeat === "weekly" && data.repeatUntil
        ? weeklyDates(data.sendDate, data.repeatUntil, 80)
        : [data.sendDate];

    const first = await insertCampaign(sql, {
      ...payload,
      sendDate: dates[0]!,
      seriesId: null,
    });

    if (dates.length === 1) {
      return { campaign: mapCampaign(first), count: 1 };
    }

    await sql`update campaigns set series_id = ${first.id} where id = ${first.id}`;
    first.series_id = first.id;

    for (const sendDate of dates.slice(1)) {
      await insertCampaign(sql, {
        ...payload,
        sendDate,
        seriesId: first.id,
        keyDateId: null,
      });
    }

    return { campaign: mapCampaign(first), count: dates.length };
  });

export const updateCampaign = createServerFn({ method: "POST" })
  .validator(campaignInput.extend({ id: z.number().int() }))
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const sql = await getSql();

    if (data.applyTo === "remaining") {
      const current = await sql<{ series_id: number | null; send_date: string }>`
        select series_id, send_date from campaigns where id = ${data.id}
      `;
      const seriesId = current[0]?.series_id;
      const fromDate = current[0]?.send_date;
      if (seriesId && fromDate) {
        await sql`
          update campaigns
          set
            title = ${data.title},
            channel = ${data.channel},
            send_time = ${data.sendTime ?? ""},
            market = ${data.market},
            status = ${data.status},
            subject = ${data.subject ?? ""},
            audience = ${data.audience ?? ""},
            notes = ${data.notes ?? ""},
            updated_at = now()
          where series_id = ${seriesId} and send_date >= ${fromDate}
        `;
      }
    }

    const rows = await sql<CampaignRow>`
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
      returning id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id, series_id
    `;
    if (!rows[0]) throw new Error("Campaign not found");
    return mapCampaign(rows[0]);
  });

export const moveCampaign = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().optional(),
      id: z.number().int(),
      sendDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
  )
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const sql = await getSql();
    const rows = await sql<CampaignRow>`
      update campaigns
      set send_date = ${data.sendDate}, updated_at = now()
      where id = ${data.id}
      returning id, title, channel, send_date, send_time, market, status, subject, audience, notes, key_date_id, series_id
    `;
    if (!rows[0]) throw new Error("Campaign not found");
    return mapCampaign(rows[0]);
  });

export const deleteCampaign = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().optional(),
      id: z.number().int(),
      scope: z.enum(["this", "remaining"]).optional().default("this"),
    }),
  )
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const sql = await getSql();
    if (data.scope === "remaining") {
      const current = await sql<{ series_id: number | null; send_date: string }>`
        select series_id, send_date from campaigns where id = ${data.id}
      `;
      const seriesId = current[0]?.series_id;
      const fromDate = current[0]?.send_date;
      if (seriesId && fromDate) {
        await sql`
          delete from campaigns
          where series_id = ${seriesId} and send_date >= ${fromDate}
        `;
        return { ok: true as const };
      }
    }
    await sql`delete from campaigns where id = ${data.id}`;
    return { ok: true as const };
  });

export const createKeyDate = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string().optional(),
      name: z.string().trim().min(1).max(120),
      startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .nullable()
        .optional(),
      region: regionSchema,
      category: categorySchema,
      notes: z.string().max(500).optional().default(""),
    }),
  )
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const sql = await getSql();
    const rows = await sql<KeyDateRow>`
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

export const deleteKeyDate = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().optional(), id: z.number().int() }))
  .handler(async ({ data }) => {
    await requireTeam(data.token);
    const sql = await getSql();
    await sql`delete from key_dates where id = ${data.id} and is_system = false`;
    return { ok: true as const };
  });
