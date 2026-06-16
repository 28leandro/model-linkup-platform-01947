import { Link } from "react-router-dom";
import VehicleInfo from "@/components/VehicleInfo";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Home, Wrench, Ruler } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { getPublicCity } from "@/lib/utils";
import { useMemo } from "react";
import { getCheapestIds, priceClass } from "@/lib/cheapest";
import ListingImageCarousel from "@/components/ListingImageCarousel";
import ListingRatingBadge from "@/components/ListingRatingBadge";

const AREA_SUBS = ["terreno","comercial","quinta","estancia","oficina","edificio"];

const getCategoryIcon = (type?: string) => {
  switch (type) {
    case 'vehicles':
      return <Car className="h-3.5 w-3.5" />;
    case 'real-estate':
      return <Home className="h-3.5 w-3.5" />;
    case 'services':
      return <Wrench className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

const getCategoryLabel = (type?: string) => {
  switch (type) {
    case 'vehicles': return 'Veículos';
    case 'real-estate': return 'Imóveis';
    case 'services': return 'Serviços';
    default: return '';
  }
};

interface SearchResultsProps {
  listings: Listing[];
}


const SearchResults = ({ listings }: SearchResultsProps) => {
  const { t } = useLanguage();
  const cheapestIds = useMemo(() => getCheapestIds(listings as any[]), [listings]);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
        {listings.length > 0 ? t('listings.searchResults') : t('search.noResults')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="group relative bg-transparent rounded-xl overflow-hidden">
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
              <div className="pt-px px-0.5 leading-tight">
                <div className="flex items-center gap-1.5 mb-0 min-h-[18px]">
                  {getCategoryIcon(listing.type) ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {getCategoryIcon(listing.type)}
                      {getCategoryLabel(listing.type)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground opacity-0">—</span>
                  )}
                </div>
                <h3 className="font-normal text-sm sm:text-base mb-0 line-clamp-1 text-foreground">{listing.title}</h3>
                <div className="flex items-center gap-1.5 min-h-[20px] flex-wrap">
                  {listing.price && listing.price > 0 ? (
                    <p className={`${priceClass(cheapestIds.has(listing.id))} font-semibold text-sm lg:text-base mb-0 truncate`}>
                      {formatPrice(listing.price, (listing as any).currency)}
                    </p>
                  ) : (
                    <p className="font-semibold text-sm lg:text-base mb-0 opacity-0">—</p>
                  )}
                  <ListingRatingBadge listingId={listing.id} category={(listing as any).category ?? listing.type} />
                </div>
                <div className="min-h-[20px]">
                  <VehicleInfo
                    year={(listing as any).year}
                    mileage={(listing as any).mileage ?? (listing as any).attributes?.mileage}
                    fuelType={(listing as any).fuel_type ?? (listing as any).fuelType}
                  />
                </div>
                {listing.type === "real-estate" && AREA_SUBS.includes((listing as any).subcategory) && (listing as any).area > 0 && (
                  <p className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-muted-foreground mt-0">
                    <Ruler className="h-3 w-3" />
                    {Number((listing as any).area).toLocaleString("es-PY")} m²
                  </p>
                )}
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0 line-clamp-1 font-light">{getPublicCity(listing)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;