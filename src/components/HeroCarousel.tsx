import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import clinicaLaBanner from "@/assets/clinica-la-banner.jpg";
import upapMedicinaBanner from "@/assets/upap-medicina-banner.png.asset.json";
import unaeBanner from "@/assets/unae-banner.jpg";

interface Slide {
  id: string;
  title_es: string;
  title_pt: string;
  subtitle_es: string;
  subtitle_pt: string;
  cta_es: string;
  cta_pt: string;
  href: string;
  accent: string;
  logo?: string;
  confetti?: boolean;
  bgImage?: string;
  fullImage?: boolean;
}

const SLIDES: Slide[] = [
  {
    id: "upap",
    title_es: "UPAP",
    title_pt: "UPAP",
    subtitle_es: "",
    subtitle_pt: "",
    cta_es: "",
    cta_pt: "",
    href: "https://upap.edu.py/",
    accent: "",
    bgImage: upapMedicinaBanner.url,
    fullImage: true,
  },
  {
    id: "clinica-la",
    title_es: "Lipoplastia mínimamente invasiva",
    title_pt: "Lipoplastia minimamente invasiva",
    subtitle_es: "Clínica cirúrgica Spa — LA",
    subtitle_pt: "Clínica cirúrgica Spa — LA",
    cta_es: "Saber más",
    cta_pt: "Saiba mais",
    href: "/category/services",
    accent: "from-[#0b1430] via-[#101a3d] to-[#070d22]",
    bgImage: clinicaLaBanner,
  },
  {
    id: "unae",
    title_es: "UNAE",
    title_pt: "UNAE",
    subtitle_es: "Universidad Autónoma de Encarnación",
    subtitle_pt: "Universidade Autônoma de Encarnación",
    cta_es: "Conocé la UNAE",
    cta_pt: "Conheça a UNAE",
    href: "/unae",
    accent: "from-[#7a0a1f] via-[#5a061f] to-[#3d0414]",
    bgImage: unaeBanner,
    fullImage: true,
  },
  {
    id: "neura",
    title_es: "NEURA",
    title_pt: "NEURA",
    subtitle_es: "Menos caos. Más control. Más ventas.",
    subtitle_pt: "Menos caos. Mais controle. Mais vendas.",
    cta_es: "Digitalizar mi negocio",
    cta_pt: "Digitalizar meu negócio",
    href: "https://www.neura.com.py",
    accent: "from-[#f0fdf4] via-[#ecfdf5] to-[#e6f7ed]",
    logo: undefined,
  },
  {
    id: "tech",
    title_es: "Tecnología al mejor precio",
    title_pt: "Tecnologia ao melhor preço",
    subtitle_es: "Celulares, laptops, gaming y más",
    subtitle_pt: "Celulares, laptops, games e mais",
    cta_es: "Explorar Tecnología",
    cta_pt: "Explorar Tecnologia",
    href: "/category/tech",
    accent: "from-slate-500 via-slate-400 to-slate-500",
  },
  {
    id: "home",
    title_es: "Renová tu hogar",
    title_pt: "Renove seu lar",
    subtitle_es: "Muebles, deco y electrodomésticos",
    subtitle_pt: "Móveis, deco e eletrodomésticos",
    cta_es: "Ver Hogar y Jardín",
    cta_pt: "Ver Casa e Jardim",
    href: "/category/home-garden",
    accent: "from-stone-400 via-stone-500 to-zinc-500",
  },
  {
    id: "vehicles",
    title_es: "Tu próximo vehículo",
    title_pt: "Seu próximo veículo",
    subtitle_es: "Miles de autos y motos en Paraguay",
    subtitle_pt: "Milhares de carros e motos no Paraguai",
    cta_es: "Ver Vehículos",
    cta_pt: "Ver Veículos",
    href: "/category/vehicles",
    accent: "from-zinc-500 via-slate-500 to-slate-600",
  },
];

