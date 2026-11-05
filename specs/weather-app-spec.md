# Especificação do Produto — Weather App

## Overview

Aplicação web responsiva para consultar condições meteorológicas de uma cidade
escolhida pelo usuário e a previsão diária dos próximos cinco dias. A interface
será apresentada em português do Brasil (pt-BR), terá Celsius como unidade
inicial e permitirá alternar para Fahrenheit.

O produto atende às personas hipotéticas identificadas no discovery: a pessoa
que decide o que vestir, o viajante que planeja a semana e a pessoa familiarizada
com Fahrenheit. A busca geográfica e os dados meteorológicos serão fornecidos
pela Open-Meteo, sem chave de API. A primeira versão não exige login nem
persistência de dados em servidor.

## Functional Requirements

- **RF1 — Buscar e selecionar cidade:** permitir que o usuário envie uma busca
  pelo nome da cidade e escolha um resultado. Cada resultado deve incluir
  cidade e informações de contexto disponíveis, como região/estado e país,
  para ajudar a distinguir locais homônimos.
- **RF2 — Consultar clima atual:** após a seleção de uma cidade, exibir
  temperatura, condição meteorológica, umidade, vento, pressão e precipitação
  atuais quando esses dados forem fornecidos.
- **RF3 — Consultar previsão de cinco dias:** exibir um resumo diário para hoje
  e os quatro dias seguintes, com temperatura mínima e máxima, condição e
  precipitação.
- **RF4 — Alternar unidade de temperatura:** permitir alternar entre Celsius
  (°C) e Fahrenheit (°F) e atualizar todas as temperaturas apresentadas.
- **RF5 — Comunicar estados da consulta:** apresentar estados distinguíveis de
  carregamento, vazio e erro nas buscas e consultas meteorológicas; quando uma
  consulta falhar, oferecer uma ação para tentar novamente.

## User Stories

- **US1 — Busca (RF1, RF2):** Como pessoa que decide o que vestir, quero buscar
  e selecionar minha cidade para consultar rapidamente o clima local.
- **US2 — Desambiguação (RF1):** Como pessoa que decide o que vestir, quero ver
  a região e o país nos resultados para escolher a cidade correta quando há
  nomes iguais.
- **US3 — Planejamento (RF3):** Como viajante que planeja a semana, quero ver
  um resumo da previsão dos próximos cinco dias para organizar minhas
  atividades.
- **US4 — Unidade (RF4):** Como pessoa familiarizada com Fahrenheit, quero
  alternar a unidade para compreender as temperaturas na escala que prefiro.
- **US5 — Falhas e feedback (RF5):** Como viajante que consulta o app em
  diferentes condições de rede, quero saber quando os dados estão carregando ou
  quando uma consulta falha para entender o que está acontecendo e poder tentar
  novamente.
- **US6 — Uso móvel (RF1–RF5, RNF1):** Como pessoa que decide o que vestir pelo
  celular, quero usar os controles e ler as informações sem conteúdo cortado
  para consultar o clima com conforto em uma tela pequena.

## Acceptance Criteria

### RF1 — Buscar e selecionar cidade

- **Dado** que o campo de busca está vazio, **quando** o usuário envia a busca,
  **então** nenhuma requisição é iniciada e uma orientação em pt-BR informa que
  é necessário digitar uma cidade.
- **Dado** um nome de cidade não vazio, **quando** o usuário envia a busca,
  **então** a aplicação apresenta os resultados retornados pela busca
  geográfica, incluindo cidade e o contexto de região/estado e país disponível.
- **Dado** que a busca retorna mais de uma cidade, **quando** os resultados são
  apresentados, **então** cada opção pode ser distinguida pelas informações de
  contexto disponíveis e selecionada pelo usuário.
- **Dado** que há resultados de busca, **quando** o usuário seleciona uma
  cidade, **então** essa cidade passa a ser a localização da consulta
  meteorológica.
- **Dado** que a busca não retorna cidades, **quando** os resultados são
  apresentados, **então** a aplicação informa claramente que nenhuma cidade
  foi encontrada.

### RF2 — Consultar clima atual

- **Dada** uma cidade selecionada e uma resposta atual completa, **quando** os
  dados são apresentados, **então** a aplicação mostra temperatura, condição,
  umidade, vento, pressão e precipitação.
- **Dada** uma cidade selecionada e um campo ausente na resposta, **quando** os
  dados são apresentados, **então** o campo indisponível é representado por
  "—" e os demais dados continuam visíveis.
- **Dada** uma cidade selecionada, **quando** a consulta meteorológica falha,
  **então** a aplicação comunica o erro e disponibiliza a ação de tentar
  novamente.

### RF3 — Consultar previsão de cinco dias

- **Dada** uma cidade selecionada e uma resposta diária completa, **quando** a
  previsão é apresentada, **então** ela contém exatamente cinco datas
  consecutivas, começando hoje, com mínima, máxima, condição e precipitação
  para cada dia.
