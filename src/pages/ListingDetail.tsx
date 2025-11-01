import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useListingsStore } from "@/store/listingsStore";
import { StarRating } from "@/components/StarRating";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const ListingDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const listings = useListingsStore((state) => state.listings);
  const listing = listings.find(l => l.id === Number(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold mb-2">Anúncio não encontrado</h1>
            <p className="text-muted-foreground">Este anúncio não existe ou foi removido.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* Galeria de Fotos */}
            <div className="relative aspect-video bg-gray-200 rounded-lg mb-4 overflow-hidden group">
              <img
                src={listing.images[currentImageIndex] || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"}
                alt={`${listing.title} - Foto ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Botões de navegação */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Indicador de foto atual */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mb-6">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-video rounded-md overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Miniatura ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
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
              {listing.phone || 'Contactar vendedor'}
            </Button>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-3">Descripción</h2>
              <p className="text-muted-foreground">
                {listing.description || 'Sin descripción disponible'}
              </p>
              
              {/* Informações adicionais para imóveis */}
              {listing.type === 'real-estate' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  {listing.bedrooms && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Dormitorios</p>
                      <p className="text-lg font-semibold">{listing.bedrooms}</p>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Baños</p>
                      <p className="text-lg font-semibold">{listing.bathrooms}</p>
                    </div>
                  )}
                  {listing.area && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">Área</p>
                      <p className="text-lg font-semibold">{listing.area}m²</p>
                    </div>
                  )}
                  {listing.price && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {listing.realEstateType === 'rent' ? 'Alquiler/mes' : 'Precio'}
                      </p>
                      <p className="text-lg font-semibold text-primary">
                        ₲ {listing.price.toLocaleString('es-PY')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingDetail;