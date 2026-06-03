# Transport Mesh Architecture

**One nervous system. Multiple nerves.**

Vision should not depend on a single communication path.

WiFi is useful, but it should not be the only nerve. A resilient observer system should communicate through multiple transport channels and choose the best available path depending on distance, latency, reliability, power, and environment.

---

## Core Principle

```txt
If one transport fails, the observer should continue.
```

The system should treat communication channels as interchangeable nerves:

```txt
WiFi       -> high bandwidth backbone
Bluetooth  -> short-range control nerve
Serial     -> wired reliability spine
Infrared   -> simple local signal / fallback pulse
USB        -> direct tether and power/data bridge
```

The goal is not to use every channel all the time.

The goal is to keep the node alive through redundancy.

---

## Neural Network Analogy

Vision can behave like a nervous system:

```txt
Sensors / clients
   ↓
Transport mesh
   ↓
Node router
   ↓
Observer memory
   ↓
Event log
   ↓
Dashboard / actions
```

Every signal enters the same memory/event system, regardless of transport.

The transport is not the identity.

The message is the identity.

---

## Transport Roles

### WiFi

Best for:

- browser dashboard
- camera streaming
- local network access
- high bandwidth detection metadata
- remote node access through VPN/tunnel

Weakness:

- can drop under router failure
- can be blocked by network isolation
- consumes more power than simple low-bandwidth links

Role:

```txt
Primary high-bandwidth channel
```

---

### Bluetooth

Best for:

- short-range device presence
- control messages
- pairing a phone/controller
- low-power status signals
- nearby hardware modules

Weakness:

- limited range
- lower bandwidth
- pairing complexity

Role:

```txt
Short-range control and presence nerve
```

---

### Serial / USB Serial

Best for:

- Arduino / ESP / microcontroller bridge
- reliable wired telemetry
- lab bench hardware
- debugging
- command channel when wireless is unstable

Weakness:

- requires cable
- usually one host/device path at a time

Role:

```txt
Wired reliability spine
```

---

### Infrared

Best for:

- simple local pulses
- binary triggers
- low-cost presence signaling
- appliance-style command signals
- fallback handshakes

Weakness:

- line of sight
- low data rate
- sunlight/interference sensitivity

Role:

```txt
Simple local reflex signal
```

---

## Message Envelope

All transports should eventually speak the same message envelope.

```ts
type VisionTransportMessage = {
  id: string;
  timestamp: string;
  nodeId: string;
  transport: "wifi" | "bluetooth" | "serial" | "infrared" | "usb" | "unknown";
  type: "heartbeat" | "detection" | "event" | "command" | "status";
  payload: unknown;
};
```

This makes the system transport-agnostic.

A `heartbeat` from Bluetooth and a `heartbeat` from WiFi are different routes but the same kind of event.

---

## Priority Strategy

Suggested priority order:

```txt
1. USB / Serial  -> most reliable when physically connected
2. WiFi          -> best bandwidth
3. Bluetooth     -> local control fallback
4. Infrared      -> simple local pulse fallback
```

But the router should decide based on health:

```txt
available?
latency okay?
last heartbeat recent?
message accepted?
```

---

## Health Model

Each transport should have a health state.

```ts
type TransportHealth = {
  transport: string;
  available: boolean;
  lastSeenAt: string | null;
  latencyMs: number | null;
  failures: number;
  status: "online" | "degraded" | "offline";
};
```

When a channel becomes degraded, Vision should continue over another channel.

---

## Example Flow

```txt
Phone camera sends detections over WiFi
        ↓
WiFi drops
        ↓
Bluetooth heartbeat still says device is nearby
        ↓
Serial bench sensor keeps sending object counts
        ↓
Observer memory continues
        ↓
Event log records WiFi degraded, serial online
```

Result:

```txt
Presence survives network instability.
```

---

## Hardware Direction

Future hardware node:

```txt
ESP32 / Arduino bridge
├── WiFi
├── Bluetooth/BLE
├── Serial USB
├── IR receiver/emitter
├── status LED
└── heartbeat loop
```

Possible first messages:

```json
{ "type": "heartbeat", "nodeId": "bench-node-01", "transport": "serial" }
{ "type": "status", "nodeId": "bench-node-01", "payload": { "battery": 87 } }
{ "type": "event", "nodeId": "bench-node-01", "payload": { "button": "scan" } }
```

---

## MVP Path

### Phase 1 — Transport Types

- define shared TypeScript transport types
- define message envelope
- define health state
- add mock transport health panel

### Phase 2 — Browser Transport Awareness

- treat browser/WiFi as one transport
- add local heartbeat
- show node status in dashboard

### Phase 3 — Serial Bridge

- add Web Serial prototype
- receive JSON lines from Arduino/ESP
- convert serial messages into Observer Events

### Phase 4 — Bluetooth Bridge

- add Web Bluetooth/BLE investigation
- use nearby device heartbeat
- log connection/disconnection events

### Phase 5 — Infrared Reflex Layer

- Arduino/ESP IR receiver
- map IR pulses to simple commands
- send command events into Observer Memory

---

## Security Rules

- do not trust transport just because it connects
- validate message shape
- reject unknown command types by default
- separate observation from execution
- log all transport commands
- require explicit pairing/approval for external nodes
- keep remote access private by default

---

## BlackMamba Interpretation

This is not just networking.

It is nervous-system design.

```txt
WiFi is sight.
Bluetooth is touch.
Serial is spine.
Infrared is reflex.
Memory is identity.
```

The observer should not panic when one nerve fails.

It should route around damage.
