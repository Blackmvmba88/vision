import { describe, expect, it } from "vitest";
import { diffSceneSnapshots } from "./diffSceneSnapshots";
import type { SceneSnapshot } from "./types";

function scene(id: string, objects: string[]): SceneSnapshot {
  return {
    id,
    timestamp: "2026-06-03T00:00:00.000Z",
    source: "browser",
    annotations: [],
    objects: objects.map((name) => ({ name, score: 0.9 })),
  };
}

describe("diffSceneSnapshots", () => {
  it("marks all objects as appeared when there is no previous scene", () => {
    const diff = diffSceneSnapshots(null, scene("current", ["keyboard", "mouse"]));

    expect(diff.appeared).toEqual(["keyboard", "mouse"]);
    expect(diff.disappeared).toEqual([]);
    expect(diff.unchanged).toEqual([]);
    expect(diff.previousCount).toBe(0);
    expect(diff.currentCount).toBe(2);
  });

  it("detects appeared, disappeared, and unchanged objects", () => {
    const previous = scene("previous", ["keyboard", "mouse", "can"]);
    const current = scene("current", ["keyboard", "mouse", "bottle"]);

    const diff = diffSceneSnapshots(previous, current);

    expect(diff.appeared).toEqual(["bottle"]);
    expect(diff.disappeared).toEqual(["can"]);
    expect(diff.unchanged).toEqual(["keyboard", "mouse"]);
  });

  it("tracks repeated object count changes", () => {
    const previous = scene("previous", ["can", "can", "mouse"]);
    const current = scene("current", ["can", "can", "can", "keyboard"]);

    const diff = diffSceneSnapshots(previous, current);

    expect(diff.appeared).toEqual(["can", "keyboard"]);
    expect(diff.disappeared).toEqual(["mouse"]);
    expect(diff.unchanged).toEqual(["can ×2"]);
  });
});
