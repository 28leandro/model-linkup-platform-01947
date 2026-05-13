import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "recently_viewed_listings";
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  id: string;
  title: string;
  image?: string;
  price?: number;
  currency?: string;
  location?: string;
  type?: string;
  viewedAt: number;
}

function read(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: RecentlyViewedItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota errors */
  }
}

export function trackRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined" || !item?.id) return;
  const current = read().filter((x) => x.id !== item.id);
  const next = [{ ...item, viewedAt: Date.now() }, ...current].slice(0, MAX_ITEMS);
  write(next);
  window.dispatchEvent(new Event("recently-viewed-updated"));
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  const refresh = useCallback(() => setItems(read()), []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("recently-viewed-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("recently-viewed-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const clear = useCallback(() => {
    write([]);
    setItems([]);
  }, []);

  return { items, clear, refresh };
}