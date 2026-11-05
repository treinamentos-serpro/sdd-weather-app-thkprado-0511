# Solução de referência — Testing

A suíte inclui **38 testes unitários** e três cenários E2E determinísticos,
executados nos projetos Chromium e mobile do Playwright (seis execuções).

## Arquivos de referência

- [`tests/unit/temperature.test.ts`](../../tests/unit/temperature.test.ts)
- [`tests/unit/weatherCode.test.ts`](../../tests/unit/weatherCode.test.ts)
- [`tests/unit/format.test.ts`](../../tests/unit/format.test.ts)
- [`tests/unit/services/weatherService.test.ts`](../../tests/unit/services/weatherService.test.ts)
- [`tests/unit/hooks/useWeather.test.ts`](../../tests/unit/hooks/useWeather.test.ts)
- [`tests/unit/components/weather-ui.test.tsx`](../../tests/unit/components/weather-ui.test.tsx)
- [`tests/e2e/weather.spec.ts`](../../tests/e2e/weather.spec.ts)

## Padrões aplicados

- **Mock de rede com `vi.stubGlobal('fetch', ...)`** nos testes do service —
  nenhum teste toca a API real.
- **Queries acessíveis** (`getByRole`, `getByLabelText`) em vez de seletores por
  classe — os testes validam a experiência, não a implementação.
- **Determinismo no E2E** via `page.route('**/geocoding-api.open-meteo.com/**')`
  e `'**/api.open-meteo.com/**'` retornando fixtures.
- **Conversão verificável:** temperatura mock de 0°C facilita assertar 32°F.
- **Cobertura de edge cases:** input vazio, sem resultados, resposta não-ok e
  resposta incompleta ou parcial; valores meteorológicos ausentes permanecem
  `null` no service e são exibidos como “—”.
- **Estabilidade E2E:** as rotas de geocoding e forecast são interceptadas, e a
  troca de unidade confirma que nenhuma consulta adicional é feita.

## Comandos

```bash
pnpm test            # unitários (Vitest)
pnpm test:coverage   # cobertura
pnpm test:e2e        # E2E (Playwright)
```

## Resultado validado

```text
Test Files  6 passed (6)
     Tests  38 passed (38)

6 passed   (Playwright: 3 cenários em Chromium e mobile)
Lines      92.77% (Vitest coverage)
```
