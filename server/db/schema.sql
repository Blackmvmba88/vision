-- Vision Persistent Presence Node
-- Initial SQLite-compatible memory schema.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS snapshots (
  id TEXT PRIMARY KEY,
  zone TEXT NOT NULL DEFAULT 'default',
  session TEXT NOT NULL DEFAULT 'local-session',
  source TEXT NOT NULL DEFAULT 'browser-camera',
  objects_json TEXT NOT NULL DEFAULT '[]',
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT 'unknown',
  zone TEXT NOT NULL DEFAULT 'default',
  session TEXT NOT NULL DEFAULT 'local-session',
  confidence REAL,
  count INTEGER,
  snapshot_id TEXT,
  meta_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (snapshot_id) REFERENCES snapshots(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_snapshots_zone_created_at
  ON snapshots(zone, created_at);

CREATE INDEX IF NOT EXISTS idx_events_type_created_at
  ON events(type, created_at);

CREATE INDEX IF NOT EXISTS idx_events_label_created_at
  ON events(label, created_at);
