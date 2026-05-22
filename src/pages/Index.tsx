import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useListingsStore } from "@/store/listingsStore";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import ServiceCategories from "@/components/ServiceCategories";
import HeroCarousel from "@/components/HeroCarousel";
import SearchResults from "@/components/SearchResults";
import RecentListings from "@/components/RecentListings";
import RecentlyViewedCarousel from "@/components/RecentlyViewedCarousel";
import Footer from "@/components/Footer";
import StoreBadgesBar from "@/components/StoreBadgesBar";
import ListingFilter, { SortOption, FilterOptions, FuelType } from "@/components/ListingFilter";
import LocationFilter, { LocationFilterValue } from "@/components/LocationFilter";
import { distanceKm, CITY_COORDS } from "@/lib/cityCoords";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import MobileSearchDialog from "@/components/MobileSearchDialog";
import { CATEGORIES } from "@/lib/categories";

const Index = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [allListings, setAllListings] = useState<any[]>([]);
  const [filteredListings, setFilteredListings] = useState<any[]>([]);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [filters, setFilters] = useState<FilterOptions>({
    sortOption: 'recent',
    fuelType: 'all',
  });
  const [locationFilter, setLocationFilter] = useState<LocationFilterValue>(() => {
    const city = searchParams.get("city") || undefined;
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const radius = searchParams.get("radius");
    const coords = city ? CITY_COORDS[city] : undefined;
    return {
      city,
      lat: lat ? Number(lat) : coords?.lat,
      lon: lon ? Number(lon) : coords?.lon,
      radiusKm: radius ? Number(radius) : 0,
    };
  });
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Open mobile search via bottom-nav event or URL param
  useEffect(() => {
    const handler = () => setMobileSearchOpen(true);
    window.addEventListener("open-mobile-search", handler);
    if (searchParams.get("search") === "1") {
      setMobileSearchOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("search");
      setSearchParams(next, { replace: true });
    }
    return () => window.removeEventListener("open-mobile-search", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Global instant search (from mobile header input)
  useEffect(() => {
    const handler = (e: Event) => {
      const q = ((e as CustomEvent).detail ?? "") as string;
      setSearchQuery(q);
      handleSearch(q);
    };
    window.addEventListener("global-search", handler as EventListener);
    return () => window.removeEventListener("global-search", handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allListings, userLocation]);

  // Sync location filter to URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (locationFilter.city) next.set("city", locationFilter.city);
    else next.delete("city");
    if (locationFilter.lat !== undefined) next.set("lat", String(locationFilter.lat));
    else next.delete("lat");
    if (locationFilter.lon !== undefined) next.set("lon", String(locationFilter.lon));
    else next.delete("lon");
    if (locationFilter.radiusKm) next.set("radius", String(locationFilter.radiusKm));
    else next.delete("radius");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilter]);

  useEffect(() => {
    // Try IP-based geolocation (no permission needed, works everywhere)
    const getLocationByIP = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeout);
        if (response.ok) {
          const data = await response.json();
          if (data.latitude && data.longitude) {
            setUserLocation({ lat: data.latitude, lon: data.longitude });
          }
        }
      } catch {
        // IP geolocation unavailable - silent fallback
      }
    };

    // Try browser geolocation first, fallback to IP
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Browser geolocation denied/failed, try IP-based
          getLocationByIP();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    } else {
      getLocationByIP();
    }

    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings_public')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching listings:', error);
      } else if (data) {
        // Convert backend data to match the Listing interface
        const formattedListings = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          category: item.category || item.type,
          rating: item.rating || 0,
          location: item.location,
          phone: item.phone,
          images: item.images || [],
          latitude: item.latitude,
          longitude: item.longitude,
          price: item.price,
          currency: item.currency,
          year: item.year,
          fuelType: item.fuel_type,
          fuel_type: item.fuel_type,
          mileage: item.attributes?.mileage,
          attributes: item.attributes,
          created_at: item.created_at,
        }));
        setAllListings(formattedListings);
        setFilteredListings(formattedListings);
      }
    };
    
    fetchListings();
  }, []);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearch = (overrideQuery?: string) => {
    const query = (overrideQuery ?? searchQuery).trim().toLowerCase();
    if (!query) {
      setHasSearched(false);
      setFilteredListings(allListings);
      return;
    }
    setHasSearched(true);

    // Match query against category/subcategory ids and localized labels
    const matchedCategoryIds = new Set<string>();
    const matchedSubcategoryIds = new Set<string>();
    for (const cat of CATEGORIES) {
      if (
        cat.id.toLowerCase().includes(query) ||
        cat.type.toLowerCase().includes(query) ||
        cat.label_es.toLowerCase().includes(query) ||
        cat.label_pt.toLowerCase().includes(query)
      ) {
        matchedCategoryIds.add(cat.id);
        matchedCategoryIds.add(cat.type);
      }
      cat.subcategories?.forEach((s) => {
        if (
          s.id.toLowerCase().includes(query) ||
          s.label_es.toLowerCase().includes(query) ||
          s.label_pt.toLowerCase().includes(query)
        ) {
          matchedSubcategoryIds.add(s.id);
          matchedCategoryIds.add(cat.id);
          matchedCategoryIds.add(cat.type);
        }
      });
    }

    let results = allListings.filter((listing) => {
      const titleMatch = listing.title.toLowerCase().includes(query);
      const locationMatch = listing.location?.toLowerCase().includes(query);
      const categoryMatch = listing.category?.toLowerCase().includes(query);
      const descriptionMatch = listing.description?.toLowerCase().includes(query) || false;
      const typeMatch = listing.type?.toLowerCase().includes(query);
      const subMatch = listing.subcategory?.toLowerCase().includes(query);
      const catIdMatch =
        (listing.category && matchedCategoryIds.has(listing.category)) ||
        (listing.type && matchedCategoryIds.has(listing.type));
      const subIdMatch = listing.subcategory && matchedSubcategoryIds.has(listing.subcategory);

      return (
        titleMatch ||
        locationMatch ||
        categoryMatch ||
        descriptionMatch ||
        typeMatch ||
        subMatch ||
        catIdMatch ||
        subIdMatch
      );
    });

    // Sort by proximity if user location is available
    if (userLocation && results.length > 0) {
      results = results
        .filter((listing) => listing.latitude && listing.longitude)
        .map((listing) => ({
          ...listing,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lon,
            listing.latitude!,
            listing.longitude!
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    setFilteredListings(results);

    if (results.length === 0) {
      toast({
        title: t('search.noResults'),
        description: t('search.noResultsDesc'),
        duration: 3000,
      });
    } else {
      const message = userLocation 
        ? `${results.length} ${t('search.resultsDesc')} (${t('search.sortedByProximity')})`
        : `${results.length} ${t('search.resultsDesc')}`;
      toast({
        title: `${results.length} ${t('search.results')}`,
        description: message,
        duration: 3000,
      });
    }
  };

  // Apply filters and sort listings
  const sortedListings = useMemo(() => {
    let listings = hasSearched ? filteredListings : allListings;
    
    // Apply location/radius filter
    if (locationFilter.lat !== undefined && locationFilter.lon !== undefined && locationFilter.radiusKm > 0) {
      listings = listings.filter((l) => {
        if (!l.latitude || !l.longitude) return false;
        return (
          distanceKm(locationFilter.lat!, locationFilter.lon!, l.latitude, l.longitude) <=
          locationFilter.radiusKm
        );
      });
    }

    // Apply price filter
    if (filters.minPrice !== undefined) {
      listings = listings.filter(l => (l.price || 0) >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      listings = listings.filter(l => (l.price || 0) <= filters.maxPrice!);
    }
    
    // Apply year filter (if listing has year field)
    if (filters.minYear !== undefined) {
      listings = listings.filter(l => !l.year || l.year >= filters.minYear!);
    }
    if (filters.maxYear !== undefined) {
      listings = listings.filter(l => !l.year || l.year <= filters.maxYear!);
    }
    
    // Apply fuel type filter (if listing has fuelType field)
    if (filters.fuelType && filters.fuelType !== 'all') {
      listings = listings.filter(l => !l.fuelType || l.fuelType === filters.fuelType);
    }
    
    // Sort listings
    const sorted = [...listings];
    switch (sortOption) {
      case 'recent':
        return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      case 'price_asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'relevant':
        return listings;
      default:
        return sorted;
    }
  }, [filteredListings, allListings, hasSearched, sortOption, filters, locationFilter]);

  return (
    <div className="min-h-screen">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />

      <div className="container mx-auto px-3 sm:px-4 pt-4">
        <LocationFilter
          value={locationFilter}
          onChange={setLocationFilter}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={() => handleSearch()}
        />
      </div>

      {!hasSearched && <ServiceCategories />}

      {!hasSearched && <HeroCarousel />}

      {!hasSearched && <RecentlyViewedCarousel />}

      <div className="container mx-auto px-3 sm:px-4 py-4">
        <ListingFilter
          sortOption={sortOption}
          onSortChange={setSortOption}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      <div className="container mx-auto px-3 sm:px-4">
        {hasSearched ? (
          <SearchResults listings={sortedListings} />
        ) : (
          <RecentListings listings={sortedListings} />
        )}
      </div>

      <LoginDialog
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
      <MobileSearchDialog
        open={mobileSearchOpen}
        onOpenChange={setMobileSearchOpen}
        initialValue={searchQuery}
        onSubmit={(q) => {
          setSearchQuery(q);
          handleSearch(q);
        }}
      />
      <StoreBadgesBar />
      <Footer />
    </div>
  );
};

export default Index;
