import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useIsMobile } from "@/hooks/use-mobile";
import { useListingModal } from "@/contexts/ListingModalContext";
import AdaptiveImage from "@/components/AdaptiveImage";
import type { Listing } from "@/store/listingsStore";

interface ListingImageCarouselProps {
  listingId: string;
  images: string[];
  title: string;
  href: string;
  aspectClassName?: string;
  noImageLabel: string;
  priority?: boolean;
  /** Full listing snapshot; when provided AND on mobile, tapping the
   *  card opens the in-app modal instead of navigating to a new page. */
  listing?: Listing | null;
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
  listing,
}: ListingImageCarouselProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isMobile = useIsMobile();
  const { open } = useListingModal();
  const favorite = isFavorite(listingId);

  const hasImages = images && images.length > 0;
  const cover = hasImages ? images[0] : FALLBACK;

  const handleHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  // On mobile: intercept the click, open the modal via local state.
  // On desktop or when we don't have the full listing: fall through to
  // Link navigation (works for deep-linking and back/forward buttons).
  const handleNavigate = (e: React.MouseEvent) => {
    if (isMobile && listing) {
      e.preventDefault();
      e.stopPropagation();
      open(listing);
    }
  };

  return (
    <motion.div
      layoutId={listing ? `listing-card-${listingId}` : undefined}
      className={cn("relative overflow-hidden bg-muted group", aspectClassName)}
    >
      {hasImages ? (
        <Link
          to={href}
          onClick={handleNavigate}
          className="absolute inset-0 block"
          draggable={false}
        >
          <AdaptiveImage
            src={cover}
            alt={title}
            priority={priority}
            width={600}
            height={600}
            draggable={false}
            className="w-full h-full object-cover select-none transition-transform duration-500 ease-out group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK;
            }}
          />
        </Link>
      ) : (
        <Link
          to={href}
          onClick={handleNavigate}
          className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs"
        >
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
    </motion.div>
  );
};

export default ListingImageCarousel;
