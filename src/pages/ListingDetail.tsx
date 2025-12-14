import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, ChevronLeft, ChevronRight, Edit, MessageCircle, Trash2 } from "lucide-react";
import { StarRating } from "@/components/StarRating";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Listing } from "@/store/listingsStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";

const ListingDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  useEffect(() => {
    const fetchListing = async () => {
      const { data, error } = await supabase
        .from('listings_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (!error && data) {
        setListing(data as Listing);
      }
    };
    
    fetchListing();
  }, [id]);
  
  // Verificar se o usuário é o dono do anúncio
  const isOwner = user && listing && user.id === listing.user_id;

  const handleDelete = async () => {
    if (listing) {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id);
      
      if (error) {
        toast({
          title: t('detail.deleteError'),
          description: t('detail.deleteErrorDesc'),
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: t('detail.deleteSuccess'),
        description: t('detail.deleteSuccessDesc'),
      });
      navigate("/");
    }
  };

  if (!listing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold mb-2">{t('detail.notFound')}</h1>
            <p className="text-muted-foreground">{t('detail.notFoundDesc')}</p>
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <Card>
          <CardContent className="p-3 sm:p-6">
            {/* Galeria de Fotos */}
            <div className="relative aspect-[4/3] sm:aspect-video md:aspect-[4/3] lg:max-h-[500px] bg-muted rounded-lg mb-3 sm:mb-4 overflow-hidden group">
              <img
                src={listing.images && listing.images[currentImageIndex] ? listing.images[currentImageIndex] : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"}
                alt={`${listing.title} - Foto ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';
                }}
              />
              
              {/* Botões de navegação */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-10 sm:w-10"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-10 sm:w-10"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  {/* Indicador de foto atual */}
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-4 xs:grid-cols-5 gap-1.5 sm:gap-2 mb-4 sm:mb-6">
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
            
            <h1 className="text-xl sm:text-2xl font-bold mb-2">{listing.title}</h1>
            <div className="mb-3 sm:mb-4">
              <StarRating rating={listing.rating} />
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{listing.location}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button className="flex-1 min-w-[120px] h-10 sm:h-11 text-sm sm:text-base">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{listing.phone || t('detail.contact')}</span>
              </Button>
              <Button
                variant="secondary"
                className="flex-1 min-w-[120px] bg-green-500 hover:bg-green-600 text-white h-10 sm:h-11 text-sm sm:text-base"
                asChild
              >
                <a 
                  href={`https://wa.me/${listing.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa tu anuncio: ${listing.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  WhatsApp
                </a>
              </Button>
              <ShareButtons title={listing.title} />
              {isOwner && (
                <div className="flex gap-2 w-full xs:w-auto">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigate(`/post-ad/${listing.id}`)}
                    className="h-10 w-10 sm:h-11 sm:w-11"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        className="h-10 w-10 sm:h-11 sm:w-11"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[90vw] max-w-md mx-auto">
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('detail.deleteConfirm')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('detail.deleteDesc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">{t('detail.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="w-full sm:w-auto">
                          {t('detail.confirmDelete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Descripción</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                {listing.description || 'Sin descripción disponible'}
              </p>
              
              {/* Informações adicionais para imóveis */}
              {listing.type === 'real-estate' && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                  {listing.bedrooms && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">Dormitorios</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.bedrooms}</p>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">Baños</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.bathrooms}</p>
                    </div>
                  )}
                  {listing.area && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">Área</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.area}m²</p>
                    </div>
                  )}
                  {listing.price && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {listing.realEstateType === 'rent' ? 'Alquiler/mes' : 'Precio'}
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-primary">
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