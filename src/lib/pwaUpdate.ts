import { isAppWorker, shouldDisablePwa } from './pwaEnvironment';

let initialized = false;

function hasAuthTokens(): boolean {
  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.slice(1));
  return query.has('code') || query.has('token_hash') ||
    query.get('type') === 'recovery' || hash.get('type') === 'recovery' ||
    hash.has('access_token') || hash.has('refresh_token');
}

export async function initPwaUpdate(): Promise<void> {
  if (initialized || !('serviceWorker' in navigator)) return;
  initialized = true;
  let iframe = true;
  try { iframe = window.self !== window.top; } catch { /* Block cross-origin frames. */ }

  if (shouldDisablePwa({
    production: import.meta.env.PROD,
    iframe,
    hostname: window.location.hostname,
    search: window.location.search,
  })) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(registrations.filter(registration =>
        [registration.active, registration.waiting, registration.installing]
          .some(worker => worker && isAppWorker(worker.scriptURL, window.location.origin))
      ).map(registration => registration.unregister()));
    } catch { /* Cleanup is best-effort and never reloads previews. */ }
    return;
  }

  // Do not reload an email callback before its one-time credentials are consumed.
  if (hasAuthTokens()) return;

  try {
    const { registerSW } = await import('virtual:pwa-register');
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() { void updateSW(true); },
      onNeedReload() {
        if (!hasAuthTokens()) window.location.reload();
      },
      onRegisteredSW(_url, registration) {
        if (!registration) return;
        const checkForUpdate = () => {
          if (navigator.onLine && document.visibilityState === 'visible') {
            void registration.update().catch(() => { /* Retry on next foreground/online event. */ });
          }
        };
        checkForUpdate();
        window.addEventListener('focus', checkForUpdate);
        window.addEventListener('online', checkForUpdate);
        document.addEventListener('visibilitychange', checkForUpdate);
      },
      onRegisterError(error) { console.warn('PWA registration failed:', error); },
    });
  } catch (error) {
    console.warn('PWA initialization failed:', error);
  }
}