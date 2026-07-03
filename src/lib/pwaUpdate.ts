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

const SW_PATH = "/sw.js";
const VERSION_KEY = "nemu-app-version";
const SW_CLEANUP_VERSION_KEY = "nemu-sw-cleanup-version";

function isBlockedEnvironment(): boolean {
  if (typeof window === "undefined") return true;
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
        localStorage.removeItem(SW_CLEANUP_VERSION_KEY);
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

  // 2. Register the kill-switch SW once per deployed version so any returning
  //    visitor with an old service worker / Workbox precache gets it wiped,
  //    without causing Safari to reload on every visit.
  let shouldRegisterCleanupWorker = Boolean(current);
  try {
    shouldRegisterCleanupWorker =
      Boolean(current) && localStorage.getItem(SW_CLEANUP_VERSION_KEY) !== current;
  } catch {
    /* localStorage blocked — skip SW cleanup to avoid repeat reloads */
    shouldRegisterCleanupWorker = false;
  }

  if (shouldRegisterCleanupWorker && "serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(SW_PATH, { scope: "/", updateViaCache: "none" })
        .then(() => {
          try {
            localStorage.setItem(SW_CLEANUP_VERSION_KEY, current!);
          } catch {
            /* ignore */
          }
        })
        .catch(() => {
          /* registration failed — non-fatal */
        });
    });
  }
}