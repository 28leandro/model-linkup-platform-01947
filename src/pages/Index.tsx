import { useState, useEffect, useMemo } from "react";
import { toast } from "@/components/ui/use-toast";
import { useListingsStore } from "@/store/listingsStore";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ServiceCategories from "@/components/ServiceCategories";
import SearchResults from "@/components/SearchResults";
import RecentListings from "@/components/RecentListings";
import Footer from "@/components/Footer";
import ListingFilter, { SortOption, FilterOptions, FuelType } from "@/components/ListingFilter";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { t } = useLanguage();
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

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    setHasSearched(true);
    
    if (!query) {
      setFilteredListings(allListings);
      toast({
        title: t('search.emptyTitle'),
        description: t('search.emptyDesc'),
        duration: 3000,
      });
      return;
    }

    let results = allListings.filter((listing) => {
      const titleMatch = listing.title.toLowerCase().includes(query);
      const locationMatch = listing.location?.toLowerCase().includes(query);
      const categoryMatch = listing.category?.toLowerCase().includes(query);
      const descriptionMatch = listing.description?.toLowerCase().includes(query) || false;

      return titleMatch || locationMatch || categoryMatch || descriptionMatch;
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
  }, [filteredListings, allListings, hasSearched, sortOption, filters]);

  return (
    <div className="min-h-screen">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
      />

      <div className="container mx-auto px-3 sm:px-4 py-4">
        <ListingFilter 
          sortOption={sortOption} 
          onSortChange={setSortOption}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>

      {!hasSearched && <ServiceCategories />}

      {hasSearched && <SearchResults listings={sortedListings} />}

      {!hasSearched && <RecentListings listings={sortedListings} />}

      <LoginDialog
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
      <Footer />
    </div>
  );
};

export default Index;
