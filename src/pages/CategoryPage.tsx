import { useParams, Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Bike, Home, Building2, Trees, Wrench, Sparkles, Scissors, MoreHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import VehicleInfo from "@/components/VehicleInfo";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useMemo } from "react";
import type { Listing } from "@/store/listingsStore";
import { useLanguage } from "@/contexts/LanguageContext";
import ListingFilter, { SortOption, FilterOptions } from "@/components/ListingFilter";
import { getPublicCity } from "@/lib/utils";
import { getCategoryById } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";

const CATEGORY_SEO: Record<string, { title: string; description: string }> = {
  "vehicles": {
    title: "Vehículos en venta en Paraguay | NEMU.py",
    description: "Buscá autos, camionetas, motos y otros vehículos publicados en Paraguay. Compará opciones y contactá directamente con vendedores en NEMU.py.",
  },
  "real-estate": {
    title: "Inmuebles en Paraguay | Casas, terrenos y departamentos | NEMU.py",
    description: "Encontrá casas, departamentos, terrenos y propiedades en Paraguay. Explorá publicaciones actualizadas en NEMU.py.",
  },
  "real-estate-sale": {
    title: "Inmuebles en venta en Paraguay | NEMU.py",
    description: "Casas, departamentos y terrenos en venta en Paraguay. Publicaciones actualizadas en NEMU.py.",
  },
  "real-estate-rent": {
    title: "Inmuebles en alquiler en Paraguay | NEMU.py",
    description: "Casas, departamentos y propiedades en alquiler en Paraguay. Encontrá tu próximo hogar en NEMU.py.",
  },
  "services": {
    title: "Servicios en Paraguay | NEMU.py",
    description: "Descubrí servicios disponibles en Paraguay y contactá fácilmente con proveedores desde NEMU.py.",
  },
  "home-garden": {
    title: "Hogar y Jardín en Paraguay | NEMU.py",
    description: "Muebles, decoración y productos para el hogar y jardín en Paraguay. Encontrá lo que necesitás en NEMU.py.",
  },
  "tech": {
    title: "Tecnología en Paraguay | NEMU.py",
    description: "Celulares, computadoras, electrónica y tecnología en Paraguay. Compará y comprá en NEMU.py.",
  },
  "fashion": {
    title: "Moda en Paraguay | NEMU.py",
    description: "Ropa, calzado y accesorios en Paraguay. Publicaciones actualizadas en NEMU.py.",
  },
};

