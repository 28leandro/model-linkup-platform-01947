import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListingDetail from "@/pages/ListingDetail";

/**
 * Full-screen overlay wrapper for a listing detail. Rendered on top of the
 * previous page (Instagram-style modal routing) so the user experiences
 * the transition as an in-app modal, not a page load. The enter/exit
 * animations are pure CSS keyframes defined in index.css, which works
 * on every browser. If View Transitions API is available, the router's
 * `unstable_viewTransition` prop can be used at the Link level for extra
 * polish — but the modal doesn't rely on it.
 *
 * Closing the overlay pops the router stack (browser back), which
 * plays the exit animation and reveals the underlying page.
 */
const ListingDetailOverlay = () => {
  const navigate = useNavigate();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [closing, setClosing] = useState(false);

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
    // Safety net if animationend never fires (e.g. reduced motion).
    window.setTimeout(done, 260);
  };

  // ESC to close on desktop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock body scroll while the modal is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
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
    </>
  );
};

export default ListingDetailOverlay;
