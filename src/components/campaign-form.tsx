import { useMemo, useState, type FormEvent } from "react";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  addCalendarMonths,
  addHours,
  formatDayMonth,
  frequencySummary,
  occurrenceDates,
  weekdayLong,
  weekdayOrdinal,
} from "@/lib/calendar/dates";
import {
  AUDIENCE_PRESETS,
  type ApplyTo,
  type Campaign,
  type CampaignInput,
  type CampaignStatus,
  type Channel,
  type DeleteScope,
  type KeyDate,
  type Market,
  type Repeat as RepeatKind,
  type RepeatUnit,
} from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35";

function defaultTimes(channel: Channel, date: string) {
  if (channel === "SMS") return { sendTime: "11:00", endDate: null as string | null, endTime: "" };
  if (channel === "EVENT") {
    const end = addHours(date, "10:00", 1);
    return { sendTime: "10:00", endDate: end.date, endTime: end.time };
  }
  return { sendTime: "09:00", endDate: null as string | null, endTime: "" };
}

const empty = (date: string): CampaignInput => ({
  title: "",
  channel: "EDM",
  sendDate: date,
  sendTime: "09:00",
  endDate: null,
  endTime: "",
  market: "AU",
  status: "draft",
  subject: "",
  audience: "",
  notes: "",
  keyDateId: null,
  repeat: "none",
  repeatUntil: addCalendarMonths(date, 12),
  repeatInterval: 1,
  repeatUnit: "day",
  applyTo: "this",
});

function fromCampaign(c: Campaign): CampaignInput {
  return {
    title: c.title,
    channel: c.channel,
    sendDate: c.sendDate,
    sendTime: c.sendTime || "09:00",
    endDate: c.endDate,
    endTime: c.endTime || "",
    market: c.market,
    status: c.status,
    subject: c.subject,
    audience: c.audience,
    notes: c.notes,
    keyDateId: c.keyDateId,
    repeat: "none",
    repeatUntil: addCalendarMonths(c.sendDate, 12),
    repeatInterval: 1,
    repeatUnit: "day",
    applyTo: "this",
  };
}

