## Objetivo

Corrigir o preenchimento de endereço por geolocalização em dispositivos móveis no `LocationPicker`, aplicando as 5 melhorias solicitadas. A maioria já existe parcialmente — vamos reforçar os pontos fracos.

## Mudanças (apenas em `src/components/LocationPicker.tsx`)

### 1. Permissões explícitas (gesto do usuário)
Já está OK — `getCurrentCoordinates` só é chamado pelo `onClick` do botão "Usar minha localização". Vou apenas garantir que nenhum efeito automático dispare GPS no mount.

### 2. Configurações de precisão ajustadas
Trocar a primeira tentativa do navegador para os valores exatos pedidos:
```ts
{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
```
Manter os fallbacks de baixa precisão e `watchPosition` como rede de segurança (sem isso, celulares lentos falham em 10s).

### 3. Fallback de erro com mensagem amigável
- Adicionar nas traduções PT/ES a chave `location.enableOrTypeManually` = "Por favor, ative a localização ou digite o endereço manualmente" / "Por favor, active la ubicación o escriba la dirección manualmente".
- Exibir essa mensagem no toast e no `<Alert>` para QUALQUER falha (não só `PERMISSION_DENIED`), substituindo as variantes genéricas atuais.

### 4. Tratamento de HTTPS
Adicionar verificação explícita no clique do botão:
```ts
if (!Capacitor.isNativePlatform() && location.protocol !== 'https:' && location.hostname !== 'localhost') {
  // mostrar alert: "Geolocalização requer HTTPS"
  return;
}
```
Já existia `window.isSecureContext`, mas vamos mostrar mensagem específica antes de tentar, em vez de cair no erro genérico `NOT_SUPPORTED`.

### 5. Feedback visual no campo
Hoje o spinner aparece só no botão. Adicionar:
- Spinner `<Loader2>` dentro do `<Input>` (lado direito) quando `isGettingLocation === true`.
- Desabilitar o `<Input>` (`disabled={isGettingLocation}`) durante a busca.
- Texto placeholder muda para "Obtendo localização..." enquanto carrega.

## Arquivos afetados

- `src/components/LocationPicker.tsx` — mudanças acima
- `src/contexts/LanguageContext.tsx` — adicionar 2 chaves de tradução (`location.enableOrTypeManually`, `location.httpsRequired`)

## Fora do escopo

- Sem mudanças no Capacitor nativo (já funciona com permissões explícitas).
- Sem mudanças no autocomplete Nominatim (já implementado).
- Sem mudanças em outros arquivos/páginas.
