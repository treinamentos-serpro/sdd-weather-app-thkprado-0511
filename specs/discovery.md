# Discovery — Weather App

## Contexto

O briefing solicita uma aplicação de previsão do tempo na qual usuários possam
buscar cidades, consultar o clima atual, ver a previsão de cinco dias, alternar
entre Celsius e Fahrenheit e usar o produto em dispositivos móveis. O objetivo
do discovery é organizar o que já foi solicitado e explicitar as decisões e
lacunas que precisam ser consideradas antes da especificação detalhada.

Para este treinamento, algumas decisões de produto já foram fechadas e estão
registradas em **Decisões**. Os itens ainda não respondidos permanecem como
perguntas em aberto; não devem ser tratados como requisitos confirmados.

## Requisitos Funcionais

- **RF1 — Buscar cidade:** permitir que o usuário pesquise cidades pelo nome e
  escolha uma cidade para consultar.
- **RF2 — Consultar clima atual:** exibir as condições atuais da cidade
  selecionada.
- **RF3 — Consultar previsão:** exibir a previsão para cinco dias.
- **RF4 — Alternar unidade:** permitir alternar a temperatura entre Celsius e
  Fahrenheit e apresentar os valores na unidade selecionada.
- **RF5 — Comunicar estados da consulta:** informar quando os dados estão
  carregando, quando não há resultados e quando ocorre um erro que impede a
  consulta.

## Requisitos Não-Funcionais

- **RNF1 — Uso em dispositivos móveis:** a interface deve ser responsiva e
  utilizável em telas móveis, além de funcionar em telas maiores.
- **RNF2 — Acessibilidade:** controles e informações devem ser compreensíveis e
  operáveis, inclusive por teclado e tecnologias assistivas. Critérios de
  conformidade precisam ser definidos na especificação.
- **RNF3 — Desempenho percebido:** busca e consulta devem apresentar feedback
  durante o carregamento e evitar deixar a interface sem resposta. Metas
  mensuráveis de tempo ainda precisam ser acordadas.
- **RNF4 — Resiliência:** falhas de rede ou do provedor de dados não devem
  bloquear permanentemente o uso da interface; o usuário deve receber uma
  comunicação compreensível.
- **RNF5 — Idioma:** a interface da primeira versão deve ser apresentada em
  português do Brasil (pt-BR).
- **RNF6 — Privacidade e simplicidade operacional:** a primeira versão não deve
  exigir autenticação nem persistência de dados em servidor.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- |
| Indisponibilidade, lentidão ou limite de requisições do provedor de clima | Média | Alto | Tratar erros e tempo limite, comunicar a falha e permitir nova tentativa; avaliar cache se necessário. |
| Busca retornar cidades homônimas ou uma localização incorreta | Alta | Médio | Apresentar informações de contexto, como país e região, e permitir que o usuário escolha o resultado correto. |
| Falha ou instabilidade da conexão do usuário | Média | Médio | Exibir estados de carregamento e erro claros e oferecer nova tentativa sem travar a interface. |
| Uso desconfortável ou conteúdo cortado em telas móveis | Média | Alto | Projetar e validar a experiência em diferentes larguras de tela, priorizando o uso móvel. |
| Conversão de temperatura ou apresentação de unidades incorreta | Baixa | Alto | Definir a unidade de origem e as regras de conversão na especificação e cobrir os casos com testes. |
| Previsão interpretada de forma diferente do esperado (período ou granularidade) | Média | Médio | Definir explicitamente o período e o nível de detalhe da previsão nos critérios de aceite. |

## Perguntas em Aberto (Open Questions)

As decisões do treinamento já resolveram a fonte de dados, o período de cinco
dias, a unidade inicial, autenticação/persistência no servidor e o idioma da
interface. As perguntas abaixo continuam sem resposta e devem ser avaliadas
antes de transformar o discovery em especificação completa.

