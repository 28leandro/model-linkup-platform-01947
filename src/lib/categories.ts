import {
  Car,
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
  type LucideIcon,
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
  },
  {
    id: "real-estate",
    type: "real-estate",
    label_es: "Inmuebles",
    label_pt: "Imóveis",
    desc_es: "Venta y alquiler de propiedades",
    desc_pt: "Venda e aluguel de propriedades",
    icon: Home,
    accent: "from-emerald-500/15 to-teal-500/10 text-emerald-700 dark:text-emerald-300",
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
      { id: "muebles",          label_es: "Muebles",          label_pt: "Móveis",            icon: Sofa,         examples: ["Sofás", "Mesas", "Camas"] },
      { id: "electrodomesticos", label_es: "Electrodomésticos", label_pt: "Eletrodomésticos", icon: Refrigerator, examples: ["Heladeras", "Lavarropas", "Microondas"] },
      { id: "decoracion",       label_es: "Decoración",       label_pt: "Decoração",         icon: Lamp,         examples: ["Alfombras", "Iluminación", "Cuadros"] },
      { id: "jardin",           label_es: "Jardín y Bricolaje", label_pt: "Jardim e Bricolagem", icon: Trees,    examples: ["Herramientas", "Plantas", "Riego"] },
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
    accent: "from-violet-500/15 to-fuchsia-500/10 text-violet-700 dark:text-violet-300",
    subcategories: [
      { id: "informatica",   label_es: "Informática y Tablets",  label_pt: "Informática e Tablets", icon: Laptop,     brands: ["Apple", "Samsung", "Lenovo", "HP", "Dell", "Asus"] },
      { id: "celulares",     label_es: "Celulares y Smartphones", label_pt: "Celulares e Smartphones", icon: Smartphone, brands: ["iPhone", "Samsung Galaxy", "Xiaomi", "Motorola", "Huawei"] },
      { id: "consolas",      label_es: "Consolas y Videojuegos",  label_pt: "Consoles e Videogames",  icon: Gamepad2,   brands: ["PS5", "Xbox Series", "Nintendo Switch", "PC Gamer"] },
      { id: "iot",           label_es: "Objetos Conectados (IoT)", label_pt: "Objetos Conectados (IoT)", icon: Watch,    brands: ["Apple", "Samsung", "Google", "Amazon", "Xiaomi"], examples: ["Smartwatches", "Alexa", "Google Home", "Cámaras Wi-Fi"] },
      { id: "accesorios",    label_es: "Accesorios",              label_pt: "Acessórios",              icon: Keyboard,   examples: ["Teclados", "Mouses", "Cables", "Fundas"] },
    ],
  },
];

export const getCategoryById = (id?: string | null) =>
  CATEGORIES.find((c) => c.id === id || c.type === id);

export const getSubcategory = (categoryId: string, subId?: string | null) =>
  getCategoryById(categoryId)?.subcategories?.find((s) => s.id === subId);

export const getConditionMeta = (condition?: string | null) =>
  CONDITIONS.find((c) => c.id === condition);