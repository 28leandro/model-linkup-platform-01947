## Reestruturação do formulário de publicação (`PostAd.tsx`)

Vou reorganizar o formulário em seções progressivas estilo *leboncoin*, mantendo 100% da identidade visual (mesmo Card, Inputs, Selects, cores, espaçamentos e radius já usados).

### 1. Estrutura em seções condicionais

O formulário será dividido em 3 blocos visualmente separados por um sub-título (`<h3>` com classe já existente `text-sm font-semibold text-muted-foreground`) e um `<Separator/>` (componente shadcn já no projeto):

```
Seção 1 — Categoría y fotos
  • Título del anuncio  (sempre)
  • Categoría principal (sempre)
  • Fotos                (sempre)

Seção 2 — Detalles del item  (aparece só depois que `category` é escolhida)
  • Subcategoría + Estado de conservación
  • Campos dinâmicos por categoria (já existem no código)
  • Descripción

Seção 3 — Precio y ubicación  (aparece só depois que `category` é escolhida)
  • Precio + Moneda (já agrupados, mantidos)
  • LocationPicker + Ciudad/Departamento na mesma linha
  • Teléfono
  • Botões Cancelar / Publicar
```

A revelação dos blocos será suave usando classes Tailwind já disponíveis: `animate-in fade-in slide-in-from-top-2 duration-300`.

### 2. Campos dinâmicos por categoria

A lógica condicional por categoria **já existe** (vehicles / real-estate / services). Vou complementar:

- **fashion**: adicionar bloco condicional com `Talla` (Input texto), `Género` (Select Masc/Fem/Infantil — já mapeado via subcategorias) e reaproveitar o `condition` que já é universal.
- **tech**: o bloco de `Marca/Modelo` já é renderizado via `sub.brands`. Adicionar campo opcional `Modelo` (Input livre) quando não houver lista de marcas/modelos.
- **home-garden / sport / outros**: nenhum campo extra — apenas Descripción + Precio (comportamento padrão).

Nenhuma alteração de schema é necessária: todos esses campos extras já são persistidos no JSONB `attributes`.

### 3. Agrupamento de campos menores

- Precio + Moneda: já estão lado a lado, mantido.
- Cidade + Departamento: já estão em `grid sm:grid-cols-2`, mantido.
- Teléfono + (espaço para campo extra futuro): manter coluna única (telefone fica melhor sozinho no mobile).

### 4. Validação em tempo real

- **Título**: helper text vermelho abaixo do input se `title.length > 0 && title.length < 5` (“Mínimo 5 caracteres”).
- **Precio**: já tem `min="0"` e `type="number"`. Vou bloquear valores negativos no `onChange` (`Math.max(0, ...)`).
- **Año** (veículos): clamp 1900..ano+1 no onChange.
- **Kilometraje / Habitaciones / Baños / Área**: `Math.max(0, ...)` no onChange.
- **Campos obrigatórios por categoria** (validação no `handleSubmit`, antes do schema):
  - vehicles: `subcategory`, `attributes.brand`, `year`
  - real-estate: `attributes.transactionType`, `attributes.propertyType`, `area`
  - services: nenhum extra além do universal
  - outros: nenhum extra
  
  Se faltar, mostrar `toast` específico apontando o campo.

### 5. Preservação visual

- Mesmos componentes (`Card`, `Input`, `Select`, `Textarea`, `Button`, `Label`, `LocationPicker`).
- Mesmas alturas (`h-11 sm:h-10`), mesmos `gap-3`, mesma classe `space-y-4 sm:space-y-6` no `<form>`.
- Sem mudanças em `index.css`, `tailwind.config.ts` ou tokens de cor.
- Sem mudanças no fluxo de fotos, paywall, upload, geocoding ou `handleSubmit` (apenas adicionar as validações pré-schema).

### Arquivos afetados

- `src/pages/PostAd.tsx` — única alteração (JSX reorganizado + validações em tempo real + bloco condicional para `fashion`/`tech`).

Nenhuma migração de banco, nenhuma mudança em outros componentes.
