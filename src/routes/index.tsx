import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarApp } from "@/components/calendar-app";
import { BootScreen, LockScreen } from "@/components/lock-screen";
import { checkSession } from "@/lib/calendar/api";
import { TOKEN_STORAGE_KEY } from "@/lib/calendar/types";

export const Route = createFileRoute("/")({ component: Home });

type Gate = { status: "boot" } | { status: "locked" } | { status: "open"; token: string };

function Home() {
  const [gate, setGate] = useState<Gate>({ status: "boot" });

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY) ?? "";
    if (!stored) {
      setGate({ status: "locked" });
      return;
    }
    let cancelled = false;
    checkSession({ data: { token: stored } })
      .then((res) => {
        if (cancelled) return;
        setGate(res.ok ? { status: "open", token: stored } : { status: "locked" });
      })
      .catch(() => {
        if (!cancelled) setGate({ status: "locked" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (gate.status === "boot") return <BootScreen />;
  if (gate.status === "locked") {
    return <LockScreen onUnlock={(token) => setGate({ status: "open", token })} />;
  }
  return <CalendarApp token={gate.token} onLock={() => setGate({ status: "locked" })} />;
}
