import type { ObserverEvent } from "./types";

export type ObserverMemorySummary = {
  totalEvents: number;
  appearedCount: number;
  disappearedCount: number;
  snapshotCount: number;
  unchangedCount: number;
  lastEventMessage: string | null;
  stabilityLabel: "silent" | "stable" | "active" | "volatile";
};

export function summarizeObserverEvents(events: ObserverEvent[]): ObserverMemorySummary {
  const appearedCount = events.filter((event) => event.type === "appeared").length;
  const disappearedCount = events.filter((event) => event.type === "disappeared").length;
  const snapshotCount = events.filter((event) => event.type === "snapshot").length;
  const unchangedCount = events.filter((event) => event.type === "unchanged").length;
  const changeCount = appearedCount + disappearedCount;

  const stabilityLabel =
    events.length === 0
      ? "silent"
      : changeCount === 0
      ? "stable"
      : changeCount <= 4
      ? "active"
      : "volatile";

  return {
    totalEvents: events.length,
    appearedCount,
    disappearedCount,
    snapshotCount,
    unchangedCount,
    lastEventMessage: events[0]?.message ?? null,
    stabilityLabel,
  };
}
