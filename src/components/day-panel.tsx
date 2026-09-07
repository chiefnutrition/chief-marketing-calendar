import { Mail, MessageSquare, Plus, Repeat, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatLong, isInRange, rangeLengthDays } from "@/lib/calendar/dates";
import type { Campaign, KeyDate } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

function categoryLabel(c: KeyDate["category"]) {
  if (c === "public") return "Holiday";
  if (c === "school") return "School";
  if (c === "retail") return "Retail";
  if (c === "sporting") return "Sport";
  return "Cultural";
}

export function DayPanel({
  date,
  keyDates,
  campaigns,
  onAdd,
  onEdit,
  onAddKeyDate,
  onDeleteKeyDate,
}: {
  date: string;
  keyDates: KeyDate[];
  campaigns: Campaign[];
  onAdd: () => void;
  onEdit: (c: Campaign) => void;
  onAddKeyDate: () => void;
  onDeleteKeyDate: (id: number) => void;
}) {
  const dayKeys = keyDates.filter((k) => isInRange(date, k.startDate, k.endDate));
  const dayCamps = campaigns.filter((c) => c.sendDate === date);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xs font-medium tracking-caps text-muted uppercase">Day</p>
          <h2 className="mt-1 font-display text-2xl leading-tight font-bold tracking-tight">
            {formatLong(date)}
          </h2>
        </div>
        <Button size="sm" onClick={onAdd} data-testid="add-campaign-day">
          <Plus className="size-4" />
          Campaign
        </Button>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xs font-medium tracking-caps text-muted uppercase">
            Key dates
          </h3>
          <button
            type="button"
            onClick={onAddKeyDate}
            className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Add date
          </button>
        </div>
        {dayKeys.length === 0 ? (
          <p className="mt-2 text-sm text-subtle">Nothing pinned to this day.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {dayKeys.map((k) => (
              <li
                key={k.id}
                className="rounded-md border border-line bg-bg px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{k.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <Badge variant={k.category}>{categoryLabel(k.category)}</Badge>
                      <Badge variant={k.region === "US" ? "us" : k.region === "AU" ? "au" : "both"}>
                        {k.region === "BOTH" ? "AU + US" : k.region}
                      </Badge>
                      {rangeLengthDays(k.startDate, k.endDate) > 1 ? (
                        <span className="text-2xs text-subtle">
                          {k.startDate} – {k.endDate}
                        </span>
                      ) : null}
                    </div>
                    {k.notes ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{k.notes}</p> : null}
                  </div>
                  {!k.isSystem ? (
                    <button
                      type="button"
                      onClick={() => onDeleteKeyDate(k.id)}
                      className="rounded-sm p-2 text-subtle hover:bg-surface-2 hover:text-danger"
                      aria-label={`Remove ${k.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 flex-1">
        <h3 className="text-2xs font-medium tracking-caps text-muted uppercase">
          Campaigns
        </h3>
        {dayCamps.length === 0 ? (
          <p className="mt-2 text-sm text-subtle">No EDM or SMS on this day yet.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {dayCamps.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onEdit(c)}
                  className="w-full rounded-md border border-line bg-bg px-3 py-2.5 text-left transition-colors hover:bg-surface-2"
                >
                  <div className="flex items-center gap-2">
                    {c.channel === "EDM" ? (
                      <Mail className="size-3.5 text-accent" />
                    ) : (
                      <MessageSquare className="size-3.5 text-clay" />
                    )}
                    <span className="text-sm font-medium text-ink">{c.title}</span>
                    {c.seriesId ? <Repeat className="size-3 text-subtle" aria-label="Weekly" /> : null}
                    <Badge variant={c.channel === "EDM" ? "edm" : "sms"} className="ml-auto">
                      {c.channel}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge variant={c.status}>{c.status}</Badge>
                    <Badge variant={c.market === "BOTH" ? "both" : c.market === "US" ? "us" : "au"}>
                      {c.market === "BOTH" ? "AU + US" : c.market}
                    </Badge>
                    {c.sendTime ? (
                      <span className="text-2xs tabular-nums text-subtle">{c.sendTime}</span>
                    ) : null}
                  </div>
                  {c.audience ? (
                    <p className="mt-1.5 text-xs text-muted">To {c.audience}</p>
                  ) : null}
                  {c.subject ? (
                    <p className={cn("mt-1 truncate text-xs text-muted")}>{c.subject}</p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
