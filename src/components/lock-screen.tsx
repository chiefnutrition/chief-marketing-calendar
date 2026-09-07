import { useEffect, useState, type FormEvent } from "react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, unlockHint } from "@/lib/calendar/api";
import { TOKEN_STORAGE_KEY } from "@/lib/calendar/types";

export function BootScreen() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-bg px-5">
      <Wordmark size="lg" />
    </main>
  );
}

export function LockScreen({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [starter, setStarter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    unlockHint()
      .then((res) => {
        if (!cancelled) setStarter(res.starter);
      })
      .catch(() => {
        /* hint is optional */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await login({ data: { password } });
      localStorage.setItem(TOKEN_STORAGE_KEY, result.token);
      onUnlock(result.token);
    } catch {
      setError("Wrong password. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_6%,transparent),transparent)]"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface p-8 shadow-[var(--shadow-border)]">
        <Wordmark size="lg" />
        <h1 className="mt-8 font-display text-3xl leading-tight font-bold tracking-tight text-ink">
          Team calendar
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          EDM and SMS planning for Australia and the US, with the dates worth building campaigns around.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="team-password">Team password</Label>
            <Input
              id="team-password"
              data-testid="team-password"
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending || !password}>
            {pending ? "Unlocking…" : "Unlock"}
          </Button>
        </form>
        {starter ? (
          <p className="mt-6 rounded-md bg-bg px-3 py-2.5 text-xs leading-relaxed text-muted">
            Starter password is{" "}
            <span className="font-medium tracking-wide text-ink">{starter}</span>
            . Change it in Settings once you are in.
          </p>
        ) : (
          <p className="mt-6 text-xs leading-relaxed text-subtle">
            Shared with the Chief marketing team. Ask whoever last changed it if you are stuck.
          </p>
        )}
      </div>
    </main>
  );
}
