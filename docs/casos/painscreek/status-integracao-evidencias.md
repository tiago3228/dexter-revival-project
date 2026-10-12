# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-12 após a auditoria inicial das páginas 1–50.

## Material de origem

O arquivo `IMAGENS DE PAINSCREEK.zip` foi localizado na Biblioteca. Ele contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável. A conferência visual do PDF é a fonte de autoridade; OCR serve apenas como apoio.

Nesta etapa, o ZIP recebido foi conferido com SHA-256 `fbd1804b32542cf0cb63217493ceebaf136cda62b2011b4bf8c891966f975cb5`; o PDF extraído foi conferido com SHA-256 `54e1cbbd0884793ea921227e118566045d109abec2e9be9250d732ac3e28aa8e`.

## Estado confirmado no repositório

- A rota `/painscreek-evidence` está definida em `src/routes/painscreek-evidence.tsx` e registrada em `src/routeTree.gen.ts`.
- `src/game/painscreekEvidence.ts` contém 34 registros estáveis, `P-001` a `P-034`, que referenciam páginas 80–116. O catálogo documental permanece separado do sistema de solução jogável.
- O explorador de evidências consome esse catálogo; o texto da introdução foi corrigido para informar 34 referências, em vez do número obsoleto 28.
- Os cinco arquivos em `public/maps/` foram validados como PNGs íntegros, comparados por SHA-256 com os originais extraídos do ZIP e encontrados byte a byte idênticos. Seus nomes correspondem às referências em `src/routes/mapas.tsx`; a rota `/mapas` está registrada.
- `src/game/VivianInvestigationGame.tsx` implementa o ciclo jogável atual do Caso Vivian Roberts: locais desbloqueáveis, coleta de evidências, cruzamento de pares, cronologia, relatório provisório e salvamento local.
- O Caso Vivian oferece três níveis de dica por evidência, com custos de 20, 50 e 100 pontos; a pontuação começa em 1.000 e é limitada a zero. As dicas consultadas são salvas e uma mesma dica não é penalizada novamente pelo fluxo normal do jogo.
- Esta etapa extraiu o cálculo de pontuação e a normalização de IDs para `src/game/vivianInvestigationRules.ts`. IDs repetidos vindos de um save são deduplicados antes do cálculo, evitando cobrança repetida por duplicatas no estado restaurado.
- O save é client-side, em `localStorage`, e é conveniente para persistência entre recargas, mas pode ser editado ou apagado manualmente pelo usuário. Sem validação em servidor, não é um registro inviolável contra adulteração deliberada. O botão de reinício também limpa o progresso; não foi alterado nesta etapa.
- O protótipo não declara culpado nem motivo final: a conclusão continua provisória e várias referências documentais ainda estão incompletas.

## Cobertura automatizada adicionada

- Teste de roteamento para `/painscreek-evidence`.
- Testes estruturais do catálogo para IDs `P-001`–`P-034`, unicidade, páginas e campos obrigatórios, além da contagem exibida na introdução.
- Testes das regras do Caso Vivian para custos graduais, deduplicação de dicas em saves, limite mínimo zero, chaves malformadas e deduplicação de IDs restaurados.
- Auditoria documental das páginas 1–50 em `auditoria-cruzamento-paginas-001-050.md`, incluindo a confirmação visual das duplicatas nas páginas 49–50 e o achado de duas entradas legíveis omitidas na página 43.

Esses testes verificam estrutura e regras de código; não substituem o cotejo documental página a página nem um teste manual do fluxo completo no navegador.

## CI e validações

- O workflow está em `.github/workflows/ci.yml`. A PR #10 foi mesclada na `main` pelo commit `27f8e849e34f8ab492bad5502c583f1eb671bc58`. O CI pós-merge [38315789718](https://github.com/tiago3228/dexter-revival-project/actions/runs/38315789718) terminou com sucesso em testes, lint e build.
- Na validação local desta etapa, `pnpm run test` passou em 7 arquivos e 25 testes; `pnpm exec tsc --noEmit` e `pnpm run build` também passaram.
- A correspondência estrutural da rota foi testada; ainda falta conferir a rota e o ciclo de investigação no navegador.

## Pendências documentais e de integração

- A auditoria inicial das páginas 1–50 foi registrada em `auditoria-cruzamento-paginas-001-050.md`. Ela encontrou duas entradas impressas omitidas na transcrição editorial da página 43 e confirmou que as páginas 49–50 repetem as páginas 46–47. A atualização editorial da transcrição ainda está pendente.
- A auditoria completa de `P-001` a `P-034` ainda precisa verificar fidelidade a cada fonte, classificação do tipo de documento, grau de confiança, estado de revisão, duplicatas e referências cruzadas.
- A relação entre a página 55 (relato de Scott sobre uma fotografia) e a página 116 (fotografia mencionada no diário) permanece sem confirmação de identidade.
- Permanecem pendentes as divergências cronológicas e os cruzamentos documentados em `auditoria-cruzamento-paginas-051-079.md`, inclusive o grau de correspondência entre as páginas 59 e 86 e entre as páginas 61 e 95.
- O catálogo não deve ser descrito como plenamente integrado ao jogo: a interface de consulta documental não está conectada ao ciclo jogável de Vivian.
- Ainda falta teste manual no navegador de desbloqueios, coleta duplicada, conexões válidas e inválidas, cronologia, bloqueio do relatório e persistência após recarga.

## Limites de interpretação

- Alegações, relatos de personagens, opiniões, inferências e fatos documentados devem continuar identificados separadamente.
- Uma suspeita, uma ausência de álibi, um motivo aparente ou uma coincidência temporal não constituem prova de autoria ou causalidade.
- Uma duplicata não conta como confirmação independente. Trechos ilegíveis ou incompletos devem permanecer assinalados, sem preenchimento por suposição.
- Status `visually-checked` indica apenas que houve cotejo com a imagem da página; não confirma automaticamente a verdade das alegações nela contidas.

Nenhuma publicação do jogo foi feita por esta atualização; apenas a documentação de auditoria foi alterada.
