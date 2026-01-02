import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";
import FavoriteButton from "@/components/FavoriteButton";

interface FavoriteListing {
  id: string;
  title: string;
  location: string | null;
  images: string[] | null;
  rating: number | null;
  price: number | null;
}

const FavoriteThings = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { favoriteIds, loading: favoritesLoading } = useFavorites();
  const [listings, setListings] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || favoriteIds.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, title, location, images, rating, price')
          .in('id', favoriteIds);

        if (error) throw error;
        setListings(data || []);
      } catch (error) {
        console.error('Error fetching favorite listings:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteListings();
    }
  }, [user, favoriteIds, favoritesLoading]);

  const isLoading = loading || favoritesLoading;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              {t('favorites.title')}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t('favorites.loginRequired')}
            </p>
            <Button asChild>
              <Link to="/">{t('header.login')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8 text-center">
          {t('favorites.title')}
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('favorites.empty')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {t('favorites.emptyDesc')}
            </p>
            <Button asChild>
              <Link to="/">{t('favorites.browse')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                  </AspectRatio>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2">{listing.title}</h3>
                    {listing.rating && <StarRating rating={listing.rating} />}
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">{listing.location}</p>
                    {listing.price && (
                      <p className="font-bold text-primary mt-2">
                        ₲ {listing.price.toLocaleString('es-PY')}
                      </p>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteThings;
