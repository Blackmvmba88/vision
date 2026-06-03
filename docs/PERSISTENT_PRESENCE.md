# Persistent Presence Architecture

**Device dies. Presence continues.**

This document defines the long-term architecture for turning **Vision** into a persistent digital presence that does not depend on a single phone, laptop, or damaged device.

The phone is not the system.

The phone is only a window.

---

## Core Principle

A device should be replaceable.

The system should not be.

```txt
Old model:

Phone
└── Camera
└── Files
└── Identity
└── Memory
└── Access

If phone dies:
❌ system dies
```

```txt
Persistent model:

Cloud / Server / Mac Mini / VPS
├── Identity
├── Memory
├── API
├── Models
├── Logs
├── Backups
└── Automations

Phone / Laptop / Tablet / Browser
└── Client window only

If device dies:
✅ login from another device
✅ continue operating
```

---

## Mission

Build Vision as a persistent observer engine that can be accessed from any device while keeping its memory, state, code, and intelligence outside the fragile client hardware.

Vision should eventually run from:

- Mac Mini
- Linux machine
- VPS
- Raspberry Pi
- browser
- phone camera
- external camera
- local network node
- remote dashboard

The user should be able to destroy or replace the phone without destroying the system.

---

## Architecture Layers

### 1. Client Layer

The client is any device used to interact with Vision.

Examples:

- phone browser
- desktop browser
- tablet
- laptop
- camera-enabled PWA

Responsibilities:

- show camera preview
- request permissions
- display detections
- send frames or metadata
- receive system state

The client should remain thin and replaceable.

---

### 2. Vision Runtime Layer

The runtime executes detection and local logic.

Possible modes:

```txt
Browser Mode
camera -> TensorFlow.js -> detections -> local state
```

```txt
Server Mode
camera/client -> API -> model runtime -> detections -> database
```

```txt
Hybrid Mode
browser detects common objects
server stores memory and coordinates long-term state
```

Responsibilities:

- object detection
- confidence filtering
- object counting
- scene snapshot generation
- event creation
- change detection

---

### 3. Memory Layer

Memory must live outside the phone.

Initial memory options:

- browser localStorage for prototype only
- SQLite for local persistent node
- PostgreSQL for server deployment
- object storage for images and snapshots
- GitHub for code and documentation

Memory entities:

```txt
SceneSnapshot
├── timestamp
├── camera_id
├── detected_objects[]
├── confidence_scores[]
├── image_reference
└── notes
```

```txt
VisionEvent
├── timestamp
├── type
├── object_label
├── previous_state
├── current_state
└── severity
```

Example events:

- object appeared
- object disappeared
- object moved
- inventory changed
- camera offline
- model confidence dropped

---

### 4. Identity Layer

The system needs a stable identity that survives devices.

Possible identifiers:

- GitHub account
- domain name
- API token
- local user account
- encrypted device key

Goal:

```txt
Iyari logs in
↓
Vision loads current system memory
↓
Any device becomes a temporary control surface
```

---

### 5. Presence Layer

Presence means the system can remain available even when the phone is gone.

Minimum version:

```txt
Mac Mini
├── runs Vision dashboard
├── stores local database
├── syncs code to GitHub
└── serves UI on local network
```

Stronger version:

```txt
Mac Mini + VPS
├── local detector node
├── remote API
├── cloud database
├── automatic backups
└── public/private dashboard
```

Enterprise version:

```txt
Multi-node Observer Network
├── workshop camera
├── mobile camera
├── inventory station
├── robot sorting station
├── model server
├── event log
└── command dashboard
```

---

## Deployment Path

### Phase 0 — Current Prototype

- React + Vite UI
- mock detections
- object confidence panel
- observer memory placeholder

### Phase 1 — Local Device Independence

Goal: make the app usable from any browser on the local network.

Tasks:

- run Vite locally
- access from phone through LAN
- keep camera as input only
- keep code and logic on Mac
- document setup steps

Example:

```bash
npm run dev -- --host 0.0.0.0
```

Then open from the phone:

```txt
http://MAC_LOCAL_IP:5173
```

### Phase 2 — Persistent Local Memory

Goal: stop losing state when a browser refreshes.

Tasks:

- add local scene memory
- add snapshot history
- export/import JSON
- prepare SQLite schema

### Phase 3 — API Backend

Goal: separate interface from intelligence.

Suggested backend:

```txt
server/
├── api/
├── database/
├── models/
├── events/
└── storage/
```

Endpoints:

```txt
GET  /health
POST /detections
GET  /memory/scenes
GET  /events
POST /snapshots
```

### Phase 4 — Always-On Node

Goal: make Mac Mini or Linux machine the persistent host.

Tasks:

- create start script
- create health check
- add auto-restart
- add logs
- add backup routine

Possible runtime tools:

- pm2
- systemd
- Docker
- launchd on macOS

### Phase 5 — Remote Presence

Goal: access Vision even outside the local network.

Options:

- Tailscale
- Cloudflare Tunnel
- VPS reverse proxy
- private VPN

Security rules:

- never expose camera feeds publicly without authentication
- use HTTPS for remote access
- keep API tokens out of git
- restrict dashboards by identity

### Phase 6 — Multi-Device Observer Mesh

Goal: multiple cameras and devices feed the same memory.

```txt
Phone camera
USB webcam
Raspberry Pi camera
Laptop camera
Workshop camera
        ↓
Unified Event Log
        ↓
Observer Memory
        ↓
Dashboard
```

---

## Security Model

Persistent does not mean careless.

Minimum rules:

- no secrets committed to GitHub
- `.env` for tokens and private URLs
- local-only by default
- remote access only through trusted tunnel or VPN
- explicit camera permission
- visible recording/detection status
- delete/export memory controls

Recommended `.env` keys:

```txt
VISION_NODE_NAME=blackmamba-mac-mini
VISION_API_URL=http://localhost:8787
VISION_STORAGE_PATH=./data
VISION_AUTH_MODE=local
```

---

## Backups

The system should survive hardware failure.

Backup targets:

- GitHub for code
- external SSD for local data
- encrypted cloud backup for database exports
- periodic JSON scene exports

Backup rhythm:

```txt
Every commit:
✅ code protected

Every day:
✅ database export

Every week:
✅ full archive
```

---

## Definition of Done

Vision becomes a real persistent presence when:

- the phone can die and the system continues
- the Mac or server keeps the memory
- another device can reconnect and resume
- detections become events
- events become memory
- memory becomes usable context

Final mantra:

```txt
Device = replaceable
Presence = persistent
Memory = externalized
Vision = always recoverable
```

---

## BlackMamba Interpretation

This is not about saving a broken phone.

This is about making sure the system is not trapped inside a broken body.

The camera can change.
The screen can change.
The device can disappear.

But the observer remains.
