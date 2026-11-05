# Solução de referência — (Hardening)

O app de referência já incorpora as práticas de hardening. Use como gabarito.

## Acessibilidade (a11y)

- **Busca:** `SearchBar` usa `<form>` com `label` associado e `aria-label` no
  input; o botão tem texto visível.
- **Toggle de unidade:** `UnitToggle` usa `role="group"` + `aria-pressed` nos
  botões — leitores anunciam qual unidade está ativa.
- **Estados:** `LoadingState` usa `role="status"`; `ErrorState` usa `role="alert"`
  → mudanças são anunciadas.
- **Teclado:** todos os interativos são nativos (`button`, `input`) — foco e
  ativação por teclado funcionam por padrão.
- **UX:** a busca expõe `aria-busy` enquanto está em andamento e move o foco ao
  título do resultado quando a consulta termina.
- **Contraste:** texto escuro nos controles com fundo accent atende ao contraste
  mínimo; o foco permanece visível.
- Ver [`src/components/SearchBar.tsx`](../../src/components/SearchBar.tsx),
  [`src/components/UnitToggle.tsx`](../../src/components/UnitToggle.tsx),
  [`src/components/states/LoadingState.tsx`](../../src/components/states/LoadingState.tsx),
  [`src/components/states/ErrorState.tsx`](../../src/components/states/ErrorState.tsx).

## Resiliência

- **Timeout** de 8s via `AbortController` em
  [`src/services/weatherService.ts`](../../src/services/weatherService.ts).
- **Erros tipados** (`WeatherServiceError`) com mensagens prontas ao usuário.
- **Retry** em [`src/hooks/useWeather.ts`](../../src/hooks/useWeather.ts) refaz a
  última operação (buscar/cidade).
- Falha de rede vira estado `error` controlado — a UI nunca quebra.
- Sem dados meteorológicos utilizáveis, a resposta gera um erro recuperável em
  vez de apresentar uma tela vazia de valores.

## Respostas parciais

- `precipitation_probability_max[i]` ausente permanece `null` e é exibido como "—".
- Ausência de `current`/`daily` → erro de "resposta incompleta" em vez de crash.
- Campos parciais permanecem como `null` no mapeamento e são exibidos como "—".

## Edge cases cobertos por teste

- Input vazio ou com espaços não dispara busca (`weather-ui.test.tsx`).
- Acentos e caracteres especiais são tratados como texto (`weatherService.test.ts`).
- Geocoding sem `results` → estado vazio (`weatherService.test.ts` + E2E).
- Resposta não-ok, incompleta ou sem dados utilizáveis → erro (`weatherService.test.ts`).
- Falha de rede seguida de retry → recuperação (`weather.spec.ts`).
- Busca por teclado, foco no resultado e viewport de 320 px (`weather.spec.ts`).

## Verificação

```bash
pnpm lint && pnpm build && pnpm test && pnpm test:e2e
```

Tudo verde.
