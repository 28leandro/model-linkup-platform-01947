/**
 * Forces returning visitors to pick up the latest deploy by:
 *  1. Comparing the build's app-version meta tag against the value
 *     stored in localStorage. On mismatch, clear caches and reload.
 *  2. Registering the kill-switch /sw.js worker so any previously
 *     installed service worker (or its caches) is removed.
 *
 * Guarded so it never runs in Lovable preview, iframes, or dev — per
 * the PWA skill rules.
 */

const VERSION_KEY = "nemu-app-version";
const SW_CLEANED_KEY = "nemu-sw-cleaned";

function isBlockedEnvironment(): boolean {
  if (typeof window === "undefined") return true;
  // Never clear caches/reload while an auth recovery link is being opened.
  // iOS Safari/PWA can drop or consume one-time URL tokens during forced reloads.
  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(
    window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash
  );
  if (
    params.get("type") === "recovery" ||
    hashParams.get("type") === "recovery" ||
    params.has("code") ||
    params.has("token_hash") ||
    hashParams.has("access_token") ||
    hashParams.has("refresh_token")
  ) {
    return true;
  }
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).get("sw") === "off") {
    return true;
  }
  return false;
}

async function clearAllCaches(): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const names = await caches.keys();
    await Promise.allSettled(names.map((n) => caches.delete(n)));
  } catch {
    /* ignore */
  }
}

async function unregisterExistingWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(regs.map((r) => r.unregister()));
  } catch {
    /* ignore */
  }
}

function getBuildVersion(): string | null {
  const tag = document.querySelector<HTMLMetaElement>(
    'meta[name="app-version"]'
  );
  return tag?.content?.trim() || null;
}

export function initPwaUpdate(): void {
  if (isBlockedEnvironment()) {
    // Best-effort cleanup if someone left preview with an old SW attached.
    void unregisterExistingWorkers();
    return;
  }

  // 1. Version-bump auto-reload (handles browser HTTP cache for icons,
  //    chunks, etc. because we hit the network with a fresh load).
  const current = getBuildVersion();
  if (current) {
    try {
      const stored = localStorage.getItem(VERSION_KEY);
      if (stored && stored !== current) {
        localStorage.setItem(VERSION_KEY, current);
        void (async () => {
          await unregisterExistingWorkers();
          await clearAllCaches();
          window.location.reload();
        })();
        return;
      }
      if (!stored) localStorage.setItem(VERSION_KEY, current);
    } catch {
      /* localStorage blocked — skip silently */
    }
  }

  // 2. One-time cleanup of any legacy service worker (old Workbox precache,
  //    or the previous kill-switch SW). We intentionally do NOT register a
  //    new worker: re-registering the kill-switch SW on every page load made
  //    it activate -> reload the page -> register again -> activate -> reload,
  //    a loop that left the site "loading" for ~10-15s before it settled.
  //    Unregistering from the page is enough; assets come straight from the
  //    network / HTTP cache (hashed files are immutable per .htaccess).
  if ("serviceWorker" in navigator) {
    void (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        if (regs.length === 0) return;
        await Promise.allSettled(regs.map((r) => r.unregister()));
        await clearAllCaches();
        // If a legacy worker was actually controlling this page, a single
        // reload escapes its cached shell. Guard with sessionStorage so this
        // can never loop.
        if (
          navigator.serviceWorker.controller &&
          !sessionStorage.getItem(SW_CLEANED_KEY)
        ) {
          sessionStorage.setItem(SW_CLEANED_KEY, "1");
          window.location.reload();
        }
      } catch {
        /* cleanup failed — non-fatal */
      }
    })();
  }
}