const HeroCarousel = () => {
  const { language } = useLanguage();
  const isPt = language === "pt";
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Preload the hero banner image (LCP candidate) so it starts downloading
  // before React paints the carousel.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = upapMedicinaBanner.url;
    // @ts-ignore - valid HTML attr
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslateX(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (translateX > 50) {
      go(-1);
    } else if (translateX < -50) {
      go(1);
    }
    setTranslateX(0);
  };

  return (
    <section className="w-full">
      <div
        ref={containerRef}
        className="relative overflow-hidden select-none touch-pan-y"
        style={{ maxHeight: 250 }}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
        onTouchEnd={handleDragEnd}
      >
        <div
          className={cn(
            "flex transition-transform duration-500 ease-out",
            isDragging && "duration-0"
          )}
          style={{
            transform: `translateX(calc(-${index * 100}% + ${translateX}px))`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          {SLIDES.map((s, slideIdx) => (
            <div
              key={s.id}
              className={cn(
                "min-w-full h-[180px] sm:h-[220px] md:h-[250px] relative bg-gradient-to-br text-white",
                s.accent
              )}
            >
              {s.bgImage && (
                <img
                  src={s.bgImage}
                  alt=""
                  aria-hidden
                  width={1200}
                  height={500}
                  loading={slideIdx === 0 ? "eager" : "lazy"}
                  decoding={slideIdx === 0 ? "sync" : "async"}
                  // @ts-ignore - fetchpriority is a valid HTML attribute
                  fetchpriority={slideIdx === 0 ? "high" : "low"}
                  className={cn(
                    "absolute inset-0 w-full h-full",
                    s.fullImage ? "object-cover object-center" : "object-cover"
                  )}
                />
              )}
              {!s.fullImage && (
                <div className={cn("absolute inset-0", s.bgImage ? "bg-black/40" : "bg-black/10")} aria-hidden />
              )}
              {s.confetti && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                  {Array.from({ length: 28 }).map((_, i) => {
                    const colors = ["#FFD700", "#FF6B9A", "#7CE7FF", "#A8FF8C", "#FFB347", "#FFFFFF"];
                    const color = colors[i % colors.length];
                    const left = (i * 37) % 100;
                    const top = (i * 53) % 100;
                    const rotate = (i * 47) % 360;
                    const size = 6 + (i % 4) * 3;
                    const delay = (i % 6) * 0.4;
                    return (
                      <span
                        key={i}
                        className="absolute animate-bounce"
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          width: size,
                          height: size * 0.4,
                          background: color,
                          transform: `rotate(${rotate}deg)`,
                          animationDelay: `${delay}s`,
                          animationDuration: `${2 + (i % 3)}s`,
                          borderRadius: 2,
                          opacity: 0.85,
                        }}
                      />
                    );
                  })}
                </div>
              )}
              {s.logo && !s.fullImage && (
                <img
                  src={s.logo}
                  alt={`${s.id} logo`}
                  loading="lazy"
                  decoding="async"
                  width={400}
                  height={400}
                  className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 h-20 sm:h-36 md:h-44 w-auto max-w-[40%] drop-shadow-xl object-contain"
                />
              )}
              {s.fullImage ? (
                <a
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={s.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={isPt ? s.title_pt : s.title_es}
                  className="absolute inset-0"
                />
              ) : s.id === "clinica-la" ? (
                <div className="relative h-full w-full px-4 sm:px-10">
                  <h2 className="absolute top-1 sm:top-4 left-4 sm:left-10 right-4 sm:right-10 text-base sm:text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm max-w-md">
                    {isPt ? s.title_pt : s.title_es}
                  </h2>
                  <p className="absolute bottom-3 sm:bottom-6 right-4 sm:right-10 text-xs sm:text-base text-white/90 text-right max-w-[60%]">
                    {isPt ? s.subtitle_pt : s.subtitle_es}
                  </p>
                  <div className="absolute bottom-3 sm:bottom-6 left-4 sm:left-10">
                    <Button asChild variant="secondary" size="sm" className="bg-white text-foreground hover:bg-white/90 text-xs sm:text-sm h-7 sm:h-9">
                      {s.href.startsWith("http") ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer">
                          {isPt ? s.cta_pt : s.cta_es}
                        </a>
                      ) : (
                        <Link to={s.href}>{isPt ? s.cta_pt : s.cta_es}</Link>
                      )}
                    </Button>
                  </div>
                </div>
              ) : s.id === "neura" ? (
                <div className="relative h-full w-full px-4 sm:px-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-slate-900">
                  <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-900/5 backdrop-blur px-2 py-0.5 rounded-full border border-slate-900/10">
                    {isPt ? "Patrocinado" : "Publicidad"}
                  </span>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2 shrink-0 pt-4 sm:pt-0">
                    <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-[#00E5A0]/15 text-[#059669] border border-[#00E5A0]/30">
                      <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight leading-none">
                        NEURA
                      </div>
                      <div className="text-[10px] sm:text-xs text-[#059669] mt-0.5">
                        Ecosistemas digitales
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base md:text-lg font-semibold leading-snug">
                      Menos caos. <span className="text-[#2563eb]">Más control.</span> <span className="text-[#059669]">Más ventas.</span>
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
                      {isPt
                        ? "Sites, lojas online, automação e contabilidade para sua empresa vender mais."
                        : "Sitios web, tiendas online, automatización y contabilidad para que tu empresa venda más."}
                    </p>
                  </div>
                  <div className="shrink-0 pb-4 sm:pb-0">
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[#00E5A0] text-[#020817] px-4 py-2 text-xs sm:text-sm font-semibold hover:gap-3 hover:bg-[#00f5ad] transition-all"
                    >
                      {isPt ? s.cta_pt : s.cta_es}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="relative h-full w-full flex flex-col justify-center px-4 sm:px-10 max-w-3xl">
                  <h2 className="text-base sm:text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm">
                    {isPt ? s.title_pt : s.title_es}
                  </h2>
                  <p className="mt-1 text-xs sm:text-base text-white/90 max-w-md">
                    {isPt ? s.subtitle_pt : s.subtitle_es}
                  </p>
                  <div className="mt-2 sm:mt-4">
                    <Button asChild variant="secondary" size="sm" className="bg-white text-foreground hover:bg-white/90 text-xs sm:text-sm h-7 sm:h-9">
                      {s.href.startsWith("http") ? (
                        <a href={s.href} target="_blank" rel="noopener noreferrer">
                          {isPt ? s.cta_pt : s.cta_es}
                        </a>
                      ) : (
                        <Link to={s.href}>{isPt ? s.cta_pt : s.cta_es}</Link>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white shadow items-center justify-center text-foreground transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white shadow items-center justify-center text-foreground transition"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          className={cn(
            "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 transition-opacity",
            SLIDES[index]?.fullImage && "opacity-0 pointer-events-none"
          )}
        >
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;