# Backlog de Tarefas — Weather App

Backlog derivado de [specs/weather-app-spec.md](../specs/weather-app-spec.md) e
[plans/weather-app-plan.md](../plans/weather-app-plan.md). A spec é a fonte de
verdade em caso de divergência.

## Priorização e tamanho

- **P0:** necessário para entregar o fluxo principal conforme a spec.
- **P1:** necessário para verificar qualidade, resiliência e acessibilidade antes
  da entrega.
- **P2:** validação de compatibilidade complementar; não exclui RNF7 dos
  critérios de lançamento.
- **P / M / G:** esforço relativo pequeno/médio/grande. Não há tarefa G:
  trabalhos maiores foram divididos em unidades menores.

## Entrega 1 — Contratos e funções puras

### T-01 — Definir os tipos do domínio meteorológico
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** Data
- **Descrição:** Criar os contratos compartilhados de unidade, cidade, clima atual, dia de previsão e dados meteorológicos, conforme o modelo do plano.
- **Critérios de aceite:**
  - `Unit`, `City`, `CurrentWeather`, `ForecastDay` e `WeatherData` são exportados de `src/types/weather.ts`.
  - Campos que podem estar ausentes na API aceitam `null` conforme o plano; temperaturas armazenadas são Celsius.
  - Os tipos compilam com TypeScript strict sem adicionar dependências.
- **Dependências:** —
- **Arquivos:** `src/types/weather.ts`
- **Requisitos:** RF1, RF2, RF3, RF4

### T-02 — Implementar conversão e formatação de temperatura
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** Data
- **Descrição:** Criar funções puras para converter Celsius/Fahrenheit e formatar temperaturas para apresentação.
- **Critérios de aceite:**
  - Conversões verificam `0 °C → 32 °F`, `100 °C → 212 °F` e `-40 °C → -40 °F`.
  - Conversão de volta de Fahrenheit para Celsius é suportada; a função não altera o valor armazenado.
  - `null` é formatado como “—” e valores válidos incluem a unidade selecionada.
- **Dependências:** T-01
- **Arquivos:** `src/lib/temperature.ts`
- **Requisitos:** RF2, RF3, RF4

### T-03 — Mapear códigos meteorológicos WMO
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** Data
- **Descrição:** Criar o mapeamento local de códigos WMO para descrições em pt-BR e identificadores de ícone.
- **Critérios de aceite:**
  - Os códigos de clima relevantes retornados pela Open-Meteo têm descrição em pt-BR.
  - Código desconhecido ou indisponível tem fallback explícito sem ocultar a informação restante.
- **Dependências:** T-01
- **Arquivos:** `src/lib/weatherCode.ts`
- **Requisitos:** RF2, RF3, RNF5

### T-04 — Formatar datas civis da previsão
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** Data
- **Descrição:** Criar função pura para apresentar datas `YYYY-MM-DD` da API sem deslocamento causado por conversão UTC.
- **Critérios de aceite:**
  - Data correspondente ao primeiro dia da previsão é rotulada “Hoje” e a segunda “Amanhã”.
  - Datas seguintes recebem rótulo abreviado do dia em pt-BR.
  - Formatação preserva a data civil recebida e é coberta para mudança de mês/ano.
- **Dependências:** —
- **Arquivos:** `src/lib/date.ts`
- **Requisitos:** RF3, RNF5

## Entrega 2 — Integração com a Open-Meteo

### T-05 — Implementar busca geográfica de cidades
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** Data
- **Descrição:** Criar `searchCities` em service próprio, normalizando resultados de geocoding para `City`.
- **Critérios de aceite:**
  - A busca aplica `trim`, codifica a consulta como parâmetro URL e pede no máximo cinco resultados em português.
  - Resultados incluem apenas contexto geográfico fornecido pela API; região/país ausentes não são inventados.
  - Lista sem resultados é retornada como vazio; falha HTTP, JSON inválido, rede e timeout são erros recuperáveis.
  - A chamada usa `AbortController` e o limite de timeout de 8 segundos definido no plano.
