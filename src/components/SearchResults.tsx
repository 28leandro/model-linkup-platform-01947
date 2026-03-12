import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import { Car, Home, Wrench } from "lucide-react";

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

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
        {listings.length > 0 ? t('listings.searchResults') : t('search.noResults')}
      </h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="group hover:shadow-lg transition-shadow duration-200 bg-card border overflow-hidden">
            <Link to={`/listing/${listing.id}`}>
              <div className="aspect-video bg-muted overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
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
                  <p className="text-primary font-bold text-sm sm:text-base mb-1">
                    Gs. {listing.price.toLocaleString('es-PY')}
                  </p>
                )}
                <StarRating rating={listing.rating} />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">{listing.location}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;