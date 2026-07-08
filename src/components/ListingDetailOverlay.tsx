import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useListingModal } from "@/contexts/ListingModalContext";
import ListingDetail from "@/pages/ListingDetail";

/**
 * In-app modal that opens when the user taps a listing card.
 *
 * Key properties:
 *   - Rendered via a portal into document.body — no scrollable ancestor
 *     can trap it and `position: fixed` anchors to the real viewport.
 *   - Uses framer-motion `layoutId` for the shared-element zoom from
 *     the tapped card image to the hero image inside the modal.
 *   - Closing calls `close()` (local state), never touches history.
 *     Chrome/Brave back button therefore stays out of the picture.
 *   - iOS-safe body scroll lock: freezes the underlying page with
 *     position: fixed at a negative top so the listing stays exactly
 *     where the user left it when the modal closes.
 *   - Forces scrollTop = 0 on the inner scroll container before paint,
 *     so the detail always opens from the top of the page.
 */
const ListingDetailOverlay = () => {
  const { listing, close } = useListingModal();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isOpen = listing !== null;

  // Reset the modal's scroll to top before the first paint. Runs on every
  // open — if the user opens two listings in a row, the second one still
  // starts at the top.
  useLayoutEffect(() => {
    if (isOpen && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isOpen, listing?.id]);

  // Lock the background page while the modal is open. `overflow: hidden`
  // alone is not enough on iOS; freezing the body with position: fixed at
  // a negative top offset is the reliable technique across browsers.
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const body = document.body;
    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      // Restore the exact scroll position the user was on.
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  // ESC closes on desktop.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && listing && (
        <>
          <motion.div
            key="listing-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
            aria-hidden="true"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.35)",
              zIndex: 999,
            }}
          />
          <motion.div
            key="listing-modal"
            layoutId={`listing-card-${listing.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              layout: { type: "spring", stiffness: 300, damping: 32 },
              opacity: { duration: 0.18 },
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "100dvh",
              zIndex: 1000,
              background: "hsl(var(--background))",
              borderRadius: 0,
              overflow: "hidden",
              willChange: "transform, opacity",
            }}
            role="dialog"
            aria-modal="true"
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
              <ListingDetail onClose={close} initialListing={listing} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ListingDetailOverlay;