- **Dependências:** T-01
- **Arquivos:** `src/services/geocodingService.ts`
- **Requisitos:** RF1, RF5, RNF4, RNF5

### T-06 — Implementar consulta do clima atual
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** Data
- **Descrição:** Criar service para consultar e normalizar a seção de clima atual em Celsius.
- **Critérios de aceite:**
  - A URL solicita os campos atuais previstos no plano, usa `timezone=auto` e fixa a unidade em Celsius.
  - Temperatura, condição/código, umidade, vento, pressão, precipitação e horário são mapeados para o contrato interno.
  - Campo ausente ou inválido vira `null`; não há conversão de ausência para zero nem descarte dos demais campos válidos.
  - Falha HTTP, JSON inválido, rede e timeout de 8 segundos são erros recuperáveis.
- **Dependências:** T-01, T-03
- **Arquivos:** `src/services/weatherService.ts`
- **Requisitos:** RF2, RF5, RNF4

### T-07 — Implementar consulta da previsão diária
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** Data
- **Descrição:** Criar service para normalizar a previsão de hoje e dos quatro dias seguintes.
- **Critérios de aceite:**
  - A URL solicita cinco dias, usa `timezone=auto` e unidade Celsius.
  - Os campos diários são associados por índice à data e retornam no máximo cinco dias, com mínima, máxima, código/condição e precipitação.
  - Campos ausentes ou inválidos viram `null`, preservando datas e outros valores utilizáveis.
  - Falha HTTP, JSON inválido, rede e timeout de 8 segundos são erros recuperáveis.
- **Dependências:** T-01, T-03
- **Arquivos:** `src/services/weatherService.ts`
- **Requisitos:** RF3, RF5, RNF4

## Entrega 3 — Orquestração e componentes

### T-08 — Orquestrar busca e seleção de cidade
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** Data
- **Descrição:** Implementar no hook o fluxo de busca explícita, estados de busca e seleção manual de um resultado.
- **Critérios de aceite:**
  - O hook expõe estado de busca distinguível entre idle, loading, success, empty e error, além de resultados e cidade selecionada.
  - Busca vazia após `trim` não chama o service e informa a necessidade de digitar uma cidade.
  - Busca com resultados aguarda seleção manual; busca vazia e erro de serviço permanecem estados distintos.
  - Nova busca aborta a anterior quando possível e ignora resultado obsoleto.
- **Dependências:** T-05
- **Arquivos:** `src/hooks/useWeather.ts`
- **Requisitos:** RF1, RF5, RNF3, RNF4

### T-09 — Orquestrar clima, previsão, unidade e retry
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** Data
- **Descrição:** Estender o hook para consultar as seções independentes de clima e previsão e expor ações de retry e troca de unidade.
- **Critérios de aceite:**
  - Selecionar cidade inicia em paralelo as consultas atual e diária; cada seção mantém loading/success/error independente.
  - Retry repete apenas a seção que falhou, com novo estado de loading, preservando cidade e dados válidos da outra seção.
  - Seções sem dados utilizáveis comunicam indisponibilidade e permitem retry; valores parciais não são inventados.
  - Unidade começa em Celsius; alternar unidade não chama services, e respostas posteriores respeitam a unidade vigente.
  - Selecionar nova cidade invalida resultados meteorológicos obsoletos.
- **Dependências:** T-02, T-06, T-07, T-08
- **Arquivos:** `src/hooks/useWeather.ts`
- **Requisitos:** RF2, RF3, RF4, RF5, RNF3, RNF4

### T-10 — Criar formulário de busca acessível
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** UI
- **Descrição:** Criar o formulário que recebe e envia explicitamente o nome da cidade.
- **Critérios de aceite:**
  - Campo tem label acessível, pode ser operado por teclado e envia por botão e Enter.
  - Submit vazio não inicia busca e apresenta orientação em pt-BR.
  - Durante busca, a interface comunica loading sem bloquear edição de modo permanente.
- **Dependências:** T-08
- **Arquivos:** `src/components/SearchForm.tsx`
- **Requisitos:** RF1, RF5, RNF2, RNF3, RNF5

