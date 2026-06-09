import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

interface ListingImageCarouselProps {
  listingId: string;
  images: string[];
  title: string;
  href: string;
  aspectClassName?: string;
  noImageLabel: string;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80";

const ListingImageCarousel = ({
  listingId,
  images,
  title,
  href,
  aspectClassName = "aspect-square lg:aspect-video",
  noImageLabel,
}: ListingImageCarouselProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listingId);

  const hasImages = images && images.length > 0;
  const slides = hasImages ? images : [FALLBACK];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const handleHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectClassName)}>
      {hasImages ? (
        <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((src, i) => (
              <div key={i} className="relative min-w-0 flex-[0_0_100%] h-full">
                <Link to={href} className="block w-full h-full" draggable={false}>
                  <img
                    src={src}
                    alt={`${title} ${i + 1}`}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK;
                    }}
                  />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Link to={href} className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
          {noImageLabel}
        </Link>
      )}

      {/* Floating heart, no container */}
      <button
        type="button"
        onClick={handleHeart}
        aria-label="favorite"
        className="absolute top-2 right-2 z-10 p-1"
      >
        <Heart
          className={cn(
            "w-6 h-6 transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]",
            favorite
              ? "fill-red-500 text-red-500 opacity-100"
              : "text-white opacity-70 fill-black/20"
          )}
          strokeWidth={2}
        />
      </button>

      {hasImages && slides.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-1 pointer-events-none">
          {slides.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-all",
                i === selectedIndex ? "bg-white" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingImageCarousel;