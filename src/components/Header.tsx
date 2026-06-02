import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, Heart, MapPin, LayoutDashboard, Search, User, Settings } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [desktopQuery, setDesktopQuery] = useState("");
  const debounceRef = useRef<number | null>(null);

  // Debounced global search dispatch (Le Bon Coin-style instant search, desktop only)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("global-search", { detail: desktopQuery }));
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [desktopQuery]);

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
      <Button
        size={mobile ? "lg" : "default"}
        variant="outline"
        className={`flex items-center gap-2 transition-colors bg-transparent border-lime-600 text-lime-700 dark:text-lime-300 dark:border-lime-500 hover:bg-lime-600 hover:text-white hover:border-lime-600 dark:hover:bg-lime-500 dark:hover:text-white ${mobile ? "w-full justify-start" : ""}`}
        onClick={() => {
          setMobileMenuOpen(false);
          if (user) {
            navigate("/post-ad");
          } else {
            onLoginClick();
          }
        }}
      >
        <Plus className="w-4 h-4" />
        {t('header.postAd')}
      </Button>
      {!user && (
        <Button 
          variant="ghost"
          size={mobile ? "lg" : "default"}
          className={`flex items-center gap-2 transition-colors hover:bg-secondary hover:text-secondary-foreground ${mobile ? "w-full justify-start" : ""}`}
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
          <div className="flex items-center gap-2">
            <div className="relative w-56 lg:w-72">
              <Input
                type="search"
                inputMode="search"
                value={desktopQuery}
                onChange={(e) => setDesktopQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    window.dispatchEvent(new CustomEvent("global-search", { detail: desktopQuery }));
                  }
                }}
                placeholder={t("search.placeholder")}
                className="h-10 px-4 rounded-full bg-muted/60 border-0 focus-visible:ring-1 focus-visible:ring-ring"
                aria-label={t("nav.search")}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-full shrink-0 transition-colors bg-transparent border-lime-600 text-lime-700 dark:text-lime-300 dark:border-lime-500 hover:bg-lime-600 hover:text-white hover:border-lime-600 dark:hover:bg-lime-500 dark:hover:text-white"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("global-search", { detail: desktopQuery }))
              }
              aria-label={t("search.button")}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <LanguageSelector />
          <NavItems />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Menú de usuario">
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
                <DropdownMenuItem onClick={() => navigate("/my-listings")}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Mis Anuncios
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Mi Cuenta
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
