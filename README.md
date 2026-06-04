# Vision

**Observe. Recognize. Remember. Persist.**

Vision is a mobile-first visual intelligence prototype by **BlackMamba**. Its first mission is simple: use a phone or webcam to recognize everyday objects such as keyboards, mice, screens, cans, bottles, pens, erasers, tools, and electronics.

The long-term mission is bigger: build an observer engine that can detect, count, remember, compare real-world objects over time, and remain accessible even when the original phone or device is gone.

---

## Core Idea

Most AI vision projects try to understand everything immediately.

Vision starts smaller and stronger:

1. **Observe** the scene through a camera.
2. **Recognize** known objects.
3. **Count** what is present.
4. **Remember** previous states.
5. **Detect change** when something appears, disappears, or moves.
6. **Persist** beyond any single device.

This is the foundation for a practical visual assistant, inventory scanner, maker bench observer, and eventually a Cognitive Forge vision module.

---

## Persistent Presence

Vision should not be trapped inside one fragile phone.

The phone is only a window.

The persistent system lives in code, memory, APIs, backups, and nodes that can be accessed from any compatible device.

```txt
Device = replaceable
Presence = persistent
Memory = externalized
Vision = always recoverable
```

Read the full architecture here:

- [Persistent Presence Architecture](docs/PERSISTENT_PRESENCE.md)
- [Persistent Presence Node Runbook](docs/PRESENCE_NODE.md)
- [Vision Demo Script](docs/DEMO_SCRIPT.md)

---

## Current Status

Vision is currently in **Prototype Alpha**.

Implemented:

- React + Vite + TypeScript app shell
- Dark cinematic UI
- Real camera preview with permission handling
- TensorFlow.js / COCO-SSD object detector
- Bounding boxes on live video
- Object confidence panel
- Custom alias editor with import/export
- Observer Memory snapshots and event log
- Change detection for appeared/disappeared objects
- Inventory Mode with grouped counts, zone/session naming, JSON export, and CSV export
- Persistent Presence Node API scaffold
- `/health`, `/events`, and `/snapshots` endpoints
- Initial SQLite-compatible event log schema

Next:

- Mobile PWA install flow
- Dataset capture mode
- Maker Bench presets
- SQLite persistence implementation
- Offline restore and backup mode

---

## Epic Modules

### 1. Vision Lite

Basic object recognition from a phone or webcam.

Target objects:

- keyboard
- mouse
- monitor
- phone
- bottle
- can
- pen
- eraser
- book
- cup

### 2. Observer Mode

The system watches a scene and builds a memory of what exists.

Example:

```txt
09:00
keyboard, mouse, can

09:05
keyboard, mouse

Change detected:
- can removed
```

### 3. Maker Bench Mode

A mode for electronics and hardware workbenches.

Target objects:

- Arduino
- ESP32
- breadboard
- OLED display
- sensor modules
- wires
- resistors
- capacitors
- screws

Future behavior:

```txt
Detected:
Arduino Nano
OLED SSD1306
MAX4466 microphone

Suggested projects:
- Audio visualizer
- Smart meter
- Voice reactive LED system
```

### 4. Inventory Memory

Count objects, group repeated detections, label the current zone/session, and export a usable inventory payload.

Current exports:

```txt
JSON -> full session payload for memory/API usage
CSV  -> spreadsheet-friendly object count report
```

Use cases:

- Desk inventory
- Tool tracking
- Classroom materials
- Workshop parts
- Small business stock

### 5. Cognitive Forge Integration

Vision becomes the visual input layer for a larger intelligence system.

```txt
Vision -> sees
Forge -> understands
Xarvis -> remembers
```

### 6. Persistent Presence Node

Vision becomes available from any compatible device while its state lives outside the client.

```txt
Mac Mini / VPS / Linux Node
├── API
├── memory
├── model runtime
├── event log
├── backups
└── dashboard

Phone / browser / tablet
└── temporary control surface
```

Current API scaffold:

```txt
GET  /health
GET  /events
POST /events
GET  /snapshots
POST /snapshots
```

Run it:

```bash
cd server
npm install
npm run dev
```

---

## Tech Stack

- React
- Vite
- TypeScript
- TensorFlow.js
- COCO-SSD
- Lucide React
- Node.js HTTP API scaffold
- SQLite schema draft
- YOLO / custom models planned
- PWA / mobile build planned
- SQLite / PostgreSQL memory planned

---

## Run Locally

```bash
git clone https://github.com/Blackmvmba88/vision.git
cd vision
npm install
npm run dev
```

Open the local Vite URL in your browser.

For local-network testing from another device:

```bash
npm run dev -- --host 0.0.0.0
```

Then open the Mac or server LAN address from the phone browser.

For the optional local presence node:

```bash
cd server
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:8787/health
```

---

## Development Roadmap

### Alpha 0.1

- [x] Create React/Vite project structure
- [x] Add prototype UI
- [x] Add real camera preview
- [x] Add camera permission handling
- [x] Add responsive mobile layout

### Alpha 0.2

- [x] Add TensorFlow.js
- [x] Add COCO-SSD model
- [x] Run live object detection
- [x] Draw bounding boxes on video
- [x] Show confidence scores

### Alpha 0.3

- [x] Count detected objects
- [x] Group repeated objects
- [x] Store scene snapshots locally
- [x] Compare current scene vs previous scene
- [x] Report added/removed objects

### Alpha 0.4

- [x] Add custom object labels
- [ ] Add dataset capture mode
- [ ] Export training images
- [ ] Prepare YOLO dataset structure

### Alpha 0.5 — Persistent Presence

- [x] Add persistent memory model
- [x] Add local JSON export/import
- [x] Add API backend scaffold
- [x] Add `/health` endpoint
- [x] Add event log schema
- [x] Add local node startup script
- [ ] Add SQLite-backed persistence
- [ ] Add backup notes

### Beta 1.0

- [ ] Offline-capable PWA
- [ ] Mobile camera mode
- [x] Inventory history foundation
- [ ] Maker Bench Mode
- [x] Export reports
- [ ] Local persistent node mode

---

## Philosophy

Vision follows an **Observer First** architecture.

Do not force intelligence before perception.

First, the system must see.
Then it must recognize.
Then it must remember.
Only after that should it reason.

And once it remembers, it should not die with the phone.

---

## License

MIT License planned.
