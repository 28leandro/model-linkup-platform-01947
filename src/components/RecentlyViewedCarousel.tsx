import { Link, useLocation } from "react-router-dom";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import ListingImageCarousel from "@/components/ListingImageCarousel";
import DesktopListingCarousel from "@/components/DesktopListingCarousel";
import { getCityFromLocation } from "@/lib/utils";

// Robust city extractor: prefer last segment that doesn't look like a street,
// fallback to the heuristic in getCityFromLocation.
const cityOnly = (loc?: string) => {
  if (!loc) return "";
  const parts = loc.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  // Drop street-looking first segment, drop trailing region/state if present
  const looksLikeStreet = (s: string) =>
    /\d/.test(s) ||
    /\b(av|avda|avenida|calle|rua|r\.|ruta|km|n[ºo°]|esq|esquina)\b/i.test(s);
  const filtered = parts.filter((p) => !looksLikeStreet(p));
  // Heuristic: city is usually the second-to-last (last is department/region)
  if (filtered.length >= 2) return filtered[filtered.length - 2];
  return filtered[0] || getCityFromLocation(loc);
};

const RecentlyViewedCarousel = () => {
  const { items, clear } = useRecentlyViewed();
  const { t } = useLanguage();
  const location = useLocation();

  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-2 sm:px-3 lg:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-light tracking-tight flex items-center gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          {t("listings.recentlyViewed")}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={clear}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          {t("listings.clear")}
        </Button>
      </div>

      {(() => {
        const renderCard = (item: typeof items[number]) => (
          <div
            key={item.id}
            className="group relative bg-transparent rounded-xl overflow-hidden shrink-0 w-[44%] sm:w-[38%] md:w-[30%] snap-start lg:w-auto lg:shrink"
          >
            <div className="rounded-xl overflow-hidden">
              <ListingImageCarousel
                listingId={item.id}
                images={item.image ? [item.image] : []}
                title={item.title}
                href={`/listing/${item.id}`}
                noImageLabel={t("listings.noImage")}
                linkState={{ preview: { id: item.id, title: item.title, images: item.image ? [item.image] : [], price: item.price }, background: location }}
              />
            </div>
            <Link
              to={`/listing/${item.id}`}
              state={{ preview: { id: item.id, title: item.title, images: item.image ? [item.image] : [], price: item.price }, background: location }}
              className="block"
            >
              <div className="pt-2 sm:pt-2.5 px-0.5">
                <h3 className="font-normal text-sm sm:text-base mb-0.5 line-clamp-1 text-foreground">
                  {item.title}
                </h3>
                {item.price && item.price > 0 ? (
                  <p className="text-foreground font-semibold text-sm lg:text-base mb-0.5">
                    {formatPrice(item.price, item.currency)}
                  </p>
                ) : (
                  <p className="font-semibold text-sm lg:text-base mb-0.5 opacity-0">—</p>
                )}
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 font-bold">
                  {cityOnly(item.location) || "\u00a0"}
                </p>
              </div>
            </Link>
          </div>
        );
        return (
          <>
            {/* Mobile: horizontal scroll */}
            <div className="lg:hidden flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-2 sm:-mx-3 px-2 sm:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map(renderCard)}
            </div>
            {/* Desktop: same carousel as other rows for uniform card size */}
            <div className="hidden lg:block">
              <DesktopListingCarousel>
                {items.map(renderCard)}
              </DesktopListingCarousel>
            </div>
          </>
        );
      })()}
    </section>
  );
};

export default RecentlyViewedCarousel;