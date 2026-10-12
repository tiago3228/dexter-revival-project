# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-12.

## Material de origem

O arquivo `IMAGENS DE PAINSCREEK.zip` foi localizado na Biblioteca. O ZIP contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável, portanto a conferência deve ser visual, com OCR apenas como apoio.

## Estado confirmado no repositório

- Rota `/painscreek-evidence` existe em `src/routes/painscreek-evidence.tsx`.
- A árvore de rotas registra a página em `src/routeTree.gen.ts`.
- O explorador usa os 19 registros de `src/game/painscreekEvidence.ts`, descritos como catálogo documental preliminar para as páginas 80–116, ampliado nesta etapa com sete registros das páginas 84–92.
- O catálogo documental continua separado do sistema de solução de casos; não confundir o catálogo com a mecânica jogável.
- `src/game/VivianInvestigationGame.tsx` implementa o primeiro ciclo jogável do Caso Vivian Roberts: coleta de evidências em locais desbloqueáveis, cruzamento de pares documentais, cronologia ordenável, relatório provisório e salvamento local.
- `src/game/VivianRobertsCase.tsx` expõe o novo modo pelo botão “Iniciar investigação” e mantém o dossiê/quadro investigativo acessíveis.
- O protótipo não declara culpado nem motivo final: há transcrições ainda incertas e a solução precisa ser confirmada antes de habilitar um veredito definitivo.
- O catálogo mantém alegações, relatos, inferências e verificações pendentes separados.

## Navegação adicionada

- `src/routes/mapas.tsx`: link para o catálogo de evidências.
- `src/routes/linha-do-tempo.tsx`: link para o catálogo de evidências.

## Verificação ainda pendente

- Executar `npm run build`, `npm test` e `npm run lint` num ambiente com dependências instaladas. Não foi possível executar essas verificações neste turno; o clone local falhou por indisponibilidade de DNS para `github.com`, e o commit ainda não reporta checks de CI.
- Testar o ciclo completo no navegador: desbloqueios de locais, coleta duplicada, conexões válidas/inválidas, cronologia, bloqueio do relatório e persistência após recarregar.
- Abrir `/painscreek-evidence` e testar pesquisa, filtro, expansão de fontes e links de ida/volta no navegador.
- Comparar as páginas restantes do PDF com as transcrições já existentes, eliminar duplicatas e preservar leituras incertas. Sete registros preliminares novos das páginas 84–92 foram acrescentados a partir de OCR e continuam pendentes de cotejo visual completo.
- Só marcar evidência como conferida visualmente depois de cotejá-la com a página original.

Nenhuma publicação do jogo foi feita por esta atualização.
