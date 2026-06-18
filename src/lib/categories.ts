import {
  Car,
  Bike,
  Truck,
  Home,
  Wrench,
  Sofa,
  Refrigerator,
  Lamp,
  Trees,
  Laptop,
  Smartphone,
  Gamepad2,
  Watch,
  Keyboard,
  Cpu,
  Shirt,
  Baby,
  Gem,
  SprayCan,
  Anchor,
  Bus,
  Zap,
  Building2,
  Briefcase,
  Factory,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import {
  Trophy,
  Dumbbell,
  Footprints,
  Package,
  Settings,
  Store,
  Tag,
  Sparkles,
  GraduationCap,
  PawPrint,
  CalendarDays,
  Hammer,
  Paintbrush,
  Truck as TruckIcon,
  HeartPulse,
  MapPin,
} from "lucide-react";

export type ConditionId =
  | "nuevo"
  | "como_nuevo"
  | "usado_excelente"
  | "usado_funcional";

export const CONDITIONS: { id: ConditionId; label_es: string; label_pt: string; color: string }[] = [
  { id: "nuevo",            label_es: "Nuevo",            label_pt: "Novo",            color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
  { id: "como_nuevo",       label_es: "Como Nuevo",       label_pt: "Como Novo",       color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300" },
  { id: "usado_excelente",  label_es: "Usado Excelente",  label_pt: "Usado Excelente", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" },
  { id: "usado_funcional",  label_es: "Usado Funcional",  label_pt: "Usado Funcional", color: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300" },
];

export interface Subcategory {
  id: string;
  label_es: string;
  label_pt: string;
  icon?: LucideIcon;
  brands?: string[];
  examples?: string[];
}

export interface Category {
  id: string;
  /** DB `type` value used in listings.type */
  type: string;
  label_es: string;
  label_pt: string;
  desc_es: string;
  desc_pt: string;
  icon: LucideIcon;
  /** Tailwind gradient tokens for bento tile */
  accent: string;
  /** Ghost style: transparent + accent border/text, fills on hover (desktop only) */
  ghost?: boolean;
  subcategories?: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "vehicles",
    type: "vehicles",
    label_es: "Vehículos",
    label_pt: "Veículos",
    desc_es: "Autos, motos, camiones",
    desc_pt: "Carros, motos, caminhões",
    icon: Car,
    accent: "from-blue-500/15 to-indigo-500/10 text-blue-700 dark:text-blue-300",
    subcategories: [
      { id: "autos",     label_es: "Autos",      label_pt: "Carros",     icon: Car,   brands: ["Toyota","Volkswagen","Chevrolet","Ford","Hyundai","Kia","Nissan","Honda","Renault","Peugeot","Fiat","Mitsubishi","Mercedes-Benz","BMW","Audi","Suzuki","Mazda","Jeep"] },
      { id: "motos",     label_es: "Motos",      label_pt: "Motos",      icon: Bike,  brands: ["Honda","Yamaha","Suzuki","Kawasaki","Bajaj","KTM","Kenton","Star","Leopard","Zanella"] },
      { id: "camionetas", label_es: "Camionetas", label_pt: "Camionetas", icon: Truck, brands: ["Toyota","Ford","Chevrolet","Volkswagen","Mitsubishi","Nissan","Hyundai","Kia","Renault"] },
      { id: "camiones-buses", label_es: "Camiones y Buses", label_pt: "Caminhões e Ônibus", icon: Bus, brands: ["Mercedes-Benz","Volvo","Scania","Iveco","MAN","Volkswagen","Ford","Hyundai","JAC","Foton"] },
      { id: "nauticos",  label_es: "Náuticos",    label_pt: "Náuticos",    icon: Anchor, examples: ["Lanchas","Jet Ski","Veleros"] },
      { id: "electricos", label_es: "Vehículos Eléctricos", label_pt: "Veículos Elétricos", icon: Zap, brands: ["Tesla","BYD","Nissan","Renault","Chevrolet"] },
      { id: "repuestos-auto",    label_es: "Repuestos para Auto",    label_pt: "Peças para Carro",      icon: Settings },
      { id: "repuestos-moto",    label_es: "Repuestos para Moto",    label_pt: "Peças para Moto",       icon: Settings },
      { id: "repuestos-camion",  label_es: "Repuestos para Camión",  label_pt: "Peças para Caminhão",   icon: Settings },
      { id: "accesorios-vehiculos", label_es: "Accesorios para Vehículos", label_pt: "Acessórios Veiculares", icon: Package },
    ],
  },
  {
    id: "real-estate",
    type: "real-estate",
    label_es: "Inmuebles",
    label_pt: "Imóveis",
    desc_es: "Venta y alquiler de propiedades",
    desc_pt: "Venda e aluguel de propriedades",
    icon: Home,
    accent: "from-transparent to-transparent group-hover:from-accent group-hover:to-accent group-hover:text-accent-foreground",
    subcategories: [
      { id: "casa",        label_es: "Casa",            label_pt: "Casa",            icon: Home },
      { id: "departamento", label_es: "Departamento",   label_pt: "Departamento",    icon: Building2 },
      { id: "terreno",     label_es: "Terreno",         label_pt: "Terreno",         icon: MapPin },
      { id: "comercial",   label_es: "Local Comercial", label_pt: "Local Comercial", icon: Store },
      { id: "quinta",      label_es: "Quinta",          label_pt: "Quinta",          icon: Trees },
      { id: "estancia",    label_es: "Estancia",        label_pt: "Estância",        icon: Trees },
      { id: "oficina",     label_es: "Oficina",         label_pt: "Escritório",      icon: Briefcase },
      { id: "edificio",    label_es: "Edificio",        label_pt: "Edifício",        icon: Factory },
    ],
  },
  {
    id: "services",
    type: "services",
    label_es: "Servicios",
    label_pt: "Serviços",
    desc_es: "Prestación de servicios",
    desc_pt: "Prestação de serviços",
    icon: Wrench,
    accent: "from-orange-500/15 to-amber-500/10 text-orange-700 dark:text-orange-300",
    subcategories: [
      { id: "reformas",   label_es: "Reformas y Construcción", label_pt: "Reformas e Construção", icon: Hammer },
      { id: "limpieza",   label_es: "Limpieza",                 label_pt: "Limpeza",               icon: Sparkles },
      { id: "mudanzas",   label_es: "Mudanzas y Fletes",        label_pt: "Mudanças e Fretes",     icon: TruckIcon },
      { id: "clases",     label_es: "Clases Particulares",      label_pt: "Aulas Particulares",    icon: GraduationCap },
      { id: "eventos",    label_es: "Eventos",                  label_pt: "Eventos",               icon: CalendarDays },
      { id: "belleza",    label_es: "Belleza y Bienestar",      label_pt: "Beleza e Bem-estar",    icon: Sparkles },
      { id: "mascotas",   label_es: "Mascotas",                 label_pt: "Animais",               icon: PawPrint },
      { id: "tecnico",    label_es: "Servicio Técnico",         label_pt: "Assistência Técnica",   icon: Wrench },
      { id: "salud",      label_es: "Salud",                    label_pt: "Saúde",                 icon: HeartPulse },
      { id: "pintura",    label_es: "Pintura",                  label_pt: "Pintura",               icon: Paintbrush },
      { id: "otros-servicios", label_es: "Otros Servicios",     label_pt: "Outros Serviços",       icon: Briefcase },
    ],
  },
  {
    id: "fashion",
    type: "fashion",
    label_es: "Moda",
    label_pt: "Moda",
    desc_es: "Ropa, accesorios, perfumes",
    desc_pt: "Roupas, acessórios, perfumes",
    icon: Shirt,
    accent: "from-transparent to-transparent group-hover:from-accent group-hover:to-accent group-hover:text-accent-foreground",
    subcategories: [
      { id: "masculino",  label_es: "Roupas",           label_pt: "Roupas",           icon: Shirt },
      { id: "feminino",   label_es: "Calzados",         label_pt: "Calçados",         icon: Footprints },
      { id: "infantil",   label_es: "Bolso Femenino",   label_pt: "Bolsa Feminina",   icon: Baby },
      { id: "relojes-joyas", label_es: "Relojes y Joyas", label_pt: "Relógios e Joias", icon: Gem },
      { id: "perfumes",   label_es: "Perfumes",         label_pt: "Perfumes",         icon: SprayCan },
      { id: "otros-fashion", label_es: "Otros",         label_pt: "Outros",           icon: Package },
    ],
  },
  {
    id: "home-garden",
    type: "home-garden",
    label_es: "Hogar y Jardín",
    label_pt: "Casa e Jardim",
    desc_es: "Muebles, electrodomésticos y más",
    desc_pt: "Móveis, eletrodomésticos e mais",
    icon: Sofa,
    accent: "from-rose-500/15 to-pink-500/10 text-rose-700 dark:text-rose-300",
    subcategories: [
      { id: "muebles",          label_es: "Muebles",          label_pt: "Móveis",            icon: Sofa,         examples: ["Sofás", "Mesas", "Camas"], brands: ["Placacentro","Salemma","Casa Rica","Tok&Stok","Ikea","Generico"] },
      { id: "electrodomesticos", label_es: "Electrodomésticos", label_pt: "Eletrodomésticos", icon: Refrigerator, examples: ["Heladeras","Lavarropas","Microondas"], brands: ["Samsung","LG","Electrolux","Whirlpool","Philco","Consul","Brastemp","Midea","Tokyo","Mtek","James","Enxuta","Panasonic"] },
      { id: "decoracion",       label_es: "Decoración",       label_pt: "Decoração",         icon: Lamp,         examples: ["Alfombras","Iluminación","Cuadros"], brands: ["Philips","Osram","Tramontina","Generico"] },
      { id: "jardin",           label_es: "Jardín y Bricolaje", label_pt: "Jardim e Bricolagem", icon: Trees,    examples: ["Herramientas","Plantas","Riego"], brands: ["Stihl","Husqvarna","Black & Decker","Bosch","Makita","Tramontina","DeWalt","Stanley"] },
      { id: "otros-hogar",      label_es: "Otros",            label_pt: "Outros",            icon: Package },
    ],
  },
  {
    id: "tech",
    type: "tech",
    label_es: "Tecnología y Electrónica",
    label_pt: "Tecnologia e Eletrônica",
    desc_es: "Informática, celulares, gaming y más",
    desc_pt: "Informática, celulares, gaming e mais",
    icon: Cpu,
    accent: "from-transparent to-transparent group-hover:from-accent group-hover:to-accent group-hover:text-accent-foreground",
    subcategories: [
      { id: "informatica",   label_es: "Computadoras y Tablets", label_pt: "Computadores e Tablets", icon: Laptop,     brands: ["Apple", "Samsung", "Lenovo", "HP", "Dell", "Asus"] },
      { id: "celulares",     label_es: "Celulares y Smartphones", label_pt: "Celulares e Smartphones", icon: Smartphone, brands: ["iPhone", "Samsung Galaxy", "Xiaomi", "Motorola", "Huawei"] },
      { id: "televisores",   label_es: "Televisores",            label_pt: "Televisores",            icon: Cpu,        brands: ["Samsung","LG","Sony","TCL","Hisense","Philips","Panasonic","JVC","AOC","Tokyo","Mtek","Noblex","Aiwa"] },
      { id: "consolas",      label_es: "Consolas y Videojuegos",  label_pt: "Consoles e Videogames",  icon: Gamepad2,   brands: ["PS5", "Xbox Series", "Nintendo Switch", "PC Gamer"] },
      { id: "iot",           label_es: "Objetos Conectados (IoT)", label_pt: "Objetos Conectados (IoT)", icon: Watch,    brands: ["Apple", "Samsung", "Google", "Amazon", "Xiaomi"], examples: ["Smartwatches", "Alexa", "Google Home", "Cámaras Wi-Fi"] },
      { id: "accesorios",    label_es: "Accesorios",              label_pt: "Acessórios",              icon: Keyboard,   examples: ["Teclados","Mouses","Cables","Fundas"], brands: ["Logitech","Genius","HP","Microsoft","Razer","Redragon","Kingston","JBL"] },
    ],
  },
  {
    id: "sport",
    type: "sport",
    label_es: "Deportes",
    label_pt: "Esportes",
    desc_es: "Bicicletas, fitness y más",
    desc_pt: "Bicicletas, fitness e mais",
    icon: Trophy,
    accent: "from-lime-500/15 to-green-500/10 text-lime-700 dark:text-lime-300",
    subcategories: [
      { id: "bicicletas",        label_es: "Bicicletas",                       label_pt: "Bicicletas",                          icon: Bike },
      { id: "ropa-deportiva",    label_es: "Ropa y Uniformes Deportivos",      label_pt: "Roupas e Uniformes Esportivos",       icon: Shirt },
      { id: "calzado-deportivo", label_es: "Calzado Deportivo / Tenis",        label_pt: "Calçados Esportivos / Tênis",         icon: Footprints },
      { id: "fitness",           label_es: "Equipamientos de Gimnasio / Fitness", label_pt: "Equipamentos de Academia / Fitness", icon: Dumbbell },
      { id: "deportes-equipo",   label_es: "Deportes Colectivos",              label_pt: "Esportes Coletivos",                  icon: Trophy },
      { id: "otros-deportes",    label_es: "Otros",                            label_pt: "Outros",                              icon: Package },
    ],
  },
];

export const getCategoryById = (id?: string | null) =>
  CATEGORIES.find((c) => c.id === id || c.type === id);

export const getSubcategory = (categoryId: string, subId?: string | null) =>
  getCategoryById(categoryId)?.subcategories?.find((s) => s.id === subId);

export const getConditionMeta = (condition?: string | null) =>
  CONDITIONS.find((c) => c.id === condition);