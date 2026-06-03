import { useEffect, useState } from "react";
import type { ManualAnnotation, SceneObject, SceneSnapshot } from "./types";

const STORAGE_KEY = "blackmamba-vision-scene-memory";

function readStoredSnapshots(): SceneSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SceneSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function useSceneMemory() {
  const [snapshots, setSnapshots] = useState<SceneSnapshot[]>(() => readStoredSnapshots());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }, [snapshots]);

  const createSnapshot = (objects: SceneObject[], annotations: ManualAnnotation[]) => {
    const now = new Date();
    const snapshot: SceneSnapshot = {
      id: `scene-${now.getTime()}`,
      timestamp: now.toISOString(),
      objects,
      annotations,
      source: "browser",
    };

    setSnapshots((previous) => [snapshot, ...previous].slice(0, 25));
    return snapshot;
  };

  const clearSnapshots = () => {
    setSnapshots([]);
  };

  const exportSnapshots = () => {
    const stamp = new Date().toISOString().replaceAll(":", "-");
    downloadTextFile(`vision-scene-memory-${stamp}.json`, JSON.stringify(snapshots, null, 2));
  };

  const importSnapshots = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as SceneSnapshot[];

    if (!Array.isArray(parsed)) {
      throw new Error("Scene memory import must be a JSON array.");
    }

    setSnapshots(parsed.slice(0, 25));
  };

  return {
    snapshots,
    createSnapshot,
    clearSnapshots,
    exportSnapshots,
    importSnapshots,
  };
}
