import { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { useListingsStore } from "@/store/listingsStore";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import ServiceCategories from "@/components/ServiceCategories";
import SearchResults from "@/components/SearchResults";
import RecentListings from "@/components/RecentListings";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const listings = useListingsStore((state) => state.listings);
  const [filteredListings, setFilteredListings] = useState(listings);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    setFilteredListings(listings);
  }, [listings]);

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

    const results = listings.filter((listing) => {
      const titleMatch = listing.title.toLowerCase().includes(query);
      const locationMatch = listing.location.toLowerCase().includes(query);
      const categoryMatch = listing.category.toLowerCase().includes(query);
      const descriptionMatch = listing.description?.toLowerCase().includes(query) || false;

      return titleMatch || locationMatch || categoryMatch || descriptionMatch;
    });

    setFilteredListings(results);

    if (results.length === 0) {
      toast({
        title: t('search.noResults'),
        description: t('search.noResultsDesc'),
        duration: 3000,
      });
    } else {
      toast({
        title: `${results.length} ${t('search.results')}`,
        description: `${results.length} ${t('search.resultsDesc')}`,
        duration: 3000,
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />
      
      {/* Hero Section com Imagem */}
      {!hasSearched && (
        <div className="relative h-[400px] bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
              alt="Clasificados Paraguay"
              className="w-full h-full object-cover opacity-20"
            />
          </div>
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('categories.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl">
              {t('search.placeholder')}
            </p>
          </div>
        </div>
      )}
      
      <SearchBar
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {!hasSearched && <ServiceCategories />}

      {hasSearched && <SearchResults listings={filteredListings} />}

      {!hasSearched && <RecentListings listings={filteredListings} />}

      <WhatsAppButton />

      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
};

export default Index;