| # | Pergunta | Impacto se ficar sem resposta |
| --- | --- | --- |
| 1 | Quais informações devem aparecer no clima atual além da temperatura e da condição (por exemplo, umidade, vento ou precipitação)? | O escopo da interface, os dados necessários e os critérios de aceite ficam indefinidos. |
| 2 | A busca deve mostrar sugestões enquanto o usuário digita ou somente após o envio da consulta? Como escolher entre cidades com o mesmo nome? | Afeta o fluxo de busca, a desambiguação e a forma de apresentar os resultados. |
| 3 | A previsão deve apresentar somente um resumo diário ou também informações por hora? | Afeta o volume de dados, o layout e a definição de “previsão de cinco dias”. |
| 4 | Com que frequência os dados devem ser atualizados e deve existir uma ação manual para atualizar? | Sem essa definição, usuários podem ver dados desatualizados ou ocorrerem requisições excessivas. |
| 5 | A aplicação precisa oferecer algum funcionamento offline ou mostrar dados previamente consultados? | Afeta estratégia de cache, persistência local e comportamento sem conexão. |
| 6 | A preferência Celsius/Fahrenheit deve ser mantida após recarregar ou fechar a aplicação? | Afeta a persistência local e a experiência em visitas futuras. |
| 7 | Quais navegadores e versões precisam ser suportados? | Afeta decisões de compatibilidade e a abrangência dos testes. |
| 8 | Além do uso em dispositivos móveis, há requisitos específicos de acessibilidade ou metas de conformidade? | Sem critérios explícitos, não é possível validar adequadamente a acessibilidade. |
| 9 | Métricas de uso ou telemetria são necessárias? Em caso afirmativo, quais dados podem ser coletados? | Afeta privacidade, consentimento e requisitos de implementação; não se deve presumir coleta de dados. |

## Suposições (Assumptions)

- O produto é uma aplicação web; o briefing não especifica uma aplicação nativa.
- O usuário tem acesso à internet para pesquisar cidades e consultar condições
  meteorológicas.
- A pesquisa por cidade é iniciada pelo usuário; geolocalização automática não
  faz parte da primeira versão definida para este treinamento.
- As personas abaixo são hipóteses para orientar a descoberta, não resultados
  de pesquisa com usuários.
- Não são definidos neste documento metas de desempenho, compatibilidade de
  navegadores ou conformidade de acessibilidade não acordadas.

## Personas

- **Pessoa que decide o que vestir:** consulta rapidamente as condições do dia,
  principalmente pelo celular. Sucesso: encontrar a condição e a temperatura
  da cidade desejada com facilidade.
- **Viajante que planeja a semana:** consulta a previsão antes de organizar
  atividades, em celular ou computador. Sucesso: compreender a previsão dos
  próximos cinco dias para a cidade escolhida.
- **Pessoa familiarizada com Fahrenheit:** prefere visualizar temperaturas em
  Fahrenheit. Sucesso: alternar a unidade e compreender os valores exibidos.

## Decisões

Decisões fechadas para este treinamento, que resolvem algumas das ambiguidades
iniciais:

- **Fonte de dados:** Open-Meteo, sem chave de API. Define o provedor para busca
  geográfica e dados meteorológicos, sem exigir credencial de API.
- **Período da previsão:** cinco dias, contando hoje e os quatro dias seguintes.
  Define o intervalo de datas incluído na previsão.
- **Unidade inicial:** Celsius. Define a unidade exibida na primeira utilização;
  a possibilidade de alternar para Fahrenheit continua sendo requisito.
- **Autenticação e persistência de servidor:** não haverá autenticação nem
  persistência de servidor na primeira versão. Não determina se a preferência
  de unidade pode ser mantida localmente; isso permanece em aberto.
- **Idioma da interface:** pt-BR. Define o idioma inicial, sem estabelecer
  suporte a outros idiomas.
- **Geolocalização automática:** fora do escopo da primeira versão. A consulta
  começa pela busca de cidade feita pelo usuário.
