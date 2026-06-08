import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";

const RecentlyViewedCarousel = () => {
  const { items, clear } = useRecentlyViewed();
  const { t } = useLanguage();
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const scrollBy = (delta: number) => {
    scrollerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          {t("listings.recentlyViewed")}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={clear}
          >
            <X className="w-3.5 h-3.5 mr-1" />
            {t("listings.clear")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8"
            onClick={() => scrollBy(-320)}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hidden sm:inline-flex h-8 w-8"
            onClick={() => scrollBy(320)}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin]"
      >
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/listing/${item.id}`}
            className="group shrink-0 w-[150px] sm:w-[180px] snap-start bg-card rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
          >
            <div className="aspect-[4/3] bg-muted overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  {t("listings.noImage")}
                </div>
              )}
            </div>
            <div className="p-2">
              <p className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight min-h-[2.25rem]">
                {item.title}
              </p>
              {item.price && item.price > 0 && (
                <p className="text-neutral-900 dark:text-neutral-100 font-semibold text-xs sm:text-sm mt-1">
                  {formatPrice(item.price, item.currency)}
                </p>
              )}
              {item.location && (
                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                  {item.location}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedCarousel;