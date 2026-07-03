import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";

interface ListingImageCarouselProps {
  listingId: string;
  images: string[];
  title: string;
  href: string;
  aspectClassName?: string;
  noImageLabel: string;
  priority?: boolean;
}

const FALLBACK =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80";

const ListingImageCarousel = ({
  listingId,
  images,
  title,
  href,
  aspectClassName = "aspect-square lg:aspect-[3/4]",
  noImageLabel,
  priority = false,
}: ListingImageCarouselProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listingId);

  const hasImages = images && images.length > 0;
  const cover = hasImages ? images[0] : FALLBACK;

  const handleHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted group", aspectClassName)}>
      {hasImages ? (
        <Link to={href} className="absolute inset-0 block" draggable={false}>
          <motion.img
            layoutId={`listing-image-${listingId}`}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            src={cover}
            alt={title}
            width={600}
            height={600}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="w-full h-full object-cover select-none transition-transform duration-500 ease-out group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK;
            }}
          />
        </Link>
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
    </div>
  );
};

export default ListingImageCarousel;