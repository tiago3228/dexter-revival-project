# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-12.

## Material de origem

O arquivo `IMAGENS DE PAINSCREEK.zip` foi localizado na Biblioteca. O ZIP contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável, portanto a conferência deve ser visual, com OCR apenas como apoio.

## Estado confirmado no repositório

- Rota `/painscreek-evidence` existe em `src/routes/painscreek-evidence.tsx`.
- A árvore de rotas registra a página em `src/routeTree.gen.ts`.
- O explorador usa os 19 registros de `src/game/painscreekEvidence.ts`, descritos como catálogo documental preliminar para as páginas 80–116, ampliado nesta etapa com sete registros das páginas 84–92.
- A página de evidências não está conectada ao sistema de solução de casos; não descrevê-la como integração de gameplay.
- O catálogo mantém alegações, relatos, inferências e verificações pendentes separados.

## Navegação adicionada

- `src/routes/mapas.tsx`: link para o catálogo de evidências.
- `src/routes/linha-do-tempo.tsx`: link para o catálogo de evidências.

## Verificação ainda pendente

- Executar `npm run build`, `npm test` e `npm run lint` num ambiente com dependências instaladas.
- Abrir `/painscreek-evidence` e testar pesquisa, filtro, expansão de fontes e links de ida/volta no navegador.
- Comparar as páginas restantes do PDF com as transcrições já existentes, eliminar duplicatas e preservar leituras incertas. Sete registros preliminares novos das páginas 84–92 foram acrescentados a partir de OCR e continuam pendentes de cotejo visual completo.
- Só marcar evidência como conferida visualmente depois de cotejá-la com a página original.

Nenhuma publicação do jogo foi feita por esta atualização.
