import { useEffect, useRef, useState } from "react";
import { Camera, Eye, Boxes, History, ScanLine, AlertTriangle, RotateCcw } from "lucide-react";
import { useObjectDetector } from "./features/detector/useObjectDetector";

const objects = [
  { name: "keyboard", score: 0.98 },
  { name: "mouse", score: 0.96 },
  { name: "monitor", score: 0.94 },
  { name: "can", score: 0.89 },
];

type CameraStatus = "initializing" | "active" | "denied" | "unsupported" | "error";

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("initializing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<
    Array<{ id: string; x: number; y: number; width: number; height: number }>
  >([]);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragRect, setDragRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const { status: detectorStatus, predictions, error: detectorError } = useObjectDetector(videoRef);

  const displayedObjects =
    predictions.length > 0
      ? predictions.map((prediction) => ({ name: prediction.className, score: prediction.score }))
      : objects;
  const detectorStateLabel =
    detectorStatus === "loading"
      ? "Loading detector..."
      : detectorStatus === "ready"
      ? "Detecting objects..."
      : "Detector failed to load";

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

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="brand-row">
          <div className="brand-mark">
            <Eye size={28} />
          </div>
          <div>
            <p className="eyebrow">BlackMamba Vision</p>
            <h1>Observe. Recognize. Remember.</h1>
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

          {predictions.map((prediction, index) => (
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
              <span>{prediction.className} {Math.round(prediction.score * 100)}%</span>
            </div>
          ))}

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
            <article className="object-card" key={`${object.name}-${object.score}`}>
              <span>{object.name}</span>
              <strong>{Math.round(object.score * 100)}%</strong>
            </article>
          ))}
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

        <div className="memory-card">
          <History size={20} />
          <div>
            <h3>Observer Memory</h3>
            <p>Inventory tracking comes next: detect changes, count objects, remember scenes.</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
