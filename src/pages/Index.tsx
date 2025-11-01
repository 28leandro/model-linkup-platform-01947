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

const Index = () => {
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
        title: "Recherche vide",
        description: "Veuillez entrer un terme de recherche",
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
        title: "Aucun résultat",
        description: "Aucune annonce ne correspond à votre recherche",
        duration: 3000,
      });
    } else {
      toast({
        title: `${results.length} résultat(s)`,
        description: `${results.length} annonce(s) correspond(ent) à votre recherche`,
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

      <WhatsAppButton />

      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
};

export default Index;
