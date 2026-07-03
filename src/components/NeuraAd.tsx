import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, ArrowRight } from "lucide-react";

/**
 * Sponsored ad slot for NEURA — Ecosistemas digitales.
 * Uses their original slogan: "Menos caos. Más control. Más ventas."
 */
const NeuraAd = () => {
  const { language } = useLanguage();
  const sponsoredLabel = language === "pt" ? "Patrocinado" : "Publicidad";
  const cta = language === "pt" ? "Digitalizar meu negócio" : "Digitalizar mi negocio";
  const tagline =
    language === "pt"
      ? "Sites, lojas online, automação e contabilidade para sua empresa vender mais e trabalhar melhor."
      : "Sitios web, tiendas online, automatización y contabilidad para que tu empresa venda más y trabaje mejor.";

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4">
      <a
        href="https://www.neura.com.py"
        target="_blank"
        rel="noopener sponsored"
        aria-label="NEURA - Ecosistemas digitales"
        className="group relative block overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/10 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground bg-background/70 backdrop-blur px-2 py-0.5 rounded-full border border-border">
          {sponsoredLabel}
        </span>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2 shrink-0">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/15 text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-extrabold tracking-tight leading-none">
                NEURA
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Ecosistemas digitales
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base sm:text-lg font-semibold leading-snug">
              Menos caos. <span className="text-primary">Más control.</span> Más ventas.
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {tagline}
            </p>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold group-hover:gap-3 transition-all">
              {cta}
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </a>
    </section>
  );
};

export default NeuraAd;