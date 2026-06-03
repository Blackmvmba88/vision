import { describe, expect, it } from "vitest";
import { summarizeObserverEvents } from "./summarizeObserverEvents";
import type { ObserverEvent, ObserverEventType } from "./types";

function event(type: ObserverEventType, index: number): ObserverEvent {
  return {
    id: `${type}-${index}`,
    timestamp: "2026-06-03T00:00:00.000Z",
    type,
    label: type,
    message: `${type} event ${index}`,
    snapshotId: `scene-${index}`,
  };
}

describe("summarizeObserverEvents", () => {
  it("reports silent state for an empty event log", () => {
    const summary = summarizeObserverEvents([]);

    expect(summary.totalEvents).toBe(0);
    expect(summary.lastEventMessage).toBeNull();
    expect(summary.stabilityLabel).toBe("silent");
  });

  it("reports stable state when there are no appeared or disappeared events", () => {
    const summary = summarizeObserverEvents([event("snapshot", 1), event("unchanged", 2)]);

    expect(summary.snapshotCount).toBe(1);
    expect(summary.unchangedCount).toBe(1);
    expect(summary.stabilityLabel).toBe("stable");
  });

  it("reports active state for moderate change volume", () => {
    const summary = summarizeObserverEvents([
      event("appeared", 1),
      event("disappeared", 2),
      event("snapshot", 3),
    ]);

    expect(summary.appearedCount).toBe(1);
    expect(summary.disappearedCount).toBe(1);
    expect(summary.stabilityLabel).toBe("active");
    expect(summary.lastEventMessage).toBe("appeared event 1");
  });

  it("reports volatile state for high change volume", () => {
    const summary = summarizeObserverEvents([
      event("appeared", 1),
      event("appeared", 2),
      event("appeared", 3),
      event("disappeared", 4),
      event("disappeared", 5),
    ]);

    expect(summary.stabilityLabel).toBe("volatile");
  });
});
