import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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
}

const SLIDES: Slide[] = [
  {
    id: "upap",
    title_es: "UPAP — Universidad Politécnica y Artística del Paraguay",
    title_pt: "UPAP — Universidade Politécnica e Artística do Paraguai",
    subtitle_es: "Inscripciones abiertas. Formá tu futuro con nosotros.",
    subtitle_pt: "Inscrições abertas. Construa seu futuro conosco.",
    cta_es: "Conocé UPAP",
    cta_pt: "Conheça a UPAP",
    href: "https://www.upap.edu.py",
    accent: "from-sky-700 via-blue-600 to-indigo-700",
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

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const go = (dir: number) =>
    setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length);

  return (
    <section className="container mx-auto px-3 sm:px-4 pt-4">
      <div className="relative overflow-hidden rounded-2xl border shadow-sm" style={{ maxHeight: 250 }}>
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {SLIDES.map((s) => (
            <div
              key={s.id}
              className={cn(
                "min-w-full h-[180px] sm:h-[220px] md:h-[250px] relative bg-gradient-to-br text-white",
                s.accent
              )}
            >
              <div className="absolute inset-0 bg-black/10" aria-hidden />
              <div className="relative h-full w-full flex flex-col justify-center px-6 sm:px-10 max-w-3xl">
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold leading-tight drop-shadow-sm">
                  {isPt ? s.title_pt : s.title_es}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-white/90 max-w-md">
                  {isPt ? s.subtitle_pt : s.subtitle_es}
                </p>
                <div className="mt-4">
                  <Button asChild variant="secondary" size="sm" className="bg-white text-foreground hover:bg-white/90">
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
            </div>
          ))}
        </div>

        <button
          aria-label="Previous slide"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-foreground transition"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-foreground transition"
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