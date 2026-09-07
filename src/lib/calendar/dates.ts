/** Parse a YYYY-MM-DD calendar date as local midnight (never UTC). */
export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function addCalendarMonths(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setMonth(d.getMonth() + n);
  return toISO(d);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Monday-first cells for a month. Null = leading/trailing spacer. */
export function monthCells(year: number, monthIndex: number): Array<number | null> {
  const first = new Date(year, monthIndex, 1);
  const lead = (first.getDay() + 6) % 7;
  const count = daysInMonth(year, monthIndex);
  const cells: Array<number | null> = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let d = 1; d <= count; d += 1) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function isoInMonth(year: number, monthIndex: number, day: number): string {
  return toISO(new Date(year, monthIndex, day));
}

export function isInRange(iso: string, start: string, end: string | null): boolean {
  const t = iso;
  const e = end ?? start;
  return t >= start && t <= e;
}

export function rangeLengthDays(start: string, end: string | null): number {
  if (!end || end === start) return 1;
  const a = fromISO(start).getTime();
  const b = fromISO(end).getTime();
  return Math.round((b - a) / 86400000) + 1;
}

export function formatLong(iso: string): string {
  return fromISO(iso).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDayMonth(iso: string): string {
  return fromISO(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

export function weekdayLong(iso: string): string {
  return fromISO(iso).toLocaleDateString("en-AU", { weekday: "long" });
}

export function monthTitle(date: Date): string {
  return date.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

/** Weekly send dates from start through until, inclusive. Caps at `max`. */
export function weeklyDates(start: string, until: string, max = 80): string[] {
  const dates: string[] = [];
  const cursor = fromISO(start);
  const end = fromISO(until);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime()) || end < cursor) {
    return [start];
  }
  while (cursor <= end && dates.length < max) {
    dates.push(toISO(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return dates.length > 0 ? dates : [start];
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
