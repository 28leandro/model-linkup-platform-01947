// Lightweight IndexedDB cache for the listings feed (Stale-While-Revalidate).
// No external deps.

const DB_NAME = "nemu-cache";
const DB_VERSION = 1;
const STORE_LISTINGS = "listings";
const STORE_META = "meta";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_LISTINGS)) {
          db.createObjectStore(STORE_LISTINGS, { keyPath: "__key" });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: "key" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getCachedListings(key: string): Promise<any[] | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_LISTINGS, "readonly");
      const store = tx.objectStore(STORE_LISTINGS);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.rows ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedListings(key: string, rows: any[]): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_LISTINGS, STORE_META], "readwrite");
      tx.objectStore(STORE_LISTINGS).put({ __key: key, rows });
      tx.objectStore(STORE_META).put({ key, updatedAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getCacheMeta(key: string): Promise<number | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_META, "readonly");
      const req = tx.objectStore(STORE_META).get(key);
      req.onsuccess = () => resolve(req.result?.updatedAt ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}