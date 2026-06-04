import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number.parseInt(process.env.PORT ?? "8787", 10);
const NODE_NAME = process.env.VISION_NODE_NAME ?? "vision-local-node";

const memory = {
  snapshots: [],
  events: [],
};

function now() {
  return new Date().toISOString();
}

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);

  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });

  res.end(body);
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

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "vision-persistent-presence-node",
      node: NODE_NAME,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: now(),
    });
  }

  if (req.method === "GET" && url.pathname === "/snapshots") {
    return sendJson(res, 200, {
      count: memory.snapshots.length,
      snapshots: memory.snapshots,
    });
  }

  if (req.method === "POST" && url.pathname === "/snapshots") {
    const payload = await readJson(req);
    const snapshot = normalizeSnapshot(payload);
    memory.snapshots.push(snapshot);

    memory.events.push(normalizeEvent({
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
    return sendJson(res, 200, {
      count: memory.events.length,
      events: memory.events,
    });
  }

  if (req.method === "POST" && url.pathname === "/events") {
    const payload = await readJson(req);
    const event = normalizeEvent(payload);
    memory.events.push(event);

    return sendJson(res, 201, event);
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

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vision Persistent Presence Node listening on http://0.0.0.0:${PORT}`);
});
