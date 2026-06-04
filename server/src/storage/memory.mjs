export function createMemoryStorage() {
  const state = {
    snapshots: [],
    events: [],
  };

  return {
    async listSnapshots() {
      return [...state.snapshots];
    },

    async createSnapshot(snapshot) {
      state.snapshots.push(snapshot);
      return snapshot;
    },

    async listEvents() {
      return [...state.events];
    },

    async createEvent(event) {
      state.events.push(event);
      return event;
    },

    async getLatestSnapshot({ zone } = {}) {
      const snapshots = zone
        ? state.snapshots.filter((snapshot) => snapshot.zone === zone)
        : state.snapshots;

      return snapshots.at(-1) ?? null;
    },
  };
}
