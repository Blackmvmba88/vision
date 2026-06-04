# Vision Persistent Presence Node

The Persistent Presence Node is the local API layer for Vision memory.

The browser app can be temporary. The node should persist scene snapshots, object events, inventory changes, and future model/runtime state.

## Current Scope

This first scaffold is intentionally small:

- `GET /health`
- `GET /snapshots`
- `POST /snapshots`
- `GET /events`
- `POST /events`
- SQLite-compatible schema draft in `server/db/schema.sql`
- in-memory runtime for fast local prototyping

## Run

From the repository root:

```bash
cd server
npm install
npm run dev
```

Default URL:

```txt
http://localhost:8787
```

Custom port:

```bash
PORT=8790 npm run dev
```

Custom node name:

```bash
VISION_NODE_NAME=mac-mini-bench PORT=8787 npm run dev
```

## Health Check

```bash
curl http://localhost:8787/health
```

Expected response:

```json
{
  "ok": true,
  "service": "vision-persistent-presence-node",
  "node": "vision-local-node",
  "uptimeSeconds": 1,
  "timestamp": "2026-06-03T00:00:00.000Z"
}
```

## Create an Event

```bash
curl -X POST http://localhost:8787/events \
  -H 'content-type: application/json' \
  -d '{
    "type": "object_seen",
    "label": "bottle",
    "zone": "desk",
    "confidence": 0.91
  }'
```

## Create a Snapshot

```bash
curl -X POST http://localhost:8787/snapshots \
  -H 'content-type: application/json' \
  -d '{
    "zone": "desk",
    "session": "alpha-demo",
    "objects": [
      { "label": "keyboard", "confidence": 0.88 },
      { "label": "mouse", "confidence": 0.82 },
      { "label": "bottle", "confidence": 0.91 }
    ]
  }'
```

## Read Memory

```bash
curl http://localhost:8787/events
curl http://localhost:8787/snapshots
```

## Event Types

Recommended event names:

```txt
object_seen
object_lost
object_count_changed
snapshot_created
inventory_exported
alias_updated
zone_started
session_started
```

## Next Engineering Steps

1. Replace in-memory arrays with SQLite persistence.
2. Add `server/src/storage/sqlite.mjs`.
3. Add validation for snapshot/event payloads.
4. Connect frontend exports to `POST /snapshots`.
5. Add PWA offline queue for failed sync attempts.
6. Add `/inventory` derived summary endpoint.
7. Add backup/export command.

## Architecture Rule

The phone is a control surface.

The node is the memory.

The model can change.

The event log stays.
