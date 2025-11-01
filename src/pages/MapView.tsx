import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListingsStore } from "@/store/listingsStore";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import Map from "@/components/Map";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/StarRating";

const MapView = () => {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const listings = useListingsStore((state) => state.listings);
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState<number | null>(null);

  const listingsWithCoords = listings.filter(
    (listing) => listing.latitude && listing.longitude
  );

  const handleMarkerClick = (listing: any) => {
    setSelectedListing(listing.id);
  };

  const selectedListingData = listings.find(l => l.id === selectedListing);

  return (
    <div className="min-h-screen">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mapa de Anúncios</h1>
          <p className="text-muted-foreground">
            Visualize todos os anúncios disponíveis no mapa
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Map 
              listings={listingsWithCoords}
              onMarkerClick={handleMarkerClick}
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              {selectedListing ? 'Anúncio Selecionado' : 'Anúncios no Mapa'}
            </h2>
            
            {selectedListingData ? (
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/listing/${selectedListingData.id}`)}
              >
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  {selectedListingData.images && selectedListingData.images.length > 0 && (
                    <img
                      src={selectedListingData.images[0]}
                      alt={selectedListingData.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-2">{selectedListingData.title}</h3>
                  <StarRating rating={selectedListingData.rating} />
                  <p className="text-sm text-muted-foreground mt-2">{selectedListingData.location}</p>
                  {selectedListingData.price && (
                    <p className="text-lg font-bold text-primary mt-2">
                      R$ {selectedListingData.price.toLocaleString('pt-BR')}
                    </p>
                  )}
                  {selectedListingData.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {selectedListingData.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {listingsWithCoords.slice(0, 5).map((listing) => (
                  <Card 
                    key={listing.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/listing/${listing.id}`)}
                  >
                    <CardContent className="p-3 flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {listing.images && listing.images.length > 0 && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{listing.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{listing.location}</p>
                        {listing.price && (
                          <p className="text-sm font-bold text-primary mt-1">
                            R$ {listing.price.toLocaleString('pt-BR')}
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
