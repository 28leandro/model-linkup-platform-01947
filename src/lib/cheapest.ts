// Highlight cheapest listing within a group of similar items.
// Rules differ by category type:
//  - real-estate: group by (currency, normalized city, area bucket, bedrooms, subcategory)
//  - others (vehicles / electronics / sports / etc): group by (type, subcategory, year, currency, city)

type AnyListing = Record<string, any>;

const normLoc = (s?: string | null) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(",")[0]
    .trim();

const areaBucket = (a?: number | null) => {
  const n = Number(a || 0);
  if (!n) return "na";
  if (n < 80) return "<80";
  if (n < 150) return "80-150";
  if (n < 300) return "150-300";
  if (n < 600) return "300-600";
  return ">=600";
};

const groupKey = (l: AnyListing): string | null => {
  const type = l.type || l.category;
  const loc = normLoc(l.location);
  const currency = l.currency || "PYG";
  if (!type || !loc) return null;

  if (type === "real-estate") {
    const area = l.area ?? l.attributes?.area;
    const bedrooms = l.attributes?.bedrooms ?? l.bedrooms;
    return `re|${currency}|${loc}|${areaBucket(Number(area))}|${bedrooms ?? "na"}|${l.subcategory || ""}`;
  }
  // vehicles, electronics/tech, sports, others
  if (!l.year) return null;
  return `${type}|${currency}|${l.subcategory || ""}|${l.year}|${loc}`;
};

export function getCheapestIds(listings: AnyListing[]): Set<string> {
  const groups = new Map<string, AnyListing[]>();
  for (const l of listings || []) {
    if (!l || !l.id) continue;
    const price = Number(l.price || 0);
    if (!price || price <= 0) continue;
    const key = groupKey(l);
    if (!key) continue;
    const arr = groups.get(key) || [];
    arr.push(l);
    groups.set(key, arr);
  }
  const ids = new Set<string>();
  for (const arr of groups.values()) {
    if (arr.length < 2) continue;
    let cheapest = arr[0];
    for (const l of arr) {
      if (Number(l.price) < Number(cheapest.price)) cheapest = l;
    }
    ids.add(cheapest.id);
  }
  return ids;
}

/** Tailwind class for a price label. Cheapest → primary (highlight); else neutral dark. */
export const priceClass = (isCheapest: boolean) =>
  isCheapest ? "text-primary" : "text-neutral-900 dark:text-neutral-100";

// --- Lightweight search history (for future personalization) ---
const SEARCH_KEY = "recent_searches";
const MAX_SEARCHES = 20;

export function trackSearch(query: string) {
  if (typeof window === "undefined") return;
  const q = (query || "").trim().toLowerCase();
  if (!q) return;
  try {
    const raw = window.localStorage.getItem(SEARCH_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    const next = [q, ...list.filter((x) => x !== q)].slice(0, MAX_SEARCHES);
    window.localStorage.setItem(SEARCH_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEARCH_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}