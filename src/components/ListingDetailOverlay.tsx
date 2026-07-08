import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useListingModal } from "@/contexts/ListingModalContext";
import ListingDetail from "@/pages/ListingDetail";
import type { Listing } from "@/store/listingsStore";

// Durations tuned to be OBVIOUSLY visible while we finish the QA loop.
// Once the animation is confirmed in the wild we can dial these back to
// the previous 280/180 values.
const ENTER_MS = 400;
const EXIT_MS = 220;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

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
 * Animation is driven by inline styles + CSS transitions. Two ticks
 * of requestAnimationFrame between mount-with-initial-style and
 * flip-to-final-style guarantee the browser paints the initial frame
 * first, so the transition actually runs. This bypasses any external
 * CSS conflict — the transition is right on the element.
 */
const ListingDetailOverlay = () => {
  const { listing, close } = useListingModal();
  const [rendered, setRendered] = useState<Listing | null>(null);
  const [entered, setEntered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const savedScrollRef = useRef(0);
  const isVisible = rendered !== null;

  // Sync context.listing → local render state, with delayed unmount so
  // the exit animation has time to play.
  useEffect(() => {
    if (listing) {
      // eslint-disable-next-line no-console
      console.log("DETAIL ANIMATION MOUNTED", listing.id);
      setRendered(listing);
      setExiting(false);
      setEntered(false); // start from the "enter" initial pose
    } else if (rendered) {
      setExiting(true);
      const t = window.setTimeout(() => {
        setRendered(null);
        setExiting(false);
        setEntered(false);
      }, EXIT_MS);
      return () => window.clearTimeout(t);
    }
  }, [listing]); // eslint-disable-line react-hooks/exhaustive-deps

  // After the initial paint with the "enter" pose, flip to the final
  // pose on the next animation frame. The double rAF is critical:
  // one frame lands the initial styles, the next triggers the transition.
  useLayoutEffect(() => {
    if (!rendered || exiting) return;
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        // eslint-disable-next-line no-console
        console.log("DETAIL TRANSITION START");
        setEntered(true);
      });
      (raf1 as unknown as { _raf2?: number })._raf2 = raf2;
    });
    return () => cancelAnimationFrame(raf1);
  }, [rendered?.id, exiting]);

  // Force scrollTop=0 before paint so the detail always opens from top.
  useLayoutEffect(() => {
    if (isVisible && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isVisible, rendered?.id]);

  // Body scroll-lock (iOS-safe).
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

  // Safety net.
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
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, close]);

  if (typeof document === "undefined" || !rendered) return null;

  // Compute the visual pose. "Enter initial" and "exit final" share the
  // same shrunken look; "entered" is the fully open pose.
  // Poses intentionally dramatic (scale 0.7, translateY 60) so the
  // animation is impossible to miss during verification.
  const opacity = exiting ? 0 : entered ? 1 : 0;
  const scale = exiting ? 0.9 : entered ? 1 : 0.7;
  const translateY = exiting ? 40 : entered ? 0 : 60;
  const durationMs = exiting ? EXIT_MS : ENTER_MS;

  return createPortal(
    <div
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
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        transformOrigin: "center top",
        transition: `opacity ${durationMs}ms ${EASING}, transform ${durationMs}ms ${EASING}`,
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
