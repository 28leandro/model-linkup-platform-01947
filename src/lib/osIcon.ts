/**
 * Returns the platform-appropriate app icon URL.
 * iOS devices get the Superellipse (rounded-square) variant,
 * Android (and everything else) get the Adaptive Round variant.
 * Both PNGs have a fully transparent background.
 */
export function getOSIcon(): string {
  if (typeof navigator === "undefined") return "/logo-nemu-v3-512.png?v=3";
  const ua = navigator.userAgent || "";
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && "ontouchend" in document);
  return isIOS ? "/logo-nemu-v3-512.png?v=3" : "/logo-nemu-v3-512.png?v=3";
}