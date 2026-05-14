import { Link, useLocation } from "react-router-dom";
import { Home, Search, Plus, MessageCircle, Menu, FolderOpen, Settings } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Heart, MapPin } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { LoginDialog } from "@/components/LoginDialog";

const BottomNav = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const focusSearch = () => {
    const el = document.querySelector<HTMLInputElement>('input[type="text"], input:not([type])');
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus(), 300);
    }
  };

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors ${
      active ? "text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Bottom navigation"
      >
        <div className="flex items-stretch justify-around h-full px-2">
          <Link to="/" className={itemClass(isActive("/"))} aria-label={t("header.home") || "Início"}>
            <Home className="h-5 w-5" />
            <span>{t("nav.home")}</span>
          </Link>

          {location.pathname === "/" ? (
            <button onClick={focusSearch} className={itemClass(false)} aria-label={t("nav.search")}>
              <Search className="h-5 w-5" />
              <span>{t("nav.search")}</span>
            </button>
          ) : (
            <Link to="/" className={itemClass(false)} aria-label={t("nav.search")}>
              <Search className="h-5 w-5" />
              <span>{t("nav.search")}</span>
            </Link>
          )}

          {/* Centered highlighted Anunciar */}
          <div className="flex-1 flex items-start justify-center">
            <Link
              to={user ? "/post-ad" : "#"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  setLoginOpen(true);
                }
              }}
              aria-label={t("nav.postAd")}
              className="-mt-5 flex flex-col items-center justify-center"
            >
              <span className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center ring-4 ring-background">
                <Plus className="h-6 w-6" />
              </span>
              <span className="mt-0.5 text-[10px] font-medium text-primary">
                {t("nav.postAd")}
              </span>
            </Link>
          </div>

          <Link to="/inbox" className={itemClass(isActive("/inbox"))} aria-label={t("nav.chat")}>
            <MessageCircle className="h-5 w-5" />
            <span>{t("nav.chat")}</span>
          </Link>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className={itemClass(false)} aria-label={t("nav.menu")}>
                <Menu className="h-5 w-5" />
                <span>{t("nav.menu")}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-3 mt-8">
                <LanguageSelector />
                <Button asChild variant="ghost" size="lg" className="w-full justify-start">
                  <Link to="/map" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {t("header.map")}
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="w-full justify-start">
                  <Link to="/favorites" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-accent fill-accent" />
                    {t("header.favorites")}
                  </Link>
                </Button>
                {user && (
                  <>
                    <Button asChild variant="ghost" size="lg" className="w-full justify-start">
                      <Link to="/my-listings" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4" />
                        {t("nav.manageAds")}
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="w-full justify-start">
                      <Link to="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {t("nav.accountSettings")}
                      </Link>
                    </Button>
                  </>
                )}
                {user ? (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full justify-start flex items-center gap-2"
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("auth.logout")}
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full justify-start flex items-center gap-2"
                    onClick={() => {
                      setMenuOpen(false);
                      setLoginOpen(true);
                    }}
                  >
                    <LogIn className="w-4 h-4" />
                    {t("header.login")}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

export default BottomNav;