import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import ListingDetail from "@/pages/ListingDetail";

/**
 * Full-screen overlay wrapper for a listing detail. Rendered on top of the
 * previous page (Instagram-style modal routing) as an in-app modal.
 *
 * Critical correctness invariants:
 *   1. The overlay is portaled into `document.body` — never a scrollable
 *      ancestor — so `position: fixed` really anchors to the viewport,
 *      even if some intermediate wrapper uses `transform` or `filter`.
 *   2. Body scroll is locked using the iOS-safe fixed-position technique.
 *      Plain `overflow: hidden` does not stop touch scrolling on iOS.
 *   3. The inner scroll container is forced to `scrollTop = 0` before the
 *      first paint, so the detail always opens at the top.
 *   4. Uses `100dvh` so the modal fills the true visible viewport on
 *      mobile browsers (accounting for the URL bar).
 *
 * Closing the overlay plays the exit animation and then pops the router
 * stack, which unmounts the overlay and restores the background page.
 */
const ListingDetailOverlay = () => {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [closing, setClosing] = useState(false);

  // Reset scroll before paint. `useLayoutEffect` runs after DOM mutations
  // but before the browser paints, so the user never sees an intermediate
  // scrolled state.
  useLayoutEffect(() => {
    if (rootRef.current) rootRef.current.scrollTop = 0;
  }, []);

  // iOS-safe body scroll lock. `overflow: hidden` alone is not enough on
  // iOS Safari — the page can still be swiped. Freezing the body with
  // `position: fixed` at a negative top offset preserves the scroll
  // position without allowing any movement.
  useEffect(() => {
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
      // Restore the exact scroll position the user was on before opening.
      window.scrollTo(0, scrollY);
    };
  }, []);

  const close = () => {
    if (closing) return;
    setClosing(true);
    const el = rootRef.current;
    const done = () => navigate(-1);
    if (!el) {
      done();
      return;
    }
    const onEnd = () => {
      el.removeEventListener("animationend", onEnd);
      done();
    };
    el.addEventListener("animationend", onEnd);
    // Safety net in case animationend never fires (e.g. reduced motion).
    window.setTimeout(done, 260);
  };

  // ESC closes on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      <div
        className="listing-overlay-backdrop"
        aria-hidden="true"
        onClick={close}
      />
      <div
        ref={rootRef}
        className="listing-overlay"
        data-closing={closing || undefined}
        role="dialog"
        aria-modal="true"
      >
        <ListingDetail onClose={close} />
      </div>
    </>,
    document.body
  );
};

export default ListingDetailOverlay;
