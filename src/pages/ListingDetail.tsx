import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import VehicleInfo from "@/components/VehicleInfo";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Listing } from "@/store/listingsStore";
import { toast } from "@/hooks/use-toast";
import ShareButtons from "@/components/ShareButtons";
import Header from "@/components/Header";
import { LoginDialog } from "@/components/LoginDialog";
import ListingMap from "@/components/ListingMap";
import { formatPrice } from "@/lib/formatPrice";
import EditableField from "@/components/EditableField";
import { toast as sonnerToast } from "sonner";
import { getPublicCity } from "@/lib/utils";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ContactSellerChat from "@/components/ContactSellerChat";
import WhatsAppContactButton from "@/components/WhatsAppContactButton";
import SimilarListings from "@/components/SimilarListings";
import SEO from "@/components/SEO";
import { RatingSystem } from "@/components/RatingSystem";

const ListingDetail = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentImageIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = (i: number) => emblaApi?.scrollTo(i);

  const getVehicleField = (field: "brand" | "model") => {
    const listingWithAttributes = listing as (Listing & { attributes?: Record<string, unknown> }) | null;
    const attrs = listingWithAttributes?.attributes || {};
    const value = listingWithAttributes?.[field] || attrs[field];
    const normalized = typeof value === "string" ? value.toLowerCase().trim() : "";
    const customValue = attrs[`${field}Custom`];

    if (["otra", "otro", "other"].includes(normalized) && typeof customValue === "string") {
      return customValue;
    }

    if (typeof value === "string" && value.trim()) return value;
    return typeof customValue === "string" && customValue.trim() ? customValue : null;
  };
  
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
        try {
          const l: any = data;
          trackRecentlyViewed({
            id: l.id,
            title: l.title,
            image: Array.isArray(l.images) ? l.images[0] : undefined,
            price: l.price,
            currency: l.currency,
            location: l.location,
            type: l.type,
          });
        } catch {
          /* tracking is best-effort */
        }
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

  const seoTitle = `${listing.title} | NEMU.py`;
  const seoDesc = (listing.description || `${listing.title} publicado en NEMU.py, el marketplace de Paraguay.`)
    .toString()
    .slice(0, 160);
  const seoImage = listing.images && listing.images.length > 0 ? listing.images[0] : undefined;
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: seoDesc,
    image: seoImage,
    offers: listing.price
      ? {
          "@type": "Offer",
          price: listing.price,
          priceCurrency: (listing as any).currency || "PYG",
          availability: "https://schema.org/InStock",
          url: `https://nemu.com.py/listing/${id}`,
        }
      : undefined,
  };

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonical={`/listing/${id}`}
        ogType="product"
        ogImage={seoImage}
        structuredData={productLd}
      />
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
            {/* Galeria de Fotos — carrossel com swipe e dots */}
            <div className="relative aspect-[4/3] sm:aspect-[16/10] max-h-[260px] sm:max-h-[220px] md:max-h-[260px] lg:max-h-[300px] max-w-md sm:max-w-lg mx-auto bg-muted rounded-lg mb-2 overflow-hidden">
              <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full touch-pan-y">
                  {(listing.images && listing.images.length > 0
                    ? listing.images
                    : ["https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80"]
                  ).map((src, i) => (
                    <div key={i} className="relative min-w-0 flex-[0_0_100%] h-full">
                      <img
                        src={src}
                        alt={`${listing.title} - Foto ${i + 1}`}
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                        draggable={false}
                        className="w-full h-full object-cover select-none"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dots */}
              {listing.images && listing.images.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/35 backdrop-blur-sm">
                  {listing.images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollTo(i)}
                      aria-label={`Foto ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Flechas navegação — somente desktop */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => emblaApi?.scrollPrev()}
                    aria-label="Foto anterior"
                    className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => emblaApi?.scrollNext()}
                    aria-label="Próxima foto"
                    className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {listing.images && listing.images.length > 1 && (
              <div className="grid grid-cols-4 xs:grid-cols-5 gap-1.5 sm:gap-2 mb-2 sm:mb-3 max-w-md sm:max-w-lg mx-auto">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
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

            {/* Compact rating badge below the featured photo */}
            {listing.user_id && (
              <div className="max-w-md sm:max-w-lg mx-auto mb-3 sm:mb-4">
                <RatingSystem
                  listingId={listing.id}
                  listingOwnerId={listing.user_id}
                  listingCategory={listing.category}
                  compactBadge
                />
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
                city: "Ciudad",
              };
              const HIDDEN_ATTRS = new Set([
                "street",
                "state",
                "postcode",
                "postal_code",
                "postalCode",
                "zip",
                "zipcode",
                "address",
                "lat",
                "lng",
                "latitude",
                "longitude",
              ]);
              const extras: Array<[string, any]> = [];
              if (listing.year) extras.push(["Año", listing.year]);
              if ((listing as any).fuel_type) extras.push(["Combustible", (listing as any).fuel_type]);
              if (listing.area) extras.push(["Área", `${listing.area} m²`]);
              const entries = Object.entries(attrs)
                .filter(([k, v]) => v !== null && v !== undefined && v !== "" && !HIDDEN_ATTRS.has(k))
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

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <ShareButtons title={listing.title} />
              {!isOwner && (
                <WhatsAppContactButton
                  listingId={listing.id}
                  listingTitle={listing.title}
                  variant="compact"
                />
              )}
            </div>

            <div className="mt-4 sm:mt-6">
              {/* Informações adicionais para imóveis */}
              {listing.type === 'real-estate' ? (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-4">
                  {listing.bedrooms ? (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('detail.bedrooms')}</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.bedrooms}</p>
                    </div>
                  ) : null}
                  {listing.bathrooms ? (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('detail.bathrooms')}</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.bathrooms}</p>
                    </div>
                  ) : null}
                  {listing.area ? (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">{t('detail.area')}</p>
                      <p className="text-base sm:text-lg font-semibold">{listing.area}m²</p>
                    </div>
                  ) : null}
                  {listing.price ? (
                    <div className="bg-muted p-2.5 sm:p-3 rounded-lg">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {listing.realEstateType === 'rent' ? t('detail.rentPerMonth') : t('detail.price')}
                      </p>
                      <div className="text-base sm:text-lg font-semibold text-foreground">
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
                  ) : null}
                </div>
              ) : null}

              {!isOwner && listing.user_id ? (
                <ContactSellerChat
                  listingId={listing.id}
                  listingTitle={listing.title}
                  sellerId={listing.user_id}
                  currentUserId={user?.id || ""}
                  onLoginRequired={() => setShowLoginDialog(true)}
                />
              ) : null}

              {listing.user_id && (
                <div className="mt-4">
                  <RatingSystem
                    listingId={listing.id}
                    listingOwnerId={listing.user_id}
                    listingCategory={listing.category}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {listing && (
          <SimilarListings
            currentId={listing.id}
            category={listing.category}
            price={listing.price}
            currency={listing.currency}
            location={listing.location}
            title={listing.title}
            type={listing.type}
            subcategory={listing.subcategory}
            brand={getVehicleField("brand")}
            model={getVehicleField("model")}
            year={listing.year}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default ListingDetail;