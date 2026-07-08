import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useListingModal } from "@/contexts/ListingModalContext";
import ListingDetail from "@/pages/ListingDetail";
import type { Listing } from "@/store/listingsStore";

const EXIT_MS = 180;

const releaseBodyLock = () => {
  const b = document.body;
  b.style.overflow = "";
  b.style.position = "";
  b.style.top = "";
  b.style.left = "";
  b.style.right = "";
  b.style.width = "";
};

/**
 * Fullscreen modal for a listing detail.
 *
 * Animation is pure CSS via .detail-enter / .detail-exit classes so
 * nothing inline (like framer-motion) can override the transform.
 *
 * Two states we juggle:
 *   - `listing` (from context) — is the modal "supposed to be" open?
 *   - `rendered` (local)       — what are we actually rendering right now?
 *
 * When the user closes, context.listing becomes null but we keep
 * `rendered` around for EXIT_MS so the exit animation can play, then
 * we unmount.
 */
const ListingDetailOverlay = () => {
  const { listing, close } = useListingModal();
  const [rendered, setRendered] = useState<Listing | null>(null);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const savedScrollRef = useRef(0);
  const isVisible = rendered !== null;

  // React to context.listing changes.
  useEffect(() => {
    if (listing) {
      setRendered(listing);
      setPhase("in");
      // eslint-disable-next-line no-console
      console.log("DETAIL ANIMATION MOUNTED", listing.id);
      return;
    }
    if (rendered) {
      setPhase("out");
      const t = window.setTimeout(() => setRendered(null), EXIT_MS);
      return () => window.clearTimeout(t);
    }
  }, [listing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Force scrollTop=0 on the inner scroll container before paint so the
  // detail always opens from the top.
  useLayoutEffect(() => {
    if (isVisible && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isVisible, rendered?.id]);

  // Body scroll-lock (iOS-safe) while the modal is visible.
  useEffect(() => {
    if (!isVisible) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    savedScrollRef.current = scrollY;
    const b = document.body;
    b.style.overflow = "hidden";
    b.style.position = "fixed";
    b.style.top = `-${scrollY}px`;
    b.style.left = "0";
    b.style.right = "0";
    b.style.width = "100%";
    return () => {
      releaseBodyLock();
      window.scrollTo(0, savedScrollRef.current);
    };
  }, [isVisible]);

  // Safety nets: always restore body on any exit path.
  useEffect(() => {
    const onHide = () => releaseBodyLock();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      releaseBodyLock();
    };
  }, []);

  // ESC to close.
  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, close]);

  if (typeof document === "undefined" || !rendered) return null;

  return createPortal(
    <div
      className={phase === "in" ? "detail-enter" : "detail-exit"}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "100dvh",
        zIndex: 9999,
        background: "hsl(var(--background))",
        overflow: "hidden",
        willChange: "transform, opacity",
      }}
    >
      <div
        ref={scrollRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
        }}
      >
        <ListingDetail onClose={close} initialListing={rendered} />
      </div>
    </div>,
    document.body
  );
};

export default ListingDetailOverlay;
