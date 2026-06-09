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
import { useUnreadMessages } from "@/hooks/useUnreadMessages";

const BottomNav = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const unreadCount = useUnreadMessages();

  // If we're viewing a listing, focus the map on that listing
  const listingMatch = location.pathname.match(/^\/listing\/([^/]+)/);
  const mapHref = listingMatch ? `/map?focus=${listingMatch[1]}` : "/map";

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent("open-mobile-search"));
  };

  const itemClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors rounded-md mx-0.5 active:bg-accent active:text-accent-foreground ${
      active ? "text-primary" : "text-foreground"
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
            <Home className="h-6 w-6" />
            <span>{t("nav.home")}</span>
          </Link>

          <button
            onClick={() => {
              if (location.pathname !== "/") {
                // Navigate then dispatch after route is rendered
                window.location.href = "/?search=1";
              } else {
                openSearch();
              }
            }}
            className={itemClass(false)}
            aria-label={t("nav.search")}
          >
            <Search className="h-6 w-6" />
            <span>{t("nav.search")}</span>
          </button>

          <Link
            to={user ? "/post-ad" : "#"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                setLoginOpen(true);
              }
            }}
            aria-label={t("nav.postAd")}
            className={itemClass(isActive("/post-ad"))}
          >
            <span className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary text-primary-foreground">
              <Plus className="h-5 w-5" />
            </span>
            <span>{t("nav.postAd")}</span>
          </Link>

          <Link to="/inbox" className={itemClass(isActive("/inbox"))} aria-label={t("nav.chat")}>
            <span className="relative">
              <MessageCircle className="h-6 w-6" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center leading-none"
                  aria-label={`${unreadCount} mensagens não lidas`}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </span>
            <span>{t("nav.chat")}</span>
          </Link>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button className={itemClass(false)} aria-label={t("nav.menu")}>
                <Menu className="h-6 w-6" />
                <span>{t("nav.menu")}</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-3 mt-8">
                <LanguageSelector />
                <Button asChild variant="ghost" size="lg" className="w-full justify-start">
                  <Link to={mapHref} onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
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
                  variant="outline"
                  size="lg"
                  className="w-full justify-start flex items-center gap-2 bg-transparent text-foreground border-input transition-colors hover:bg-primary hover:text-primary-foreground hover:border-primary"
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