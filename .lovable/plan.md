## Ajuste no campo Marca + novo campo Modelo (Veículos)

### Objetivo
Na página de publicação, quando a categoria for **Vehículos**, expandir a lista de marcas (incluindo marcas chinesas como Geely, BYD, Chery, JAC, Great Wall, Haval, MG, Changan, Dongfeng, Foton, etc.) e adicionar um novo campo **Modelo** que mostra automaticamente os modelos da marca selecionada (apenas modelos comercializados de **2005 até o presente**).

### Mudanças

**1. `src/lib/categories.ts`**
- Manter a estrutura atual de `subcategories` (autos / motos / camiones).
- Substituir o array simples `brands: string[]` por uma estrutura `brandModels: Record<string, string[]>` em cada subcategoria de veículos, mapeando cada marca para sua lista de modelos (2005–atualidade).
- Adicionar marcas chinesas:
  - **Autos**: Geely, BYD, Chery, JAC, Great Wall, Haval, MG, Changan, Dongfeng, GAC, Lifan, DFSK
  - **Camiones**: JAC, Foton, Sinotruk, Dongfeng, Shacman, FAW, Higer, Yutong, Golden Dragon
  - **Motos**: Loncin, Lifan, Zongshen, Haojue, Jianshe (já existem Bajaj/Kenton/Star/Leopard)
- Helper `getBrandsFor(subId)` e `getModelsFor(subId, brand)`.

**2. `src/pages/PostAd.tsx`**
- O `Select` de Marca passa a ler de `getBrandsFor(subcategory)`.
- Ao mudar a marca, limpar `attributes.model`.
- Adicionar novo `Select` de **Modelo** logo abaixo da Marca, populado com `getModelsFor(subcategory, attributes.brand)`.
  - Só aparece se houver marca selecionada.
  - Inclui opção "Otro" que troca para um `Input` de texto livre (`modelCustom`), igual ao padrão já usado para "Otra" marca.
- Aplica-se apenas à categoria `vehicles` (Hogar/Tech mantêm o comportamento atual com `brands` flat).

### Detalhes técnicos

```text
Subcategoria: Autos
└─ Marca: [Toyota ▼]   ← lista expandida c/ chinesas
   └─ Modelo: [Corolla ▼]   ← novo, filtrado por marca
      ou "Otro" → input livre
```

- Modelos cobertos: gerações comercializadas no Paraguai entre 2005 e 2026 (ex.: Toyota → Corolla, Hilux, Yaris, Etios, RAV4, Land Cruiser, Fortuner, Camry, Prius, Avanza, Innova, 4Runner, Tacoma, Hiace; BYD → F0, F3, Song, Tang, Yuan, Dolphin, Atto 3, Han, Seal; Geely → Emgrand, Coolray, Tugella, Atlas; etc.).
- Lista grande ⇒ ficará num arquivo dedicado se ultrapassar ~400 linhas em `categories.ts` (extrair para `src/lib/vehicleBrands.ts`).
- Sem alterações de schema / backend — `attributes.brand` e `attributes.model` já são salvos como JSONB.

### Arquivos afetados
- `src/lib/categories.ts` (ou novo `src/lib/vehicleBrands.ts` + import)
- `src/pages/PostAd.tsx`
