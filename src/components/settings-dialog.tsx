import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, createKeyDate } from "@/lib/calendar/api";
import type { DateCategory, Region } from "@/lib/calendar/types";

export function SettingsDialog({
  open,
  onOpenChange,
  token,
  defaultDate,
  defaultTab = "password",
  onKeyDateCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string;
  defaultDate: string;
  defaultTab?: "password" | "date";
  onKeyDateCreated: () => void;
}) {
  const [tab, setTab] = useState<"password" | "date">(defaultTab);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [pending, setPending] = useState(false);

  const [name, setName] = useState("");
  const [start, setStart] = useState(defaultDate);
  const [end, setEnd] = useState("");
  const [region, setRegion] = useState<Region>("AU");
  const [category, setCategory] = useState<DateCategory>("retail");
  const [notes, setNotes] = useState("");
  const [dateMsg, setDateMsg] = useState("");

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setStart(defaultDate);
    }
  }, [open, defaultTab, defaultDate]);

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setPwErr("");
    setPwMsg("");
    try {
      await changePassword({ data: { token, current, next } });
      setPwMsg("Password updated.");
      setCurrent("");
      setNext("");
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setPending(false);
    }
  }

  async function saveDate(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setDateMsg("");
    try {
      await createKeyDate({
        data: {
          token,
          name,
          startDate: start,
          endDate: end || null,
          region,
          category,
          notes,
        },
      });
      setDateMsg("Date added to the calendar.");
      setName("");
      setNotes("");
      onKeyDateCreated();
    } catch (err) {
      setDateMsg(err instanceof Error ? err.message : "Could not add date");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Team password and custom dates the whole calendar can plan around.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4 flex rounded-md bg-surface-2 p-1">
          <button
            type="button"
            onClick={() => setTab("password")}
            className={`h-9 flex-1 rounded-sm text-sm font-medium ${tab === "password" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"}`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setTab("date")}
            className={`h-9 flex-1 rounded-sm text-sm font-medium ${tab === "date" ? "bg-surface text-ink shadow-[var(--shadow-border)]" : "text-muted"}`}
          >
            Custom date
          </button>
        </div>

        {tab === "password" ? (
          <form onSubmit={savePassword} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current password</Label>
              <Input
                id="current-pw"
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="next-pw">New password</Label>
              <Input
                id="next-pw"
                type="password"
                value={next}
                onChange={(e) => setNext(e.target.value)}
                minLength={6}
              />
            </div>
            {pwErr ? <p className="text-sm text-danger">{pwErr}</p> : null}
            {pwMsg ? <p className="text-sm text-accent">{pwMsg}</p> : null}
            <Button type="submit" disabled={pending || !current || next.length < 6}>
              {pending ? "Saving…" : "Update password"}
            </Button>
          </form>
        ) : (
          <form onSubmit={saveDate} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="kd-name">Name</Label>
              <Input
                id="kd-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Collagen bar launch"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kd-start">Start</Label>
                <Input id="kd-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kd-end">End (optional)</Label>
                <Input id="kd-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="kd-region">Market</Label>
                <select
                  id="kd-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
                >
                  <option value="AU">AU</option>
                  <option value="US">US</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="kd-cat">Type</Label>
                <select
                  id="kd-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DateCategory)}
                  className="flex h-11 w-full rounded-md border border-line bg-surface px-3 text-sm"
                >
                  <option value="retail">Retail / campaign</option>
                  <option value="cultural">Cultural</option>
                  <option value="sporting">Sporting</option>
                  <option value="school">School</option>
                  <option value="public">Public holiday</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="kd-notes">Notes</Label>
              <Input
                id="kd-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Why this matters for Chief"
              />
            </div>
            {dateMsg ? <p className="text-sm text-accent">{dateMsg}</p> : null}
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending ? "Saving…" : "Add key date"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
