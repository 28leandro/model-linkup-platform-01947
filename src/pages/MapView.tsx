import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListingsStore } from "@/store/listingsStore";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import Map from "@/components/Map";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";
import { useLanguage } from "@/contexts/LanguageContext";

const MapView = () => {
  const { t } = useLanguage();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const listings = useListingsStore((state) => state.listings);
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);

  const listingsWithCoords = listings.filter(
    (listing) => listing.latitude && listing.longitude
  );

  const handleMarkerClick = (listing: any) => {
    setSelectedListing(listing.id);
  };

  const selectedListingData = listings.find(l => l.id === selectedListing);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{t('map.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-lg overflow-hidden h-[50vh] sm:h-[60vh] lg:h-[70vh]">
              <Map 
                listings={listingsWithCoords}
                onMarkerClick={handleMarkerClick}
                center={[-58.4438, -23.4425]}
                zoom={6}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 order-1 lg:order-2">
            <h2 className="text-lg sm:text-xl font-semibold">
              {selectedListing ? t('map.selected') : t('map.onMap')}
            </h2>
            
            {selectedListingData ? (
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/listing/${selectedListingData.id}`)}
              >
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {selectedListingData.images && selectedListingData.images.length > 0 && (
                    <img
                      src={selectedListingData.images[0]}
                      alt={selectedListingData.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-medium text-base sm:text-lg mb-2">{selectedListingData.title}</h3>
                  <StarRating rating={selectedListingData.rating} />
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">{selectedListingData.location}</p>
                  {selectedListingData.price && (
                    <p className="text-base sm:text-lg font-bold text-primary mt-2">
                      ₲ {selectedListingData.price.toLocaleString('es-PY')}
                    </p>
                  )}
                  {selectedListingData.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-2">
                      {selectedListingData.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[30vh] lg:max-h-none overflow-y-auto">
                {listingsWithCoords.slice(0, 5).map((listing) => (
                  <Card 
                    key={listing.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <CardContent className="p-2 sm:p-3 flex gap-2 sm:gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        {listing.images && listing.images.length > 0 && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs sm:text-sm truncate">{listing.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{listing.location}</p>
                        {listing.price && (
                          <p className="text-xs sm:text-sm font-bold text-primary mt-1">
                            ₲ {listing.price.toLocaleString('es-PY')}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
};

export default MapView;
