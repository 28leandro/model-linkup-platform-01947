## Alterações em `src/components/BottomNav.tsx` (somente mobile)

### 1. Efeito de toque igual aos botões "ubicación" e "km"
Esses botões usam `variant="outline"` do shadcn, cujo efeito é `hover:bg-accent hover:text-accent-foreground` (fundo cinza suave do tema, sem tom primário).

- Trocar no `itemClass` o atual `active:bg-primary/15 active:text-primary` por `active:bg-accent active:text-accent-foreground`.
- Manter o estado de rota ativa com `text-primary` (continua sinalizando a página atual).
- Sem estado permanente — o efeito aparece só enquanto o dedo está pressionando.

### 2. Botão "+" dentro de quadrado arredondado com cor fixa
- Manter o "Publicar" alinhado na mesma barra que os outros (mesma altura, mesmo tamanho de fonte) — não voltar ao círculo elevado.
- O ícone `Plus` passa a ficar dentro de um pequeno quadrado de cantos arredondados (`rounded-lg`), com cor de fundo fixa (`bg-primary text-primary-foreground`), tamanho aproximado `h-7 w-7`, ícone `h-4 w-4`.
- O label `Publicar` continua abaixo, no mesmo tamanho dos demais.
- Esse quadrado mantém a cor fixa sempre (não muda com toque nem com rota), apenas o label segue a regra normal dos demais itens.

### Sem alterações
- Nada muda em desktop, em `RecentListings.tsx` ou em outros arquivos.
- Nenhuma alteração de lógica/navegação.
