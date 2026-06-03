import { useEffect, useState } from "react";
import type { ManualAnnotation, ObserverEvent, SceneObject, SceneSnapshot } from "./types";

const SNAPSHOTS_STORAGE_KEY = "blackmamba-vision-scene-memory";
const EVENTS_STORAGE_KEY = "blackmamba-vision-observer-events";

function readStoredSnapshots(): SceneSnapshot[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SceneSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readStoredEvents(): ObserverEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ObserverEvent[];
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
  const [events, setEvents] = useState<ObserverEvent[]>(() => readStoredEvents());

  useEffect(() => {
    window.localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(snapshots));
  }, [snapshots]);

  useEffect(() => {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  }, [events]);

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

  const addEvents = (nextEvents: ObserverEvent[]) => {
    setEvents((previous) => [...nextEvents, ...previous].slice(0, 100));
  };

  const clearMemory = () => {
    setSnapshots([]);
    setEvents([]);
  };

  const exportMemory = () => {
    const stamp = new Date().toISOString().replaceAll(":", "-");
    const payload = {
      exportedAt: new Date().toISOString(),
      snapshots,
      events,
    };
    downloadTextFile(`vision-observer-memory-${stamp}.json`, JSON.stringify(payload, null, 2));
  };

  const importMemory = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as { snapshots?: SceneSnapshot[]; events?: ObserverEvent[] } | SceneSnapshot[];

    if (Array.isArray(parsed)) {
      setSnapshots(parsed.slice(0, 25));
      setEvents([]);
      return;
    }

    if (!Array.isArray(parsed.snapshots)) {
      throw new Error("Observer memory import must include a snapshots array.");
    }

    setSnapshots(parsed.snapshots.slice(0, 25));
    setEvents(Array.isArray(parsed.events) ? parsed.events.slice(0, 100) : []);
  };

  return {
    snapshots,
    events,
    createSnapshot,
    addEvents,
    clearMemory,
    exportMemory,
    importMemory,
  };
}
