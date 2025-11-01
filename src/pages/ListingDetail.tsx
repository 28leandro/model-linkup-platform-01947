import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin } from "lucide-react";
import { useListingsStore } from "@/store/listingsStore";
import { StarRating } from "@/components/StarRating";

const ListingDetail = () => {
  const { id } = useParams();
  const listings = useListingsStore((state) => state.listings);
  const listing = listings.find(l => l.id === Number(id));

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold mb-2">Annonce non trouvée</h1>
            <p className="text-muted-foreground">Cette annonce n'existe pas ou a été supprimée.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="aspect-video bg-white rounded-lg mb-6 overflow-hidden">
              <img
                src={listing.images[0] || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
            <div className="mb-4">
              <StarRating rating={listing.rating} />
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground mb-6">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>

            <Button className="w-full mb-4">
              <Phone className="w-4 h-4 mr-2" />
              Contacter le vendeur
            </Button>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingDetail;