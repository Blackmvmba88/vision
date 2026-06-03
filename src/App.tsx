import { useEffect, useRef, useState } from "react";
import { Camera, Eye, Boxes, History, ScanLine, AlertTriangle, RotateCcw } from "lucide-react";

const objects = [
  { name: "keyboard", confidence: 0.98 },
  { name: "mouse", confidence: 0.96 },
  { name: "monitor", confidence: 0.94 },
  { name: "can", confidence: 0.89 },
];

type CameraStatus = "initializing" | "active" | "denied" | "unsupported" | "error";

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("initializing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        <div className="camera-frame">
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
          <div className="scan-grid" />
          <div className="camera-label">
            <Camera size={18} />
            {cameraStatus === "active" ? "Live camera" : "Camera preview"}
          </div>

          <div className="camera-status">
            {cameraStatus === "active" && "Live camera active"}
            {cameraStatus === "initializing" && "Initializing camera..."}
            {cameraStatus === "denied" && <span><AlertTriangle size={16} /> Permission denied</span>}
            {cameraStatus === "unsupported" && <span><AlertTriangle size={16} /> Unsupported</span>}
            {cameraStatus === "error" && <span><AlertTriangle size={16} /> Camera error</span>}
          </div>

          {(cameraStatus === "denied" || cameraStatus === "error") && (
            <button className="camera-button" onClick={requestCameraAccess}>
              <RotateCcw size={16} /> Retry camera
            </button>
          )}

          <div className="box box-keyboard">keyboard 98%</div>
          <div className="box box-mouse">mouse 96%</div>
          <div className="box box-monitor">monitor 94%</div>
          <ScanLine className="scan-line" size={42} />
        </div>
      </section>

      <aside className="panel">
        <div className="panel-header">
          <Boxes size={22} />
          <div>
            <h2>Detected Objects</h2>
            <p>{objects.length} objects in current frame</p>
          </div>
        </div>

        <div className="object-list">
          {objects.map((object) => (
            <article className="object-card" key={object.name}>
              <span>{object.name}</span>
              <strong>{Math.round(object.confidence * 100)}%</strong>
            </article>
          ))}
        </div>

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
