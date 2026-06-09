import { Link } from "react-router-dom";
import VehicleInfo from "@/components/VehicleInfo";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import ListingImageCarousel from "@/components/ListingImageCarousel";
import { formatPrice } from "@/lib/formatPrice";
import { getPublicCity } from "@/lib/utils";
import { getCategoryById, getConditionMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";
import { Ruler } from "lucide-react";
import { useMemo } from "react";
import { getCheapestIds, priceClass } from "@/lib/cheapest";

const AREA_SUBS = ["terreno","comercial","quinta","estancia","oficina","edificio"];

const getCategoryBadge = (type?: string, isPt = false) => {
  const cat = getCategoryById(type);
  if (!cat) return null;
  const Icon = cat.icon;
  return { Icon, label: isPt ? cat.label_pt : cat.label_es };
};

interface RecentListingsProps {
  listings: Listing[];
}


const RecentListings = ({ listings }: RecentListingsProps) => {
  const { t, language } = useLanguage();
  const isPt = language === "pt";
  const cheapestIds = useMemo(() => getCheapestIds(listings as any[]), [listings]);

  return (
    <div className="container mx-auto px-2 sm:px-3 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-light tracking-tight mb-3 sm:mb-4">{t('listings.recent')}</h2>
      <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth -mx-2 sm:-mx-3 px-2 sm:px-3 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {listings.map((listing) => (
          <div key={listing.id} className="group relative bg-transparent rounded-xl overflow-hidden shrink-0 w-[calc(50%-0.375rem)] sm:w-[calc(50%-0.5rem)] snap-start lg:w-auto lg:shrink">
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
                    const b = getCategoryBadge(listing.type, isPt);
                    if (!b) return null;
                    const { Icon, label } = b;
                    return (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground">
                        <Icon className="h-3 w-3" />
                        {label}
                      </span>
                    );
                  })()}
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
        ))}
      </div>
    </div>
  );
};

export default RecentListings;