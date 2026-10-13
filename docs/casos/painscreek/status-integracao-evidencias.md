# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-13.

## Material de origem

O arquivo `IMAGENSDEPAINSCREEK.zip` foi fornecido pelo usuário e contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. SHA-256 do ZIP: `fbd1804b32542cf0cb63217493ceebaf136cda62b2011b4bf8c891966f975cb5`; SHA-256 do PDF: `54e1cbbd0884793ea921227e118566045d109abec2e9be9250d732ac3e28aa8e`. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável. A Galeria de imagens das fontes, com 116 originais e miniaturas, é a referência visual acessível no jogo; OCR e transcrição servem apenas como apoio.

## Estado confirmado no repositório

- A rota `/painscreek-evidence` está definida em `src/routes/painscreek-evidence.tsx` e registrada em `src/routeTree.gen.ts`.
- `src/game/painscreekEvidence.ts` contém 47 registros estáveis, `P-001` a `P-047`, que referenciam páginas 1–116. A tela do catálogo continua sendo o explorador documental; a conexão com a progressão jogável de Vivian é parcial, não uma integração completa do catálogo.
- O explorador de evidências consome esse catálogo e exibe a contagem derivada dos dados; a documentação foi alinhada aos 47 registros atuais, em vez das contagens obsoletas 28 e 34.
- Os cinco arquivos em `public/maps/` foram validados como PNGs íntegros, comparados por SHA-256 com os originais extraídos do ZIP e encontrados byte a byte idênticos. Seus nomes correspondem às referências em `src/routes/mapas.tsx`; a rota `/mapas` está registrada.
- `src/game/VivianInvestigationGame.tsx` implementa o ciclo jogável atual do Caso Vivian Roberts: locais desbloqueáveis, coleta de evidências, cruzamento de pares, cronologia, relatório provisório e salvamento local.
- A integração incremental conecta sete pistas coletadas a registros cuja página exata está marcada `visually-checked`: `police-report` → P-010/p. 90; `scott-denial` → P-016/p. 88; `hospital-closure` → P-013/p. 84; `henry-death` → P-008/p. 85; `funds-investigation` → P-007/p. 97; `vivian-medical` → P-020/p. 94; e `code-0318` → P-003/p. 102. O código confere novamente o status e a presença da página no registro antes de exibir a ficha.
- As fichas documentais são opcionais e começam recolhidas. Ao abri-las, o jogador vê a origem da pista, o tipo de fonte, o que o catálogo registra, os limites/pendências e a inferência permitida. O texto esclarece que cotejo visual não confirma automaticamente alegações nem causalidade.
- Pistas sem vínculo exato já conferido permanecem sem ficha integrada. Em especial, a p. 43 não foi promovida a pista independente; a possibilidade de referência cruzada continua em aberto e não foi atribuída no jogo.
- O fechamento do Hospital Comunitário aparece em 1996, conforme a fonte já marcada como visualmente conferida na p. 84. Saves antigos com o ID `hospital-1956` migram para o evento `hospital-1996`, sem descartar a posição anterior do jogador na cronologia.
- O Caso Vivian oferece três níveis de dica por evidência, com custos de 20, 50 e 100 pontos; a pontuação começa em 1.000 e é limitada a zero. As dicas consultadas são salvas e uma mesma dica não é penalizada novamente pelo fluxo normal do jogo.
- O cálculo de pontuação e a normalização de IDs estão extraídos para `src/game/vivianInvestigationRules.ts`. IDs repetidos vindos de um save são deduplicados antes do cálculo, evitando cobrança repetida por duplicatas no estado restaurado.
- O save é client-side, em `localStorage`, e é conveniente para persistência entre recargas, mas pode ser editado ou apagado manualmente pelo usuário. Sem validação em servidor, não é um registro inviolável contra adulteração deliberada. O botão de reinício também limpa o progresso; não foi alterado nesta etapa.
- O protótipo não declara culpado nem motivo final: a conclusão continua provisória e várias referências documentais ainda estão incompletas.

## Cobertura automatizada adicionada

- Teste de roteamento para `/painscreek-evidence`.
- Teste de navegação que verifica a gravação do marcador de retomada do Caso Vivian ao clicar em “Voltar ao jogo” no catálogo.
- Testes estruturais do catálogo para IDs `P-001`–`P-047`, unicidade, páginas e campos obrigatórios, além da contagem exibida na introdução e da presença da Galeria com 116 imagens originais e miniaturas.
- Testes das regras do Caso Vivian para custos graduais, deduplicação de dicas em saves, limite mínimo zero, chaves malformadas e deduplicação de IDs restaurados.
- Testes de integração jogável para os sete vínculos listados acima, abertura opcional das fichas, ausência de fichas em pistas não vinculadas, data de 1996 e migração de saves com o antigo ID de cronologia.

Esses testes verificam estrutura, regras e os vínculos explicitamente implementados; não substituem o cotejo documental registro a registro nem autorizam iniciar a auditoria suspensa.

## CI e validações

