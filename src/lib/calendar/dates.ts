import type { Repeat, RepeatUnit } from "./types";

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

export function addDays(iso: string, n: number): string {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
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

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Add hours to a calendar date + HH:mm, wrapping past midnight. */
export function addHours(iso: string, time: string, hours: number): { date: string; time: string } {
  const d = fromISO(iso);
  const [h, m] = (time || "09:00").split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  d.setHours(d.getHours() + hours);
  return { date: toISO(d), time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}` };
}

const ORDINALS = ["first", "second", "third", "fourth", "fifth"] as const;

export function weekdayOrdinal(iso: string): { n: number; weekday: number; label: string } {
  const d = fromISO(iso);
  const weekday = d.getDay();
  const nth = Math.ceil(d.getDate() / 7);
  const lastDay = daysInMonth(d.getFullYear(), d.getMonth());
  const isLast = d.getDate() + 7 > lastDay;
  if (isLast && nth >= 4) {
    return { n: -1, weekday, label: "last" };
  }
  return { n: nth, weekday, label: ORDINALS[nth - 1] ?? `${nth}th` };
}

export function nthWeekdayInMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  n: number,
): string | null {
  if (n === -1) {
    const last = new Date(year, monthIndex + 1, 0);
    const diff = (last.getDay() - weekday + 7) % 7;
    last.setDate(last.getDate() - diff);
    return toISO(last);
  }
  const first = new Date(year, monthIndex, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  if (day > daysInMonth(year, monthIndex)) return null;
  return toISO(new Date(year, monthIndex, day));
}

export function monthlyNthDates(start: string, until: string, max = 36): string[] {
  const dates: string[] = [start];
  const { n, weekday } = weekdayOrdinal(start);
  const end = fromISO(until);
  let year = fromISO(start).getFullYear();
  let month = fromISO(start).getMonth() + 1;
  while (dates.length < max) {
    if (month > 11) {
      month = 0;
      year += 1;
    }
    const iso = nthWeekdayInMonth(year, month, weekday, n);
    month += 1;
    if (!iso) continue;
    if (fromISO(iso) > end) break;
    if (iso > start) dates.push(iso);
  }
  return dates;
}

function stepDates(start: string, until: string, interval: number, unit: RepeatUnit, max: number): string[] {
  const dates: string[] = [];
  let cur = start;
  const end = fromISO(until);
  const step = Math.max(1, Math.min(30, Math.floor(interval) || 1));
  while (dates.length < max && fromISO(cur) <= end) {
    dates.push(cur);
    if (unit === "month") cur = addCalendarMonths(cur, step);
    else cur = addDays(cur, unit === "week" ? step * 7 : step);
  }
  return dates.length > 0 ? dates : [start];
}

/** Weekly send dates from start through until, inclusive. Caps at `max`. */
export function weeklyDates(start: string, until: string, max = 80): string[] {
  return stepDates(start, until, 1, "week", max);
}

export function occurrenceDates(
  start: string,
  until: string | null,
  repeat: Repeat,
  interval = 1,
  unit: RepeatUnit = "day",
  max = 366,
): string[] {
  if (repeat === "none" || !until) return [start];
  if (repeat === "daily") return stepDates(start, until, 1, "day", max);
  if (repeat === "weekly") return stepDates(start, until, 1, "week", max);
  if (repeat === "monthly") return monthlyNthDates(start, until, Math.min(max, 36));
  return stepDates(start, until, interval, unit, max);
}

export function frequencySummary(
  start: string,
  repeat: Repeat,
  interval = 1,
  unit: RepeatUnit = "day",
): string {
  const day = weekdayLong(start);
  const step = Math.max(1, interval);
  if (repeat === "daily") return "Daily";
  if (repeat === "weekly") return `Weekly on ${day}`;
  if (repeat === "monthly") {
    const { label } = weekdayOrdinal(start);
    return `Monthly on the ${label} ${day}`;
  }
  if (repeat === "custom") {
    if (unit === "day") return step === 1 ? "Daily" : `Every ${step} days`;
    if (unit === "week") return step === 1 ? `Weekly on ${day}` : `Every ${step} weeks on ${day}`;
    return step === 1 ? `Monthly on the ${weekdayOrdinal(start).label} ${day}` : `Every ${step} months`;
  }
  return "Does not repeat";
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
