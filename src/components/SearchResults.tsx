import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import VehicleInfo from "@/components/VehicleInfo";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Home, Wrench, Ruler } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { getPublicCity } from "@/lib/utils";
import { useMemo } from "react";
import { getCheapestIds, priceClass } from "@/lib/cheapest";

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
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        {listings.map((listing) => (
          <Card key={listing.id} className="group hover:shadow-lg transition-shadow duration-200 bg-card border overflow-hidden">
            <Link to={`/listing/${listing.id}`}>
              <div className="aspect-[4/3] lg:aspect-[3/4] bg-muted overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                    {t('listings.noImage')}
                  </div>
                )}
              </div>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {getCategoryIcon(listing.type) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {getCategoryIcon(listing.type)}
                      {getCategoryLabel(listing.type)}
                    </span>
                  )}
                </div>
                <h3 className="font-medium text-base sm:text-lg mb-2 line-clamp-2">{listing.title}</h3>
                {listing.price && listing.price > 0 && (
                  <p className={`${priceClass(cheapestIds.has(listing.id))} font-bold text-sm sm:text-base mb-1`}>
                    {formatPrice(listing.price, (listing as any).currency)}
                  </p>
                )}
                <VehicleInfo
                  year={(listing as any).year}
                  mileage={(listing as any).mileage ?? (listing as any).attributes?.mileage}
                  fuelType={(listing as any).fuel_type ?? (listing as any).fuelType}
                />
                {listing.type === "real-estate" && AREA_SUBS.includes((listing as any).subcategory) && (listing as any).area > 0 && (
                  <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Ruler className="h-3 w-3" />
                    {Number((listing as any).area).toLocaleString("es-PY")} m²
                  </p>
                )}
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">{getPublicCity(listing)}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;