import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useListingModal } from "@/contexts/ListingModalContext";
import ListingDetail from "@/pages/ListingDetail";

/**
 * Bulletproof cleanup helper. Called from three places (effect cleanup,
 * component unmount, and window pagehide) so if any code path misses,
 * the body always ends up in a usable state.
 */
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
 * In-app fullscreen modal for a listing detail.
 *
 * Non-negotiables (bugs that keep coming back if we don't defend against them):
 *   1. NEVER touch history. Open = setState, close = clearState.
 *   2. Portal into <body> so no scrollable/transformed ancestor traps it.
 *   3. Body scroll-lock cleanup MUST run on close, unmount, AND pagehide,
 *      or the site is left with position: fixed and appears frozen.
 *   4. Simple fade + scale animation only. Shared-element layoutId caused
 *      a phantom fullscreen card to stick after close in earlier attempts.
 *   5. AnimatePresence unmounts the DOM after exit — nothing lingers with
 *      pointer-events blocking clicks.
 */
const ListingDetailOverlay = () => {
  const { listing, close } = useListingModal();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const savedScrollRef = useRef(0);
  const isOpen = listing !== null;

  // Reset the modal's inner scroll before the browser paints. Runs every
  // time a new listing is opened, so opening a second one still starts
  // at the top.
  useLayoutEffect(() => {
    if (isOpen && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isOpen, listing?.id]);

  // Body scroll lock while the modal is open. iOS-safe: overflow: hidden
  // alone does not stop touch scrolling, so we also freeze the body at a
  // negative offset. Every branch that leaves the effect calls
  // releaseBodyLock so nothing stays stuck.
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  // Safety nets: if the component unmounts for any reason or the tab is
  // hidden mid-modal, guarantee the body styles are cleared. This is what
  // prevents the "frozen page" bug reported after rapid open/close cycles
  // or hot reloads.
  useEffect(() => {
    const onHide = () => releaseBodyLock();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      releaseBodyLock();
    };
  }, []);

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
        <motion.div
          key="listing-modal"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ListingDetailOverlay;
