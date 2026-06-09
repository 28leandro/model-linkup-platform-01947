import { Link } from "react-router-dom";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import ListingImageCarousel from "@/components/ListingImageCarousel";

const RecentlyViewedCarousel = () => {
  const { items, clear } = useRecentlyViewed();
  const { t } = useLanguage();

  if (items.length === 0) return null;

  return (
    <section className="container mx-auto px-2 sm:px-3 py-6 sm:py-8">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-light tracking-tight flex items-center gap-2">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          {t("listings.recentlyViewed")}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={clear}
        >
          <X className="w-3.5 h-3.5 mr-1" />
          {t("listings.clear")}
        </Button>
      </div>

      <div className="flex lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none scroll-smooth -mx-2 sm:-mx-3 px-2 sm:px-3 lg:mx-0 lg:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-transparent rounded-xl overflow-hidden shrink-0 w-[44%] sm:w-[38%] md:w-[30%] snap-start lg:w-auto lg:shrink"
          >
            <div className="rounded-xl overflow-hidden">
              <ListingImageCarousel
                listingId={item.id}
                images={item.image ? [item.image] : []}
                title={item.title}
                href={`/listing/${item.id}`}
                noImageLabel={t("listings.noImage")}
              />
            </div>
            <Link to={`/listing/${item.id}`} className="block">
              <div className="pt-2 sm:pt-2.5 px-0.5">
                <h3 className="font-normal text-sm sm:text-base mb-0.5 line-clamp-1 text-foreground">
                  {item.title}
                </h3>
                {item.price && item.price > 0 && (
                  <p className="text-foreground font-semibold text-sm lg:text-base mb-0.5">
                    {formatPrice(item.price, item.currency)}
                  </p>
                )}
                {item.location && (
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 font-light">
                    {item.location}
                  </p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedCarousel;