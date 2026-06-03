export type VisionTransport = "wifi" | "bluetooth" | "serial" | "infrared" | "usb" | "unknown";

export type VisionTransportMessageType = "heartbeat" | "detection" | "event" | "command" | "status";

export type VisionTransportMessage<TPayload = unknown> = {
  id: string;
  timestamp: string;
  nodeId: string;
  transport: VisionTransport;
  type: VisionTransportMessageType;
  payload: TPayload;
};

export type TransportHealthStatus = "online" | "degraded" | "offline";

export type TransportHealth = {
  transport: VisionTransport;
  available: boolean;
  lastSeenAt: string | null;
  latencyMs: number | null;
  failures: number;
  status: TransportHealthStatus;
};

export const TRANSPORT_PRIORITY: VisionTransport[] = ["usb", "serial", "wifi", "bluetooth", "infrared", "unknown"];

export function createHeartbeatMessage(nodeId: string, transport: VisionTransport): VisionTransportMessage {
  return {
    id: `${nodeId}-${transport}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    nodeId,
    transport,
    type: "heartbeat",
    payload: { alive: true },
  };
}

export function isTransportOnline(health: TransportHealth) {
  return health.available && health.status === "online";
}
