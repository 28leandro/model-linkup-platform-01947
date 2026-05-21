import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, Heart, MapPin } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  // If we're viewing a listing, focus the map on that listing
  const listingMatch = location.pathname.match(/^\/listing\/([^/]+)/);
  const mapHref = listingMatch ? `/map?focus=${listingMatch[1]}` : "/map";

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