### T-11 — Criar lista selecionável de cidades
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** UI
- **Descrição:** Exibir resultados de geocoding com contexto geográfico disponível e seleção explícita.
- **Critérios de aceite:**
  - Cada resultado mostra nome e região/estado e país quando fornecidos.
  - Opções têm nome acessível, são selecionáveis por teclado e disambiguam homônimos com os dados existentes.
  - Estado sem resultados comunica claramente que nenhuma cidade foi encontrada.
- **Dependências:** T-01, T-08
- **Arquivos:** `src/components/SearchResults.tsx`
- **Requisitos:** RF1, RF5, RNF2, RNF5

### T-12 — Criar componentes de loading, vazio e erro
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** UI
- **Descrição:** Criar componentes reutilizáveis para os estados de consulta.
- **Critérios de aceite:**
  - Loading, vazio e erro têm mensagens distintas em pt-BR e semântica anunciável.
  - Erro oferece ação nomeada de tentar novamente; estado vazio não é apresentado como erro.
  - Estados são identificáveis por tecnologia assistiva e não dependem apenas de cor ou ícone.
- **Dependências:** —
- **Arquivos:** `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`
- **Requisitos:** RF5, RNF2, RNF5

### T-13 — Exibir clima atual
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** UI
- **Descrição:** Criar a seção de clima atual e apresentar os campos disponíveis para a cidade selecionada.
- **Critérios de aceite:**
  - Exibe temperatura, condição, umidade, vento, pressão e precipitação disponíveis.
  - Campo ausente aparece como “—” sem esconder os outros campos válidos.
  - Estado de falha da seção apresenta retry específico sem ocultar a previsão bem-sucedida.
- **Dependências:** T-01, T-02, T-03, T-12
- **Arquivos:** `src/components/CurrentWeather.tsx`
- **Requisitos:** RF2, RF5, RNF5

### T-14 — Exibir previsão de cinco dias
- **Prioridade:** P0
- **Tamanho:** M
- **Tipo:** UI
- **Descrição:** Criar a lista de cinco resumos diários, incluindo mínima, máxima, condição e precipitação.
- **Critérios de aceite:**
  - Apresenta hoje e os quatro dias seguintes, com todos os campos disponíveis.
  - Campos ausentes aparecem como “—”; falha da previsão mantém o clima atual visível e oferece retry específico.
  - Layout se adapta a viewport móvel sem exigir rolagem horizontal da página.
- **Dependências:** T-01, T-02, T-03, T-04, T-12
- **Arquivos:** `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`
- **Requisitos:** RF3, RF5, RNF1, RNF5

### T-15 — Criar controle acessível de unidade
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** UI
- **Descrição:** Criar controle de alternância entre Celsius e Fahrenheit.
- **Critérios de aceite:**
  - Controles °C e °F têm nomes acessíveis e são operáveis por teclado.
  - Unidade selecionada fica visual e programaticamente identificável.
  - A seleção aciona somente a ação local de unidade fornecida pelo hook.
- **Dependências:** T-02, T-09
- **Arquivos:** `src/components/UnitToggle.tsx`
- **Requisitos:** RF4, RNF2

### T-16 — Integrar busca e estados iniciais no App
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** UI
- **Descrição:** Conectar formulário, resultados e estados de busca ao hook na tela principal.
- **Critérios de aceite:**
  - A tela permite busca e seleção manual de cidade sem expor URLs ou respostas brutas da API à UI.
  - Estado inicial, loading, vazio e erro da busca são conectados às seções correspondentes.
  - A tela inicial é utilizável a partir de 320 px, com foco visível e textos em pt-BR.
  - O fluxo não exige login nem persiste buscas, cidade, unidade ou telemetria.
- **Dependências:** T-08, T-10, T-11, T-12
- **Arquivos:** `src/App.tsx`
- **Requisitos:** RF1, RF5, RNF1, RNF2, RNF5, RNF6

