export type Region = "AU" | "US" | "BOTH";
export type Market = "AU" | "US" | "BOTH";
export type Channel = "EDM" | "SMS" | "EVENT";
export type CampaignStatus = "draft" | "scheduled" | "sent";
export type DateCategory = "public" | "school" | "retail" | "cultural" | "sporting";
export type Repeat = "none" | "daily" | "weekly" | "monthly" | "custom";
export type RepeatUnit = "day" | "week" | "month";
export type ApplyTo = "this" | "remaining";
export type DeleteScope = "this" | "remaining";

export type KeyDate = {
  id: number;
  name: string;
  startDate: string;
  endDate: string | null;
  region: Region;
  category: DateCategory;
  notes: string;
  isSystem: boolean;
};

export type Campaign = {
  id: number;
  title: string;
  channel: Channel;
  sendDate: string;
  sendTime: string;
  endDate: string | null;
  endTime: string;
  market: Market;
  status: CampaignStatus;
  subject: string;
  audience: string;
  notes: string;
  keyDateId: number | null;
  seriesId: number | null;
};

export type CampaignInput = {
  title: string;
  channel: Channel;
  sendDate: string;
  sendTime: string;
  endDate: string | null;
  endTime: string;
  market: Market;
  status: CampaignStatus;
  subject: string;
  audience: string;
  notes: string;
  keyDateId: number | null;
  repeat: Repeat;
  repeatUntil: string | null;
  repeatInterval: number;
  repeatUnit: RepeatUnit;
  applyTo: ApplyTo;
};

export type BoardData = {
  keyDates: KeyDate[];
  campaigns: Campaign[];
};

export const TOKEN_STORAGE_KEY = "chief_cal_token";

export const AUDIENCE_PRESETS = [
  "All subscribers",
  "AU list",
  "US list",
  "Recipe list",
  "VIP",
  "Lapsed 90d",
] as const;

export function channelLabel(channel: Channel): string {
  if (channel === "EVENT") return "Event";
  return channel;
}

export function channelChipClass(channel: Channel): string {
  if (channel === "SMS") return "bg-clay text-clay-fg";
  if (channel === "EVENT") return "bg-event text-event-fg";
  return "bg-accent text-accent-fg";
}

export function channelDotClass(channel: Channel): string {
  if (channel === "SMS") return "bg-clay";
  if (channel === "EVENT") return "bg-event";
  return "bg-accent";
}

export function channelBadgeVariant(channel: Channel): "edm" | "sms" | "event" {
  if (channel === "SMS") return "sms";
  if (channel === "EVENT") return "event";
  return "edm";
}

export function coversDate(c: Pick<Campaign, "sendDate" | "endDate">, iso: string): boolean {
  const end = c.endDate && c.endDate > c.sendDate ? c.endDate : c.sendDate;
  return iso >= c.sendDate && iso <= end;
}
