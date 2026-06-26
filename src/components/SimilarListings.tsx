import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import ListingImageCarousel from "@/components/ListingImageCarousel";
import ListingRatingBadge from "@/components/ListingRatingBadge";
import { getCheapestIds, priceClass } from "@/lib/cheapest";
import { CATEGORIES } from "@/lib/categories";

interface SimilarListingsProps {
  currentId: string;
  category?: string | null;
  price?: number | null;
  currency?: string | null;
  location?: string | null;
  title?: string | null;
  type?: string | null;
  subcategory?: string | null;
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
  type?: string | null;
  category: string | null;
  subcategory?: string | null;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  attributes?: Record<string, string | number | boolean | null | undefined> | null;
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
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const normalizeBrand = (value?: string | null) => normalizeValue(value).replace(/\s+/g, " ");

const canonicalCategory = (value?: string | null) => {
  const normalized = normalizeValue(value);
  const category = CATEGORIES.find((c) => {
    const aliases = [c.id, c.type, c.label_es, c.label_pt].map(normalizeValue);
    return aliases.includes(normalized);
  });
  return category?.id || value || null;
};

const canonicalSubcategory = (categoryValue?: string | null, subcategoryValue?: string | null) => {
  const normalized = normalizeValue(subcategoryValue);
  if (!normalized) return null;

  const categoryId = canonicalCategory(categoryValue);
  const categories = categoryId
    ? CATEGORIES.filter((c) => c.id === categoryId || c.type === categoryId)
    : CATEGORIES;

  for (const categoryItem of categories.length ? categories : CATEGORIES) {
    const subcategory = categoryItem.subcategories?.find((s) => {
      const aliases = [s.id, s.label_es, s.label_pt].map(normalizeValue);
      return aliases.includes(normalized);
    });
    if (subcategory) return subcategory.id;
  }

  return normalized.replace(/\s+/g, "-");
};

const serviceAffinity = (row: {
  title?: string | null;
  category?: string | null;
  subcategory?: string | null;
  type?: string | null;
}) => {
  const text = normalizeValue(
    [row.category, row.type, row.subcategory, row.title].filter(Boolean).join(" ")
  );

  if (
    /\b(belleza|beleza|bienestar|bem\s*estar|estetica|esteticista|spa|masaje|massagem|peluquer|cabelo|cabello|barber|barbero|manicur|manicure|pedicure|unas|unhas|cejas|sobrancelhas|depilacion|depilacao|maquillaje|maquiagem|gel)\b/.test(text)
  ) {
    return "beauty";
  }

  if (
    /\b(reformas?|construccion|construcao|construçao|obra|obras|albanil|albañil|muralha|muralla|muro|porton|portao|portón|herreria|serralheria|cemento|ladrillo|tijolo|techo|telhado|plomer|fontaner|electric|pintura|pintor)\b/.test(text)
  ) {
    return "construction";
  }

  return canonicalSubcategory("services", row.subcategory);
};

const normalizeModel = (value?: string | null) =>
  normalizeValue(value)
    .replace(/\b(toyota|volkswagen|chevrolet|ford|hyundai|kia|nissan|honda|renault|peugeot|citroen|fiat|mitsubishi|mercedes\s*benz|bmw|audi|suzuki|mazda|jeep|geely|byd|chery|jac|great\s*wall|haval|mg|changan|dongfeng|gac|lifan|dfsk)\b/g, " ")
    .replace(/\b(modelo|marca|auto|carro|camioneta|vehiculo|veiculo|vendo|venta|se vende|ano|año)\b/g, " ")
    .replace(/\b(19\d{2}|20\d{2})\b/g, " ")
    .replace(/\b(automatico|automatica|manual|full|equipo|diesel|flex|nafta|gasolina|motor|turbo|4x2|4x4)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractYear = (value?: string | null) => {
  const match = (value || "").match(/\b(19\d{2}|20\d{2})\b/);
  return match ? Number(match[1]) : null;
};

const vehicleField = (row: Pick<SimilarItem, "brand" | "model" | "attributes">, field: "brand" | "model") => {
  const direct = row[field];
  const attrs = row.attributes || {};
  const rawValue = direct || attrs[field];
  const normalizedRawValue = normalizeValue(typeof rawValue === "string" ? rawValue : null);
  const shouldUseCustom = normalizedRawValue === "otra" || normalizedRawValue === "otro" || normalizedRawValue === "other";
  const value = shouldUseCustom ? attrs[`${field}Custom`] : rawValue || attrs[`${field}Custom`];
  return typeof value === "string" ? value : null;
};

const vehicleYear = (row: Pick<SimilarItem, "year" | "title" | "attributes">) => {
  const attrYear = row.attributes?.year;
  const parsedAttrYear = typeof attrYear === "number" ? attrYear : Number(attrYear);
  if (row.year && row.year > 0) return row.year;
  if (Number.isFinite(parsedAttrYear) && parsedAttrYear > 0) return parsedAttrYear;
  return extractYear(row.title);
};

const sameVehicleCategory = (row: { type?: string | null; category?: string | null }) =>
  normalizeValue(row.type).includes("vehicle") ||
  normalizeValue(row.category).includes("vehicle") ||
  normalizeValue(row.type).includes("vehiculo") ||
  normalizeValue(row.category).includes("vehiculo") ||
  normalizeValue(row.type).includes("veiculo") ||
  normalizeValue(row.category).includes("veiculo") ||
  row.type === "vehicles" ||
  row.category === "vehicles";

const sameRegion = (a?: string | null, b?: string | null) => {
  const regionKey = (value?: string | null) => {
    const firstPart = (value || "").split(",")[0] || "";
    const lastArea = firstPart.split("-").map((part) => part.trim()).filter(Boolean).pop() || firstPart;
    return normalizeValue(lastArea).replace(/^[-\s]+/, "");
  };
  const left = regionKey(a);
  const right = regionKey(b);
  if (!left || !right) return true;
  return left === right || left.includes(right) || right.includes(left);
};

const cityKey = (value?: string | null) => {
  const firstPart = (value || "").split(",")[0] || "";
  const lastArea = firstPart.split("-").map((p) => p.trim()).filter(Boolean).pop() || firstPart;
  return normalizeValue(lastArea).replace(/^[-\s]+/, "");
};

const sameCity = (a?: string | null, b?: string | null) => {
  const left = cityKey(a);
  const right = cityKey(b);
  if (!left || !right) return false;
  return left === right;
};

const modelCloseness = (candidate?: string | null, current?: string | null) => {
  const candidateModel = normalizeModel(candidate);
  const currentModel = normalizeModel(current);
  if (!candidateModel || !currentModel) return 0;
  if (candidateModel === currentModel) return 100;
  if (candidateModel.includes(currentModel) || currentModel.includes(candidateModel)) return 60;

  const currentTokens = new Set(currentModel.split(/\s+/).filter(Boolean));
  const candidateTokens = candidateModel.split(/\s+/).filter(Boolean);
  return candidateTokens.filter((token) => currentTokens.has(token)).length * 15;
};

const SimilarListings = ({
  currentId,
  category,
  price,
  currency,
  location,
  title,
  type,
  subcategory,
  brand,
  model,
  year,
}: SimilarListingsProps) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<SimilarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const currentBrand = brand || null;
        const currentModel = model || null;
        const currentCategory = canonicalCategory(category || type);
        const currentSubcategory = canonicalSubcategory(currentCategory, subcategory);
        const normalizedBrand = normalizeBrand(currentBrand);
        const normalizedModel = normalizeModel(currentModel);
        const currentYear = year && year > 0 ? year : extractYear(title);
        const hasYearWindow = !!currentYear && currentYear > 0;
        const isVehicle = sameVehicleCategory({ type, category });
        const select =
          "id,title,price,currency,location,images,created_at,type,category,subcategory,brand,model,year,attributes";

        let rows: SimilarItem[] = [];

        const baseQuery = () =>
          supabase
            .from("listings_public")
            .select(select)
            .neq("id", currentId);
        type SimilarQuery = ReturnType<typeof baseQuery>;

        const runQuery = async (
          build: (q: SimilarQuery) => SimilarQuery,
          limit = 40
        ): Promise<SimilarItem[]> => {
          let q = baseQuery().limit(limit);
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
          // Vehicles: same subcategory (carros, motos, etc.) + same brand.
          // Then filter by year (±5) and price (±35%) when available.
          const vehicleRows = await runQuery(
            (q) => {
              let qq = q.or("category.eq.vehicles,type.eq.vehicles");
              if (subcategory) qq = qq.eq("subcategory", subcategory);
              return qq;
            },
            200
          );
          const candidates = vehicleRows.filter(sameVehicleCategory);
          rows = candidates.filter((r) => {
            if (normalizedBrand) {
              const rb = normalizeBrand(vehicleField(r, "brand"));
              if (rb && rb !== normalizedBrand) return false;
            }
            if (currentYear) {
              const ry = vehicleYear(r);
              if (ry && Math.abs(ry - currentYear) > 5) return false;
            }
            if (price && price > 0 && r.price && r.price > 0) {
              const delta = Math.abs(r.price - price) / price;
              if (delta > 0.35) return false;
            }
            return true;
          });
          // If nothing matched the brand filter, fall back to same subcategory only.
          if (rows.length === 0) rows = candidates;
        } else if (currentCategory === "services") {
          const currentServiceAffinity = serviceAffinity({ category, type, subcategory, title });
          const serviceRows = await runQuery(
            (q) => q.or("category.eq.services,type.eq.services"),
            120
          );

          rows = serviceRows.filter((r) => {
            const candidateSubcategory = canonicalSubcategory("services", r.subcategory);
            const candidateAffinity = serviceAffinity(r);

            if (currentSubcategory && candidateSubcategory && candidateSubcategory !== currentSubcategory) {
              return false;
            }
            if (currentServiceAffinity) return candidateAffinity === currentServiceAffinity;
            if (currentSubcategory) return candidateSubcategory === currentSubcategory;
            return false;
          });
        } else {
          // Simple rule for every other category (belleza, inmuebles/casas,
          // tecnología/computadores, celulares, etc.): match by subcategory.
          // Never mix subcategories. Only fall back to category when the
          // current listing has no subcategory at all.
          if (currentSubcategory && currentCategory) {
            rows = await runQuery(
              (q) => q.eq("category", currentCategory).eq("subcategory", currentSubcategory),
              60
            );
          } else if (currentCategory) {
            rows = await runQuery((q) => q.eq("category", currentCategory), 60);
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
          if (canonicalCategory(r.category || r.type) === currentCategory) score += 30;
          if (currentSubcategory && canonicalSubcategory(currentCategory, r.subcategory) === currentSubcategory) score += 50;
          if (isVehicle) {
            const rowBrand = vehicleField(r, "brand");
            const rowModel = vehicleField(r, "model");
            if (normalizedBrand && normalizeBrand(rowBrand) === normalizedBrand)
              score += 100;
            score += modelCloseness(rowModel, currentModel) * 2;
            const rowYear = vehicleYear(r);
            if (currentYear && rowYear) {
              const dy = Math.abs(rowYear - currentYear);
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
  }, [currentId, category, price, currency, location, title, type, subcategory, brand, model, year]);

  const isVehicleView = sameVehicleCategory({ type, category });
  const cityName = (location || "").split(",")[0]?.split("-").pop()?.trim() || location || "";

  // Highlight the cheapest among similar items (already category+region peers).
  const cheapestIds = (() => {
    const valid = items.filter((i) => i.price && i.price > 0);
    if (valid.length < 2) return new Set<string>();
    let cheapest = valid[0];
    for (const i of valid) if (Number(i.price) < Number(cheapest.price)) cheapest = i;
    return new Set<string>([cheapest.id]);
  })();

  if (loading) return null;
  if (items.length === 0) {
    if (isVehicleView) {
      return (
        <section className="container mx-auto px-2 sm:px-3 py-6 sm:py-8">
          <h2 className="text-lg sm:text-xl font-light tracking-tight mb-2">
            {t("listings.similarInRegion")}
          </h2>
          <p className="text-sm text-muted-foreground">
            Nenhum veículo similar encontrado em {cityName}.
          </p>
        </section>
      );
    }
    return null;
  }

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "";
    }
  };

  return (
    <section className="container mx-auto px-2 sm:px-3 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-light tracking-tight mb-3 sm:mb-4">
        {t("listings.similarInRegion")}
      </h2>

      <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth -mx-2 sm:-mx-3 px-2 sm:px-3 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          return (
            <div key={item.id} className="group relative bg-transparent rounded-xl overflow-hidden shrink-0 w-[44%] sm:w-[38%] md:w-[30%] snap-start lg:w-auto lg:shrink">
              <div className="rounded-xl overflow-hidden">
                <ListingImageCarousel
                  listingId={item.id}
                  images={Array.isArray(item.images) ? item.images : []}
                  title={item.title}
                  href={`/listing/${item.id}`}
                  noImageLabel={t("listings.noImage")}
                />
              </div>
              <Link to={`/listing/${item.id}`} className="block">
                <div className="pt-2 sm:pt-2.5 px-0.5">
                  <h3 className="font-normal text-sm sm:text-base mb-0.5 line-clamp-1 text-foreground">
                    {item.title}
                  </h3>
                  <ListingRatingBadge listingId={item.id} category={(item as any).category ?? (item as any).type} className="mb-0.5" />
                  {item.price && item.price > 0 && (
                    <p className={`${priceClass(cheapestIds.has(item.id))} font-semibold text-sm lg:text-base mb-0.5`}>
                      {formatPrice(item.price, item.currency || undefined)}
                    </p>
                  )}
                  {item.location && (
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 font-light flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-light">
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SimilarListings;