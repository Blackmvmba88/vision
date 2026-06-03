# Vision

**Observe. Recognize. Remember.**

Vision is a mobile-first visual intelligence prototype by **BlackMamba**. Its first mission is simple: use a phone or webcam to recognize everyday objects such as keyboards, mice, screens, cans, bottles, pens, erasers, tools, and electronics.

The long-term mission is bigger: build an observer engine that can detect, count, remember, and compare real-world objects over time.

---

## Core Idea

Most AI vision projects try to understand everything immediately.

Vision starts smaller and stronger:

1. **Observe** the scene through a camera.
2. **Recognize** known objects.
3. **Count** what is present.
4. **Remember** previous states.
5. **Detect change** when something appears, disappears, or moves.

This is the foundation for a practical visual assistant, inventory scanner, maker bench observer, and eventually a Cognitive Forge vision module.

---

## Current Status

Vision is currently in **Prototype Alpha**.

Implemented:

- React + Vite + TypeScript app shell
- Dark cinematic UI
- Mock camera frame
- Mock object detections
- Object confidence panel
- Observer Memory placeholder

Next:

- Real camera preview
- TensorFlow.js / COCO-SSD detector
- Bounding boxes on live video
- Object counter
- Local scene memory

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

Count objects and compare changes over time.

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

---

## Tech Stack

- React
- Vite
- TypeScript
- TensorFlow.js planned
- COCO-SSD planned
- YOLO / custom models planned
- PWA / mobile build planned

---

## Run Locally

```bash
git clone https://github.com/Blackmvmba88/vision.git
cd vision
npm install
npm run dev
```

Open the local Vite URL in your browser.

---

## Development Roadmap

### Alpha 0.1

- [x] Create React/Vite project structure
- [x] Add prototype UI
- [ ] Add real camera preview
- [ ] Add camera permission handling
- [ ] Add responsive mobile layout

### Alpha 0.2

- [ ] Add TensorFlow.js
- [ ] Add COCO-SSD model
- [ ] Run live object detection
- [ ] Draw bounding boxes on video
- [ ] Show confidence scores

### Alpha 0.3

- [ ] Count detected objects
- [ ] Group repeated objects
- [ ] Store scene snapshots locally
- [ ] Compare current scene vs previous scene
- [ ] Report added/removed objects

### Alpha 0.4

- [ ] Add custom object labels
- [ ] Add dataset capture mode
- [ ] Export training images
- [ ] Prepare YOLO dataset structure

### Beta 1.0

- [ ] Offline-capable PWA
- [ ] Mobile camera mode
- [ ] Inventory history
- [ ] Maker Bench Mode
- [ ] Export reports

---

## Philosophy

Vision follows an **Observer First** architecture.

Do not force intelligence before perception.

First, the system must see.
Then it must recognize.
Then it must remember.
Only after that should it reason.

---

## License

MIT License planned.
