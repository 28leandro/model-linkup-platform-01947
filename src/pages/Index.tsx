import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useListingsStore } from "@/store/listingsStore";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ServiceCategories from "@/components/ServiceCategories";
import SearchResults from "@/components/SearchResults";
import RecentListings from "@/components/RecentListings";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const listings = useListingsStore((state) => state.listings);
  const [filteredListings, setFilteredListings] = useState(listings);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
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
          rating: item.rating || 5,
          location: item.location,
          phone: item.phone,
          images: item.images || [],
          latitude: item.latitude,
          longitude: item.longitude,
        }));
        setFilteredListings(formattedListings);
      }
    };
    
    fetchListings();
    setFilteredListings(listings);
  }, [listings]);

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
      setFilteredListings(listings);
      toast({
        title: t('search.emptyTitle'),
        description: t('search.emptyDesc'),
        duration: 3000,
      });
      return;
    }

    let results = listings.filter((listing) => {
      const titleMatch = listing.title.toLowerCase().includes(query);
      const locationMatch = listing.location.toLowerCase().includes(query);
      const categoryMatch = listing.category.toLowerCase().includes(query);
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
        ? `${results.length} ${t('search.resultsDesc')} (ordenados por proximidade)`
        : `${results.length} ${t('search.resultsDesc')}`;
      toast({
        title: `${results.length} ${t('search.results')}`,
        description: message,
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />
      
      <SearchBar 
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {!hasSearched && <ServiceCategories />}

      {hasSearched && <SearchResults listings={filteredListings} />}

      {!hasSearched && <RecentListings listings={filteredListings} />}

      <LoginDialog
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
};

export default Index;
