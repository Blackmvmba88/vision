import type { ObserverEvent, SceneSnapshot } from "./types";
import type { SceneSnapshotDiff } from "./diffSceneSnapshots";

function createEventId(snapshotId: string, type: string, label: string, index: number) {
  return `${snapshotId}-${type}-${label.replace(/\s+/g, "-").toLowerCase()}-${index}`;
}

export function createObserverEvents(snapshot: SceneSnapshot, diff: SceneSnapshotDiff): ObserverEvent[] {
  const events: ObserverEvent[] = [
    {
      id: createEventId(snapshot.id, "snapshot", "scene", 0),
      timestamp: snapshot.timestamp,
      type: "snapshot",
      label: "scene",
      message: `Scene snapshot saved with ${snapshot.objects.length} objects and ${snapshot.annotations.length} manual marks.`,
      snapshotId: snapshot.id,
    },
  ];

  diff.appeared.forEach((label, index) => {
    events.push({
      id: createEventId(snapshot.id, "appeared", label, index),
      timestamp: snapshot.timestamp,
      type: "appeared",
      label,
      message: `${label} appeared in the scene.`,
      snapshotId: snapshot.id,
    });
  });

  diff.disappeared.forEach((label, index) => {
    events.push({
      id: createEventId(snapshot.id, "disappeared", label, index),
      timestamp: snapshot.timestamp,
      type: "disappeared",
      label,
      message: `${label} disappeared from the scene.`,
      snapshotId: snapshot.id,
    });
  });

  if (diff.appeared.length === 0 && diff.disappeared.length === 0 && diff.unchanged.length > 0) {
    events.push({
      id: createEventId(snapshot.id, "unchanged", "stable", 0),
      timestamp: snapshot.timestamp,
      type: "unchanged",
      label: "stable",
      message: `Scene remained stable with ${diff.unchanged.length} tracked object group${diff.unchanged.length === 1 ? "" : "s"}.`,
      snapshotId: snapshot.id,
    });
  }

  return events;
}
