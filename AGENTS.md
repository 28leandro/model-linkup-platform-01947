# Architecture rules

- Manage the app-shell service worker exclusively through `vite-plugin-pwa` generateSW and the guarded `pwaUpdate` entry module; this provides automatic updates without controlling preview environments or unrelated messaging workers.
- Preserve the existing public manifest identity and use network-first navigation caching with auth/OAuth exclusions; this keeps installed app continuity and avoids caching one-time authentication links.