- **Dada** uma resposta de previsão com um ou mais campos ausentes, **quando**
  os dias são apresentados, **então** cada campo indisponível é representado
  por "—" sem ocultar os outros dados ou quebrar a apresentação.
- **Dada** uma cidade selecionada e uma falha na consulta de previsão,
  **quando** a falha é identificada, **então** a aplicação comunica o erro e
  disponibiliza a ação de tentar novamente.

### RF4 — Alternar unidade de temperatura

- **Dado** que a aplicação apresenta temperaturas em °C, **quando** o usuário
  seleciona °F, **então** todas as temperaturas atuais e da previsão são
  apresentadas em Fahrenheit, sem uma nova consulta meteorológica.
- **Dado** que a aplicação apresenta temperaturas em °F, **quando** o usuário
  seleciona °C, **então** todas as temperaturas atuais e da previsão são
  apresentadas em Celsius, sem uma nova consulta meteorológica.
- **Dado** que a aplicação é iniciada sem preferência previamente persistida,
  **quando** uma temperatura é apresentada, **então** a unidade inicial é °C.

### RF5 — Comunicar estados da consulta

- **Dada** uma busca ou consulta meteorológica em andamento, **quando** a
  resposta ainda não chegou, **então** um indicador ou mensagem de carregamento
  informa que a operação está em andamento.
- **Dada** uma busca concluída sem resultados, **quando** o estado vazio é
  apresentado, **então** a mensagem explica que nenhuma cidade foi encontrada
  e não é confundida com uma falha de serviço.
- **Dada** uma falha de rede, timeout ou erro do provedor, **quando** a
  aplicação recebe ou identifica a falha, **então** apresenta uma mensagem
  compreensível em pt-BR e uma ação de tentar novamente.
- **Dado** um erro recuperável, **quando** o usuário aciona tentar novamente,
  **então** a aplicação repete a consulta correspondente e comunica seu novo
  estado de carregamento.

## Non-Functional Requirements

- **RNF1 — Responsividade:** a interface deve ser utilizável a partir de 320 px
  de largura, sem rolagem horizontal da página nem conteúdo essencial cortado,
  e adaptar-se também a telas maiores.
- **RNF2 — Acessibilidade:** fluxos e controles devem ser operáveis por
  teclado; controles devem ter nomes acessíveis; foco deve permanecer visível;
  estados de carregamento, vazio e erro devem ser comunicados de forma
  programaticamente identificável; texto e controles devem atender aos
  contrastes mínimos WCAG 2.1 nível AA aplicáveis.
- **RNF3 — Desempenho percebido:** ao iniciar uma busca ou consulta, a
  interface deve comunicar o carregamento sem esperar pela resposta do
  provedor. Não há SLA para o tempo de resposta da Open-Meteo nesta versão.
- **RNF4 — Resiliência:** falhas de rede, timeout e indisponibilidade do
  provedor não devem deixar a interface permanentemente bloqueada; a aplicação
  deve oferecer nova tentativa para consultas com erro.
- **RNF5 — Idioma:** textos e mensagens da interface da primeira versão devem
  estar em pt-BR.
- **RNF6 — Privacidade e operação:** não exigir login nem persistir dados em
  servidor. Não coletar telemetria de uso nesta versão.
- **RNF7 — Compatibilidade:** suportar as duas versões estáveis mais recentes,
  disponíveis na data de lançamento, de Chrome, Edge, Firefox e Safari.

## Edge Cases

| Caso | Comportamento esperado |
| --- | --- |
| Cidade inexistente | Exibir estado vazio informando que nenhuma cidade foi encontrada; permitir editar e enviar outra busca. |
| Campo de busca vazio ou contendo apenas espaços | Não iniciar a busca e orientar o usuário a digitar uma cidade. |
| Acentos, pontuação ou caracteres especiais no nome | Tratar o conteúdo como texto de busca, sem interpretar caracteres como comandos; apresentar resultados ou estado vazio normalmente. |
| Cidades homônimas | Mostrar os dados de região/estado e país disponíveis em cada resultado e deixar a escolha ao usuário. |
| Falha na busca geográfica | Exibir erro de busca distinto do estado sem resultados e permitir tentar novamente. |
| Falha na consulta de clima atual | Preservar a cidade selecionada, comunicar o erro da consulta atual e permitir nova tentativa. |
| Falha na consulta da previsão | Comunicar especificamente a indisponibilidade da previsão e permitir nova tentativa. |
| Timeout ou perda de conexão | Encerrar o estado de carregamento com mensagem de erro e ação para tentar novamente; não manter a tela bloqueada. |
| Geocoding sem resultados | Exibir mensagem de estado vazio, sem tratar a resposta válida sem resultados como erro de serviço. |
| Resposta parcial ou campo meteorológico ausente | Exibir "—" apenas para os campos ausentes e manter os demais dados utilizáveis. |
| Resposta sem qualquer dado utilizável | Não inventar valores; comunicar que os dados não estão disponíveis e permitir nova tentativa. |
| Alternância de unidade antes da previsão carregar | Atualizar imediatamente os valores já disponíveis; aplicar a unidade selecionada aos dados quando a previsão chegar. |

