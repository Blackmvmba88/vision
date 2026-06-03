import { Camera, Eye, Boxes, History, ScanLine } from "lucide-react";

const objects = [
  { name: "keyboard", confidence: 0.98 },
  { name: "mouse", confidence: 0.96 },
  { name: "monitor", confidence: 0.94 },
  { name: "can", confidence: 0.89 },
];

export default function App() {
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
          <div className="scan-grid" />
          <div className="camera-label">
            <Camera size={18} />
            Camera preview placeholder
          </div>
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
