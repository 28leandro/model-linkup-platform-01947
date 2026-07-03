import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";

interface ListingOverlayCtx {
  openId: string | null;
  open: (id: string) => void;
  close: () => void;
}

const Ctx = createContext<ListingOverlayCtx | null>(null);

export const useListingOverlay = () => useContext(Ctx);

export function ListingOverlayProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = useCallback((id: string) => {
    setOpenId((prev) => {
      if (prev === id) return prev;
      // Push new history entry so the browser Back button closes the overlay.
      window.history.pushState(
        { __listingOverlay: true, id },
        "",
        `/listing/${id}`
      );
      return id;
    });
  }, []);

  const close = useCallback(() => {
    setOpenId((prev) => {
      if (!prev) return prev;
      // If the current history entry is our overlay entry, go back so URL restores.
      if (window.history.state && (window.history.state as any).__listingOverlay) {
        window.history.back();
      }
      return null;
    });
  }, []);

  useEffect(() => {
    const onPop = () => {
      // If we navigate away from an overlay entry, hide it.
      const s = window.history.state as any;
      if (!s || !s.__listingOverlay) {
        setOpenId(null);
      } else if (s.id) {
        setOpenId(s.id);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (openId) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openId]);

  return <Ctx.Provider value={{ openId, open, close }}>{children}</Ctx.Provider>;
}
