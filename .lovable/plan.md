## Alterações na BottomNav (mobile)

**Arquivo:** `src/components/BottomNav.tsx`

### 1. Alinhar o botão "Publicar" com os demais
- Remover o estilo destacado (círculo grande elevado com `-mt-5`, `ring-4`, sombra).
- Transformar o "Publicar" em um item normal da barra, igual aos outros (ícone + label, mesma altura, mesmo tamanho de fonte).
- Manter o ícone `Plus` e o label `t("nav.postAd")`, mas usando a mesma classe `itemClass` dos demais.
- Resultado: 5 itens uniformes na mesma linha — Início, Buscar, Publicar, Chat, Menu.

### 2. Cor ao tocar nos demais comandos
- Atualizar `itemClass` para que TODOS os itens (incluindo agora o Publicar) reajam ao toque com uma cor visível.
- Usar estado `active:` do Tailwind: `active:bg-primary/10 active:text-primary` (substituindo o atual `active:bg-accent/10 active:text-accent` que pode estar pouco visível).
- O efeito aparece apenas no momento do toque e desaparece ao soltar — sem estado permanente.
- Item ativo da rota continua com `text-primary` para indicar a página atual.

### Sem alterações
- Nenhuma mudança em desktop (a barra continua `md:hidden`).
- Sem mudanças em `RecentListings.tsx` nem em outros arquivos.
