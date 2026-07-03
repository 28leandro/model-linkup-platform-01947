import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import { X, MapPin, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Listing } from "@/store/listingsStore";
import { formatPrice } from "@/lib/formatPrice";
import { getPublicCity } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  id: string;
  onClose: () => void;
}

const spring = { type: "spring" as const, stiffness: 90, damping: 22, mass: 1.2 };

const ListingOverlay = ({ id, onClose }: Props) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [mobileEmblaRef, mobileEmblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [mobileIdx, setMobileIdx] = useState(0);
  const [sharedDone, setSharedDone] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    supabase
      .from("listings_public")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancel) return;
        if (data) {
          setListing(data as Listing);
          try {
            const l: any = data;
            trackRecentlyViewed({
              id: l.id,
              title: l.title,
              image: Array.isArray(l.images) ? l.images[0] : undefined,
              price: l.price,
              currency: l.currency,
              location: l.location,
              type: l.type,
            });
          } catch {}
        }
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [id]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentIdx(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!mobileEmblaApi) return;
    const onSelect = () => setMobileIdx(mobileEmblaApi.selectedScrollSnap());
    mobileEmblaApi.on("select", onSelect);
    onSelect();
    return () => {
      mobileEmblaApi.off("select", onSelect);
    };
  }, [mobileEmblaApi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const images = listing?.images && listing.images.length > 0 ? listing.images : [];
  const cover =
    images[0] ||
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80";
  const extraImages = images.slice(1);
  const allImages = images.length > 0 ? images : [cover];

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background overflow-y-auto overscroll-contain"
      initial={false}
    >
      {/* Dim backdrop that fades in during the expansion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="fixed inset-0 -z-10 bg-black/60 backdrop-blur-sm pointer-events-none"
      />
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="hidden sm:flex fixed top-3 right-3 z-[110] w-10 h-10 rounded-full bg-black/55 hover:bg-black/70 text-white items-center justify-center backdrop-blur-sm"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Mobile: unified full-width carousel with all images */}
      <div className="sm:hidden relative w-full aspect-[4/3] bg-muted overflow-hidden">
        {/* Embla with all images sits underneath */}
        <div ref={mobileEmblaRef} className="overflow-hidden h-full">
          <div className="flex touch-pan-y h-full">
            {allImages.map((src, i) => (
              <div key={i} className="relative min-w-0 flex-[0_0_100%] h-full">
                <img
                  src={src}
                  alt={`${listing?.title || ""} - ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Back button (mobile) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Voltar"
          className="absolute top-3 left-3 z-20 w-10 h-10 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm z-20">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === mobileIdx ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: shared cover image at top */}
      <motion.div
        className="hidden sm:block relative w-full aspect-[16/9] bg-muted overflow-hidden"
      >
        <img src={cover} alt={listing?.title || ""} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      </motion.div>

      {/* Shared element rendered at overlay root so it never gets clipped.
          Sits absolute at the top matching the image area size (mobile 4/3, desktop 16/9). */}
      {!sharedDone && (
        <motion.img
          layoutId={`listing-image-${id}`}
          transition={spring}
          src={cover}
          alt={listing?.title || ""}
          draggable={false}
          onLayoutAnimationComplete={() => setSharedDone(true)}
          className="absolute top-0 left-0 w-full aspect-[4/3] sm:aspect-[16/9] object-cover pointer-events-none z-[105]"
        />
      )}

      {/* Rest of content fades/slides in after the shared transition */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8"
      >
        {/* Extra images carousel (desktop only — mobile already unified above) */}
        {extraImages.length > 0 && (
          <div className="hidden sm:block relative mb-5 sm:mb-6 rounded-xl overflow-hidden bg-muted">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex touch-pan-y">
                {extraImages.map((src, i) => (
                  <div key={i} className="relative min-w-0 flex-[0_0_100%] aspect-[4/3] sm:aspect-[16/10]">
                    <img
                      src={src}
                      alt={`${listing?.title || ""} - ${i + 2}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>
            {extraImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  aria-label="Anterior"
                  className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white items-center justify-center backdrop-blur-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  aria-label="Siguiente"
                  className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white items-center justify-center backdrop-blur-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                  {extraImages.map((_, i) => (
                    <span
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === currentIdx ? "w-4 bg-white" : "w-1.5 bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {loading && !listing ? (
          <div className="space-y-3">
            <div className="h-7 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-24 w-full bg-muted rounded animate-pulse" />
          </div>
        ) : listing ? (
          <>
            <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-foreground">
              {listing.title}
            </h1>
            {listing.price && listing.price > 0 && (
              <p className="text-xl sm:text-2xl font-bold text-primary mb-3">
                {formatPrice(listing.price, (listing as any).currency)}
              </p>
            )}
            <div className="flex items-center gap-2 text-muted-foreground mb-5 text-sm sm:text-base">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">{getPublicCity(listing)}</span>
            </div>
            {listing.description && (
              <div className="bg-muted/40 border border-border rounded-lg p-4 text-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap mb-6">
                {listing.description}
              </div>
            )}
            <a
              href={`/listing/${id}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t('common.viewFull') || 'Ver página completa'}
            </a>
          </>
        ) : (
          <p className="text-muted-foreground">{t('detail.notFound')}</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default function ListingOverlayHost({
  openId,
  onClose,
}: {
  openId: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {openId && <ListingOverlay key={openId} id={openId} onClose={onClose} />}
    </AnimatePresence>
  );
}
