// NEMU.py kill-switch / cache-cleanup service worker.
// Purpose: when a new version is deployed, evict any previously cached
// assets (old favicons, old chunks, stale HTML) and force open tabs to
// reload, then unregister itself so the site stays SW-free until the
// next bump.

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      try {
        // Cache Storage is origin-scoped: only delete caches this SW owns
        // (Workbox / app-shell buckets). Leave third-party caches alone.
        const names = await caches.keys();
        const ours = names.filter((n) =>
          /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-|^nemu-/.test(n)
        );
        await Promise.allSettled(ours.map((n) => caches.delete(n)));
      } finally {
        // Unregister silently. DO NOT navigate/reload clients from here:
        // combined with the page re-registering this worker on every load,
        // c.navigate() created an activate -> reload -> register -> activate
        // loop that left the site "loading" for ~10-15s before settling.
        await self.registration.unregister();
      }
    })()
  )
);

self.addEventListener("fetch", () => {
  // No-op: never serve from cache. Browser handles all requests directly.
});