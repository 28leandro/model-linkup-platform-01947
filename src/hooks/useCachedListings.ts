import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCachedListings, setCachedListings, getCacheMeta } from "@/lib/listingsCache";

function formatRow(item: any) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    category: item.category || item.type,
    rating: item.rating || 0,
    location: item.location,
    phone: item.phone,
    images: item.images || [],
    latitude: item.latitude,
    longitude: item.longitude,
    price: item.price,
    currency: item.currency,
    year: item.year,
    fuelType: item.fuel_type,
    fuel_type: item.fuel_type,
    mileage: item.attributes?.mileage,
    attributes: item.attributes,
    subcategory: item.subcategory,
    condition: item.condition,
    area: item.area,
    created_at: item.created_at,
  };
}

export function useCachedListings(cacheKey = "feed:home") {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1. Hydrate instantly from IndexedDB
      const [cached, meta] = await Promise.all([
        getCachedListings(cacheKey),
        getCacheMeta(cacheKey),
      ]);
      if (!cancelled && cached && cached.length > 0) {
        setListings(cached);
        setFromCache(true);
        setLastSyncedAt(meta);
        setLoading(false);
      }

      // 2. Revalidate from network (if online)
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        if (!cancelled && (!cached || cached.length === 0)) setLoading(false);
        return;
      }

      setRefreshing(true);
      const { data, error } = await supabase
        .from("listings_public")
        .select("*")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (!error && data) {
        const formatted = data.map(formatRow);
        setListings(formatted);
        setFromCache(false);
        setLastSyncedAt(Date.now());
        setCachedListings(cacheKey, formatted);
      } else if (error) {
        console.error("Error fetching listings:", error);
      }
      setLoading(false);
      setRefreshing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  return { listings, loading, refreshing, fromCache, lastSyncedAt };
}