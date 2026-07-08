import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Listing } from "@/store/listingsStore";

interface ListingModalContextValue {
  listing: Listing | null;
  open: (listing: Listing) => void;
  close: () => void;
}

const ListingModalContext = createContext<ListingModalContextValue | undefined>(undefined);

/**
 * Global state for the listing detail modal. Intentionally decoupled from
 * React Router: opening a listing does NOT push to browser history, so
 * the browser back button never exits the site. Closing simply clears
 * local state — no history manipulation.
 *
 * Deep-linking to /listing/:id keeps working via the existing route,
 * which renders ListingDetail as a real page (that path is for shared
 * URLs and refreshes; in-app taps use this modal instead).
 */
export const ListingModalProvider = ({ children }: { children: ReactNode }) => {
  const [listing, setListing] = useState<Listing | null>(null);

  const open = useCallback((next: Listing) => {
    setListing(next);
  }, []);

  const close = useCallback(() => {
    setListing(null);
  }, []);

  const value = useMemo(() => ({ listing, open, close }), [listing, open, close]);

  return (
    <ListingModalContext.Provider value={value}>
      {children}
    </ListingModalContext.Provider>
  );
};

export const useListingModal = () => {
  const ctx = useContext(ListingModalContext);
  if (!ctx) {
    throw new Error("useListingModal must be used within a ListingModalProvider");
  }
  return ctx;
};