function Segment<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex rounded-md bg-surface-2 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-9 flex-1 rounded-sm px-2 text-xs font-medium transition-colors duration-150",
            value === opt.value ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted hover:text-ink",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function CampaignForm({
  initial,
  date,
  keyDates,
  pending,
  remainingCount = 1,
  onSubmit,
  onDelete,
}: {
  initial?: Campaign;
  date: string;
  keyDates: KeyDate[];
  pending: boolean;
  remainingCount?: number;
  onSubmit: (input: CampaignInput) => Promise<void>;
  onDelete?: (scope: DeleteScope) => Promise<void>;
}) {
  const [form, setForm] = useState<CampaignInput>(initial ? fromCampaign(initial) : empty(date));
  const [confirmDelete, setConfirmDelete] = useState<DeleteScope | null>(null);
  const isSeries = Boolean(initial?.seriesId);
  const isEvent = form.channel === "EVENT";
  const dayDates = keyDates.filter((k) => {
    const end = k.endDate ?? k.startDate;
    return form.sendDate >= k.startDate && form.sendDate <= end;
  });

  const sendCount = useMemo(() => {
    if (form.repeat === "none" || !form.repeatUntil) return 1;
    return occurrenceDates(
      form.sendDate,
      form.repeatUntil,
      form.repeat,
      form.repeatInterval,
      form.repeatUnit,
    ).length;
  }, [form.repeat, form.sendDate, form.repeatUntil, form.repeatInterval, form.repeatUnit]);

  const summary = frequencySummary(form.sendDate, form.repeat, form.repeatInterval, form.repeatUnit);
  const weeklyLabel = `Weekly on ${weekdayLong(form.sendDate)}`;
  const monthlyLabel = `Monthly on the ${weekdayOrdinal(form.sendDate).label} ${weekdayLong(form.sendDate)}`;

  function set<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "sendDate" && typeof value === "string") {
        if (!prev.repeatUntil || prev.repeatUntil < value) {
          next.repeatUntil = addCalendarMonths(value, 12);
        }
        if (prev.channel === "EVENT" && (!prev.endDate || prev.endDate < value)) {
          next.endDate = value;
        }
      }
      if (key === "channel") {
        const ch = value as Channel;
        const times = defaultTimes(ch, next.sendDate);
        next.sendTime = times.sendTime;
        next.endDate = times.endDate;
        next.endTime = times.endTime;
        if (ch === "EVENT" && next.status === "draft") next.status = "scheduled";
      }
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="campaign-title">{isEvent ? "Event name" : "Campaign name"}</Label>
        <Input
          id="campaign-title"
          data-testid="campaign-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={isEvent ? "Team tasting" : "Weekly newsletter"}
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label>Channel</Label>
        <Segment
          value={form.channel}
          onChange={(v) => set("channel", v as Channel)}
          options={[
            { value: "EDM", label: "EDM" },
            { value: "SMS", label: "SMS" },
            { value: "EVENT", label: "Event" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audience">{isEvent ? "Who's invited" : "Audience"}</Label>
        <Input
          id="audience"
          value={form.audience}
          onChange={(e) => set("audience", e.target.value)}
          placeholder={isEvent ? "Retail + brand" : "All subscribers"}
        />
        {!isEvent ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {AUDIENCE_PRESETS.map((preset) => {
              const active = form.audience === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => set("audience", active ? "" : preset)}
                  className={cn(
                    "h-8 rounded-full px-2.5 text-2xs font-medium transition-colors duration-150",
                    active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-ink",
                  )}
                >
                  {preset}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="send-date">Start date</Label>
          <Input
            id="send-date"
            type="date"
            value={form.sendDate}
            onChange={(e) => set("sendDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="send-time">Start time</Label>
          <Input
            id="send-time"
            type="time"
            value={form.sendTime}
            onChange={(e) => set("sendTime", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-date">End date</Label>
          <Input
            id="end-date"
            type="date"
            min={form.sendDate}
            value={form.endDate ?? ""}
            onChange={(e) => set("endDate", e.target.value || null)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end-time">End time</Label>
          <Input
            id="end-time"
            type="time"
            value={form.endTime}
            onChange={(e) => set("endTime", e.target.value)}
          />
        </div>
      </div>

      {initial ? (
        isSeries ? (
          <div className="space-y-1.5">
            <Label>Apply changes to</Label>
            <Segment
              value={form.applyTo}
              onChange={(v) => set("applyTo", v as ApplyTo)}
              options={
                remainingCount > 1
                  ? [
                      { value: "this", label: "This one" },
                      { value: "remaining", label: "All remaining" },
                    ]
                  : [{ value: "this", label: "This one" }]
              }
            />
            <p className="flex items-center gap-1.5 text-2xs text-subtle">
              <Repeat className="size-3" />
              Repeating series
            </p>
          </div>
        ) : null
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="frequency">Frequency</Label>
          <select
            id="frequency"
            value={form.repeat}
            onChange={(e) => set("repeat", e.target.value as RepeatKind)}
            className={selectClass}
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">{weeklyLabel}</option>
            <option value="monthly">{monthlyLabel}</option>
            <option value="custom">Custom</option>
          </select>

          {form.repeat === "custom" ? (
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-2 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="repeat-interval">Repeat every</Label>
                <Input
                  id="repeat-interval"
                  type="number"
                  min={1}
                  max={30}
                  value={form.repeatInterval}
                  onChange={(e) => set("repeatInterval", Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="repeat-unit">Unit</Label>
                <select
                  id="repeat-unit"
                  value={form.repeatUnit}
                  onChange={(e) => set("repeatUnit", e.target.value as RepeatUnit)}
                  className={selectClass}
                >
                  <option value="day">Day(s)</option>
                  <option value="week">Week(s)</option>
                  <option value="month">Month(s)</option>
                </select>
              </div>
            </div>
          ) : null}

          {form.repeat !== "none" ? (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="repeat-until">Until</Label>
              <Input
                id="repeat-until"
                type="date"
                min={form.sendDate}
                value={form.repeatUntil ?? ""}
                onChange={(e) => set("repeatUntil", e.target.value || null)}
              />
              <p className="flex items-center gap-1.5 text-2xs text-subtle">
                <Repeat className="size-3 shrink-0" />
                {summary} · {sendCount} {isEvent ? "event" : "send"}
                {sendCount === 1 ? "" : "s"}
                {form.repeatUntil ? ` through ${formatDayMonth(form.repeatUntil)}` : ""}
              </p>
            </div>
          ) : null}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Market</Label>
        <Segment
          value={form.market}
          onChange={(v) => set("market", v as Market)}
          options={[
            { value: "AU", label: "AU" },
            { value: "US", label: "US" },
            { value: "BOTH", label: "Both" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Status</Label>
        <Segment
          value={form.status}
          onChange={(v) => set("status", v as CampaignStatus)}
          options={[
            { value: "draft", label: "Draft" },
            { value: "scheduled", label: "Scheduled" },
            { value: "sent", label: isEvent ? "Done" : "Sent" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">
          {form.channel === "SMS" ? "SMS copy" : isEvent ? "Location" : "Subject line"}
        </Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder={
            form.channel === "SMS"
              ? "New recipes this week."
              : isEvent
                ? "HQ kitchen, Alexandria"
                : "This week’s recipes"
          }
        />
      </div>

      {form.repeat === "none" && dayDates.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="key-date">Tied to</Label>
          <select
            id="key-date"
            value={form.keyDateId ?? ""}
            onChange={(e) => set("keyDateId", e.target.value ? Number(e.target.value) : null)}
            className={selectClass}
          >
            <option value="">None</option>
            {dayDates.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder={isEvent ? "Agenda, owner, kit list…" : "Offer, hero product, owner…"}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        {onDelete ? (
          isSeries ? (
            confirmDelete ? (
              <Button
                type="button"
                variant="danger"
                onClick={() => onDelete(confirmDelete)}
                disabled={pending}
              >
                {confirmDelete === "remaining"
                  ? `Delete ${remainingCount} upcoming`
                  : "Confirm delete this one"}
              </Button>
            ) : (
              <div className="flex flex-1 flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete("this")}>
                  Delete this one
                </Button>
                {remainingCount > 1 ? (
                  <Button type="button" variant="ghost" onClick={() => setConfirmDelete("remaining")}>
                    Delete upcoming
                  </Button>
                ) : null}
              </div>
            )
          ) : confirmDelete ? (
            <Button type="button" variant="danger" onClick={() => onDelete("this")} disabled={pending}>
              Confirm delete
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete("this")}>
              Delete
            </Button>
          )
        ) : null}
        <Button type="submit" disabled={pending || !form.title.trim()} data-testid="save-campaign">
          {pending
            ? "Saving…"
            : initial
              ? "Save changes"
              : form.repeat !== "none"
                ? `Add ${sendCount}`
                : isEvent
                  ? "Add event"
                  : "Add campaign"}
        </Button>
      </div>
    </form>
  );
}
