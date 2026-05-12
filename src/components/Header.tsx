import { Button } from "@/components/ui/button";
import { Plus, LogIn, LogOut, Heart, MapPin, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import LanguageSelector from "@/components/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onLoginClick: () => void;
}

const Header = ({ onLoginClick }: HeaderProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Button asChild variant="ghost" size={mobile ? "lg" : "default"} className={mobile ? "w-full justify-start" : ""}>
        <Link to="/map" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
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
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-11 w-11">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-4 mt-8">
                <NavItems mobile />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
