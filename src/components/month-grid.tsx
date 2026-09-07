import type { Campaign, KeyDate } from "@/lib/calendar/types";
import {
  isoInMonth,
  isInRange,
  monthCells,
  rangeLengthDays,
  todayISO,
  WEEKDAYS,
} from "@/lib/calendar/dates";
import { cn } from "@/lib/utils";

function matchesRegion(region: string, filter: "ALL" | "AU" | "US") {
  if (filter === "ALL") return true;
  return region === filter || region === "BOTH";
}

export function MonthGrid({
  year,
  monthIndex,
  keyDates,
  campaigns,
  region,
  channel,
  showKeyDates,
  showSchool,
  selectedDate,
  onSelectDate,
  onEditCampaign,
  onMoveCampaign,
}: {
  year: number;
  monthIndex: number;
  keyDates: KeyDate[];
  campaigns: Campaign[];
  region: "ALL" | "AU" | "US";
  channel: "ALL" | "EDM" | "SMS";
  showKeyDates: boolean;
  showSchool: boolean;
  selectedDate: string | null;
  onSelectDate: (iso: string) => void;
  onEditCampaign?: (c: Campaign) => void;
  onMoveCampaign?: (c: Campaign, sendDate: string) => void;
}) {
  const cells = monthCells(year, monthIndex);
  const today = todayISO();

  return (
    <div className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]">
      <div className="grid grid-cols-7 border-b border-line">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="px-1 py-2.5 text-center text-2xs font-medium tracking-caps text-muted uppercase"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`e-${i}`} className="min-h-16 border-line bg-bg/40 md:min-h-28" />;
          }
          const iso = isoInMonth(year, monthIndex, day);
          const dayKeys = showKeyDates
            ? keyDates.filter(
                (k) =>
                  matchesRegion(k.region, region) &&
                  isInRange(iso, k.startDate, k.endDate) &&
                  (showSchool || k.category !== "school"),
              )
            : [];
          const school = showSchool
            ? keyDates.some(
                (k) =>
                  k.category === "school" &&
                  matchesRegion(k.region, region) &&
                  isInRange(iso, k.startDate, k.endDate) &&
                  rangeLengthDays(k.startDate, k.endDate) <= 21,
              )
            : false;
          const dayCamps = campaigns.filter(
            (c) =>
              c.sendDate === iso &&
              (channel === "ALL" || c.channel === channel) &&
              matchesRegion(c.market, region),
          );
          const isToday = iso === today;
          const isSelected = iso === selectedDate;
          const labelKeys = dayKeys
            .filter((k) => k.category !== "school")
            .filter((k) => rangeLengthDays(k.startDate, k.endDate) <= 3 || k.startDate === iso);
          const peekKeys = labelKeys.slice(0, 1);
          const peekCamps = dayCamps.slice(0, 2);
          const more = labelKeys.length + dayCamps.length - peekKeys.length - peekCamps.length;

          return (
            <div
              key={iso}
              role="button"
              tabIndex={0}
              data-date={iso}
              onClick={() => onSelectDate(iso)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectDate(iso);
                }
              }}
              onDragOver={(e) => {
                if (!onMoveCampaign) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                if (!onMoveCampaign) return;
                e.preventDefault();
                e.stopPropagation();
                const id = Number(e.dataTransfer.getData("text/plain"));
                const c = campaigns.find((x) => x.id === id);
                if (c) onMoveCampaign(c, iso);
              }}
              className={cn(
                "flex min-h-16 flex-col items-start gap-0.5 border-t border-l border-line p-1.5 text-left md:min-h-28 md:p-2",
                i % 7 === 0 && "border-l-0",
                school && "bg-school/70",
                isSelected && "bg-surface-2",
                "cursor-pointer transition-colors duration-150 hover:bg-surface-2/80",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs tabular-nums",
                  isToday ? "bg-accent font-medium text-accent-fg" : "text-ink",
                )}
              >
                {day}
              </span>
              <div className="hidden w-full flex-col gap-0.5 md:flex">
                {peekKeys.map((k) => (
                  <span key={k.id} className="truncate text-2xs leading-tight text-muted italic">
                    {k.name}
                  </span>
                ))}
                {peekCamps.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    draggable={Boolean(onMoveCampaign)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCampaign?.(c);
                    }}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", String(c.id));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    className={cn(
                      "truncate rounded-xs px-1 py-0.5 text-left text-2xs font-medium leading-tight",
                      c.channel === "EDM" ? "bg-accent text-accent-fg" : "bg-clay text-clay-fg",
                    )}
                  >
                    {c.channel} {c.title}
                  </button>
                ))}
                {more > 0 ? <span className="text-2xs text-subtle">+{more}</span> : null}
              </div>
              <div className="mt-auto flex flex-wrap gap-0.5 md:hidden">
                {dayCamps.slice(0, 3).map((c) => (
                  <span
                    key={c.id}
                    className={cn(
                      "size-1.5 rounded-full",
                      c.channel === "EDM" ? "bg-accent" : "bg-clay",
                    )}
                  />
                ))}
                {dayCamps.length === 0 && peekKeys.length > 0 ? (
                  <span className="size-1.5 rounded-full bg-subtle" />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