- O workflow está em `.github/workflows/ci.yml`. Como referência histórica, a execução [38315052983](https://github.com/tiago3228/dexter-revival-project/actions/runs/38315052983) terminou com sucesso no commit `194b65e6c449cae625950ad929a5d21cf2a3ba7a`, dentro do PR #10; a execução anterior [38314003065](https://github.com/tiago3228/dexter-revival-project/actions/runs/38314003065) também passou no commit `27d434f5440632d1cd7fc6a46e25393c02b08309`.
- Na validação local da integração: a suíte passou em 11 arquivos e 38 testes; `pnpm exec tsc --noEmit` e `pnpm run build` passaram; `pnpm run lint` terminou com 0 erros e 7 avisos preexistentes; `git diff --check` passou.
- QA manual no Chromium, com estado fictício de teste, expandiu a ficha P-013 em 320×700 e 390×844: texto legível e sem overflow horizontal. O smoke test anterior do modo jogável verificou bloqueio/desbloqueio de locais, coleta sem duplicação, combinações, cronologia, persistência e bloqueio/liberação do relatório.
- O CI remoto para a branch desta integração deve ser acompanhado na PR antes de qualquer merge.

## Pendências documentais e de integração

- A auditoria das páginas 1–50 está registrada em `auditoria-cruzamento-paginas-001-050.md`, incluindo as duas entradas legíveis recuperadas da p. 43 e as duplicatas confirmadas das pp. 49–50.
- A comparação visual página a página das páginas 51–79 está concluída e registrada em `auditoria-cruzamento-paginas-051-079.md`. A transcrição de trabalho registra a omissão de texto detectada pelo OCR na p. 55, o plural impresso “Sem álibis” na p. 61 e a contradição cronológica interna da p. 56. As páginas 55, 59 e 61 foram cruzadas, respectivamente, com as páginas 116, 86 e 95; a p. 59 também foi conferida diretamente com a imagem.
- A etapa de revisão dos personagens está concluída e registrada em `auditoria-personagens.md`: 20 perfis foram liberados com resumos restritos às fontes, Hannah e Nicole permanecem pendentes por lacunas de identificação, Scott e Sofia mantêm contradições abertas, e o placeholder coletivo sem identidade individual foi removido.
- A auditoria autorizada de continuidade foi executada em 2026-10-13: P-001 e P-002 foram confirmados pelo usuário como já auditados e aprovados; P-003–P-047 foram processados em relatórios individuais, sem refazer cotejos históricos já registrados. Todos os 45 registros P-003–P-047 permanecem parciais, pois ainda têm lacunas de fonte, identidade, corroboração, transcrição, duplicata, referência cruzada ou desfecho.
- O relatório consolidado está em `relatorio-auditoria-p003-p047.md`, com relatórios individuais em `auditoria-individual/`. Nenhum catálogo, vínculo jogável, código, estado de revisão ou integração foi alterado nesta etapa.
- A trava de início foi cumprida mediante autorização explícita. Não há nova auditoria em execução neste momento; um ciclo futuro deve trabalhar apenas nas pendências documentadas e não refazer P-001/P-002 nem cotejos já concluídos sem motivo específico.
- Em 2026-10-13, um smoke test manual da interface (não uma auditoria documental) confirmou: catálogo abre e expande ressalvas; busca por “fotografia” combinada ao filtro “Incompleta” mostra 2 resultados; o atlas alterna do mapa da cidade para a rede de esgotos; e a linha do tempo libera 3 eventos ao registrar um diário, preserva esse progresso após recarga e retorna a 0/12 diários e 0/44 eventos ao bloqueá-lo novamente.
- A duplicata editorial `P-009/P-031` está explicitamente marcada no catálogo; `P-031` foi preservado apenas para rastreabilidade histórica e não conta como evidência independente.
- Páginas 55 e 116, ambas datadas de 13/02/1995, provavelmente se referem à mesma fotografia, mas não a identificam visualmente; P-005 continua incompleto quanto à identidade e ao retorno da foto. Não resolver a divergência até que a auditoria seja autorizada.
- Páginas 59 e 86 provavelmente se referem ao mesmo acidente de 1973; p. 86 fornece os detalhes das vítimas e indenizações. A nota da p. 61 sobre o pai de Bernard não pode ser ligada a esse acidente sem data ou identificação adicional. Páginas 61 e 95 são documentos distintos associados ao mesmo Bernard; a ficha funcional não corrobora a nota investigativa. Manter as divergências sem resolução até autorização da auditoria.
- A contradição de datas/ações de Scott na p. 56 permanece sem explicação. Preservar os cabeçalhos como impressos; não corrigir por inferência.
- O catálogo não está plenamente integrado: somente sete vínculos de pistas do ciclo de Vivian exibem fichas documentais. O restante dos registros continua sem conexão com a progressão. A p. 43 de Scott Brooks não foi estabelecida como pista independente e permanece sem vínculo; determinar se será referência cruzada exige validação posterior, sem antecipar uma conclusão.
- As PRs #14, #15, #16 e #17 constam como mescladas em `main` em 2026-10-13. A PR #16 sobre confirmação obrigatória de penalidade de dica está mesclada; o teste manual anterior confirmou que “Não” não desconta pontos e que “Sim” aplica o custo antes da revelação.
- Em 2026-10-13, o QA responsivo anterior conferiu `/painscreek-evidence`, `/mapas`, `/linha-do-tempo` e o dossiê Vivian em 320×700 e 390×844, sem overflow horizontal; o modo jogável e o diálogo de confirmação da dica também foram verificados. O QA desta integração expandiu também uma ficha P-013 nas duas larguras móveis. Essas validações são de layout e interação, não cotejo documental.

## Limites de interpretação

- Alegações, relatos de personagens, opiniões, inferências e fatos documentados devem continuar identificados separadamente.
- O status `Confirmado na fonte` se aplica ao resumo restrito exibido para a pessoa, não valida automaticamente todos os relatos ou acusações das páginas citadas.
- Uma suspeita, uma ausência de álibi, um motivo aparente ou uma coincidência temporal não constituem prova de autoria ou causalidade.
- Uma duplicata não conta como confirmação independente. Trechos ilegíveis ou incompletos devem permanecer assinalados, sem preenchimento por suposição.
- Status `visually-checked` indica apenas que houve cotejo com a imagem da página; não confirma automaticamente a verdade das alegações nela contidas.

Nenhuma publicação do jogo foi feita por esta atualização.
