import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useListingModal } from "@/contexts/ListingModalContext";
import ListingDetail from "@/pages/ListingDetail";
import type { Listing } from "@/store/listingsStore";

const ENTER_MS = 520;
// El exit conserva el mismo perfil (mismo transform-origin, easing
// espejo) pero más corto — cerrar debería sentirse ágil.
const EXIT_MS = 240;
const ENTER_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
const EXIT_EASING = "cubic-bezier(0.7, 0, 0.84, 0)";

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
 * Animation: pure CSS @keyframes referenced via inline `animation`.
 * Keyframes run automatically when the element mounts, so we don't
 * depend on React repainting an "initial pose" before flipping to
 * "final pose" (which React 18 concurrent rendering can silently
 * skip, causing the modal to appear instantly instead of animating).
 */
const ListingDetailOverlay = () => {
  const { listing, origin, close } = useListingModal();
  const [rendered, setRendered] = useState<Listing | null>(null);
  const [renderedOrigin, setRenderedOrigin] = useState<{ x: number; y: number } | null>(null);
  const [exiting, setExiting] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const savedScrollRef = useRef(0);
  const isVisible = rendered !== null;

  // Sync context.listing → local render state. Keep the modal in the
  // DOM during the exit animation, then unmount.
  useEffect(() => {
    if (listing) {
      setRendered(listing);
      setRenderedOrigin(origin);
      setExiting(false);
    } else if (rendered) {
      setExiting(true);
      const t = window.setTimeout(() => {
        setRendered(null);
        setRenderedOrigin(null);
        setExiting(false);
      }, EXIT_MS);
      return () => window.clearTimeout(t);
    }
  }, [listing]); // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    if (isVisible && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [isVisible, rendered?.id]);

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
      // "scroll-behavior: smooth" global en <html> hace que scrollTo
      // anime desde 0 hasta la posición guardada — el usuario ve la
      // página "volver al top y bajar". Forzamos scroll-behavior: auto
      // durante la restauración y lo devolvemos después.
      const html = document.documentElement;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      releaseBodyLock();
      try {
        window.scrollTo({ top: savedScrollRef.current, left: 0, behavior: "instant" as ScrollBehavior });
      } catch {
        window.scrollTo(0, savedScrollRef.current);
      }
      html.style.scrollBehavior = prev;
    };
  }, [isVisible]);

  useEffect(() => {
    const onHide = () => releaseBodyLock();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      releaseBodyLock();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, close]);

  if (typeof document === "undefined" || !rendered) return null;

  // Inline `animation` references the @keyframes defined in index.css.
  // Using `both` fill-mode keeps the final pose after the animation
  // completes; `forwards` on the exit animation freezes it at the last
  // frame until React unmounts the element.
  // Salida = reverso exacto de la entrada: zoom-out AL mismo punto
  // desde el que el modal creció. Mismo transform-origin, keyframe
  // simétrica, duración y easing espejo → se ve como el usuario
  // rebobinando la apertura.
  const hasOrigin = renderedOrigin !== null;
  const animation = exiting
    ? hasOrigin
      ? `airbnbDetailZoomOut ${EXIT_MS}ms ${EXIT_EASING} forwards`
      : `airbnbDetailExit ${EXIT_MS}ms ${EXIT_EASING} forwards`
    : hasOrigin
      ? `airbnbDetailZoomIn ${ENTER_MS}ms ${ENTER_EASING} both`
      : `airbnbDetailEnter ${ENTER_MS}ms ${ENTER_EASING} both`;

  const transformOrigin = hasOrigin
    ? `${renderedOrigin.x}px ${renderedOrigin.y}px`
    : "center center";

  // Backdrop entra 2x más rápido que el modal para tapar la página
  // de fondo antes de que se note el slide-up.
  const backdropAnim = exiting
    ? `airbnbBackdropExit ${EXIT_MS}ms ${EXIT_EASING} forwards`
    : `airbnbBackdropEnter 160ms ease-out both`;

  return createPortal(
    <>
      {/* Backdrop opaco del mismo color que el modal — aparece
          instantáneamente para tapar la página de fondo mientras
          el modal aún está subiendo desde abajo. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9998,
          background: "hsl(var(--background))",
          animation: backdropAnim,
          willChange: "opacity",
        }}
      />
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
          // Bordes redondeados visibles durante la animación de zoom
          // (el modal aparece a scale bajo → esquinas prominentes).
          // En el estado final el modal ocupa 100vw × 100dvh, así que
          // las esquinas quedan justo fuera del viewport y no se ven.
          borderRadius: 28,
          animation,
          transformOrigin,
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
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
      </div>
    </>,
    document.body
  );
};

export default ListingDetailOverlay;
