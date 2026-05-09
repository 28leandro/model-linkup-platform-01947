import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ChevronLeft, ChevronRight, Edit, Trash2, ArrowLeft } from "lucide-react";
import VehicleInfo from "@/components/VehicleInfo";
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
import Header from "@/components/Header";
import { LoginDialog } from "@/components/LoginDialog";
import ListingMap from "@/components/ListingMap";
import { formatPrice } from "@/lib/formatPrice";
import EditableField from "@/components/EditableField";
import { toast as sonnerToast } from "sonner";
import { getPublicCity } from "@/lib/utils";
import ContactSellerChat from "@/components/ContactSellerChat";
import WhatsAppContactButton from "@/components/WhatsAppContactButton";

const ListingDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('listings_public')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (!error && data) {
        setListing(data as Listing);
      }
      setIsLoading(false);
    };
    
    fetchListing();
  }, [id]);
  
  // Verificar se o usuário é o dono do anúncio
  const isOwner = user && listing && user.id === listing.user_id;

  const updateField = async (field: "title" | "price" | "description", value: string | number) => {
    if (!listing) return;
    const payload: any = { [field]: value };
    const { error } = await supabase.from("listings").update(payload).eq("id", listing.id);
    if (error) throw new Error(error.message);
    setListing({ ...listing, ...payload } as Listing);
    sonnerToast.success("Alteração salva com sucesso");
  };

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

  if (isLoading) {
    return (
      <>
        <Header onLoginClick={() => setShowLoginDialog(true)} />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Header onLoginClick={() => setShowLoginDialog(true)} />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-xl font-semibold mb-2">{t('detail.notFound')}</h1>
              <p className="text-muted-foreground">{t('detail.notFoundDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </>
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
    <>
      <Header onLoginClick={() => setShowLoginDialog(true)} />
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToHome')}
            </Link>
          </Button>
        <Card>
          <CardContent className="p-3 sm:p-6">
            {/* Galeria de Fotos */}
            <div className="relative aspect-[4/3] sm:aspect-video md:aspect-[4/3] lg:max-h-[500px] bg-muted rounded-lg mb-3 sm:mb-4 overflow-hidden group">
              <img
                src={listing.images && listing.images[currentImageIndex] ? listing.images[currentImageIndex] : "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"}
                alt={`${listing.title} - Foto ${currentImageIndex + 1}`}
                loading="lazy"
                decoding="async"
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
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity h-8 w-8 sm:h-10 sm:w-10"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
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
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              <EditableField
                value={listing.title}
                canEdit={!!isOwner}
                onSave={(v) => updateField("title", v as string)}
                validate={(v) =>
                  v.trim().length < 5 ? "O título deve ter no mínimo 5 caracteres" : null
                }
              />
            </h1>
            <div className="mb-3 sm:mb-4">
              <div className="bg-muted/40 border border-border rounded-lg p-3 sm:p-4 text-foreground text-sm sm:text-base leading-relaxed">
                {isOwner ? (
                  <EditableField
                    value={listing.description ?? ""}
                    type="textarea"
                    canEdit={true}
                    display={
                      <span className="whitespace-pre-wrap">
                        {listing.description || t('detail.noDescription')}
                      </span>
                    }
                    onSave={(v) => updateField("description", v as string)}
                    validate={(v) =>
                      v.trim().length < 20 ? "A descrição deve ter pelo menos 20 caracteres" : null
                    }
                  />
                ) : (
                  <p className="whitespace-pre-wrap">
                    {listing.description || t('detail.noDescription')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{getPublicCity(listing)}</span>
            </div>

            {/* Detalhes do Produto */}
            {(() => {
              const attrs = ((listing as any).attributes || {}) as Record<string, any>;
              const labels: Record<string, string> = {
                brand: "Marca",
                model: "Modelo",
                vehicleType: "Tipo de vehículo",
                motoType: "Tipo de moto",
                engineCC: "Cilindrada",
                startType: "Arranque",
                mileage: "Kilometraje",
                transmission: "Transmisión",
                propertyType: "Tipo de propiedad",
                bedrooms: "Habitaciones",
                bathrooms: "Baños",
                parking: "Estacionamiento",
                schedule: "Horario",
                coverage: "Cobertura",
              };
              const extras: Array<[string, any]> = [];
              if (listing.year) extras.push(["Año", listing.year]);
              if ((listing as any).fuel_type) extras.push(["Combustible", (listing as any).fuel_type]);
              if (listing.area) extras.push(["Área", `${listing.area} m²`]);
              const entries = Object.entries(attrs)
                .filter(([, v]) => v !== null && v !== undefined && v !== "")
                .map(([k, v]) => {
                  const label = labels[k] || k;
                  const value = typeof v === "boolean" ? (v ? "Sí" : "No") : String(v);
                  return [label, value] as [string, string];
                });
              const all = [...extras, ...entries];
              if (all.length === 0) return null;
              return (
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3">Detalles del Producto</h2>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {all.map(([label, value]) => (
                      <div key={label} className="bg-muted p-2.5 sm:p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
                        <p className="text-sm sm:text-base font-semibold break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex flex-wrap gap-2 mb-4">
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
              {listing.type === 'vehicles' && (
                <div className="bg-muted/40 border border-border rounded-lg p-3 sm:p-4">
                  <VehicleInfo
                    year={listing.year}
                    mileage={listing.mileage ?? (listing as any).attributes?.mileage}
                    fuelType={(listing as any).fuel_type ?? (listing as any).fuelType}
                    className="text-sm"
                  />
                </div>
              )}
              
              {/* Informações adicionais para imóveis */}
              {listing.type === 'real-estate' && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                  {listing.bedrooms && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('detail.bedrooms')}</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.bedrooms}</p>
                    </div>
                  )}
                  {listing.bathrooms && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('detail.bathrooms')}</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.bathrooms}</p>
                    </div>
                  )}
                  {listing.area && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('detail.area')}</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.area}m²</p>
                    </div>
                  )}
                  {listing.price && (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {listing.realEstateType === 'rent' ? t('detail.rentPerMonth') : t('detail.price')}
                      </p>
                      <div className="text-base sm:text-lg font-semibold text-primary">
                        <EditableField
                          value={listing.price}
                          type="number"
                          canEdit={!!isOwner}
                          display={<span>{formatPrice(listing.price, (listing as any).currency)}</span>}
                          onSave={(v) => updateField("price", Number(v))}
                          validate={(v) => {
                            const n = Number(v);
                            if (Number.isNaN(n) || n <= 0) return "O preço deve ser um número positivo";
                            return null;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mapa de ubicación */}
              {listing.latitude && listing.longitude && (
                <ListingMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  title={listing.title}
                  location={listing.location}
                />
              )}

              {!isOwner && listing.user_id && (
                <ContactSellerChat
                  listingId={listing.id}
                  listingTitle={listing.title}
                  sellerId={listing.user_id}
                  currentUserId={user?.id || ""}
                  onLoginRequired={() => setShowLoginDialog(true)}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {!isOwner && <WhatsAppContactButton listingId={listing.id} listingTitle={listing.title} />}
    </div>
    </>
  );
};

export default ListingDetail;