import { Link } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface RecentListingsProps {
  listings: Listing[];
}


const RecentListings = ({ listings }: RecentListingsProps) => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('listings.recent')}</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="group hover:shadow-md transition-shadow bg-card rounded-lg overflow-hidden">
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
                <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2">{listing.title}</h3>
                <StarRating rating={listing.rating} />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">{listing.location}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentListings;