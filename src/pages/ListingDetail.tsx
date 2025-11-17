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
import { toast } from "@/components/ui/use-toast";

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
          title: "Erro ao excluir",
          description: "Não foi possível excluir o anúncio.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Anúncio excluído",
        description: "Seu anúncio foi removido com sucesso.",
      });
      navigate("/");
    }
  };

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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            {/* Galeria de Fotos */}
            <div className="relative aspect-video md:aspect-[4/3] lg:max-h-[500px] bg-gray-200 rounded-lg mb-4 overflow-hidden group">
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

            <div className="flex gap-2 mb-4">
              <Button className="flex-1">
                <Phone className="w-4 h-4 mr-2" />
                {listing.phone || 'Contactar vendedor'}
              </Button>
              <Button 
                variant="secondary"
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                asChild
              >
                <a 
                  href={`https://wa.me/${listing.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa tu anuncio: ${listing.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
              {isOwner && (
                <>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => navigate(`/post-ad/${listing.id}`)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>

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