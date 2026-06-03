import { useMemo, useState } from "react";
import { ClipboardList, Download, FileJson, MapPin } from "lucide-react";
import "./inventoryMode.css";

type InventoryObject = {
  name: string;
  score: number;
  displayName?: string;
  spanishName?: string;
  systemRole?: string;
};

type InventoryItem = {
  key: string;
  name: string;
  displayName: string;
  spanishName: string;
  systemRole: string;
  count: number;
  bestScore: number;
  averageScore: number;
};

type InventoryPayload = {
  type: "blackmamba-vision-inventory-session";
  version: 1;
  zone: string;
  generatedAt: string;
  totalDetections: number;
  uniqueObjects: number;
  objects: InventoryItem[];
  rawObjects: InventoryObject[];
};

type InventoryModeProps = {
  objects: InventoryObject[];
};

const buildInventory = (objects: InventoryObject[]) => {
  const grouped = objects.reduce<Map<string, InventoryItem & { totalScore: number }>>((inventory, object) => {
    const key = object.name.toLowerCase();
    const existing = inventory.get(key);

    if (existing) {
      existing.count += 1;
      existing.bestScore = Math.max(existing.bestScore, object.score);
      existing.totalScore += object.score;
      existing.averageScore = existing.totalScore / existing.count;
      return inventory;
    }

    inventory.set(key, {
      key,
      name: object.name,
      displayName: object.displayName ?? object.name,
      spanishName: object.spanishName ?? object.name,
      systemRole: object.systemRole ?? "observed object",
      count: 1,
      bestScore: object.score,
      averageScore: object.score,
      totalScore: object.score,
    });

    return inventory;
  }, new Map());

  return Array.from(grouped.values())
    .map(({ totalScore: _totalScore, ...item }) => item)
    .sort((a, b) => b.count - a.count || b.bestScore - a.bestScore || a.displayName.localeCompare(b.displayName));
};

const downloadTextFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const toCsv = (items: InventoryItem[]) => {
  const headers = ["name", "displayName", "spanishName", "systemRole", "count", "bestConfidence", "averageConfidence"];
  const rows = items.map((item) => [
    item.name,
    item.displayName,
    item.spanishName,
    item.systemRole,
    String(item.count),
    String(Math.round(item.bestScore * 100)),
    String(Math.round(item.averageScore * 100)),
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
};

const createPayload = (zone: string, objects: InventoryObject[], inventoryItems: InventoryItem[]): InventoryPayload => ({
  type: "blackmamba-vision-inventory-session",
  version: 1,
  zone,
  generatedAt: new Date().toISOString(),
  totalDetections: objects.length,
  uniqueObjects: inventoryItems.length,
  objects: inventoryItems,
  rawObjects: objects,
});

export function InventoryMode({ objects }: InventoryModeProps) {
  const [zone, setZone] = useState("Maker bench");
  const [message, setMessage] = useState<string | null>(null);
  const inventoryItems = useMemo(() => buildInventory(objects), [objects]);

  const exportJson = () => {
    const payload = createPayload(zone, objects, inventoryItems);
    downloadTextFile(JSON.stringify(payload, null, 2), `vision-inventory-${Date.now()}.json`, "application/json");
    setMessage(`Exported ${payload.uniqueObjects} unique object${payload.uniqueObjects === 1 ? "" : "s"} from ${zone}.`);
  };

  const exportCsv = () => {
    downloadTextFile(toCsv(inventoryItems), `vision-inventory-${Date.now()}.csv`, "text/csv;charset=utf-8");
    setMessage(`CSV inventory exported from ${zone}.`);
  };

  return (
    <section className="inventory-card">
      <div className="inventory-heading">
        <ClipboardList size={18} />
        <div>
          <h3>Inventory Mode</h3>
          <p>{objects.length} detections · {inventoryItems.length} unique object{inventoryItems.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <label className="zone-field">
        <span><MapPin size={14} /> Zone / session</span>
        <input value={zone} onChange={(event) => setZone(event.target.value)} placeholder="Desk, maker bench, tool box..." />
      </label>

      <div className="inventory-grid">
        {inventoryItems.map((item) => (
          <article className="inventory-item" key={item.key}>
            <div>
              <strong>{item.displayName}</strong>
              <small>{item.spanishName} · {item.systemRole}</small>
            </div>
            <div className="inventory-count">
              <span>x{item.count}</span>
              <small>{Math.round(item.bestScore * 100)}%</small>
            </div>
          </article>
        ))}
        {inventoryItems.length === 0 && <small className="empty-state">No objects in inventory yet.</small>}
      </div>

      <div className="inventory-actions">
        <button onClick={exportJson} disabled={inventoryItems.length === 0}><FileJson size={16} /> Export JSON</button>
        <button onClick={exportCsv} disabled={inventoryItems.length === 0}><Download size={16} /> Export CSV</button>
      </div>

      {message && <small className="inventory-message">{message}</small>}
    </section>
  );
}
