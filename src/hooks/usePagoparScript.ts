import { useEffect, useState } from "react";

const PAGOPAR_SCRIPT_URL =
  "https://s3-sa-east-1.amazonaws.com/pagopar.com/js/pay-v1.js";

type Status = "idle" | "loading" | "ready" | "error";

/**
 * Carrega o script oficial do Pagopar de forma assíncrona.
 * Reutiliza a tag se já existir no DOM.
 */
export function usePagoparScript() {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-expect-error - global injetada pelo script
    if (window.Pagopar) {
      setStatus("ready");
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PAGOPAR_SCRIPT_URL}"]`
    );

    const onLoad = () => setStatus("ready");
    const onError = () => setStatus("error");

    if (existing) {
      setStatus("loading");
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return () => {
        existing.removeEventListener("load", onLoad);
        existing.removeEventListener("error", onError);
      };
    }

    setStatus("loading");
    const script = document.createElement("script");
    script.src = PAGOPAR_SCRIPT_URL;
    script.async = true;
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  return status;
}