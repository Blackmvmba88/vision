import http from "node:http";
import { randomUUID } from "node:crypto";
import { createInventoryPayload } from "./domain/inventory.mjs";
import { createMemoryStorage } from "./storage/memory.mjs";

const PORT = Number.parseInt(process.env.PORT ?? "8787", 10);
const NODE_NAME = process.env.VISION_NODE_NAME ?? "vision-local-node";

// Security: bind address defaults to loopback; explicit opt-in for LAN/public
const BIND_ADDR = process.env.VISION_BIND_ADDRESS ?? "127.0.0.1";

// Security: CORS origin defaults to frontend dev server; explicit opt-in for "*"
const CORS_ORIGIN = process.env.VISION_CORS_ORIGIN ?? "http://localhost:5173";

// Security: optional bearer token for read/write (if env var set, enforced on all endpoints except /health)
const AUTH_TOKEN = process.env.VISION_AUTH_TOKEN ?? null;

const storage = createMemoryStorage();

function now() {
  return new Date().toISOString();
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": CORS_ORIGIN,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
  });

  res.end(body);
}

// Security: token validation middleware
function validateToken(req) {
  if (!AUTH_TOKEN) return true; // No token configured, allow all
  const header = req.headers.authorization ?? "";
  return header.startsWith("Bearer ") && header.slice(7) === AUTH_TOKEN;
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();

  if (!raw) {
    return {};
  }

  return JSON.parse(raw);
}

function normalizeSnapshot(input) {
  return {
    id: input.id ?? randomUUID(),
    zone: input.zone ?? "default",
    session: input.session ?? "local-session",
    source: input.source ?? "browser-camera",
    objects: Array.isArray(input.objects) ? input.objects : [],
    createdAt: input.createdAt ?? now(),
    meta: input.meta ?? {},
  };
}

function normalizeEvent(input) {
  return {
    id: input.id ?? randomUUID(),
    type: input.type ?? "object_seen",
    label: input.label ?? "unknown",
    zone: input.zone ?? "default",
    session: input.session ?? "local-session",
    confidence: typeof input.confidence === "number" ? input.confidence : null,
    count: typeof input.count === "number" ? input.count : null,
    createdAt: input.createdAt ?? now(),
    meta: input.meta ?? {},
  };
}

async function route(req, res) {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  // /health is public; all other endpoints require valid token (if configured)
  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "vision-persistent-presence-node",
      node: NODE_NAME,
      storage: "memory",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: now(),
    });
  }

  // Require token for all other endpoints (if AUTH_TOKEN is set)
  if (AUTH_TOKEN && !validateToken(req)) {
    return sendJson(res, 401, {
      ok: false,
      error: "unauthorized",
      message: "Missing or invalid Authorization: Bearer <token>",
    });
  }

  if (req.method === "GET" && url.pathname === "/snapshots") {
    const snapshots = await storage.listSnapshots();

    return sendJson(res, 200, {
      count: snapshots.length,
      snapshots,
    });
  }

  if (req.method === "POST" && url.pathname === "/snapshots") {
    const payload = await readJson(req);
    const snapshot = normalizeSnapshot(payload);
    await storage.createSnapshot(snapshot);

    await storage.createEvent(normalizeEvent({
      type: "snapshot_created",
      label: "scene",
      zone: snapshot.zone,
      session: snapshot.session,
      count: snapshot.objects.length,
      meta: { snapshotId: snapshot.id },
    }));

    return sendJson(res, 201, snapshot);
  }

  if (req.method === "GET" && url.pathname === "/events") {
    const events = await storage.listEvents();

    return sendJson(res, 200, {
      count: events.length,
      events,
    });
  }

  if (req.method === "POST" && url.pathname === "/events") {
    const payload = await readJson(req);
    const event = normalizeEvent(payload);
    await storage.createEvent(event);

    return sendJson(res, 201, event);
  }

  if (req.method === "GET" && url.pathname === "/inventory") {
    const zone = url.searchParams.get("zone") ?? undefined;
    const snapshot = await storage.getLatestSnapshot({ zone });

    if (!snapshot) {
      return sendJson(res, 200, {
        zone: zone ?? "default",
        session: null,
        snapshotId: null,
        createdAt: null,
        count: 0,
        objects: [],
      });
    }

    return sendJson(res, 200, createInventoryPayload(snapshot));
  }

  return sendJson(res, 404, {
    ok: false,
    error: "not_found",
    routes: [
      "GET /health",
      "GET /snapshots",
      "POST /snapshots",
      "GET /events",
      "POST /events",
      "GET /inventory",
      "GET /inventory?zone=desk",
    ],
  });
}

const server = http.createServer((req, res) => {
  route(req, res).catch((error) => {
    sendJson(res, 500, {
      ok: false,
      error: "internal_error",
      message: error instanceof Error ? error.message : String(error),
    });
  });
});

server.listen(PORT, BIND_ADDR, () => {
  const corsStatus = CORS_ORIGIN === "*" ? "PERMISSIVE" : `limited to ${CORS_ORIGIN}`;
  const authStatus = AUTH_TOKEN ? "enabled" : "disabled";
  console.log(`Vision Persistent Presence Node listening on http://${BIND_ADDR}:${PORT}`);
  console.log(`  CORS: ${corsStatus}`);
  console.log(`  Auth: ${authStatus}`);
});
