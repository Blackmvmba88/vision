# Vision Demo Script

A short demo flow for recording, pitching, or testing Vision Alpha.

## Goal

Show that Vision can:

1. Open on a phone or browser.
2. See through a real camera.
3. Detect everyday objects.
4. Count what exists.
5. Remember a scene.
6. Notice change.
7. Export or sync memory to a persistent node.

## Setup

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Optional API node:

```bash
cd server
npm install
npm run dev
```

Open the Vite URL on desktop or phone.

## Scene

Use a simple desk setup:

- keyboard
- mouse
- phone
- bottle or can
- notebook
- pen

## Demo Flow

### 1. Camera Activation

Open Vision and allow camera access.

Narration:

```txt
Vision starts as an observer. First it sees. Then it recognizes. Then it remembers.
```

### 2. Object Detection

Point the camera at the desk.

Expected visible behavior:

- bounding boxes
- object names
- confidence values
- grouped object list

Narration:

```txt
The system detects everyday objects in real time from a normal phone or webcam.
```

### 3. Inventory Memory

Save/export the current scene.

Narration:

```txt
A scene becomes a memory snapshot: object, count, zone, session, and time.
```

### 4. Change Detection

Remove the bottle or can from the scene.

Expected behavior:

```txt
Removed:
- bottle
```

Narration:

```txt
Now Vision is not just seeing. It compares state over time.
```

### 5. Presence Node Check

If the API node is running:

```bash
curl http://localhost:8787/health
```

Narration:

```txt
The phone is replaceable. The memory can live in a local node, Mac Mini, server, or future cloud runtime.
```

### 6. Snapshot Sync Prototype

```bash
curl -X POST http://localhost:8787/snapshots \
  -H 'content-type: application/json' \
  -d '{
    "zone": "desk",
    "session": "demo",
    "objects": [
      { "label": "keyboard", "confidence": 0.88 },
      { "label": "mouse", "confidence": 0.82 },
      { "label": "bottle", "confidence": 0.91 }
    ]
  }'
```

Then:

```bash
curl http://localhost:8787/snapshots
```

## Closing Line

```txt
Vision is an Observer First engine: see, recognize, count, remember, persist.
```

## Next Upgrade for the Demo

Dataset Capture Mode:

```txt
Detect object
↓
Save image crop
↓
Save label JSON
↓
Build custom training dataset
↓
Train better model for maker bench objects
```
