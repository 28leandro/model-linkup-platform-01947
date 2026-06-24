/**
 * Returns the platform-appropriate app icon URL.
 * Returns the canonical NEMU.py app icon URL.
 * The PNG uses a filled background so iOS favorites never fall back to defaults.
 */
export function getOSIcon(): string {
  return "/favicon.png?v=2";
}