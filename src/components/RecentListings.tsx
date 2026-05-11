import { Link } from "react-router-dom";
import VehicleInfo from "@/components/VehicleInfo";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import FavoriteButton from "@/components/FavoriteButton";
import { Car, Home, Wrench } from "lucide-react";
import { formatPrice } from "@/lib/formatPrice";
import { getPublicCity } from "@/lib/utils";
import { getCategoryById, getConditionMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

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

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('listings.recent')}</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="group relative hover:shadow-md transition-shadow bg-card rounded-lg overflow-hidden">
            <div className="absolute top-2 right-2 z-10">
              <FavoriteButton listingId={listing.id} className="bg-background/80 backdrop-blur-sm" />
            </div>
            <Link to={`/listing/${listing.id}`}>
              <AspectRatio ratio={16 / 9} className="overflow-hidden bg-muted">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={`${listing.title} - foto principal`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
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
              </AspectRatio>
              <div className="p-3 sm:p-4">
                <div className="flex items-center gap-1.5 mb-1.5">
                  {(() => {
                    const b = getCategoryBadge(listing.type, isPt);
                    if (!b) return null;
                    const { Icon, label } = b;
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </span>
                    );
                  })()}
                  {(() => {
                    const cond = getConditionMeta((listing as any).condition);
                    if (!cond) return null;
                    return (
                      <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium", cond.color)}>
                        {isPt ? cond.label_pt : cond.label_es}
                      </span>
                    );
                  })()}
                </div>
                <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2">{listing.title}</h3>
                {listing.price && listing.price > 0 && (
                  <p className="text-primary font-bold text-sm sm:text-base mb-1">
                    {formatPrice(listing.price, (listing as any).currency)}
                  </p>
                )}
                <VehicleInfo
                  year={(listing as any).year}
                  mileage={(listing as any).mileage ?? (listing as any).attributes?.mileage}
                  fuelType={(listing as any).fuel_type ?? (listing as any).fuelType}
                />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">{getPublicCity(listing)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentListings;