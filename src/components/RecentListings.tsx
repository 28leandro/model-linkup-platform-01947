import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Ruler, Plus, ArrowRight } from "lucide-react";
import VehicleInfo from "@/components/VehicleInfo";
import ListingImageCarousel from "@/components/ListingImageCarousel";
import DesktopListingCarousel from "@/components/DesktopListingCarousel";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import { cn, getPublicCity } from "@/lib/utils";
import { CATEGORIES, getCategoryById, getConditionMeta } from "@/lib/categories";
import { getCheapestIds, priceClass } from "@/lib/cheapest";

const AREA_SUBS = ["terreno", "comercial", "quinta", "estancia", "oficina", "edificio"];

const getCategoryBadge = (type?: string, isPt = false) => {
  const cat = getCategoryById(type);
  if (!cat) return null;
  const Icon = cat.icon;
  return { Icon, label: isPt ? cat.label_pt : cat.label_es };
};

interface RecentListingsProps {
  listings: Listing[];
  initialLimit?: number;
  expandMode?: "inline" | "route";
}

const RecentListings = ({ listings, initialLimit = 8, expandMode = "inline" }: RecentListingsProps) => {
  const { t, language } = useLanguage();
  const isPt = language === "pt";
  const cheapestIds = useMemo(() => getCheapestIds(listings as any[]), [listings]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      cat,
      items: listings.filter((l) => l.type === cat.id || l.type === cat.type),
    })).filter((g) => g.items.length > 0);
  }, [listings]);

  const uncategorized = useMemo(() => {
    const known = new Set<string>();
    CATEGORIES.forEach((c) => { known.add(c.id); known.add(c.type); });
    return listings.filter((l) => !l.type || !known.has(l.type));
  }, [listings]);

  const renderCard = (listing: Listing) => (
    <div key={listing.id} className="group relative bg-transparent rounded-xl overflow-hidden shrink-0 w-[44%] sm:w-[38%] md:w-[30%] snap-start lg:w-full lg:shrink-0">
      <div className="rounded-xl overflow-hidden">
        <ListingImageCarousel
          listingId={listing.id}
          images={listing.images || []}
          title={listing.title}
          href={`/listing/${listing.id}`}
          noImageLabel={t('listings.noImage')}
        />
      </div>
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="pt-2 sm:pt-2.5 px-0.5">
          <div className="flex items-center gap-1 mb-1 flex-wrap">
            {(() => {
              const cond = getConditionMeta((listing as any).condition);
              if (!cond) return null;
              return (
                <span className={cn("inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium", cond.color)}>
                  {isPt ? cond.label_pt : cond.label_es}
                </span>
              );
            })()}
          </div>
          <h3 className="font-normal text-sm sm:text-base mb-0.5 line-clamp-1 text-foreground">{listing.title}</h3>
          {listing.price && listing.price > 0 && (
            <p className={`${priceClass(cheapestIds.has(listing.id))} font-semibold text-sm lg:text-base mb-0.5`}>
              {formatPrice(listing.price, (listing as any).currency)}
            </p>
          )}
          <VehicleInfo
            year={(listing as any).year}
            mileage={(listing as any).mileage ?? (listing as any).attributes?.mileage}
            fuelType={(listing as any).fuel_type ?? (listing as any).fuelType}
          />
          {listing.type === "real-estate" && AREA_SUBS.includes((listing as any).subcategory) && (listing as any).area > 0 && (
            <p className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground mt-1">
              <Ruler className="h-3 w-3" />
              {Number((listing as any).area).toLocaleString("es-PY")} m²
            </p>
          )}
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 font-light">{getPublicCity(listing)}</p>
        </div>
      </Link>
    </div>
  );

  const renderSeeAllCard = (catId: string, remaining: number) => {
    const handleClick = () => {
      if (expandMode === "inline") setExpanded((s) => ({ ...s, [catId]: true }));
    };
    const inner = (
      <div className="h-full w-full flex flex-col items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-primary/10 via-muted/40 to-accent/10 border border-border/60 hover:border-primary/40 transition-colors p-4 text-center min-h-[180px]">
        <div className="rounded-full bg-primary/15 p-3">
          <Plus className="h-5 w-5 text-primary" />
        </div>
        <p className="text-sm sm:text-base font-medium text-foreground">{isPt ? "Ver tudo" : "Ver todo"}</p>
        <p className="text-[11px] sm:text-xs text-muted-foreground inline-flex items-center gap-1">
          +{remaining} <ArrowRight className="h-3 w-3" />
        </p>
      </div>
    );
    const wrapperCls = "group relative shrink-0 w-[44%] sm:w-[38%] md:w-[30%] snap-start lg:w-full lg:shrink-0 cursor-pointer";
    if (expandMode === "route") {
      return (
        <Link key={`see-all-${catId}`} to={`/category/${catId}`} className={wrapperCls}>
          {inner}
        </Link>
      );
    }
    return (
      <button key={`see-all-${catId}`} type="button" onClick={handleClick} className={wrapperCls + " text-left"}>
        {inner}
      </button>
    );
  };

  const renderGroupRow = (catId: string, items: Listing[]) => {
    const isExpanded = expanded[catId];
    const needsLimit = items.length > initialLimit && !isExpanded;
    const remaining = items.length - initialLimit;
    return (
      <>
        {/* Mobile: horizontal scroll-snap row */}
        <div className="lg:hidden flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-2 sm:-mx-3 px-2 sm:px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((listing, idx) => {
            const hide = needsLimit && idx >= initialLimit;
            if (hide) return null;
            return renderCard(listing);
          })}
          {needsLimit && renderSeeAllCard(catId, remaining)}
        </div>
        {/* Desktop: embla carousel with arrows + progress bars */}
        <div className="hidden lg:block">
          <DesktopListingCarousel>
            {items.map((listing) => renderCard(listing))}
          </DesktopListingCarousel>
        </div>
      </>
    );
  };

  return (
    <div className="container mx-auto px-2 sm:px-3 py-6 sm:py-8 space-y-8">
      {groups.map(({ cat, items }) => (
        <section key={cat.id}>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-light tracking-tight flex items-center gap-2">
              <cat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              {isPt ? cat.label_pt : cat.label_es}
            </h2>
          </div>
          {renderGroupRow(cat.id, items)}
        </section>
      ))}
      {uncategorized.length > 0 && (
        <section>
          <h2 className="text-lg sm:text-xl font-light tracking-tight mb-3 sm:mb-4">{t('listings.recent')}</h2>
          {renderGroupRow("__uncategorized__", uncategorized)}
        </section>
      )}
    </div>
  );
};

export default RecentListings;