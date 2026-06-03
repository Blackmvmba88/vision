import { useMemo } from "react";
import type { TransportHealth } from "./types";

export function useTransportMesh() {
  const now = new Date().toISOString();

  const transports = useMemo<TransportHealth[]>(
    () => [
      {
        transport: "wifi",
        available: true,
        lastSeenAt: now,
        latencyMs: 24,
        failures: 0,
        status: "online",
      },
      {
        transport: "bluetooth",
        available: false,
        lastSeenAt: null,
        latencyMs: null,
        failures: 0,
        status: "offline",
      },
      {
        transport: "serial",
        available: false,
        lastSeenAt: null,
        latencyMs: null,
        failures: 0,
        status: "offline",
      },
      {
        transport: "infrared",
        available: false,
        lastSeenAt: null,
        latencyMs: null,
        failures: 0,
        status: "offline",
      },
      {
        transport: "usb",
        available: false,
        lastSeenAt: null,
        latencyMs: null,
        failures: 0,
        status: "offline",
      },
    ],
    [now],
  );

  const onlineCount = transports.filter((transport) => transport.status === "online").length;
  const degradedCount = transports.filter((transport) => transport.status === "degraded").length;
  const offlineCount = transports.filter((transport) => transport.status === "offline").length;
  const primaryTransport = transports.find((transport) => transport.status === "online") ?? null;

  return {
    transports,
    onlineCount,
    degradedCount,
    offlineCount,
    primaryTransport,
  };
}
