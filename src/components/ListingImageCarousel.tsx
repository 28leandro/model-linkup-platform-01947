import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/useFavorites";
import { useListingOverlay } from "@/contexts/ListingOverlayContext";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const overlay = useListingOverlay();
  const isMobile = useIsMobile();

  const hasImages = images && images.length > 0;
  const cover = hasImages ? images[0] : FALLBACK;

  const handleHeart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  // ---- Long-press handling (mobile only) ----
  const pressTimer = useRef<number | null>(null);
  const longPressFired = useRef(false);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const clearPress = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!isMobile || !overlay) return;
    if (e.pointerType === "mouse") return; // touch/pen only
    longPressFired.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    clearPress();
    pressTimer.current = window.setTimeout(() => {
      longPressFired.current = true;
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { (navigator as any).vibrate?.(15); } catch {}
      }
      overlay.open(listingId);
    }, 500);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!startPos.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    if (dx > 10 || dy > 10) clearPress();
  };

  const onPointerEnd = () => {
    clearPress();
    startPos.current = null;
  };

  const suppressIfLongPress = (e: React.SyntheticEvent) => {
    if (longPressFired.current) {
      e.preventDefault();
      e.stopPropagation();
      longPressFired.current = false;
    }
  };

  const noCalloutStyle: React.CSSProperties = {
    WebkitTouchCallout: "none" as any,
    WebkitUserSelect: "none",
    userSelect: "none",
  };

  return (
    <div className={cn("relative overflow-hidden bg-muted group", aspectClassName)}>
      {hasImages ? (
        <Link
          to={href}
          className="absolute inset-0 block"
          draggable={false}
          onClick={(e) => {
            // On mobile: images do NOT open on tap — only on long-press (500ms).
            // Suppress the synthetic click that fires after a long-press.
            if (isMobile) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerLeave={onPointerEnd}
          onContextMenu={(e) => {
            if (isMobile) e.preventDefault();
          }}
          style={isMobile ? noCalloutStyle : undefined}
        >
          <motion.img
            layoutId={`listing-image-${listingId}`}
            transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1.2 }}
            src={cover}
            alt={title}
            width={600}
            height={600}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            draggable={false}
            className="w-full h-full object-cover select-none [transition:none!important] [-webkit-touch-callout:none] [-webkit-user-select:none]"
            onContextMenu={(e) => { if (isMobile) e.preventDefault(); }}
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