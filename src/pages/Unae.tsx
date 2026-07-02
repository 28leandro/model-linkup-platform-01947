import { Link } from "react-router-dom";
import { ArrowLeft, GraduationCap, Users, Globe2, Lightbulb, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import unaeBanner from "@/assets/unae-banner.jpg";

/**
 * Advertising landing page for UNAE (Universidad Autónoma de Encarnación).
 * Styled after UNAE's own brand palette: burgundy #7a0a1f + gold #c9a24a.
 */
const Unae = () => {
  const { language } = useLanguage();
  const isPt = language === "pt";

  const pillars = [
    {
      icon: GraduationCap,
      title_es: "Excelencia Académica",
      title_pt: "Excelência Acadêmica",
      desc_es: "Carreras de grado y posgrado con acreditación nacional.",
      desc_pt: "Cursos de graduação e pós com acreditação nacional.",
    },
    {
      icon: Users,
      title_es: "Compromiso Social",
      title_pt: "Compromisso Social",
      desc_es: "Formamos profesionales al servicio de la comunidad.",
      desc_pt: "Formamos profissionais a serviço da comunidade.",
    },
    {
      icon: Globe2,
      title_es: "Proyección Internacional",
      title_pt: "Projeção Internacional",
      desc_es: "Convenios de intercambio con universidades del mundo.",
      desc_pt: "Convênios de intercâmbio com universidades do mundo.",
    },
    {
      icon: Lightbulb,
      title_es: "Innovación y Liderazgo",
      title_pt: "Inovação e Liderança",
      desc_es: "Investigación aplicada y espíritu emprendedor.",
      desc_pt: "Pesquisa aplicada e espírito empreendedor.",
    },
  ];

  const faculties = [
    { es: "FACAT — Arquitectura", pt: "FACAT — Arquitetura" },
    { es: "FACEM — Empresariales", pt: "FACEM — Empresariais" },
    { es: "FCJHS — Jurídicas y Humanidades", pt: "FCJHS — Jurídicas e Humanidades" },
    { es: "FACQUF — Química y Farmacia", pt: "FACQUF — Química e Farmácia" },
    { es: "FACVA — Ciencias Veterinarias", pt: "FACVA — Ciências Veterinárias" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#fff 0%,#fdf6ec 100%)" }}>
      <div className="container mx-auto px-4 py-4">
        <Button asChild variant="ghost" size="sm">
          <Link to="/" className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {isPt ? "Voltar" : "Volver"}
          </Link>
        </Button>
      </div>

      {/* Hero */}
      <section className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border shadow-lg">
          <img
            src={unaeBanner}
            alt="UNAE — Universidad Autónoma de Encarnación"
            width={1600}
            height={640}
            className="w-full h-auto"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="text-center mt-8 max-w-3xl mx-auto">
          <span
            className="inline-block text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full border"
            style={{ color: "#7a0a1f", borderColor: "#c9a24a", background: "#fdf6ec" }}
          >
            {isPt ? "Publicidade" : "Publicidad"}
          </span>
          <h1
            className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: "#7a0a1f" }}
          >
            {isPt
              ? "Construa seu futuro na UNAE"
              : "Construí tu futuro en la UNAE"}
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground">
            {isPt
              ? "Universidade Autônoma de Encarnación — mais de 30 anos formando líderes no Paraguai."
              : "Universidad Autónoma de Encarnación — más de 30 años formando líderes en Paraguay."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="text-white hover:opacity-90"
              style={{ background: "#7a0a1f" }}
            >
              <a href="https://www.unae.edu.py/tv/" target="_blank" rel="noopener noreferrer">
                {isPt ? "Visitar site oficial" : "Visitar sitio oficial"}
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" style={{ borderColor: "#c9a24a", color: "#7a0a1f" }}>
              <a href="https://www.unae.edu.py/tv/index.php/carreras" target="_blank" rel="noopener noreferrer">
                {isPt ? "Ver cursos" : "Ver carreras"}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title_es} className="p-5 border-2 hover:shadow-md transition-shadow" style={{ borderColor: "#f0e0be" }}>
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: "#fdf6ec", color: "#7a0a1f" }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm md:text-base" style={{ color: "#7a0a1f" }}>
                  {isPt ? p.title_pt : p.title_es}
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {isPt ? p.desc_pt : p.desc_es}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Faculties */}
      <section className="container mx-auto px-4 mt-12">
        <div
          className="rounded-3xl p-6 md:p-10 text-white"
          style={{ background: "linear-gradient(135deg,#7a0a1f 0%,#5a061f 100%)" }}
        >
          <h2 className="text-2xl md:text-3xl font-extrabold" style={{ color: "#f5d67a" }}>
            {isPt ? "Faculdades do Complexo UNAE" : "Facultades del Complejo UNAE"}
          </h2>
          <p className="mt-2 text-white/80 text-sm md:text-base">
            {isPt
              ? "Uma oferta acadêmica ampla, com foco em qualidade e empregabilidade."
              : "Una oferta académica amplia, con foco en calidad y empleabilidad."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {faculties.map((f) => (
              <div
                key={f.es}
                className="rounded-xl px-4 py-3 border backdrop-blur-sm text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(201,162,74,0.4)" }}
              >
                {isPt ? f.pt : f.es}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="container mx-auto px-4 mt-12 mb-16">
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5 flex items-start gap-3">
            <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#7a0a1f" }} />
            <div>
              <div className="font-semibold text-sm">{isPt ? "Endereço" : "Dirección"}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Padre Kreusser e/ Indep. Nacional y Honorio González, Encarnación
              </div>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-3">
            <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#7a0a1f" }} />
            <div>
              <div className="font-semibold text-sm">{isPt ? "Telefone" : "Teléfono"}</div>
              <a href="tel:+59571205454" className="text-xs text-muted-foreground mt-0.5 hover:underline block">
                +595 71 205 454
              </a>
            </div>
          </Card>
          <Card className="p-5 flex items-start gap-3">
            <Mail className="h-5 w-5 shrink-0 mt-0.5" style={{ color: "#7a0a1f" }} />
            <div>
              <div className="font-semibold text-sm">Web</div>
              <a
                href="https://www.unae.edu.py/tv/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground mt-0.5 hover:underline block"
              >
                www.unae.edu.py
              </a>
            </div>
          </Card>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-8">
          {isPt
            ? "Conteúdo publicitário. Nemu.com.py não é afiliado à UNAE."
            : "Contenido publicitario. Nemu.com.py no está afiliado a la UNAE."}
        </p>
      </section>
    </div>
  );
};

export default Unae;