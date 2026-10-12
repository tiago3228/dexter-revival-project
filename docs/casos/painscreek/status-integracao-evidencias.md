# Estado da integração de evidências de Painscreek

Atualizado em 2026-10-12.

## Material de origem

O arquivo `IMAGENS DE PAINSCREEK.zip` foi localizado na Biblioteca. O ZIP contém o PDF `The Painscreek Killing.pdf` (116 páginas) e cinco mapas em PNG. O PDF é composto por páginas digitalizadas; a extração de texto direta não retorna texto selecionável, portanto a conferência deve ser visual, com OCR apenas como apoio.

## Estado confirmado no repositório

- Rota `/painscreek-evidence` existe em `src/routes/painscreek-evidence.tsx`.
- A árvore de rotas registra a página em `src/routeTree.gen.ts`.
- O arquivo de catálogo contém 34 registros (`P-001` a `P-034`) em `src/game/painscreekEvidence.ts`, cobrindo referências das páginas 80–116. Nesta revisão, as páginas 98–101 foram cotejadas com as imagens originais. Quatro documentos novos foram acrescentados: conselho de Henry a Vivian (p. 98), carta de Rachel Davis sobre a origem de Scott (p. 99), contratação de Steven Moss (p. 100) e carta jurídica sobre a defesa de Scott (p. 101). O lote 104–105 acrescentou a carta de Scott a Trisha (p. 104), cotejada visualmente, e um registro de enfermagem (p. 105), mantido incompleto até revisão visual detalhada. As páginas 84–97 também já foram cotejadas, com três documentos novos desse lote.
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
- A auditoria de cruzamento das páginas 100–116 foi adicionada em `docs/casos/painscreek/auditoria-cruzamento-paginas-100-116.md`. Ela identificou uma duplicidade entre P-009 e P-031 (ambas associadas ao relato de Stephanie na p. 109); P-031 foi corrigida no catálogo para funcionar como referência duplicada, sem valor de confirmação independente, além de distinguir episódios de Andrew, o empréstimo da fotografia e as referências indiretas ao incidente de 1975. A auditoria documental não substitui a revisão visual nem a validação no jogo.\n- O lote 106–116 já está descrito no catálogo, mas o cotejo visual e a consolidação dos registros ainda não devem ser considerados concluídos em todos os campos. Os metadados de revisão foram alinhados aos cotejos documentados: P-004, P-010, P-011 e P-034 agora refletem a conferência visual de suas fontes, mantendo as incertezas nos campos de ressalva. Próxima etapa recomendada: auditar a deduplicação das páginas 1–79 contra o catálogo atual antes de ampliar a integração jogável.
- O relatório financeiro da página 97, a notícia de fechamento do hospital (p. 84), a notícia da mina (p. 86), a notícia sobre Andrew Reed (p. 87), a declaração de Scott (p. 88), a carta de realocação (p. 89), a carta para Daniel (p. 91), a carta comercial (p. 92), o laudo médico (p. 94), a ficha de Bernard Hopkins (p. 95) e a carta de Dorothy (p. 96) foram cotejados visualmente. A carta para Daniel continua marcada como incompleta porque a página não identifica o remetente nem mostra o fim da carta. A carta de ameaça mencionada na página 100 também continua ausente: a página documenta apenas a referência ao anexo.
- Os status `visually-checked` confirmam apenas o cotejo com a imagem; não confirmam automaticamente que acusações, relatos ou inferências do documento sejam verdadeiros.

Nenhuma publicação do jogo foi feita por esta atualização.
