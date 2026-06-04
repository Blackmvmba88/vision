function normalizeObjectLabel(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return "unknown";
  }

  return item.alias ?? item.label ?? item.className ?? item.name ?? "unknown";
}

function normalizeObjectConfidence(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const confidence = item.confidence ?? item.score ?? item.probability;
  return typeof confidence === "number" ? confidence : null;
}

export function deriveInventoryFromSnapshot(snapshot) {
  const grouped = new Map();

  for (const item of snapshot?.objects ?? []) {
    const label = normalizeObjectLabel(item);
    const confidence = normalizeObjectConfidence(item);
    const current = grouped.get(label) ?? {
      label,
      count: 0,
      maxConfidence: null,
      avgConfidence: null,
      confidenceSum: 0,
      confidenceSamples: 0,
    };

    current.count += 1;

    if (typeof confidence === "number") {
      current.maxConfidence = Math.max(current.maxConfidence ?? confidence, confidence);
      current.confidenceSum += confidence;
      current.confidenceSamples += 1;
      current.avgConfidence = Number((current.confidenceSum / current.confidenceSamples).toFixed(4));
    }

    grouped.set(label, current);
  }

  return [...grouped.values()]
    .map(({ confidenceSum, confidenceSamples, ...item }) => item)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function createInventoryPayload(snapshot) {
  return {
    zone: snapshot?.zone ?? "default",
    session: snapshot?.session ?? "local-session",
    snapshotId: snapshot?.id ?? null,
    createdAt: snapshot?.createdAt ?? null,
    count: snapshot?.objects?.length ?? 0,
    objects: deriveInventoryFromSnapshot(snapshot),
  };
}