const CategoryPage = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const isPt = language === "pt";
  const [listings, setListings] = useState<Listing[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [filters, setFilters] = useState<FilterOptions>({
    sortOption: 'recent',
    fuelType: 'all',
  });
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'all' | 'auto' | 'moto'>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'all' | 'house' | 'apartment' | 'land'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'construction' | 'maintenance' | 'beauty' | 'other'>('all');
  const [otherServicesOpen, setOtherServicesOpen] = useState(false);
  
  const categoryMap: Record<string, { type: string, titleKey: string }> = {
    "vehicles": { type: "vehicles", titleKey: "category.vehicles" },
    "real-estate": { type: "real-estate", titleKey: "category.realEstate" },
    "real-estate-sale": { type: "real-estate", titleKey: "category.realEstateSale" },
    "real-estate-rent": { type: "real-estate", titleKey: "category.realEstateRent" },
    "services": { type: "services", titleKey: "category.services" },
    "home-garden": { type: "home-garden", titleKey: "category.homeGarden" },
    "tech": { type: "tech", titleKey: "category.tech" },
    "fashion": { type: "fashion", titleKey: "category.fashion" },
  };

  const category = categoryMap[id || "vehicles"] ?? { type: id || "", titleKey: "category.vehicles" };
  const meta = getCategoryById(id || "");
  const [subFilter, setSubFilter] = useState<string>(searchParams.get("sub") || "all");

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (subFilter && subFilter !== "all") next.set("sub", subFilter);
    else next.delete("sub");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subFilter]);

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings_public')
        .select('*');
      
      if (!error && data) {
        setListings(data as Listing[]);
      }
    };
    
    fetchListings();
  }, []);
  
  const categoryListings = listings.filter((listing) => 
    listing.type === category.type
  );

  // Apply filters and sort listings
  const sortedListings = useMemo(() => {
    let filtered = [...categoryListings];

    if (meta?.subcategories && subFilter !== "all") {
      filtered = filtered.filter((l: any) => l.subcategory === subFilter);
    }

    // Vehicle type filter (auto/moto) — only applies for vehicles category
    if (category.type === 'vehicles' && vehicleTypeFilter !== 'all') {
      filtered = filtered.filter(l => {
        const attrs = (l as any).attributes || {};
        const vt = attrs.vehicleType;
        const titleLower = (l.title || '').toLowerCase();
        const isMoto =
          vt === 'moto' ||
          !!attrs.motoType ||
          !!attrs.engineCC ||
          /\bmoto\b|motocicl|scooter/i.test(titleLower);
        return vehicleTypeFilter === 'moto' ? isMoto : !isMoto;
      });
    }

    // Property type filter — only applies for real-estate
    if (category.type === 'real-estate' && propertyTypeFilter !== 'all') {
      filtered = filtered.filter(l => {
        const attrs = (l as any).attributes || {};
        const pt = attrs.propertyType;
        const text = `${l.title || ''} ${l.description || ''}`.toLowerCase();
        if (propertyTypeFilter === 'house') return pt === 'house' || /\bcasa\b/.test(text);
        if (propertyTypeFilter === 'apartment') return pt === 'apartment' || /apartamento|departamento|\bdepto\b/.test(text);
        if (propertyTypeFilter === 'land') return pt === 'land' || /terreno|lote/.test(text);
        return true;
      });
    }

    // Service type filter — only applies for services
    if (category.type === 'services' && serviceTypeFilter !== 'all') {
      filtered = filtered.filter(l => {
        const text = `${l.title || ''} ${l.description || ''}`.toLowerCase();
        const construction = /construc|albañil|obra|reform|pintur|electric|plomer|fontaner/.test(text);
        const maintenance = /manteni|reparaci|limpiez|jardin|fumigaci|tecnic/.test(text);
        const beauty = /belleza|peluquer|barber|estetic|manicur|spa|masaj/.test(text);
        if (serviceTypeFilter === 'construction') return construction;
        if (serviceTypeFilter === 'maintenance') return maintenance;
        if (serviceTypeFilter === 'beauty') return beauty;
        if (serviceTypeFilter === 'other') return !construction && !maintenance && !beauty;
        return true;
      });
    }
    
    // Apply price filter
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(l => (l.price || 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(l => (l.price || 0) <= filters.maxPrice!);
    }
    
    // Apply year filter (if listing has year field)
    if (filters.minYear !== undefined) {
      filtered = filtered.filter(l => !(l as any).year || (l as any).year >= filters.minYear!);
    }
    if (filters.maxYear !== undefined) {
      filtered = filtered.filter(l => !(l as any).year || (l as any).year <= filters.maxYear!);
    }
    
    // Apply fuel type filter (if listing has fuelType field)
    if (filters.fuelType && filters.fuelType !== 'all') {
      filtered = filtered.filter(l => !(l as any).fuelType || (l as any).fuelType === filters.fuelType);
    }
    
    // Sort listings
    switch (sortOption) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      case 'price_asc':
        return filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'relevant':
        return filtered;
      default:
        return filtered;
    }
  }, [categoryListings, sortOption, filters, vehicleTypeFilter, propertyTypeFilter, serviceTypeFilter, category.type, subFilter, meta]);

  const seoEntry = CATEGORY_SEO[id || ""] ?? {
    title: "Categoría | NEMU.py",
    description: "Explorá publicaciones en NEMU.py, el marketplace de Paraguay para vehículos, inmuebles y servicios.",
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoEntry.title}
        description={seoEntry.description}
        canonical={`/category/${id || ""}`}
      />
      <header className="bg-background shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('common.backToHome')}
            </Link>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold mt-2">
            {category ? t(category.titleKey) : t('category.default')}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-4">
          <ListingFilter 
            sortOption={sortOption} 
            onSortChange={setSortOption}
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {category.type === 'real-estate' && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant={propertyTypeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setPropertyTypeFilter('all')}>Todos</Button>
            <Button variant={propertyTypeFilter === 'house' ? 'default' : 'outline'} size="sm" onClick={() => setPropertyTypeFilter('house')} className="gap-2">
              <Home className="h-4 w-4" /> Casa
            </Button>
            <Button variant={propertyTypeFilter === 'apartment' ? 'default' : 'outline'} size="sm" onClick={() => setPropertyTypeFilter('apartment')} className="gap-2">
              <Building2 className="h-4 w-4" /> Apartamento
            </Button>
            <Button variant={propertyTypeFilter === 'land' ? 'default' : 'outline'} size="sm" onClick={() => setPropertyTypeFilter('land')} className="gap-2">
              <Trees className="h-4 w-4" /> Terreno
            </Button>
          </div>
        )}

        {category.type === 'services' && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant={serviceTypeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setServiceTypeFilter('all')}>Todos</Button>
            <Button variant={serviceTypeFilter === 'construction' ? 'default' : 'outline'} size="sm" onClick={() => setServiceTypeFilter('construction')} className="gap-2">
              <Wrench className="h-4 w-4" /> Construcción
            </Button>
            <Button variant={serviceTypeFilter === 'maintenance' ? 'default' : 'outline'} size="sm" onClick={() => setServiceTypeFilter('maintenance')} className="gap-2">
              <Sparkles className="h-4 w-4" /> Mantenimiento
            </Button>
            <Button variant={serviceTypeFilter === 'beauty' ? 'default' : 'outline'} size="sm" onClick={() => setServiceTypeFilter('beauty')} className="gap-2">
              <Scissors className="h-4 w-4" /> Belleza
            </Button>
            <Sheet open={otherServicesOpen} onOpenChange={setOtherServicesOpen}>
              <SheetTrigger asChild>
                <Button
                  variant={serviceTypeFilter === 'other' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setServiceTypeFilter('other'); setOtherServicesOpen(true); }}
                  className="gap-2"
                >
                  <MoreHorizontal className="h-4 w-4" /> Otros
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[360px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Otros servicios</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-1">
                  {[
                    "Clases particulares","Cuidado de niños","Cuidado de ancianos","Paseo de mascotas",
                    "Veterinaria a domicilio","Fotografía","Diseño gráfico","Diseño web","Marketing digital",
                    "Asesoría contable","Asesoría legal","Traducciones","Mudanzas","Fletes","Cerrajería",
                    "Costura y arreglos","Catering","Decoración de eventos","DJ y sonido","Animación de fiestas",
                    "Enfermería a domicilio","Masajes","Entrenamiento personal","Lavado de autos","Limpieza de tapizados",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setOtherServicesOpen(false)}
                      className="text-left text-sm px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {meta?.subcategories && (
          <div className="mb-4 flex gap-2 overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 snap-x snap-mandatory pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Button
              variant={subFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSubFilter("all")}
              className="snap-start shrink-0 rounded-full"
            >
              Todas
            </Button>
            {meta.subcategories.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <Button
                  key={sub.id}
                  variant={subFilter === sub.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSubFilter(sub.id)}
                  className="snap-start shrink-0 rounded-full gap-2"
                >
                  {SubIcon && <SubIcon className="h-4 w-4" />}
                  {isPt ? sub.label_pt : sub.label_es}
                </Button>
              );
            })}
          </div>
        )}

        {sortedListings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-muted-foreground text-sm sm:text-base">{t('common.noListingsInCategory')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-md transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <Link to={`/listing/${listing.id}`}>
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={listing.images[0] || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&q=80"}
                        alt={listing.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2">{listing.title}</h3>
                      <ListingRatingBadge listingId={listing.id} category={(listing as any).category ?? (listing as any).type} className="mb-1" />
                      <div className="mb-2">
                        <VehicleInfo
                          year={(listing as any).year}
                          mileage={(listing as any).mileage ?? (listing as any).attributes?.mileage}
                          fuelType={(listing as any).fuel_type ?? (listing as any).fuelType}
                        />
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-1">{getPublicCity(listing)}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;