import { useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useListingModal } from "@/contexts/ListingModalContext";
import type { Listing } from "@/store/listingsStore";

/**
 * Returns a factory that produces onClick handlers for listing cards.
 * On mobile the handler opens the in-app modal via local state (never
 * navigates), so the browser back button won't exit the site. On
 * desktop it lets the underlying <Link> navigate normally.
 *
 * Usage:
 *   const makeCardClick = useListingCardClick();
 *   ...
 *   {items.map(item => <Link onClick={makeCardClick(item)} .../>)}
 */
export const useListingCardClick = () => {
  const isMobile = useIsMobile();
  const { open } = useListingModal();

  return useCallback(
    (listing: Listing | null | undefined) => (e: React.MouseEvent) => {
      if (!isMobile || !listing) return;
      e.preventDefault();
      e.stopPropagation();
      open(listing);
    },
    [isMobile, open]
  );
};
