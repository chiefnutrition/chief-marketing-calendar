import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign, CampaignInput, CampaignStatus, Channel, KeyDate, Market } from "@/lib/calendar/types";
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
  onSubmit,
  onDelete,
}: {
  initial?: Campaign;
  date: string;
  keyDates: KeyDate[];
  pending: boolean;
  onSubmit: (input: CampaignInput) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [form, setForm] = useState<CampaignInput>(initial ? fromCampaign(initial) : empty(date));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dayDates = keyDates.filter((k) => {
    const end = k.endDate ?? k.startDate;
    return form.sendDate >= k.startDate && form.sendDate <= end;
  });

  function set<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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
          placeholder="Mother's Day EDM"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="send-date">Send date</Label>
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
          placeholder={form.channel === "SMS" ? "Dad, this one's for you." : "Father's Day, sorted."}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="audience">Audience</Label>
        <Input
          id="audience"
          value={form.audience}
          onChange={(e) => set("audience", e.target.value)}
          placeholder="AU VIP · purchased 90d"
        />
      </div>

      {dayDates.length > 0 ? (
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
          confirmDelete ? (
            <Button type="button" variant="danger" onClick={onDelete} disabled={pending}>
              Confirm delete
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          )
        ) : null}
        <Button type="submit" disabled={pending || !form.title.trim()} data-testid="save-campaign">
          {pending ? "Saving…" : initial ? "Save changes" : "Add campaign"}
        </Button>
      </div>
    </form>
  );
}
