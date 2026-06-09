import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listingId);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const hasImages = images && images.length > 0;
  const slides = hasImages ? images : [FALLBACK];

  const handleHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectClassName)}>
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((src, idx) => (
            <div key={idx} className="relative min-w-0 flex-[0_0_100%] h-full">
              <Link to={href} className="block w-full h-full" draggable={false}>
                {hasImages ? (
                  <img
                    src={src}
                    alt={`${title} - foto ${idx + 1}`}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover select-none"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    {noImageLabel}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

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

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-1.5 left-0 right-0 z-10 flex justify-center gap-1 pointer-events-none">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={cn(
                "h-1.5 rounded-full transition-all",
                idx === selectedIndex
                  ? "w-1.5 bg-white"
                  : "w-1.5 bg-white/60"
              )}
              style={{ boxShadow: "0 0 2px rgba(0,0,0,0.5)" }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingImageCarousel;