// Public site URL for shareable links and social (OG) metadata.
// The custom domain (nemu.com.py) is still being verified, so links to it
// don't open yet. Use the current origin on the live site (works today on the
// published URL and automatically on the custom domain once it is active);
// fall back to the published URL from preview/localhost.
const PUBLISHED_URL = "https://nemu-com-py.lovable.app";

export const getSiteUrl = (): string => {
  if (typeof window === "undefined") return PUBLISHED_URL;
  const origin = window.location.origin;
  const isPreview = /localhost|127\.0\.0\.1|id-preview--|lovableproject\.com/.test(origin);
  return isPreview ? PUBLISHED_URL : origin;
};