## Assumptions

- A aplicação é web e o usuário tem conexão com a internet para pesquisar e
  consultar dados; não haverá modo offline nem exibição de dados em cache.
- A busca é enviada explicitamente pelo usuário, não há sugestões enquanto
  digita, e a seleção entre resultados é manual.
- A previsão é um resumo diário de hoje e dos quatro dias seguintes, sem
  previsão por hora.
- Cada seleção de cidade inicia uma consulta; não há atualização automática
  periódica na primeira versão.
- Celsius é a unidade inicial em cada nova sessão. A preferência de unidade
  não precisa ser mantida após recarregar ou fechar a aplicação.
- Open-Meteo é a fonte de geocoding e de dados meteorológicos, conforme decisão
  registrada no discovery; a aplicação não exige chave de API.
- As personas são hipóteses para orientar o produto, não resultados de pesquisa
  com usuários.
- Compatibilidade e acessibilidade seguem os critérios descritos nesta
  especificação como baseline da primeira versão.

## Risks

| Risco | Probabilidade / impacto | Mitigação |
| --- | --- | --- |
| Indisponibilidade, lentidão ou limite de requisições da Open-Meteo | Média / alto | Tratar falhas e timeout, comunicar o estado e permitir nova tentativa; o tempo de resposta do provedor não é garantido pelo produto. |
| Cidade homônima ou seleção de localização incorreta | Alta / médio | Exibir contexto geográfico disponível e exigir seleção explícita do usuário. |
| Instabilidade da conexão do usuário | Média / médio | Encerrar estados de carregamento com erro recuperável e oferecer nova tentativa. |
| Campo ausente ou resposta parcial | Média / médio | Representar campo indisponível como "—" sem descartar os dados restantes. |
| Conversão de temperatura ou rótulo de unidade incorreto | Baixa / alto | Definir °C como inicial, atualizar todas as temperaturas ao alternar e validar conversões com critérios automatizáveis. |
| Conteúdo cortado ou navegação difícil em telas móveis | Média / alto | Projetar a partir de 320 px e validar a interface em viewport móvel e desktop. |
| Barreiras de acessibilidade | Média / alto | Incluir requisitos de teclado, foco, nomes acessíveis, anúncio de estados e contraste WCAG 2.1 AA. |

## Out of Scope

- Autenticação, contas de usuário ou sincronização entre dispositivos.
- Persistência de cidade, histórico, favoritos ou preferência de unidade.
- Geolocalização automática.
- Modo offline ou exibição de consultas anteriores em cache.
- Atualização automática periódica ou notificações push e alertas.
- Previsões por hora ou mais de cinco dias.
- Outros idiomas além de pt-BR.
- Telemetria, métricas de uso ou coleta de dados pessoais.
- Aplicativo nativo para iOS ou Android.

## Open Questions

Não há perguntas bloqueantes para iniciar o desenvolvimento da primeira versão.
As lacunas do discovery foram fechadas nesta especificação como decisões de
produto explícitas: informações do clima atual e resumo diário estão definidos
em RF2 e RF3; busca enviada pelo usuário e seleção manual estão definidas em
Assumptions; atualização automática e persistência de unidade estão excluídas;
modo offline e telemetria estão excluídos; compatibilidade e acessibilidade
estão delimitadas em RNF2 e RNF7. Mudanças nesses limites exigem revisão desta
especificação antes de orientar a implementação.

## Revisão crítica aplicada

Esta versão incorpora os seguintes refinamentos para reduzir ambiguidades e
facilitar implementação e teste:

1. Define o conteúdo do clima atual e da previsão, incluindo o período exato de
   cinco dias.
2. Especifica quando a busca é iniciada e como cidades homônimas são
   diferenciadas.
3. Distingue estado vazio de falha de serviço e define o que ocorre com dados
   parciais, ausência total de dados e timeout.
4. Define o comportamento de unidade inicial, conversão e persistência.
5. Delimita compatibilidade de navegadores, acessibilidade, operação offline,
   atualização de dados e telemetria.

## Rastreabilidade

| User Story | Requisitos funcionais | Critérios de aceite | Requisitos não funcionais |
| --- | --- | --- | --- |
| US1 | RF1, RF2 | RF1: campo vazio, busca com resultado e seleção; RF2: dados atuais | RNF3, RNF4, RNF5 |
| US2 | RF1 | RF1: apresentação de contexto e escolha entre resultados | RNF2, RNF5 |
| US3 | RF3 | RF3: cinco datas consecutivas e campos diários | RNF3, RNF4, RNF5 |
| US4 | RF4 | RF4: conversão nos dois sentidos sem nova consulta e unidade inicial | RNF2 |
| US5 | RF5 | RF5: carregamento, distinção de vazio e erro, nova tentativa | RNF2, RNF4, RNF5 |
| US6 | RF1–RF5 | Critérios responsivos e acessíveis aplicáveis aos fluxos e estados | RNF1, RNF2 |
