# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-12.

## Material de origem

O arquivo `IMAGENSDEPAINSCREEK.zip` foi fornecido pelo usuário e contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. SHA-256 do ZIP: `fbd1804b32542cf0cb63217493ceebaf136cda62b2011b4bf8c891966f975cb5`; SHA-256 do PDF: `54e1cbbd0884793ea921227e118566045d109abec2e9be9250d732ac3e28aa8e`. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável. A imagem é a fonte de autoridade; OCR serve apenas como apoio.

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
- Teste de navegação que verifica a gravação do marcador de retomada do Caso Vivian ao clicar em “Voltar ao jogo” no catálogo.
- Testes estruturais do catálogo para IDs `P-001`–`P-034`, unicidade, páginas e campos obrigatórios, além da contagem exibida na introdução.
- Testes das regras do Caso Vivian para custos graduais, deduplicação de dicas em saves, limite mínimo zero, chaves malformadas e deduplicação de IDs restaurados.

Esses testes verificam estrutura e regras de código; não substituem o cotejo documental página a página nem um teste manual do fluxo completo no navegador.

## CI e validações

- O workflow está em `.github/workflows/ci.yml`. A execução [38315052983](https://github.com/tiago3228/dexter-revival-project/actions/runs/38315052983) terminou com sucesso no commit `194b65e6c449cae625950ad929a5d21cf2a3ba7a`, dentro do PR #10. A execução anterior [38314003065](https://github.com/tiago3228/dexter-revival-project/actions/runs/38314003065) também passou no commit `27d434f5440632d1cd7fc6a46e25393c02b08309`.
- Este registro documental foi atualizado depois do commit validado `194b65e`; o commit que registrar esta própria atualização ainda precisa passar pelo CI antes de qualquer merge.
- Na validação local desta correção: `pnpm test` passou em 8 arquivos e 26 testes; `pnpm exec tsc --noEmit` e `pnpm run build` passaram; `pnpm run lint` terminou com 0 erros e 7 avisos preexistentes; `git diff --check` passou.
- O teste automatizado cobre o marcador de retorno do catálogo; ainda falta conferir a rota e o ciclo de investigação completo no navegador.

## Pendências documentais e de integração

- A comparação visual página a página das páginas 51–79 foi concluída e registrada em `auditoria-cruzamento-paginas-051-079.md`. A transcrição de trabalho registra a omissão de texto detectada pelo OCR na p. 55, o plural impresso “Sem álibis” na p. 61 e a contradição cronológica interna da p. 56. A revisão de p. 55, 59 e 61 foi cruzada, respectivamente, com p. 116, 86 e 95. A p. 59 também foi conferida diretamente com a imagem nesta atualização.
- A etapa de revisão dos personagens foi concluída e registrada em `auditoria-personagens.md`: 20 perfis foram liberados com resumos restritos às fontes, Hannah e Nicole permanecem pendentes por lacunas de identificação, Scott e Sofia mantêm contradições abertas, e o placeholder coletivo sem identidade individual foi removido.
- A auditoria completa de `P-001` a `P-034` ainda precisa verificar fidelidade a cada fonte, classificação do tipo de documento, grau de confiança, estado de revisão, duplicatas e referências cruzadas.
- Páginas 55 e 116, ambas datadas de 13/02/1995, provavelmente se referem à mesma fotografia, mas não a identificam visualmente; P-005 continua incompleto quanto à identidade e ao retorno da foto.
- Páginas 59 e 86 provavelmente se referem ao mesmo acidente de 1973; p. 86 fornece os detalhes das vítimas e indenizações. A nota da p. 61 sobre o pai de Bernard não pode ser ligada a esse acidente sem data ou identificação adicional. Páginas 61 e 95 são documentos distintos associados ao mesmo Bernard; a ficha funcional não corrobora a nota investigativa.
- A contradição de datas/ações de Scott na p. 56 permanece sem explicação. Preservar os cabeçalhos como impressos; não corrigir por inferência.
- O catálogo não deve ser descrito como plenamente integrado ao jogo: a interface de consulta documental não está conectada ao ciclo jogável de Vivian.
- Ainda falta teste manual no navegador de desbloqueios, coleta duplicada, conexões válidas e inválidas, cronologia, bloqueio do relatório e persistência após recarga.

## Limites de interpretação

- Alegações, relatos de personagens, opiniões, inferências e fatos documentados devem continuar identificados separadamente.
- O status `Confirmado na fonte` se aplica ao resumo restrito exibido para a pessoa, não valida automaticamente todos os relatos ou acusações das páginas citadas.
- Uma suspeita, uma ausência de álibi, um motivo aparente ou uma coincidência temporal não constituem prova de autoria ou causalidade.
- Uma duplicata não conta como confirmação independente. Trechos ilegíveis ou incompletos devem permanecer assinalados, sem preenchimento por suposição.
- Status `visually-checked` indica apenas que houve cotejo com a imagem da página; não confirma automaticamente a verdade das alegações nela contidas.

Nenhuma publicação do jogo foi feita por esta atualização.
