import { Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDayMonth, todayISO, toISO } from "@/lib/calendar/dates";
import type { Campaign, KeyDate } from "@/lib/calendar/types";

function matchesRegion(region: string, filter: "ALL" | "AU" | "US") {
  if (filter === "ALL") return true;
  return region === filter || region === "BOTH";
}

export function Upcoming({
  keyDates,
  campaigns,
  region,
  channel,
  showKeyDates,
  onOpenDate,
}: {
  keyDates: KeyDate[];
  campaigns: Campaign[];
  region: "ALL" | "AU" | "US";
  channel: "ALL" | "EDM" | "SMS";
  showKeyDates: boolean;
  onOpenDate: (iso: string) => void;
}) {
  const today = todayISO();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 60);
  const until = toISO(horizon);

  const camps = campaigns
    .filter(
      (c) =>
        c.sendDate >= today &&
        c.sendDate <= until &&
        (channel === "ALL" || c.channel === channel) &&
        matchesRegion(c.market, region),
    )
    .slice(0, 8);

  const dates = showKeyDates
    ? keyDates
        .filter(
          (k) =>
            matchesRegion(k.region, region) &&
            k.category !== "school" &&
            k.startDate >= today &&
            k.startDate <= until,
        )
        .slice(0, 8)
    : [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xs font-medium tracking-caps text-muted uppercase">
          Upcoming sends
        </h2>
        {camps.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">No campaigns in the next 60 days.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {camps.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onOpenDate(c.sendDate)}
                  className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-2"
                >
                  <span className="w-12 shrink-0 pt-0.5 text-2xs tabular-nums text-muted">
                    {formatDayMonth(c.sendDate)}
                  </span>
                  {c.channel === "EDM" ? (
                    <Mail className="mt-0.5 size-3.5 shrink-0 text-accent" />
                  ) : (
                    <MessageSquare className="mt-0.5 size-3.5 shrink-0 text-clay" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{c.title}</span>
                    <span className="text-2xs text-subtle">
                      {c.channel} · {c.market} · {c.status}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xs font-medium tracking-caps text-muted uppercase">
          Dates to plan around
        </h2>
        {dates.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">No upcoming key dates in view.</p>
        ) : (
          <ul className="mt-3 space-y-1">
            {dates.map((k) => (
              <li key={k.id}>
                <button
                  type="button"
                  onClick={() => onOpenDate(k.startDate)}
                  className="flex w-full items-start gap-3 rounded-md px-2 py-2 text-left hover:bg-surface-2"
                >
                  <span className="w-12 shrink-0 pt-0.5 text-2xs tabular-nums text-muted">
                    {formatDayMonth(k.startDate)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{k.name}</span>
                    <span className="mt-0.5 inline-flex items-center gap-1.5">
                      <Badge variant={k.region === "BOTH" ? "both" : k.region === "US" ? "us" : "au"}>
                        {k.region === "BOTH" ? "AU + US" : k.region}
                      </Badge>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
