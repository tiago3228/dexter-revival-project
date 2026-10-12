# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-12.

## Material de origem

O arquivo `IMAGENS DE PAINSCREEK.zip` foi localizado na Biblioteca. O ZIP contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável, portanto a conferência deve ser visual, com OCR apenas como apoio.

## Estado confirmado no repositório

- Rota `/painscreek-evidence` existe em `src/routes/painscreek-evidence.tsx`.
- A árvore de rotas registra a página em `src/routeTree.gen.ts`.
- O explorador usa 22 registros em `src/game/painscreekEvidence.ts`, cobrindo referências das páginas 80–116. Nesta revisão, os registros das páginas 84–97 foram cotejados com as imagens originais; três documentos novos (laudo médico de Vivian, ficha de Bernard Hopkins e despedida de Dorothy) foram acrescentados.
- O catálogo documental continua separado do sistema de solução de casos; não confundir o catálogo com a mecânica jogável.
- `src/game/VivianInvestigationGame.tsx` implementa o primeiro ciclo jogável do Caso Vivian Roberts: coleta de evidências em locais desbloqueáveis, cruzamento de pares documentais, cronologia ordenável, relatório provisório e salvamento local.
- `src/game/VivianRobertsCase.tsx` expõe o novo modo pelo botão “Iniciar investigação” e mantém o dossiê/quadro investigativo acessíveis.
- O modo jogável agora oferece três níveis de dica por evidência, com penalidades de 20, 50 e 100 pontos. O total parte de 1.000 pontos, é limitado a zero e aparece na exploração e no relatório provisório.
- As dicas usadas são persistidas no navegador, não podem ser cobradas duas vezes e são limpas ao reiniciar. A leitura de progresso aceita saves antigos da versão 1 e migra para a versão 2.
- O protótipo não declara culpado nem motivo final: há transcrições ainda incertas e a solução precisa ser confirmada antes de habilitar um veredito definitivo.
- O catálogo mantém alegações, relatos, inferências e verificações pendentes separados.

## Navegação adicionada

- `src/routes/mapas.tsx`: link para o catálogo de evidências.
- `src/routes/linha-do-tempo.tsx`: link para o catálogo de evidências.

## Verificação ainda pendente

- Executar `npm run build`, `npm test` e `npm run lint` num ambiente com dependências instaladas. Não foi possível executar essas verificações neste turno; o clone local falhou por indisponibilidade de DNS para `github.com`, e o commit ainda não reporta checks de CI.
- Testar o ciclo completo no navegador: desbloqueios de locais, coleta duplicada, conexões válidas/inválidas, cronologia, bloqueio do relatório e persistência após recarregar.
- Abrir `/painscreek-evidence` e testar pesquisa, filtro, expansão de fontes e links de ida/volta no navegador.
- Continuar a revisão das páginas fora do lote 84–97 e comparar cada documento com o catálogo para eliminar duplicatas, identificar personagens/lugares e preservar leituras incertas.
- O relatório financeiro da página 97, a notícia de fechamento do hospital (p. 84), a notícia da mina (p. 86), a notícia sobre Andrew Reed (p. 87), a declaração de Scott (p. 88), a carta de realocação (p. 89), a carta para Daniel (p. 91), a carta comercial (p. 92), o laudo médico (p. 94), a ficha de Bernard Hopkins (p. 95) e a carta de Dorothy (p. 96) foram cotejados visualmente. A carta para Daniel continua marcada como incompleta porque a página não identifica o remetente nem mostra o fim da carta.
- Os status `visually-checked` confirmam apenas o cotejo com a imagem; não confirmam automaticamente que acusações, relatos ou inferências do documento sejam verdadeiros.

Nenhuma publicação do jogo foi feita por esta atualização.