### T-17 — Integrar clima, previsão e unidade no App
- **Prioridade:** P0
- **Tamanho:** P
- **Tipo:** UI
- **Descrição:** Conectar as seções meteorológicas e o controle de unidade ao fluxo já integrado no App.
- **Critérios de aceite:**
  - Após selecionar uma cidade, clima atual e previsão aparecem nas respectivas seções.
  - Seções parciais/erro mantêm os dados bem-sucedidos visíveis e oferecem retry independente.
  - O controle atualiza todas as temperaturas sem iniciar nova consulta.
- **Dependências:** T-09, T-13, T-14, T-15, T-16
- **Arquivos:** `src/App.tsx`
- **Requisitos:** RF2, RF3, RF4, RF5, RNF1, RNF2, RNF5

## Entrega 4 — Testes explícitos

### T-18 — Testar funções de temperatura e códigos WMO
- **Prioridade:** P1
- **Tamanho:** P
- **Tipo:** Test
- **Descrição:** Criar testes unitários para conversão/formatação de temperatura e mapeamento WMO.
- **Critérios de aceite:**
  - Testes cobrem conversões nos dois sentidos, valores de referência, arredondamento e `null`.
  - Testes cobrem códigos WMO conhecidos e desconhecidos.
  - Testes não dependem de rede.
- **Dependências:** T-02, T-03
- **Arquivos:** `tests/unit/lib/weather-formatting.test.ts`
- **Requisitos:** RF2, RF3, RF4

### T-19 — Testar formatação de datas civis
- **Prioridade:** P1
- **Tamanho:** P
- **Tipo:** Test
- **Descrição:** Cobrir rótulos da previsão e casos de borda de calendário.
- **Critérios de aceite:**
  - Testes cobrem hoje, amanhã e dias seguintes, incluindo virada de mês/ano.
  - Testes confirmam que a data civil não muda com o fuso horário da máquina.
- **Dependências:** T-04
- **Arquivos:** `tests/unit/lib/date.test.ts`
- **Requisitos:** RF3

### T-20 — Testar service de geocoding
- **Prioridade:** P1
- **Tamanho:** M
- **Tipo:** Test
- **Descrição:** Testar contrato, normalização e falhas do service geográfico com `fetch` mockado.
- **Critérios de aceite:**
  - Testes verificam URL/parâmetros codificados, consulta vazia, resultado com contexto e resposta sem resultados.
  - Testes verificam falha HTTP/rede, JSON inválido e timeout/abort sem depender da API externa.
  - Metadados opcionais ausentes não são inventados nem causam falha de mapeamento.
- **Dependências:** T-05
- **Arquivos:** `tests/unit/services/geocodingService.test.ts`
- **Requisitos:** RF1, RF5, RNF4

### T-21 — Testar services de clima e previsão
- **Prioridade:** P1
- **Tamanho:** M
- **Tipo:** Test
- **Descrição:** Testar mapeamento de resposta atual e diária com `fetch` mockado.
- **Critérios de aceite:**
  - Testes verificam campos/parâmetros solicitados, timezone, Celsius e o limite de cinco dias.
  - Testes cobrem mapeamento completo e parcial, valores inválidos, arrays incompletos, HTTP/rede, JSON inválido e timeout.
  - Serviços testados separadamente não exigem disponibilidade de Open-Meteo.
- **Dependências:** T-06, T-07
- **Arquivos:** `tests/unit/services/weatherService.test.ts`
- **Requisitos:** RF2, RF3, RF5, RNF4

### T-22 — Testar estados e concorrência do hook
- **Prioridade:** P1
- **Tamanho:** M
- **Tipo:** Test
- **Descrição:** Testar as transições do hook e a coordenação entre busca, consultas independentes, unidade e retry.
- **Critérios de aceite:**
  - Testes cobrem vazio sem chamada, loading, resultados, seleção, empty, erro e retry da busca.
  - Testes cobrem loading/resultados independentes, retry da seção falha, preservação parcial e resposta sem dados utilizáveis.
  - Alternar unidade não repete consulta; respostas antigas de busca/seleção não substituem o estado atual.
