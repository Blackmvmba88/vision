import { useEffect, useRef, useState } from "react";
import { Camera, Eye, Boxes, History, ScanLine, AlertTriangle, RotateCcw, Save, Download, Upload, Trash2, Activity, ListTree, BarChart3, Pencil, X } from "lucide-react";
import { useObjectDetector } from "./features/detector/useObjectDetector";
import { getObjectAlias } from "./features/labels/objectAliases";
import { useCustomAliases } from "./features/labels/useCustomAliases";
import { createObserverEvents } from "./features/memory/createObserverEvents";
import { diffSceneSnapshots, type SceneSnapshotDiff } from "./features/memory/diffSceneSnapshots";
import { summarizeObserverEvents } from "./features/memory/summarizeObserverEvents";
import { useSceneMemory } from "./features/memory/useSceneMemory";
import type { ManualAnnotation } from "./features/memory/types";

const objects = [
  { name: "keyboard", score: 0.98 },
  { name: "mouse", score: 0.96 },
  { name: "cell phone", score: 0.94 },
  { name: "bottle", score: 0.89 },
];

type CameraStatus = "initializing" | "active" | "denied" | "unsupported" | "error";

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("initializing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [memoryMessage, setMemoryMessage] = useState<string | null>(null);
  const [aliasMessage, setAliasMessage] = useState<string | null>(null);
  const [selectedAliasTarget, setSelectedAliasTarget] = useState("cell phone");
  const [aliasDisplayName, setAliasDisplayName] = useState("Mi cel nodo");
  const [aliasSpanishName, setAliasSpanishName] = useState("Celular nodo principal");
  const [aliasSystemRole, setAliasSystemRole] = useState("persistent presence control surface");
  const [lastDiff, setLastDiff] = useState<SceneSnapshotDiff | null>(null);
  const [annotations, setAnnotations] = useState<ManualAnnotation[]>([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const { status: detectorStatus, predictions, error: detectorError } = useObjectDetector(videoRef);
  const { customAliases, setCustomAlias, removeCustomAlias, clearCustomAliases } = useCustomAliases();
  const { snapshots, events, createSnapshot, addEvents, clearMemory, exportMemory, importMemory } = useSceneMemory();
  const observerSummary = summarizeObserverEvents(events);

  const displayedObjects =
    predictions.length > 0
      ? predictions.map((prediction) => {
          const alias = getObjectAlias(prediction.className, customAliases);
          return {
            name: alias.canonicalName,
            score: prediction.score,
            displayName: alias.displayName,
            spanishName: alias.spanishName,
            systemRole: alias.systemRole,
          };
        })
      : objects.map((object) => {
          const alias = getObjectAlias(object.name, customAliases);
          return {
            ...object,
            name: alias.canonicalName,
            displayName: alias.displayName,
            spanishName: alias.spanishName,
            systemRole: alias.systemRole,
          };
        });

  const aliasTargets = Array.from(new Set(["cell phone", ...displayedObjects.map((object) => object.name), ...Object.keys(customAliases)]));
  const customAliasEntries = Object.entries(customAliases);
  const detectorStateLabel =
    detectorStatus === "loading"
      ? "Loading detector..."
      : detectorStatus === "ready"
      ? "Detecting objects..."
      : "Detector failed to load";

  useEffect(() => {
    const alias = getObjectAlias(selectedAliasTarget, customAliases);
    setAliasDisplayName(alias.displayName);
    setAliasSpanishName(alias.spanishName);
    setAliasSystemRole(alias.systemRole);
  }, [selectedAliasTarget, customAliases]);

  const requestCameraAccess = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus("unsupported");
      setErrorMessage("Camera access is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus("active");
      setErrorMessage(null);
    } catch (error) {
      const domError = error instanceof DOMException ? error : null;
      if (domError?.name === "NotAllowedError") {
        setCameraStatus("denied");
        setErrorMessage("Camera access was denied. Allow permission to continue.");
      } else {
        setCameraStatus("error");
        setErrorMessage("Unable to access the camera. Check your device or browser settings.");
      }
    }
  };

  useEffect(() => {
    requestCameraAccess();

    return () => {
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (cameraStatus !== "active") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    setDragStart({ x, y });
    setDragRect({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragStart || cameraStatus !== "active") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const currentX = event.clientX - bounds.left;
    const currentY = event.clientY - bounds.top;
    const width = currentX - dragStart.x;
    const height = currentY - dragStart.y;
    setDragRect({
      x: width < 0 ? currentX : dragStart.x,
      y: height < 0 ? currentY : dragStart.y,
      width: Math.abs(width),
      height: Math.abs(height),
    });
  };

  const finalizeAnnotation = () => {
    if (!dragRect) {
      setDragStart(null);
      return;
    }
    if (dragRect.width > 10 && dragRect.height > 10) {
      setAnnotations((previous) => [
        ...previous,
        {
          id: `manual-${Date.now()}`,
          x: dragRect.x,
          y: dragRect.y,
          width: dragRect.width,
          height: dragRect.height,
        },
      ]);
    }
    setDragStart(null);
    setDragRect(null);
  };

  const handleSaveSnapshot = () => {
    const previousSnapshot = snapshots[0] ?? null;
    const snapshot = createSnapshot(displayedObjects, annotations);
    const diff = diffSceneSnapshots(previousSnapshot, snapshot);
    const nextEvents = createObserverEvents(snapshot, diff);
    addEvents(nextEvents);
    setLastDiff(diff);
    setMemoryMessage(`Saved ${snapshot.objects.length} objects and ${nextEvents.length} event${nextEvents.length === 1 ? "" : "s"}.`);
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importMemory(file);
      setLastDiff(null);
      setMemoryMessage(`Imported observer memory from ${file.name}`);
    } catch (error) {
      setMemoryMessage(error instanceof Error ? error.message : "Unable to import observer memory.");
    } finally {
      event.target.value = "";
    }
  };

  const handleClearMemory = () => {
    clearMemory();
    setLastDiff(null);
    setMemoryMessage("Observer memory cleared.");
  };

  const handleSaveAlias = () => {
    setCustomAlias(selectedAliasTarget, aliasDisplayName, aliasSpanishName, aliasSystemRole);
    setAliasMessage(`Alias saved for ${selectedAliasTarget}.`);
  };

  const handleRemoveAlias = (className = selectedAliasTarget) => {
    removeCustomAlias(className);
    setAliasMessage(`Custom alias removed for ${className}.`);
  };

  const handleClearAliases = () => {
    clearCustomAliases();
    setAliasMessage("All custom aliases cleared.");
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="brand-row">
          <div className="brand-mark">
            <Eye size={28} />
          </div>
          <div>
            <p className="eyebrow">BlackMamba Vision</p>
            <h1>Observe. Recognize. Remember. Persist.</h1>
          </div>
        </div>

        <div
          className="camera-frame"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={finalizeAnnotation}
          onMouseLeave={finalizeAnnotation}
        >
          <video ref={videoRef} className="camera-video" muted playsInline />
          {cameraStatus !== "active" && (
            <div className="camera-fallback">
              <Camera size={22} />
              <div>
                <p>Camera preview placeholder</p>
                <small>{errorMessage ?? "Waiting for camera permission..."}</small>
              </div>
            </div>
          )}
          <div className="camera-overlay">
            {cameraStatus === "active" && (
              <p className="mouse-hint">Click and drag to mark an object region.</p>
            )}
          </div>
          <div className="scan-grid" />
          <div className="camera-label">
            <Camera size={18} />
            {cameraStatus === "active" ? "Live camera" : "Camera preview"}
          </div>

          {predictions.map((prediction, index) => {
            const alias = getObjectAlias(prediction.className, customAliases);
            return (
              <div
                key={`${prediction.className}-${index}`}
                className="detection-box"
                style={{
                  left: `${prediction.bbox[0]}px`,
                  top: `${prediction.bbox[1]}px`,
                  width: `${prediction.bbox[2]}px`,
                  height: `${prediction.bbox[3]}px`,
                }}
              >
                <span>{alias.displayName} · {alias.spanishName} {Math.round(prediction.score * 100)}%</span>
              </div>
            );
          })}

          {annotations.map((annotation) => (
            <div
              key={annotation.id}
              className="annotation-box"
              style={{
                left: `${annotation.x}px`,
                top: `${annotation.y}px`,
                width: `${annotation.width}px`,
                height: `${annotation.height}px`,
              }}
            />
          ))}

          {dragRect && (
            <div
              className="annotation-box annotation-preview"
              style={{
                left: `${dragRect.x}px`,
                top: `${dragRect.y}px`,
                width: `${dragRect.width}px`,
                height: `${dragRect.height}px`,
              }}
            />
          )}

          <div className="camera-status">
            {cameraStatus === "active" && "Live camera active"}
            {cameraStatus === "initializing" && "Initializing camera..."}
            {cameraStatus === "denied" && <span><AlertTriangle size={16} /> Permission denied</span>}
            {cameraStatus === "unsupported" && <span><AlertTriangle size={16} /> Unsupported</span>}
            {cameraStatus === "error" && <span><AlertTriangle size={16} /> Camera error</span>}
            {cameraStatus === "active" && detectorStatus && <span>{detectorStateLabel}</span>}
          </div>

          {(cameraStatus === "denied" || cameraStatus === "error") && (
            <button className="camera-button" onClick={requestCameraAccess}>
              <RotateCcw size={16} /> Retry camera
            </button>
          )}

          <ScanLine className="scan-line" size={42} />
        </div>
      </section>

      <aside className="panel">
        <div className="panel-header">
          <Boxes size={22} />
          <div>
            <h2>Detected Objects</h2>
            <p>{displayedObjects.length} objects in current frame</p>
            {detectorError && <small className="error-label">{detectorError}</small>}
          </div>
        </div>

        <div className="object-list">
          {displayedObjects.map((object) => (
            <article className="object-card object-card-column" key={`${object.name}-${object.score}`}>
              <div className="object-title-row">
                <span>{object.displayName ?? object.name}</span>
                <strong>{Math.round(object.score * 100)}%</strong>
              </div>
              <small>{object.spanishName ?? object.name} · {object.systemRole ?? "observed object"}</small>
            </article>
          ))}
        </div>

        <div className="alias-card">
          <div className="memory-heading">
            <Pencil size={18} />
            <div>
              <h3>Custom Alias</h3>
              <p>{customAliasEntries.length} custom alias{customAliasEntries.length === 1 ? "" : "es"} stored</p>
            </div>
          </div>
          <div className="alias-form">
            <select value={selectedAliasTarget} onChange={(event) => setSelectedAliasTarget(event.target.value)}>
              {aliasTargets.map((target) => (
                <option key={target} value={target}>{target}</option>
              ))}
            </select>
            <input value={aliasDisplayName} onChange={(event) => setAliasDisplayName(event.target.value)} placeholder="Display name" />
            <input value={aliasSpanishName} onChange={(event) => setAliasSpanishName(event.target.value)} placeholder="Spanish name" />
            <input value={aliasSystemRole} onChange={(event) => setAliasSystemRole(event.target.value)} placeholder="System role" />
          </div>
          <div className="memory-actions">
            <button onClick={handleSaveAlias}><Save size={16} /> Save alias</button>
            <button onClick={() => handleRemoveAlias()}><X size={16} /> Remove</button>
            <button onClick={handleClearAliases} disabled={customAliasEntries.length === 0}><Trash2 size={16} /> Clear aliases</button>
          </div>
          {aliasMessage && <small className="memory-message">{aliasMessage}</small>}
          {customAliasEntries.length > 0 && (
            <div className="alias-list">
              {customAliasEntries.map(([className, alias]) => (
                <article className="alias-item" key={className}>
                  <div>
                    <span>{className}</span>
                    <strong>{alias.displayName ?? className} · {alias.spanishName ?? className}</strong>
                    <small>{alias.systemRole ?? "custom observed object"}</small>
                  </div>
                  <button onClick={() => handleRemoveAlias(className)} aria-label={`Remove alias for ${className}`}><X size={14} /></button>
                </article>
              ))}
            </div>
          )}
        </div>

        {annotations.length > 0 && (
          <div className="manual-panel">
            <h3>Manual marks</h3>
            <p>{annotations.length} region{annotations.length > 1 ? "s" : ""} marked with mouse.</p>
            <div className="manual-list">
              {annotations.map((annotation) => (
                <article className="annotation-item" key={annotation.id}>
                  <span>{annotation.id}</span>
                  <strong>{Math.round(annotation.width)}×{Math.round(annotation.height)}</strong>
                </article>
              ))}
            </div>
          </div>
        )}

        <div className="memory-card memory-card-column">
          <div className="memory-heading">
            <History size={20} />
            <div>
              <h3>Observer Memory</h3>
              <p>{snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"} · {events.length} event{events.length === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="memory-actions">
            <button onClick={handleSaveSnapshot}><Save size={16} /> Save scene</button>
            <button onClick={exportMemory} disabled={snapshots.length === 0 && events.length === 0}><Download size={16} /> Export</button>
            <button onClick={handleImportClick}><Upload size={16} /> Import</button>
            <button onClick={handleClearMemory} disabled={snapshots.length === 0 && events.length === 0}><Trash2 size={16} /> Clear</button>
            <input ref={importInputRef} type="file" accept="application/json" onChange={handleImportFile} hidden />
          </div>

          {memoryMessage && <small className="memory-message">{memoryMessage}</small>}

          <div className={`stats-card stats-${observerSummary.stabilityLabel}`}>
            <div className="memory-heading">
              <BarChart3 size={18} />
              <div>
                <h3>Observer Stats</h3>
                <p>Status: {observerSummary.stabilityLabel}</p>
              </div>
            </div>
            <div className="stats-grid">
              <div><span>Events</span><strong>{observerSummary.totalEvents}</strong></div>
              <div><span>Appeared</span><strong>{observerSummary.appearedCount}</strong></div>
              <div><span>Gone</span><strong>{observerSummary.disappearedCount}</strong></div>
              <div><span>Snapshots</span><strong>{observerSummary.snapshotCount}</strong></div>
            </div>
            {observerSummary.lastEventMessage && <small className="stats-last">Last: {observerSummary.lastEventMessage}</small>}
          </div>

          {lastDiff && (
            <div className="change-card">
              <div className="memory-heading">
                <Activity size={18} />
                <div>
                  <h3>Change Detection</h3>
                  <p>{lastDiff.previousCount} objects before → {lastDiff.currentCount} objects now</p>
                </div>
              </div>
              <div className="change-grid">
                <div>
                  <span>Appeared</span>
                  <strong>{lastDiff.appeared.length > 0 ? lastDiff.appeared.join(", ") : "none"}</strong>
                </div>
                <div>
                  <span>Disappeared</span>
                  <strong>{lastDiff.disappeared.length > 0 ? lastDiff.disappeared.join(", ") : "none"}</strong>
                </div>
                <div>
                  <span>Unchanged</span>
                  <strong>{lastDiff.unchanged.length > 0 ? lastDiff.unchanged.join(", ") : "none"}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="event-log-card">
            <div className="memory-heading">
              <ListTree size={18} />
              <div>
                <h3>Event Log</h3>
                <p>Latest observer events</p>
              </div>
            </div>
            <div className="event-list">
              {events.slice(0, 8).map((event) => (
                <article className={`event-item event-${event.type}`} key={event.id}>
                  <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  <strong>{event.message}</strong>
                </article>
              ))}
              {events.length === 0 && <small className="empty-state">No events yet. Save a scene to create the first observer event.</small>}
            </div>
          </div>

          <div className="snapshot-list">
            {snapshots.slice(0, 5).map((snapshot) => (
              <article className="snapshot-card" key={snapshot.id}>
                <span>{new Date(snapshot.timestamp).toLocaleString()}</span>
                <strong>{snapshot.objects.length} objects · {snapshot.annotations.length} marks</strong>
              </article>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
