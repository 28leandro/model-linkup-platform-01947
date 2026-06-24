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

        await self.clients.claim();
        const wins = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(wins.map((c) => c.navigate(c.url)));
      } finally {
        await self.registration.unregister();
      }
    })()
  )
);

self.addEventListener("fetch", () => {
  // No-op: never serve from cache. Browser handles all requests directly.
});