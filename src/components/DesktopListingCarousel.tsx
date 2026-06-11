import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DesktopListingCarouselProps {
  children: React.ReactNode[];
  /** Tailwind basis class for each slide on desktop */
  slideBasisClass?: string;
}

const DesktopListingCarousel = ({
  children,
  slideBasisClass = "lg:basis-1/4 xl:basis-1/5",
}: DesktopListingCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    loop: false,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [snaps, setSnaps] = useState<number[]>([]);
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex gap-3 items-stretch h-full">
          {children.map((child, i) => (
            <div
              key={i}
              className={cn("min-w-0 shrink-0 grow-0 h-full", slideBasisClass)}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        aria-label="Previous"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className={cn(
          "absolute left-0 top-1/3 -translate-y-1/2 -translate-x-1/2 z-10",
          "h-10 w-10 rounded-full bg-background/90 border border-border shadow-md",
          "flex items-center justify-center hover:bg-background transition",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className={cn(
          "absolute right-0 top-1/3 -translate-y-1/2 translate-x-1/2 z-10",
          "h-10 w-10 rounded-full bg-background/90 border border-border shadow-md",
          "flex items-center justify-center hover:bg-background transition",
          "disabled:opacity-0 disabled:pointer-events-none"
        )}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

    </div>
  );
};

export default DesktopListingCarousel;