# Plan: Rediseño completo del marketplace estilo Leboncoin (PY)

Este es un cambio amplio. Lo dividimos en **5 fases** para entregar valor incrementalmente y evitar romper lo existente. Podés aprobar todo o pedirme ejecutar solo algunas fases.

## Fase 1 — Taxonomía de categorías (base)

Crear un archivo central `src/lib/categories.ts` con la estructura jerárquica del Paraguay:

- **Vehículos** (ya existe)
- **Inmuebles** (ya existe)
- **Servicios** (ya existe)
- **Hogar y Jardín** (NUEVO)
  - Muebles (Sofás, Mesas, Camas)
  - Electrodomésticos (Heladeras, Lavarropas, Microondas)
  - Decoración (Alfombras, Iluminación, Cuadros)
  - Jardín y Bricolaje
- **Tecnología y Electrónica** (NUEVO)
  - Informática y Tablets (Apple, Samsung, Lenovo, HP, Dell, Asus)
  - Celulares y Smartphones (iPhone, Samsung Galaxy, Xiaomi, Motorola)
  - Consolas y Videojuegos (PS5, Xbox Series, Nintendo Switch, PC Gamer)
  - Objetos Conectados / IoT (Smartwatches, Alexa, Cámaras Wi-Fi)
  - Accesorios (Teclados, Mouses, Cables, Fundas)

Cada categoría con: `id`, `label_es`, `label_pt`, `icon` (lucide), subcategorías, marcas sugeridas.

Lista de ciudades PY en `src/lib/cities.ts`: Asunción, Ciudad del Este, Encarnación, San Lorenzo, Luque, Capiatá, Lambaré, Fernando de la Mora, Pedro Juan Caballero, Coronel Oviedo, Villarrica, Concepción, etc.

**Migración DB:** añadir columnas opcionales `subcategory`, `brand`, `model`, `condition` (`nuevo` | `como_nuevo` | `usado_excelente` | `usado_funcional`) a `listings`. Sin breaking changes (todo nullable).

## Fase 2 — Home rediseñado (Bento + Banners + Ad slots)

Reemplazo de `Index.tsx` por un layout limpio:

```text
┌──────────────────────────────────────────────┐
│  Header con búsqueda global prominente       │
├──────────────────────────────────────────────┤
│  Banner carrusel (max-h 250px)               │
├──────────────────────────────────────────────┤
│  Bento grid de 5 categorías (iconos lucide)  │
├──────────────────────────────────────────────┤
│  [Sidebar Ad]  Grid de productos  [Ad slot]  │
├──────────────────────────────────────────────┤
│  Footer                                       │
└──────────────────────────────────────────────┘
```

- Cartas con `rounded-2xl`, `shadow-sm hover:shadow-md`, mucho whitespace
- Lazy-loading de imágenes (`loading="lazy"` ya existe, reforzar)
- Componentes nuevos: `CategoryBento`, `HeroCarousel`, `AdSlot` (placeholder)
- Soporte modo oscuro suave vía `next-themes` ya existente o toggle simple

## Fase 3 — Filtros inteligentes + búsqueda

Extender `ListingFilter`:
- Rango de precio (PYG / USD)
- Radio de KM desde ubicación del usuario (slider 5–500 km)
- Fecha de publicación (Hoy, 7 días, 30 días)
- Filtro por subcategoría dinámico según categoría
- Filtro por marca (cuando aplica a tech)
- Filtro por estado (Nuevo / Como Nuevo / Usado…) con badges de color

Badges de estado en cada card:
- Nuevo → verde
- Como Nuevo → azul
- Usado Excelente → ámbar
- Usado Funcional → gris

## Fase 4 — Flujo de publicación step-by-step

Refactor de `PostAd.tsx` a wizard de pasos:

1. **Categoría** → bento grid de categorías
2. **Subcategoría** → grid de subcategorías
3. **Detalles** → título, descripción, marca/modelo si tech, estado
4. **Fotos** → drag-and-drop con preview, optimizado mobile
5. **Precio + Ubicación** → currency toggle, ciudad PY, mapa
6. **Revisar y publicar**

Barra de progreso superior, transiciones suaves con `framer-motion` (ya en el proyecto si está, sino CSS transitions).

## Fase 5 — VDP + Chat estilo iMessage

**Listing Detail (VDP):**
- Carrusel de fotos moderno (swipe en mobile, flechas en desktop)
- Botón flotante "Contactar vendedor" fijo en mobile bottom
- Mapa con ubicación aproximada (radio 500m, no exacta) — ya existe parcialmente
- Sección de specs (marca, modelo, año, estado) según categoría

**Chat (`ContactSellerChat` + `Inbox`):**
- Burbujas estilo iMessage: emisor a la derecha azul, receptor a la izquierda gris
- `rounded-2xl`, esquinas asimétricas en última burbuja del grupo
- Timestamps agrupados, indicador "leído"
- Input fijo abajo, autoexpansible
- Sin headers pesados — minimalista

---

## Detalles técnicos

- **Stack:** React + Tailwind + lucide-react (ya en proyecto). Sin nuevas dependencias salvo que falte `framer-motion`.
- **DB:** una sola migración aditiva (columnas nullable) — no rompe datos existentes.
- **i18n:** todas las strings vía `t()` en `LanguageContext` (PT + ES).
- **Performance:** lazy-load images, `React.lazy` para páginas pesadas, memoization en filtros.
- **Responsive:** mobile-first, touch targets ≥44px, inputs 16px (regla iOS ya en `index.css`).
- **Modo oscuro:** tokens HSL en `index.css` con variante `.dark`.

---

## Pregunta antes de ejecutar

Este trabajo es grande (~15–20 archivos nuevos/modificados + 1 migración). Sugiero:

**Opción A — Ejecutar todo de corrido** (1 entrega grande, ~muchos pasos)
**Opción B — Fase por fase** con tu aprobación entre cada una (más seguro)
**Opción C — Solo fases priorizadas** (decime cuáles)

Mi recomendación: **Opción B**, empezando por Fase 1 (taxonomía + migración) y Fase 2 (home rediseñado), que es donde el cambio visual es más impactante. Decime cómo seguimos.
