import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import upapLogo from "@/assets/upap-logo.png";
import smartfitLogo from "@/assets/smartfit-logo.png";
import clinicaLaBanner from "@/assets/clinica-la-banner.jpg";

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
}

const SLIDES: Slide[] = [
  {
    id: "clinica-la",
    title_es: "Lipoplastia mínimamente invasiva",
    title_pt: "Lipoplastia minimamente invasiva",
    subtitle_es: "Clínica cirúrgica plástica Spa — LA",
    subtitle_pt: "Clínica cirúrgica plástica Spa — LA",
    cta_es: "Saber más",
    cta_pt: "Saiba mais",
    href: "/category/services",
    accent: "from-[#0b1430] via-[#101a3d] to-[#070d22]",
    bgImage: clinicaLaBanner,
  },
  {
    id: "upap",
    title_es: "UPAP",
    title_pt: "UPAP",
    subtitle_es: "Inscripciones abiertas. Formá tu futuro con nosotros.",
    subtitle_pt: "Inscrições abertas. Construa seu futuro conosco.",
    cta_es: "Conocé UPAP",
    cta_pt: "Conheça a UPAP",
    href: "https://www.upap.edu.py",
    accent: "from-[#7a0a2a] via-[#9b1c3d] to-[#5a061f]",
    logo: upapLogo,
    confetti: true,
  },
  {
    id: "smartfit",
    title_es: "Smart Fit — Entrená sin límites",
    title_pt: "Smart Fit — Treine sem limites",
    subtitle_es: "La cadena de gimnasios más grande de Latinoamérica.",
    subtitle_pt: "A maior rede de academias da América Latina.",
    cta_es: "Conocé Smart Fit",
    cta_pt: "Conheça a Smart Fit",
    href: "https://www.smartfit.com.py",
    accent: "from-[#1a1a1a] via-[#2b2b2b] to-[#000000]",
    logo: smartfitLogo,
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
    <section className="container mx-auto px-3 sm:px-4 pt-4">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border shadow-sm select-none touch-pan-y"
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
          {SLIDES.map((s) => (
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className={cn("absolute inset-0", s.bgImage ? "bg-black/40" : "bg-black/10")} aria-hidden />
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
              {s.logo && (
                <img
                  src={s.logo}
                  alt={`${s.id} logo`}
                  loading="lazy"
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 h-24 sm:h-36 md:h-44 w-auto drop-shadow-xl object-contain hidden sm:block"
                />
              )}
              {s.id === "clinica-la" ? (
                <div className="relative h-full w-full px-4 sm:px-10">
                  <h2 className="absolute top-3 sm:top-6 left-4 sm:left-10 right-4 sm:right-10 text-base sm:text-2xl md:text-4xl font-bold leading-tight drop-shadow-sm max-w-md">
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

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
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