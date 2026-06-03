import { describe, expect, it } from "vitest";
import { createObserverEvents } from "./createObserverEvents";
import type { SceneSnapshot } from "./types";

const snapshot: SceneSnapshot = {
  id: "scene-1",
  timestamp: "2026-06-03T00:00:00.000Z",
  source: "browser",
  annotations: [{ id: "manual-1", x: 1, y: 2, width: 30, height: 40 }],
  objects: [
    { name: "keyboard", score: 0.98 },
    { name: "mouse", score: 0.96 },
  ],
};

describe("createObserverEvents", () => {
  it("always creates a snapshot event", () => {
    const events = createObserverEvents(snapshot, {
      appeared: [],
      disappeared: [],
      unchanged: [],
      previousCount: 0,
      currentCount: 2,
    });

    expect(events[0]).toMatchObject({
      type: "snapshot",
      label: "scene",
      snapshotId: "scene-1",
    });
    expect(events[0].message).toContain("2 objects");
    expect(events[0].message).toContain("1 manual marks");
  });

  it("creates appeared and disappeared events from a diff", () => {
    const events = createObserverEvents(snapshot, {
      appeared: ["bottle"],
      disappeared: ["can"],
      unchanged: ["keyboard"],
      previousCount: 2,
      currentCount: 2,
    });

    expect(events.map((event) => event.type)).toEqual(["snapshot", "appeared", "disappeared"]);
    expect(events[1].message).toBe("bottle appeared in the scene.");
    expect(events[2].message).toBe("can disappeared from the scene.");
  });

  it("creates a stable unchanged event when no objects changed", () => {
    const events = createObserverEvents(snapshot, {
      appeared: [],
      disappeared: [],
      unchanged: ["keyboard", "mouse"],
      previousCount: 2,
      currentCount: 2,
    });

    expect(events.map((event) => event.type)).toEqual(["snapshot", "unchanged"]);
    expect(events[1].message).toContain("Scene remained stable");
  });
});
