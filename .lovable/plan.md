# Corrigir o autocompletar de localização no celular

## Diagnóstico

O `LocationPicker` atual **não tem autocompletar real**. Hoje ele só:
1. Mostra um campo `<Input>` de texto livre.
2. Tem um botão "Usar minha localização atual" (GPS / IP).
3. No mount, tenta IP geolocation silencioso (ipapi.co) e, se conseguir, **escreve uma cidade no campo automaticamente**.

No celular isso falha por dois motivos combinados:

- **Não existe lista de sugestões enquanto o usuário digita** — o que o usuário chama de "preenchimento automático" simplesmente não está implementado.
- O botão de GPS, dentro do **iframe do preview Lovable no iOS Safari**, frequentemente é bloqueado (Safari exige `allow="geolocation"` no iframe, que o preview não injeta). Por isso o usuário só vê "Obteniendo..." girando para sempre, como aparece no replay da sessão.
- O `ipapi.co` em rede móvel paraguaia muitas vezes retorna coordenadas erradas ou é bloqueado por CORS, então o "auto-preenchimento por IP" também não dispara.

A solução definitiva é trocar o campo por um **input com sugestões de endereço (typeahead)** usando a API pública do **Nominatim (OpenStreetMap)** — mesma fonte já usada no projeto, sem token, e que funciona igual em desktop e mobile (não depende de permissão do navegador nem do iframe).

## Plano

### 1. `src/components/LocationPicker.tsx` — reescrever para typeahead

- Adicionar estado: `suggestions`, `isSearching`, `showSuggestions`, `debouncedQuery`.
- Ao digitar (mín. 3 caracteres), com debounce de 350 ms, chamar:
  ```
  https://nominatim.openstreetmap.org/search
    ?q=<query>
    &format=json
    &addressdetails=1
    &limit=6
    &countrycodes=py,br,ar
    &accept-language=pt
  ```
  com header `User-Agent: LinkUpPlatform/1.0` e `AbortController` (cancela requisições antigas).
- Renderizar lista de sugestões (`<ul>`) abaixo do input com `display_name`. Usar tokens semânticos (`bg-popover`, `text-popover-foreground`, `border`, `hover:bg-accent`) — sem cores fixas.
- Ao clicar/tocar numa sugestão: preencher o input, chamar `onLocationSelect({ address, latitude: parseFloat(lat), longitude: parseFloat(lon) })`, fechar a lista.
- Fechar a lista em `onBlur` (com pequeno delay para o clique funcionar) e ao pressionar `Escape`.
- Acessibilidade: `role="listbox"`, `aria-autocomplete="list"`, navegação com setas ↑/↓ e Enter.
- Mobile: `inputMode="search"`, `autoComplete="off"`, `enterKeyHint="search"`, altura `h-11` para alvo de toque, `font-size: 16px` (já garantido pelo design global) para evitar zoom no iOS.

### 2. Manter o botão "Usar minha localização" como opção secundária
- Continua funcionando quando o usuário concede GPS.
- Quando preenche via GPS/IP, usa o reverse-geocode existente.
- Se falhar silenciosamente (iframe / permissão negada), o usuário agora tem o autocompletar como caminho principal.

### 3. Remover o auto-preenchimento por IP no mount
- Substituir pelo autocompletar manual — assim o campo nunca fica "preso" com uma cidade errada vinda do IP.

### 4. Sem mudanças em backend, em outras telas, ou no schema
- `PostAd.tsx` continua usando `<LocationPicker onLocationSelect={...} />` exatamente como hoje (mesma assinatura de prop).

## Arquivos afetados

- `src/components/LocationPicker.tsx` (única alteração)

## Como validar

1. Abrir `/post-ad` no celular.
2. Digitar "asun" → ver sugestões "Asunción, Paraguay…" aparecerem em ~0,5 s.
3. Tocar na sugestão → campo preenchido, latitude/longitude enviados ao formulário.
4. Em modo offline ou sem permissão de GPS, o fluxo continua 100% funcional.
