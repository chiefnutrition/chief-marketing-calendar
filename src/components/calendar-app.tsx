import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Lock, Plus, Repeat, Settings } from "lucide-react";
import { toast } from "sonner";
import { Wordmark } from "@/components/wordmark";
import { MonthGrid } from "@/components/month-grid";
import { DayPanel } from "@/components/day-panel";
import { Upcoming } from "@/components/upcoming";
import { CampaignForm } from "@/components/campaign-form";
import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createCampaign,
  deleteCampaign,
  deleteKeyDate,
  loadBoard,
  logout,
  moveCampaign,
  updateCampaign,
} from "@/lib/calendar/api";
import {
  addMonths,
  formatDayMonth,
  formatLong,
  fromISO,
  monthTitle,
  startOfMonth,
  todayISO,
  toISO,
} from "@/lib/calendar/dates";
import {
  TOKEN_STORAGE_KEY,
  type Campaign,
  type CampaignInput,
  type DeleteScope,
  type KeyDate,
} from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

type RegionFilter = "ALL" | "AU" | "US";
type ChannelFilter = "ALL" | "EDM" | "SMS";
type View = "month" | "agenda";

function FilterPill<T extends string>({
  value,
  current,
  onClick,
  children,
}: {
  value: T;
  current: T;
  onClick: (v: T) => void;
  children: ReactNode;
}) {
  const active = value === current;
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={cn(
        "h-11 rounded-full px-3.5 text-xs font-medium transition-colors duration-150",
        active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function CalendarApp({
  token,
  onLock,
}: {
  token: string;
  onLock: () => void;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [keyDates, setKeyDates] = useState<KeyDate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<RegionFilter>("ALL");
  const [channel, setChannel] = useState<ChannelFilter>("ALL");
  const [showKeyDates, setShowKeyDates] = useState(true);
  const [showSchool, setShowSchool] = useState(true);
  const [view, setView] = useState<View>("month");
  const [selectedDate, setSelectedDate] = useState<string | null>(todayISO());
  const [dayOpen, setDayOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [formDate, setFormDate] = useState(todayISO());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"password" | "date">("password");
  const [settingsTabDate, setSettingsTabDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const year = month.getFullYear();
  const dialogOpen = dayOpen || formOpen || settingsOpen;

  const remainingCount = editing?.seriesId
    ? campaigns.filter((c) => c.seriesId === editing.seriesId && c.sendDate >= editing.sendDate).length
    : 1;

  const refresh = useCallback(async () => {
    const data = await loadBoard({ data: { token, year } });
    setKeyDates(data.keyDates);
    setCampaigns(data.campaigns);
    setLoading(false);
  }, [token, year]);

  useEffect(() => {
    setLoading(true);
    refresh().catch(() => {
      toast.error("Could not load the calendar.");
      setLoading(false);
    });
  }, [refresh]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (dialogOpen) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") setMonth((m) => addMonths(m, 1));
      if (e.key === "ArrowLeft") setMonth((m) => addMonths(m, -1));
      if (e.key === "t") {
        const now = startOfMonth(new Date());
        setMonth(now);
        setSelectedDate(todayISO());
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialogOpen]);

  function openDay(iso: string) {
    setSelectedDate(iso);
    setDayOpen(true);
    const d = fromISO(iso);
    if (d.getMonth() !== month.getMonth() || d.getFullYear() !== month.getFullYear()) {
      setMonth(startOfMonth(d));
    }
  }

  function openCreate(iso: string) {
    setEditing(null);
    setFormDate(iso);
    setFormOpen(true);
  }

  function openEdit(c: Campaign) {
    setEditing(c);
    setFormDate(c.sendDate);
    setFormOpen(true);
  }

  async function saveCampaign(input: CampaignInput) {
    setSaving(true);
    try {
      if (editing) {
        await updateCampaign({ data: { token, id: editing.id, ...input } });
        toast.success(input.applyTo === "remaining" ? "Updated remaining sends." : "Campaign updated.");
      } else {
        const result = await createCampaign({ data: { token, ...input } });
        toast.success(
          result.count > 1 ? `Added ${result.count} weekly sends.` : "Campaign added.",
        );
      }
      setFormOpen(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save campaign");
    } finally {
      setSaving(false);
    }
  }

  async function removeCampaign(scope: DeleteScope) {
    if (!editing) return;
    setSaving(true);
    try {
      await deleteCampaign({ data: { token, id: editing.id, scope } });
      toast.success(scope === "remaining" ? "Upcoming sends removed." : "Campaign removed.");
      setFormOpen(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    } finally {
      setSaving(false);
    }
  }

  async function handleMove(c: Campaign, sendDate: string) {
    if (c.sendDate === sendDate) return;
    setCampaigns((prev) => prev.map((x) => (x.id === c.id ? { ...x, sendDate } : x)));
    try {
      await moveCampaign({ data: { token, id: c.id, sendDate } });
      toast.success(`Moved to ${formatDayMonth(sendDate)}.`);
    } catch {
      toast.error("Could not move campaign");
      await refresh();
    }
  }

  async function removeKeyDate(id: number) {
    try {
      await deleteKeyDate({ data: { token, id } });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove date");
    }
  }

  async function lock() {
    try {
      await logout();
    } catch {
      /* cookie clear is best-effort */
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    onLock();
  }

  function jumpYear(y: number) {
    const now = new Date();
    if (y === now.getFullYear()) {
      setMonth(startOfMonth(now));
      setSelectedDate(todayISO());
    } else {
      setMonth(new Date(y, month.getMonth(), 1));
    }
  }

  const monthStart = toISO(month);
  const monthEnd = toISO(new Date(year, month.getMonth() + 1, 0));

  const agendaItems = useMemo(() => {
    type Item =
      | { kind: "campaign"; date: string; campaign: Campaign }
      | { kind: "key"; date: string; keyDate: KeyDate };
    const items: Item[] = [];
    for (const c of campaigns) {
      if (c.sendDate < monthStart || c.sendDate > monthEnd) continue;
      if (channel !== "ALL" && c.channel !== channel) continue;
      if (region !== "ALL" && c.market !== region && c.market !== "BOTH") continue;
      items.push({ kind: "campaign", date: c.sendDate, campaign: c });
    }
    if (showKeyDates) {
      for (const k of keyDates) {
        if (k.startDate < monthStart || k.startDate > monthEnd) continue;
        if (region !== "ALL" && k.region !== region && k.region !== "BOTH") continue;
        if (!showSchool && k.category === "school") continue;
        items.push({ kind: "key", date: k.startDate, keyDate: k });
      }
    }
    items.sort((a, b) => a.date.localeCompare(b.date));
    return items;
  }, [campaigns, keyDates, monthStart, monthEnd, channel, region, showKeyDates, showSchool]);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="border-b border-line bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Wordmark className="shrink-0" />
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openCreate(selectedDate ?? todayISO())}
              data-testid="add-campaign"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Campaign</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSettingsTab("password");
                setSettingsTabDate(selectedDate ?? todayISO());
                setSettingsOpen(true);
              }}
              aria-label="Settings"
            >
              <Settings className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={lock} aria-label="Lock">
              <Lock className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 px-4 py-5 md:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-5" />
              </Button>
              <h1 className="min-w-[12ch] text-center font-display text-2xl font-bold tracking-tight md:text-3xl">
                {monthTitle(month)}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
              >
                <ChevronRight className="size-5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-1"
                onClick={() => {
                  setMonth(startOfMonth(new Date()));
                  setSelectedDate(todayISO());
                }}
              >
                Today
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md bg-surface-2 p-1">
                {[2026, 2027].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => jumpYear(y)}
                    className={cn(
                      "h-9 rounded-sm px-3 text-xs font-medium",
                      year === y ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted",
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md bg-surface-2 p-1">
                <button
                  type="button"
                  onClick={() => setView("month")}
                  className={cn(
                    "h-9 rounded-sm px-3 text-xs font-medium",
                    view === "month" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted",
                  )}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setView("agenda")}
                  className={cn(
                    "h-9 rounded-sm px-3 text-xs font-medium",
                    view === "agenda" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted",
                  )}
                >
                  Agenda
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <FilterPill value="ALL" current={region} onClick={setRegion}>
              AU + US
            </FilterPill>
            <FilterPill value="AU" current={region} onClick={setRegion}>
              AU
            </FilterPill>
            <FilterPill value="US" current={region} onClick={setRegion}>
              US
            </FilterPill>
            <span className="mx-1 h-4 w-px bg-line" />
            <FilterPill value="ALL" current={channel} onClick={setChannel}>
              All channels
            </FilterPill>
            <FilterPill value="EDM" current={channel} onClick={setChannel}>
              EDM
            </FilterPill>
            <FilterPill value="SMS" current={channel} onClick={setChannel}>
              SMS
            </FilterPill>
            <span className="mx-1 h-4 w-px bg-line" />
            <button
              type="button"
              onClick={() => setShowKeyDates((v) => !v)}
              className={cn(
                "h-11 rounded-full px-3.5 text-xs font-medium",
                showKeyDates ? "bg-surface-2 text-ink" : "bg-transparent text-subtle line-through",
              )}
            >
              Key dates
            </button>
            <button
              type="button"
              onClick={() => setShowSchool((v) => !v)}
              className={cn(
                "h-11 rounded-full px-3.5 text-xs font-medium",
                showSchool ? "bg-surface-2 text-ink" : "bg-transparent text-subtle line-through",
              )}
            >
              School holidays
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-[420px] animate-pulse rounded-xl bg-surface-2" />
            ) : view === "month" ? (
              <MonthGrid
                year={year}
                monthIndex={month.getMonth()}
                keyDates={keyDates}
                campaigns={campaigns}
                region={region}
                channel={channel}
                showKeyDates={showKeyDates}
                showSchool={showSchool}
                selectedDate={selectedDate}
                onSelectDate={openDay}
                onEditCampaign={openEdit}
                onMoveCampaign={handleMove}
              />
            ) : (
              <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)] md:p-6">
                {agendaItems.length === 0 ? (
                  <p className="text-sm text-muted">Nothing in {monthTitle(month)} for these filters.</p>
                ) : (
                  <ol className="divide-y divide-line">
                    {agendaItems.map((item) =>
                      item.kind === "campaign" ? (
                        <li key={`c-${item.campaign.id}`}>
                          <button
                            type="button"
                            onClick={() => openEdit(item.campaign)}
                            className="flex w-full items-start gap-4 py-3 text-left hover:bg-bg"
                          >
                            <span className="w-16 shrink-0 text-xs tabular-nums text-muted">
                              {item.date.slice(8)}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 rounded-full px-2 py-0.5 text-2xs font-medium",
                                item.campaign.channel === "EDM"
                                  ? "bg-accent text-accent-fg"
                                  : "bg-clay text-clay-fg",
                              )}
                            >
                              {item.campaign.channel}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex items-center gap-1.5 text-sm font-medium">
                                {item.campaign.title}
                                {item.campaign.seriesId ? (
                                  <Repeat className="size-3 text-subtle" aria-label="Weekly" />
                                ) : null}
                              </span>
                              <span className="text-xs text-muted">
                                {item.campaign.market} · {item.campaign.status}
                                {item.campaign.audience ? ` · ${item.campaign.audience}` : ""}
                                {item.campaign.subject ? ` · ${item.campaign.subject}` : ""}
                              </span>
                            </span>
                          </button>
                        </li>
                      ) : (
                        <li key={`k-${item.keyDate.id}`}>
                          <button
                            type="button"
                            onClick={() => openDay(item.date)}
                            className="flex w-full items-start gap-4 py-3 text-left hover:bg-bg"
                          >
                            <span className="w-16 shrink-0 text-xs tabular-nums text-muted">
                              {item.date.slice(8)}
                            </span>
                            <span className="mt-0.5 text-2xs tracking-wide text-muted uppercase">
                              Date
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm italic">{item.keyDate.name}</span>
                              <span className="text-xs text-muted">
                                {item.keyDate.region === "BOTH" ? "AU + US" : item.keyDate.region}
                              </span>
                            </span>
                          </button>
                        </li>
                      ),
                    )}
                  </ol>
                )}
              </div>
            )}
          </div>

          {view === "month" ? (
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-subtle">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-xs bg-accent" /> EDM
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-xs bg-clay" /> SMS
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-xs bg-school" /> School holidays
              </span>
              <span>Drag a campaign to another day to reschedule. AU school dates follow NSW.</span>
            </p>
          ) : null}
        </div>

        <aside className="hidden lg:block">
          <Upcoming
            keyDates={keyDates}
            campaigns={campaigns}
            region={region}
            channel={channel}
            showKeyDates={showKeyDates}
            onOpenDate={openDay}
          />
        </aside>

        <div className="lg:hidden">
          <Upcoming
            keyDates={keyDates}
            campaigns={campaigns}
            region={region}
            channel={channel}
            showKeyDates={showKeyDates}
            onOpenDate={openDay}
          />
        </div>
      </div>

      <Dialog open={dayOpen} onOpenChange={setDayOpen}>
        <DialogContent className="max-h-[min(90dvh,720px)] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedDate ? formatLong(selectedDate) : "Day"}</DialogTitle>
            <DialogDescription>Key dates and campaigns for this day.</DialogDescription>
          </DialogHeader>
          {selectedDate ? (
            <DayPanel
              date={selectedDate}
              keyDates={keyDates}
              campaigns={campaigns}
              onAdd={() => {
                setDayOpen(false);
                openCreate(selectedDate);
              }}
              onEdit={(c) => {
                setDayOpen(false);
                openEdit(c);
              }}
              onAddKeyDate={() => {
                setDayOpen(false);
                setSettingsTab("date");
                setSettingsTabDate(selectedDate);
                setSettingsOpen(true);
              }}
              onDeleteKeyDate={removeKeyDate}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[min(90dvh,760px)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit campaign" : "New campaign"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update this EDM or SMS." : `Sending ${formatLong(formDate)}.`}
            </DialogDescription>
          </DialogHeader>
          {formOpen ? (
            <CampaignForm
              key={editing ? `edit-${editing.id}` : `new-${formDate}`}
              initial={editing ?? undefined}
              date={formDate}
              keyDates={keyDates}
              pending={saving}
              remainingCount={remainingCount}
              onSubmit={saveCampaign}
              onDelete={editing ? removeCampaign : undefined}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        token={token}
        defaultDate={settingsTabDate}
        defaultTab={settingsTab}
        onKeyDateCreated={refresh}
      />
    </div>
  );
}
