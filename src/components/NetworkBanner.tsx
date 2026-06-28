import { WifiOff, Signal } from "lucide-react";
import { useNetwork } from "@/contexts/NetworkContext";
import { useLanguage } from "@/contexts/LanguageContext";

const NetworkBanner = () => {
  const { online, isSlow } = useNetwork();
  const { language } = useLanguage();
  const isPt = language === "pt";

  if (online && !isSlow) return null;

  const text = !online
    ? isPt
      ? "Modo offline — A navegar nos anúncios guardados"
      : "Modo sin conexión — Navegando en anuncios guardados"
    : isPt
      ? "Ligação fraca detetada — Imagens otimizadas para poupar dados"
      : "Conexión lenta detectada — Imágenes optimizadas para ahorrar datos";

  const Icon = !online ? WifiOff : Signal;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-40 px-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 72px)" }}
    >
      <div className="flex items-center gap-2 rounded-full bg-foreground/90 text-background backdrop-blur px-3.5 py-1.5 text-xs shadow-lg">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate max-w-[80vw]">{text}</span>
      </div>
    </div>
  );
};

export default NetworkBanner;