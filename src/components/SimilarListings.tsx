import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import FavoriteButton from "@/components/FavoriteButton";

interface SimilarListingsProps {
  currentId: string;
  category?: string | null;
  price?: number | null;
  currency?: string | null;
  location?: string | null;
  title?: string | null;
  type?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
}

interface SimilarItem {
  id: string;
  title: string;
  price: number | null;
  currency: string | null;
  location: string | null;
  images: string[] | null;
  created_at: string;
  category: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  attributes?: Record<string, any> | null;
}

const STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "a", "o", "as", "os", "para", "com",
  "em", "un", "una", "el", "la", "los", "las", "y", "e", "por", "the",
]);

const tokenize = (s?: string | null) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));

const normalizeValue = (value?: string | null) =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const vehicleField = (row: Pick<SimilarItem, "brand" | "model" | "attributes">, field: "brand" | "model") => {
  const direct = row[field];
  const attrs = row.attributes || {};
  return direct || attrs[field] || attrs[`${field}Custom`] || null;
};

const sameRegion = (a?: string | null, b?: string | null) => {
  const left = normalizeValue(a).replace(/^[-\s]+/, "");
  const right = normalizeValue(b).replace(/^[-\s]+/, "");
  if (!left || !right) return true;
  return left === right || left.includes(right) || right.includes(left);
};

const SimilarListings = ({
  currentId,
  category,
  price,
  currency,
  location,
  title,
  type,
  brand,
  model,
  year,
}: SimilarListingsProps) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<SimilarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const currentBrand = brand || null;
        const currentModel = model || null;
        const normalizedBrand = normalizeValue(currentBrand);
        const normalizedModel = normalizeValue(currentModel);
        const hasYearWindow = !!year && year > 0;
        const isVehicle = type === "vehicles" || category === "vehicles";
        const select =
          "id,title,price,currency,location,images,created_at,category,brand,model,year,attributes";

        let rows: SimilarItem[] = [];

        const runQuery = async (
          build: (q: any) => any,
          limit = 40
        ): Promise<SimilarItem[]> => {
          let q = supabase
            .from("listings_public")
            .select(select)
            .neq("id", currentId)
            .limit(limit);
          q = build(q);
          const { data, error } = await q;
          if (error) throw error;
          return ((data || []) as unknown) as SimilarItem[];
        };

        const mergeUnique = (a: SimilarItem[], b: SimilarItem[]) => {
          const seen = new Set(a.map((r) => r.id));
          for (const r of b) {
            if (!seen.has(r.id)) {
              a.push(r);
              seen.add(r.id);
            }
          }
          return a;
        };

        if (isVehicle) {
          const vehicleRows = await runQuery((q) => {
            q = q.eq("category", "vehicles");
            if (hasYearWindow) q = q.gte("year", year! - 4).lte("year", year! + 4);
            return q;
          }, 120);

          const inRegion = vehicleRows.filter((r) => sameRegion(location, r.location));
          const searchPool = inRegion.length > 0 ? inRegion : vehicleRows;
          const sameBrand = searchPool.filter(
            (r) => normalizedBrand && normalizeValue(vehicleField(r, "brand")) === normalizedBrand
          );
          const sameModel = sameBrand.filter(
            (r) => normalizedModel && normalizeValue(vehicleField(r, "model")) === normalizedModel
          );

          rows = sameModel.length > 0 ? sameModel : sameBrand;
        } else {
          rows = await runQuery((q) => {
            if (category) q = q.eq("category", category);
            if (currency) q = q.eq("currency", currency);
            if (price && price > 0)
              q = q.gte("price", price * 0.8).lte("price", price * 1.2);
            return q;
          }, 60);
          if (rows.length < 4 && category) {
            const relaxed = await runQuery((q) => q.eq("category", category));
            rows = mergeUnique(rows, relaxed);
          }
        }

        const titleTokens = new Set(tokenize(title));
        const cityNorm = (location || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

        const scored = rows.map((r) => {
          let score = 0;
          if (r.category && category && r.category === category) score += 30;
          if (isVehicle) {
            const rowBrand = vehicleField(r, "brand");
            const rowModel = vehicleField(r, "model");
            if (normalizedBrand && normalizeValue(rowBrand) === normalizedBrand)
              score += 40;
            // Highest priority: same model
            if (normalizedModel && normalizeValue(rowModel) === normalizedModel)
              score += 80;
            if (year && year > 0 && r.year && r.year > 0) {
              const dy = Math.abs(r.year - year);
              if (dy <= 4) score += 20 - dy * 3;
            }
          }
          if (price && price > 0 && r.price && r.price > 0) {
            const delta = Math.abs(r.price - price) / price;
            if (delta <= 0.2) score += 25 - Math.round(delta * 100);
          }
          if (cityNorm && r.location) {
            const rl = r.location
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            if (rl === cityNorm) score += 20;
            else if (rl.includes(cityNorm) || cityNorm.includes(rl)) score += 10;
          }
          if (titleTokens.size && r.title) {
            const matches = tokenize(r.title).filter((w) => titleTokens.has(w));
            score += Math.min(matches.length * 4, 16);
          }
          return { row: r, score };
        });

        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, 12).map((s) => s.row);
        if (!cancelled) setItems(top);
      } catch (e) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [currentId, category, price, currency, location, title, type, brand, model, year]);

  const scrollBy = (delta: number) =>
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });

  if (loading || items.length === 0) return null;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold">
          {t("listings.similarInRegion")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8"
            onClick={() => scrollBy(-320)}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8"
            onClick={() => scrollBy(320)}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
      >
        {items.map((item) => {
          const img = Array.isArray(item.images) ? item.images[0] : undefined;
          return (
            <Link
              key={item.id}
              to={`/listing/${item.id}`}
              className="group relative shrink-0 w-[150px] sm:w-[180px] snap-start bg-card rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
            >
              <div className="absolute top-1.5 right-1.5 z-10">
                <FavoriteButton
                  listingId={item.id}
                  size="icon"
                  className="h-8 w-8 bg-background/80 backdrop-blur-sm rounded-full"
                />
              </div>
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {img ? (
                  <img
                    src={img}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                    {t("listings.noImage")}
                  </div>
                )}
              </div>
              <div className="p-2">
                {item.price && item.price > 0 && (
                  <p className="text-primary font-semibold text-xs sm:text-sm">
                    {formatPrice(item.price, item.currency || undefined)}
                  </p>
                )}
                <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight min-h-[2.25rem] mt-0.5">
                  {item.title}
                </p>
                {item.location && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {formatDate(item.created_at)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarListings;