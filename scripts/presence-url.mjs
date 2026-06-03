#!/usr/bin/env node

import os from "node:os";

const PORT = process.env.VISION_PORT ?? process.env.PORT ?? "5173";

function getLanAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const [name, entries] of Object.entries(interfaces)) {
    for (const entry of entries ?? []) {
      if (entry.family !== "IPv4") continue;
      if (entry.internal) continue;
      addresses.push({ name, address: entry.address });
    }
  }

  return addresses;
}

const addresses = getLanAddresses();

console.log("\nBlackMamba Vision — Persistent Presence URLs\n");
console.log(`Local:   http://localhost:${PORT}`);

if (addresses.length === 0) {
  console.log("LAN:     no external IPv4 address detected");
  console.log("\nTip: connect the host machine to WiFi or Ethernet, then run this again.\n");
  process.exit(0);
}

for (const { name, address } of addresses) {
  console.log(`LAN:     http://${address}:${PORT}    (${name})`);
}

console.log("\nOpen one of the LAN URLs from a phone, tablet, or another computer on the same network.");
console.log("The device becomes a temporary window. The node remains the host.\n");