- **Dependências:** T-08, T-09
- **Arquivos:** `tests/unit/hooks/useWeather.test.ts`
- **Requisitos:** RF1, RF2, RF3, RF4, RF5, RNF4

### T-23 — Testar formulário e resultados da UI
- **Prioridade:** P1
- **Tamanho:** P
- **Tipo:** Test
- **Descrição:** Cobrir interação do formulário e seleção de resultados com Testing Library.
- **Critérios de aceite:**
  - Testes cobrem submit por teclado, label acessível, bloqueio de consulta vazia e seleção de cidade com contexto.
  - Testes verificam o nome acessível de cada opção e sua seleção por teclado.
- **Dependências:** T-10, T-11
- **Arquivos:** `tests/unit/components/search.test.tsx`
- **Requisitos:** RF1, RNF2

### T-24 — Testar estados e apresentação meteorológica
- **Prioridade:** P1
- **Tamanho:** M
- **Tipo:** Test
- **Descrição:** Testar os estados de consulta e a apresentação de clima atual e previsão.
- **Critérios de aceite:**
  - Loading, vazio e erro são distinguíveis; retry aciona a ação específica e estados são identificáveis programaticamente.
  - Testes verificam campos atuais e cinco dias, inclusive falha parcial e retry independente.
  - Testes verificam que campo ausente aparece como “—” sem ocultar valores válidos.
  - Testes de datas/temperaturas exibidas são independentes da rede.
- **Dependências:** T-12, T-13, T-14
- **Arquivos:** `tests/unit/components/weather-display.test.tsx`
- **Requisitos:** RF2, RF3, RF5, RNF2

### T-25 — Testar alternância acessível de unidade
- **Prioridade:** P1
- **Tamanho:** P
- **Tipo:** Test
- **Descrição:** Verificar o controle de unidade e a conversão local de todos os valores apresentados.
- **Critérios de aceite:**
  - Testes cobrem operação por teclado, unidade selecionada e conversão de todas as temperaturas atuais e diárias.
  - Testes confirmam que alternar unidade não aciona nova consulta.
- **Dependências:** T-02, T-15
- **Arquivos:** `tests/unit/components/UnitToggle.test.tsx`
- **Requisitos:** RF4, RNF2

## Entrega 5 — E2E e validação final

### T-26 — Testar fluxo principal e recuperação com Playwright
- **Prioridade:** P1
- **Tamanho:** M
- **Tipo:** Test
- **Descrição:** Validar fluxos integrados determinísticos usando interceptação de rede no Playwright.
- **Critérios de aceite:**
  - E2E cobre busca, desambiguação/seleção, clima atual e cinco dias.
  - E2E cobre °C/°F antes e depois da chegada da previsão e confirma ausência de nova consulta ao alternar unidade.
  - E2E cobre busca vazia/sem resultado, erro de geocoding, falha parcial e retry; testes não dependem de Open-Meteo real.
- **Dependências:** T-17, T-22, T-23, T-24, T-25
- **Arquivos:** `tests/e2e/weather-flow.spec.ts`
- **Requisitos:** RF1, RF2, RF3, RF4, RF5

### T-27 — Validar responsividade, teclado e compatibilidade
- **Prioridade:** P2
- **Tamanho:** M
- **Tipo:** Test
- **Descrição:** Acrescentar validação E2E de viewport móvel, acessibilidade básica e navegadores suportados.
- **Critérios de aceite:**
  - Em viewport de 320 px, a página não tem rolagem horizontal nem corta conteúdo essencial; também há cobertura desktop.
  - Fluxos principais podem ser percorridos por teclado, com foco visível e nomes acessíveis verificáveis.
  - Execução cobre Chrome, Firefox e WebKit/Safari disponíveis no Playwright; registrar limitações de execução para Edge ou versões não instaladas, sem substituir a matriz RNF7 de lançamento.
- **Dependências:** T-17, T-26
- **Arquivos:** `tests/e2e/responsive-accessibility.spec.ts`, configuração existente do Playwright se necessário
- **Requisitos:** RF1–RF5, RNF1, RNF2, RNF7

