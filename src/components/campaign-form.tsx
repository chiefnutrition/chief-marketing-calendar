import { useMemo, useState, type FormEvent } from "react";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addCalendarMonths, formatDayMonth, weekdayLong, weeklyDates } from "@/lib/calendar/dates";
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
} from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

const empty = (date: string): CampaignInput => ({
  title: "",
  channel: "EDM",
  sendDate: date,
  sendTime: "09:00",
  market: "AU",
  status: "draft",
  subject: "",
  audience: "",
  notes: "",
  keyDateId: null,
  repeat: "none",
  repeatUntil: addCalendarMonths(date, 12),
  applyTo: "this",
});

function fromCampaign(c: Campaign): CampaignInput {
  return {
    title: c.title,
    channel: c.channel,
    sendDate: c.sendDate,
    sendTime: c.sendTime || "09:00",
    market: c.market,
    status: c.status,
    subject: c.subject,
    audience: c.audience,
    notes: c.notes,
    keyDateId: c.keyDateId,
    repeat: "none",
    repeatUntil: addCalendarMonths(c.sendDate, 12),
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
  const dayDates = keyDates.filter((k) => {
    const end = k.endDate ?? k.startDate;
    return form.sendDate >= k.startDate && form.sendDate <= end;
  });

  const sendCount = useMemo(() => {
    if (form.repeat !== "weekly" || !form.repeatUntil) return 1;
    return weeklyDates(form.sendDate, form.repeatUntil, 80).length;
  }, [form.repeat, form.sendDate, form.repeatUntil]);

  function set<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "sendDate" && typeof value === "string") {
        if (!prev.repeatUntil || prev.repeatUntil < value) {
          next.repeatUntil = addCalendarMonths(value, 12);
        }
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
        <Label htmlFor="campaign-title">Campaign name</Label>
        <Input
          id="campaign-title"
          data-testid="campaign-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Weekly newsletter"
          autoFocus
        />
      </div>

      <div className="space-y-1.5">
        <Label>Channel</Label>
        <Segment
          value={form.channel}
          onChange={(v) => {
            set("channel", v as Channel);
            if (!initial) set("sendTime", v === "SMS" ? "11:00" : "09:00");
          }}
          options={[
            { value: "EDM", label: "EDM" },
            { value: "SMS", label: "SMS" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audience">Audience</Label>
        <Input
          id="audience"
          value={form.audience}
          onChange={(e) => set("audience", e.target.value)}
          placeholder="All subscribers"
        />
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
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="send-date">{form.repeat === "weekly" ? "First send" : "Send date"}</Label>
          <Input
            id="send-date"
            type="date"
            value={form.sendDate}
            onChange={(e) => set("sendDate", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="send-time">Send time</Label>
          <Input
            id="send-time"
            type="time"
            value={form.sendTime}
            onChange={(e) => set("sendTime", e.target.value)}
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
                      { value: "this", label: "This send" },
                      { value: "remaining", label: "All remaining" },
                    ]
                  : [{ value: "this", label: "This send" }]
              }
            />
            <p className="flex items-center gap-1.5 text-2xs text-subtle">
              <Repeat className="size-3" />
              Weekly series · {weekdayLong(initial.sendDate)}s
            </p>
          </div>
        ) : null
      ) : (
        <div className="space-y-1.5">
          <Label>Repeats</Label>
          <Segment
            value={form.repeat}
            onChange={(v) => set("repeat", v as RepeatKind)}
            options={[
              { value: "none", label: "Once" },
              { value: "weekly", label: "Weekly" },
            ]}
          />
          {form.repeat === "weekly" ? (
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="repeat-until">Until</Label>
              <Input
                id="repeat-until"
                type="date"
                min={form.sendDate}
                value={form.repeatUntil ?? ""}
                onChange={(e) => set("repeatUntil", e.target.value || null)}
              />
              <p className="text-2xs text-subtle">
                Every {weekdayLong(form.sendDate)} · {sendCount} send{sendCount === 1 ? "" : "s"}
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
            { value: "sent", label: "Sent" },
          ]}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">{form.channel === "SMS" ? "SMS copy" : "Subject line"}</Label>
        <Input
          id="subject"
          value={form.subject}
          onChange={(e) => set("subject", e.target.value)}
          placeholder={form.channel === "SMS" ? "New recipes this week." : "This week’s recipes"}
        />
      </div>

      {form.repeat === "none" && dayDates.length > 0 ? (
        <div className="space-y-1.5">
          <Label htmlFor="key-date">Tied to</Label>
          <select
            id="key-date"
            value={form.keyDateId ?? ""}
            onChange={(e) => set("keyDateId", e.target.value ? Number(e.target.value) : null)}
            className="flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
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
          placeholder="Offer, hero product, owner…"
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
                  : "Confirm delete this send"}
              </Button>
            ) : (
              <div className="flex flex-1 flex-wrap gap-2">
                <Button type="button" variant="ghost" onClick={() => setConfirmDelete("this")}>
                  Delete this send
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
              : form.repeat === "weekly"
                ? `Add ${sendCount} sends`
                : "Add campaign"}
        </Button>
      </div>
    </form>
  );
}
