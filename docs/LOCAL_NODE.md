# Local Persistent Node Runbook

This runbook explains how to run **BlackMamba Vision** as a local persistent node.

The goal is simple:

```txt
Mac / Linux host = persistent node
Phone / tablet / laptop = temporary window
```

---

## 1. Install dependencies

```bash
npm install
```

---

## 2. Start the local node

```bash
npm run dev
```

The project is configured to listen on all local interfaces using:

```bash
vite --host 0.0.0.0
```

This allows other devices on the same WiFi or LAN to open the Vision dashboard.

---

## 3. Show presence URLs

In another terminal:

```bash
npm run presence:url
```

Example output:

```txt
BlackMamba Vision — Persistent Presence URLs

Local:   http://localhost:5173
LAN:     http://192.168.1.20:5173    (en0)
```

Open the LAN URL from the phone browser.

The phone becomes only a camera and control surface.

---

## 4. Camera permissions

Modern browsers usually require one of these for camera access:

- `localhost`
- HTTPS
- explicit browser permission

On a phone opening a LAN URL, camera behavior may vary by browser.

If camera access fails:

- try Chrome
- try Safari on iOS
- check browser site permissions
- try a secure tunnel later
- test camera directly on the host machine first

---

## 5. Persistent node mindset

Do not store critical system identity only on the phone.

The phone should be disposable.

Recommended local node ownership:

```txt
Mac Mini / Linux Box
├── repo clone
├── npm dependencies
├── local database later
├── logs later
├── backups later
└── optional tunnel later
```

Client devices:

```txt
Phone
Tablet
Laptop
Browser
```

All clients are replaceable.

---

## 6. Next upgrades

Planned upgrades for this runbook:

- `npm run node:start`
- `npm run node:health`
- local API server
- SQLite scene memory
- launchd service for macOS
- systemd service for Linux
- Tailscale or Cloudflare Tunnel guide

---

## BlackMamba Rule

```txt
If a device breaks, Vision should not lose its memory.
If a phone dies, Vision should not lose its presence.
If a client disappears, the node remains.
```
