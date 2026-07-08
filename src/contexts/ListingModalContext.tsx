import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Listing } from "@/store/listingsStore";

export interface ModalOrigin {
  /** Viewport-space center of the element that was tapped. Used as
   *  transform-origin so the modal appears to grow from that point. */
  x: number;
  y: number;
}

interface ListingModalContextValue {
  listing: Listing | null;
  origin: ModalOrigin | null;
  open: (listing: Listing, origin?: ModalOrigin | null) => void;
  close: () => void;
}

const ListingModalContext = createContext<ListingModalContextValue | undefined>(undefined);

export const ListingModalProvider = ({ children }: { children: ReactNode }) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [origin, setOrigin] = useState<ModalOrigin | null>(null);

  const open = useCallback((next: Listing, from?: ModalOrigin | null) => {
    setOrigin(from ?? null);
    setListing(next);
  }, []);

  const close = useCallback(() => {
    setListing(null);
  }, []);

  const value = useMemo(() => ({ listing, origin, open, close }), [listing, origin, open, close]);

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