## Sequência sugerida em fatias verticais

1. **Busca visível:** T-01, T-05, T-08, T-10, T-11, T-12 e T-16; entrega busca, desambiguação e seleção antes da integração meteorológica.
2. **Clima atual utilizável:** T-02, T-03, T-06, T-09 e T-13; entrega clima atual com loading, erro e valores parciais.
3. **Previsão e unidades:** T-04, T-07, T-14, T-15 e T-17; completa os cinco dias e a alternância Celsius/Fahrenheit.
4. **Qualidade e lançamento:** T-18 a T-27; verifica contratos, estados, fluxos E2E, responsividade, acessibilidade e compatibilidade.

As dependências de cada tarefa prevalecem sobre esta sugestão quando houver
paralelismo possível.

## Rastreabilidade requisito → tarefas

| Requisito | Tarefas |
| --- | --- |
| RF1 — Buscar e selecionar cidade | T-01, T-05, T-08, T-10, T-11, T-16, T-20, T-22, T-23, T-26, T-27 |
| RF2 — Consultar clima atual | T-01, T-02, T-03, T-06, T-09, T-13, T-17, T-18, T-21, T-22, T-24, T-26, T-27 |
| RF3 — Consultar previsão de cinco dias | T-01, T-02, T-03, T-04, T-07, T-09, T-14, T-17, T-18, T-19, T-21, T-22, T-24, T-26, T-27 |
| RF4 — Alternar unidade de temperatura | T-01, T-02, T-09, T-15, T-17, T-18, T-22, T-24, T-25, T-26, T-27 |
| RF5 — Comunicar estados da consulta | T-05, T-06, T-07, T-08, T-09, T-10, T-11, T-12, T-13, T-14, T-16, T-17, T-20, T-21, T-22, T-23, T-24, T-26, T-27 |

Todos os requisitos funcionais RF1–RF5 têm tarefas correspondentes.

## Rastreabilidade de requisitos não funcionais

| Requisito | Tarefas |
| --- | --- |
| RNF1 — Responsividade | T-14, T-16, T-17, T-27 |
| RNF2 — Acessibilidade | T-10, T-11, T-12, T-15, T-16, T-17, T-23, T-24, T-25, T-27 |
| RNF3 — Desempenho percebido | T-08, T-09, T-10 |
| RNF4 — Resiliência | T-05, T-06, T-07, T-08, T-09, T-20, T-21, T-22 |
| RNF5 — Idioma pt-BR | T-03, T-04, T-10, T-11, T-12, T-13, T-14, T-16, T-20 |
| RNF6 — Privacidade e operação | T-05, T-06, T-07, T-16, T-26 |
| RNF7 — Compatibilidade | T-27 |

## Prompt de implementação para delegação — T-01

> Implemente a tarefa T-01 do backlog em `tasks/weather-app-tasks.md`.
>
> **Contexto:** este repositório segue Spec-Driven Development. Consulte
> `specs/weather-app-spec.md` e a seção Data Model de
> `plans/weather-app-plan.md`; a spec prevalece em caso de divergência. O projeto
> usa TypeScript strict e os tipos compartilhados devem ficar em
> `src/types/weather.ts`.
>
> **Escopo:** exporte `Unit`, `City`, `CurrentWeather`, `ForecastDay` e
> `WeatherData`. Preserve o contrato do plano: `Unit` é `"celsius" |
> "fahrenheit"`; cidade inclui nome, coordenadas e metadados geográficos
> opcionais; campos meteorológicos que podem faltar são `null`; temperaturas
> internas são Celsius; `current` e `forecast` podem ser `null`; datas diárias
> preservam o formato civil `YYYY-MM-DD`.
>
> **Critérios de aceite:** os tipos representam esses contratos sem valores
> fictícios ou casts permissivos e compilam em TypeScript strict. Não adicione
> dependências nem altere arquivos fora do escopo, salvo ajuste estritamente
> necessário para a compilação. Ao concluir, informe arquivos alterados e a
> validação executada.
>
> **Arquivos prováveis:** `src/types/weather.ts`.
