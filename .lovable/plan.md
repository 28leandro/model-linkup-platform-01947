# Plano: Performance Mobile "Estilo Spotify"

Objetivo: feed de anúncios ultra-rápido em 3G/4G, com carregamento instantâneo, sincronização em background e imagens adaptativas — mantendo o design atual.

## 1. Monitorizador de Conetividade (`SpeedProvider`)

**Novo:** `src/contexts/NetworkContext.tsx`
- Hook `useNetwork()` que expõe: `online`, `effectiveType` (`'4g'|'3g'|'2g'|'slow-2g'|'unknown'`), `saveData`, `isSlow` (= `2g`/`slow-2g`/`saveData`).
- Usa `navigator.connection` com listener `change` e fallback seguro para browsers sem suporte (assume `4g`).
- Listeners `online`/`offline` em `window`.
- Montado em `src/main.tsx` envolvendo `<App />` (acima do `QueryClientProvider`).

## 2. Cache Offline com IndexedDB (Stale-While-Revalidate)

**Novo:** `src/lib/listingsCache.ts`
- IndexedDB nativo (sem nova dependência). Database `nemu-cache`, store `listings` (keyPath `id`) + store `meta` (timestamps por chave de query).
- API: `getCachedListings(key)`, `setCachedListings(key, rows)`, `getCacheMeta(key)`.

**Novo:** `src/hooks/useCachedListings.ts`
- Fluxo SWR:
  1. Lê IndexedDB com a chave do feed (`feed:home`) e retorna imediatamente (`data`, `isStale=true`).
  2. Se `online`, faz `supabase.from('listings_public').select('*').order('created_at desc')` em background.
  3. Ao chegar dados frescos: atualiza estado + grava no IndexedDB.
- Retorna `{ listings, loading, refreshing, fromCache, lastSyncedAt }`.

**Editado:** `src/pages/Index.tsx`
- Substitui o `useEffect` que faz fetch direto por `useCachedListings()`. Mantém toda a lógica de filtros/sort intacta (apenas troca a fonte de `allListings`).

## 3. Componente de Imagem Adaptativa

**Novo:** `src/components/AdaptiveImage.tsx`
- Props: `src`, `alt`, `width`, `height`, `priority?`, `className`, `fallbackColor?`.
- Detecta se `src` é do Supabase Storage (`/storage/v1/object/public/...`) e reescreve para `/storage/v1/render/image/public/...` com query `?width=&quality=&format=webp`.
- Qualidade dinâmica via `useNetwork()`:
  - `4g`/desconhecido: `width=800, quality=80, format=webp`.
  - `3g`: `width=500, quality=65, format=webp`.
  - `2g`/`slow-2g`/`saveData`: `width=350, quality=50, format=webp`.
  - `offline`: tenta cache do browser; em erro mostra `fallbackColor` (placeholder sólido).
- `loading`/`fetchpriority`/`decoding` controlados por `priority`.
- Fundo `bg-muted` + dimensões fixas → previne CLS.

**Editado:** `src/components/ListingImageCarousel.tsx`
- Troca `<img>` por `<AdaptiveImage>` mantendo classes e fallback existentes.

## 4. LCP — Primeiro Anúncio Prioritário

**Editado:** `src/components/RecentListings.tsx` (e `SearchResults.tsx` se aplicável)
- Passa `priority={index === 0}` para o primeiro card. Restantes ficam `loading="lazy" decoding="async"` (já é o default do `AdaptiveImage`).

## 5. Banner de Rede

**Novo:** `src/components/NetworkBanner.tsx`
- Fixo no fundo (acima do `BottomNav`), discreto, com `safe-area-inset-bottom`.
- Mostra apenas se `!online` ou `isSlow`:
  - Offline: "Modo Offline — A navegar nos anúncios guardados".
  - Lento: "Ligação fraca detetada — Imagens otimizadas para poupar dados".
- Traduções PT/ES via `t()` em `LanguageContext`.
- Montado em `src/App.tsx`.

## Notas técnicas

- Sem novas dependências (IndexedDB nativo, sem Dexie).
- Não toca em RLS, schema, edge functions, nem no service worker existente.
- Não altera design/identidade visual — apenas substitui `<img>` por wrapper e adiciona um banner condicional.
- Mantém compatibilidade com o `priority` já usado em `ListingImageCarousel`.

## Arquivos

Novos: `src/contexts/NetworkContext.tsx`, `src/lib/listingsCache.ts`, `src/hooks/useCachedListings.ts`, `src/components/AdaptiveImage.tsx`, `src/components/NetworkBanner.tsx`.
Editados: `src/main.tsx`, `src/App.tsx`, `src/pages/Index.tsx`, `src/components/ListingImageCarousel.tsx`, `src/components/RecentListings.tsx`, `src/contexts/LanguageContext.tsx` (2 chaves de tradução).
