import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type CacheEntry = { avg: number; count: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

async function fetchRating(listingId: string): Promise<CacheEntry> {
  if (cache.has(listingId)) return cache.get(listingId)!;
  if (inflight.has(listingId)) return inflight.get(listingId)!;
  const p = (async () => {
    const { data } = await supabase
      .from("listing_ratings")
      .select("rating")
      .eq("listing_id", listingId);
    const rows = (data || []) as { rating: number | string }[];
    const count = rows.length;
    const avg = count ? rows.reduce((s, r) => s + Number(r.rating), 0) / count : 0;
    const entry = { avg, count };
    cache.set(listingId, entry);
    inflight.delete(listingId);
    return entry;
  })();
  inflight.set(listingId, p);
  return p;
}

interface Props {
  listingId: string;
  category?: string | null;
  className?: string;
}

/** Tiny inline star + average for any listing with ratings. Renders nothing if no ratings. */
export const ListingRatingBadge = ({ listingId, category, className = "" }: Props) => {
  const [state, setState] = useState<CacheEntry | null>(
    cache.get(listingId) || null
  );

  useEffect(() => {
    let alive = true;
    fetchRating(listingId).then((e) => {
      if (alive) setState(e);
    });
    return () => {
      alive = false;
    };
  }, [listingId]);

  if (!state || state.count === 0) return null;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] leading-none text-muted-foreground shrink-0 ${className}`}
      aria-label={`${state.avg.toFixed(1)} de 5 · ${state.count} evaluaciones`}
    >
      <Star className="w-3 h-3 fill-foreground text-foreground" />
      <span className="font-medium text-foreground/80">{state.avg.toFixed(1)}</span>
    </span>
  );
};

export default ListingRatingBadge;