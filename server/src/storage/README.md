# Vision Storage Layer

This directory contains pluggable storage backends for the persistent presence node.

## Overview

All storage adapters implement a common interface, allowing the node to switch between in-memory, SQLite, or other backends without changing application logic.

## Storage Interface

```typescript
interface StorageAdapter {
  // Snapshots (scene state)
  listSnapshots(): Promise<Snapshot[]>
  createSnapshot(snapshot: Snapshot): Promise<Snapshot>
  
  // Events (audit log)
  listEvents(): Promise<Event[]>
  createEvent(event: Event): Promise<Event>
  
  // Queries
  getLatestSnapshot(options?: { zone?: string }): Promise<Snapshot | null>
}
```

## Current Implementations

### `memory.mjs` — In-Memory Storage (Current)

**Purpose:** Fast prototyping and local development.

**Characteristics:**
- Data stored in JavaScript arrays
- Zero I/O latency
- Single-process only
- Data lost on server restart

**When to use:**
- `npm run dev` (local development)
- Demo mode
- Unit tests
- Temporary data

**Limitations:**
- Not suitable for production
- No durability guarantee
- No concurrent access from multiple processes
- No query optimization

### `sqlite.mjs` — SQLite Persistence (Planned)

**Purpose:** Persistent, queryable storage with zero runtime dependencies.

**Schema:** See `../db/schema.sql`

**Characteristics:**
- Persistent file-based database
- ACID transactions
- Indexed queries (zone, type, time range)
- Suitable for single-machine deployments

**When to use:**
- Production on a single machine (Mac Mini, VPS, Raspberry Pi)
- Data retention required
- Backup/restore workflows
- Query flexibility

**Implementation roadmap:**

1. **Setup phase**
   ```javascript
   import Database from "better-sqlite3";
   // or: import initSqlJs from "sql.js" (for serverless)
   
   function createSqliteStorage(dbPath = "./vision.db") {
     const db = new Database(dbPath);
     db.exec(/* read from schema.sql */);
     // ...
   }
   ```

2. **Map interface methods to SQL**
   ```javascript
   return {
     async listSnapshots() {
       return db.prepare("SELECT * FROM snapshots ORDER BY created_at DESC").all();
     },
     
     async createSnapshot(snapshot) {
       db.prepare(`
         INSERT INTO snapshots (id, zone, session, source, objects_json, meta_json, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
       `).run(
         snapshot.id, snapshot.zone, snapshot.session, snapshot.source,
         JSON.stringify(snapshot.objects), JSON.stringify(snapshot.meta), snapshot.createdAt
       );
       return snapshot;
     },
     
     async listEvents() { /* ... */ },
     async createEvent(event) { /* ... */ },
     async getLatestSnapshot(options) { /* ... */ },
   };
   ```

3. **Add query helpers** (optional, but useful)
   ```javascript
   listSnapshotsByZone(zone) { 
     return db.prepare("SELECT * FROM snapshots WHERE zone = ? ORDER BY created_at DESC").all(zone);
   }
   
   listEventsByType(type) {
     return db.prepare("SELECT * FROM events WHERE type = ? ORDER BY created_at DESC").all(type);
   }
   ```

4. **Testing**
   - Verify both memory and SQLite pass the same test suite
   - Benchmark performance
   - Test concurrent writes

## Switching Backends

To switch from memory to SQLite, edit `server/src/index.mjs`:

```javascript
// Before
import { createMemoryStorage } from "./storage/memory.mjs";
const storage = createMemoryStorage();

// After
import { createSqliteStorage } from "./storage/sqlite.mjs";
const storage = createSqliteStorage(process.env.VISION_DB_PATH ?? "./vision.db");
```

The rest of the application code remains unchanged.

## Adding a New Backend

To add a new backend (e.g., PostgreSQL, MongoDB):

1. Create `server/src/storage/postgres.mjs` (or similar)
2. Export a factory function that returns the interface above
3. Test against the same test suite
4. Switch in `index.mjs`

Example:

```javascript
// server/src/storage/postgres.mjs
import pg from "pg";

export async function createPostgresStorage(connectionString) {
  const pool = new pg.Pool({ connectionString });
  
  return {
    async listSnapshots() {
      const res = await pool.query("SELECT * FROM snapshots ORDER BY created_at DESC");
      return res.rows;
    },
    // ... implement remaining methods
  };
}
```

## Testing All Backends

Create a test suite that runs against any backend:

```javascript
// server/test/storage.test.mjs
export async function testStorageInterface(createStorage, cleanupStorage) {
  const storage = await createStorage();
  
  try {
    // Test 1: Create snapshot
    const snap = await storage.createSnapshot({
      id: "test-1",
      zone: "kitchen",
      session: "demo",
      source: "test",
      objects: [{ label: "cup", confidence: 0.9 }],
      createdAt: new Date().toISOString(),
      meta: {},
    });
    assert.equal(snap.id, "test-1");
    
    // Test 2: List snapshots
    const list = await storage.listSnapshots();
    assert.equal(list.length, 1);
    
    // Test 3: Get latest by zone
    const latest = await storage.getLatestSnapshot({ zone: "kitchen" });
    assert.equal(latest.id, "test-1");
    
    // Test 4: Create event
    const evt = await storage.createEvent({
      id: "evt-1",
      type: "object_seen",
      label: "cup",
      zone: "kitchen",
      session: "demo",
      confidence: 0.9,
      count: null,
      createdAt: new Date().toISOString(),
      meta: {},
    });
    assert.equal(evt.id, "evt-1");
    
    // Test 5: List events
    const events = await storage.listEvents();
    assert(events.length >= 1);
    
    console.log("✅ All tests passed");
  } finally {
    await cleanupStorage();
  }
}

// Run tests against both backends
import { createMemoryStorage } from "../src/storage/memory.mjs";
import { createSqliteStorage } from "../src/storage/sqlite.mjs";

await testStorageInterface(
  () => createMemoryStorage(),
  () => Promise.resolve() // no cleanup for memory
);

await testStorageInterface(
  () => createSqliteStorage(":memory:"), // in-memory SQLite for tests
  () => Promise.resolve()
);
```

## Next Steps

- [ ] Implement `sqlite.mjs` using `better-sqlite3` or `sql.js`
- [ ] Add optional query helpers for common filters
- [ ] Create comprehensive test suite (`test/storage.test.mjs`)
- [ ] Benchmark memory vs. SQLite for typical workloads
- [ ] Add data export/backup methods
- [ ] Document migration path from memory to SQLite (for existing users)
- [ ] Consider PostgreSQL backend for cloud deployments
