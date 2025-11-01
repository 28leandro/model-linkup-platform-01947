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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">{t('listings.recent')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="group hover:shadow-md transition-shadow bg-white">
            <Link to={`/listing/${listing.id}`}>
              <AspectRatio ratio={16 / 9} className="rounded-md mb-3 overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={`${listing.title} - foto principal`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    {t('listings.noImage')}
                  </div>
                )}
              </AspectRatio>
              <h3 className="font-medium text-lg mb-1">{listing.title}</h3>
              <StarRating rating={listing.rating} />
              <p className="text-sm text-gray-500 mt-2">{listing.location}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentListings;