import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, Heart, MapPin, LayoutDashboard, Search } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileQuery, setMobileQuery] = useState("");
  const debounceRef = useRef<number | null>(null);

  // Debounced global search dispatch (Le Bon Coin-style instant search)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("global-search", { detail: mobileQuery }));
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [mobileQuery]);

  // If we're viewing a listing, focus the map on that listing
  const listingMatch = location.pathname.match(/^\/listing\/([^/]+)/);
  const mapHref = listingMatch ? `/map?focus=${listingMatch[1]}` : "/map";

  const handleManageListings = () => {
    if (user) {
      navigate("/my-listings");
    } else {
      onLoginClick();
    }
  };

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Button asChild variant="ghost" size={mobile ? "lg" : "default"} className={mobile ? "w-full justify-start" : ""}>
        <Link to={mapHref} className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <MapPin className="w-4 h-4" />
          {t('header.map')}
        </Link>
      </Button>
      <Button asChild variant="ghost" size={mobile ? "lg" : "default"} className={mobile ? "w-full justify-start" : ""}>
        <Link to="/favorites" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <Heart className="w-4 h-4 text-accent fill-accent" />
          {t('header.favorites')}
        </Link>
      </Button>
      {user && (
        <Button asChild size={mobile ? "lg" : "default"} className={mobile ? "w-full justify-start" : ""}>
          <Link to="/post-ad" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <Plus className="w-4 h-4" />
            {t('header.postAd')}
          </Link>
        </Button>
      )}
      {user ? (
        <Button 
          variant="default" 
          size={mobile ? "lg" : "default"}
          className={`flex items-center gap-2 ${mobile ? "w-full justify-start" : ""}`}
          onClick={() => {
            signOut();
            setMobileMenuOpen(false);
          }}
        >
          <LogOut className="w-4 h-4" />
          {t('auth.logout')}
        </Button>
      ) : (
        <Button 
          variant="default" 
          size={mobile ? "lg" : "default"}
          className={`flex items-center gap-2 ${mobile ? "w-full justify-start" : ""}`}
          onClick={() => {
            onLoginClick();
            setMobileMenuOpen(false);
          }}
        >
          <LogIn className="w-4 h-4" />
          {t('header.login')}
        </Button>
      )}
    </>
  );

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4">
          <LanguageSelector />
          <NavItems />
          <Button
            variant="outline"
            size="default"
            onClick={handleManageListings}
            className="hidden md:inline-flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Mis Anuncios
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2 flex-1 justify-end max-w-[60%]">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              inputMode="search"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.dispatchEvent(new CustomEvent("global-search", { detail: mobileQuery }));
                }
              }}
              placeholder={t("search.placeholder")}
              className="h-10 pl-9 pr-3 rounded-full bg-muted/60 border-0 text-base focus-visible:ring-1 focus-visible:ring-ring"
              aria-label={t("nav.search")}
            />
          </div>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
