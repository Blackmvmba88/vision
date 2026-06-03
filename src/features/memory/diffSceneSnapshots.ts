import type { SceneObject, SceneSnapshot } from "./types";

export type SceneSnapshotDiff = {
  appeared: string[];
  disappeared: string[];
  unchanged: string[];
  previousCount: number;
  currentCount: number;
};

function countObjects(objects: SceneObject[]) {
  const counts = new Map<string, number>();

  for (const object of objects) {
    counts.set(object.name, (counts.get(object.name) ?? 0) + 1);
  }

  return counts;
}

function expandCountDiff(label: string, count: number) {
  if (count <= 1) return label;
  return `${label} ×${count}`;
}

export function diffSceneSnapshots(previous: SceneSnapshot | null, current: SceneSnapshot): SceneSnapshotDiff {
  const previousCounts = countObjects(previous?.objects ?? []);
  const currentCounts = countObjects(current.objects);
  const labels = new Set([...previousCounts.keys(), ...currentCounts.keys()]);
  const appeared: string[] = [];
  const disappeared: string[] = [];
  const unchanged: string[] = [];

  for (const label of labels) {
    const before = previousCounts.get(label) ?? 0;
    const after = currentCounts.get(label) ?? 0;

    if (after > before) appeared.push(expandCountDiff(label, after - before));
    if (before > after) disappeared.push(expandCountDiff(label, before - after));
    if (before > 0 && after > 0) unchanged.push(expandCountDiff(label, Math.min(before, after)));
  }

  return {
    appeared,
    disappeared,
    unchanged,
    previousCount: previous?.objects.length ?? 0,
    currentCount: current.objects.length,
  };
}
