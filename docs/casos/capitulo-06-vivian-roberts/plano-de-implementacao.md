# Plano de implementação — Capítulo 6

## Fase 1 — Base documental

- [x] Criar área documental separada para o capítulo.

- [x] Definir regras de proveniência e estado de revisão.

- [x] Criar catálogo inicial de personagens, locais e tipos de evidência.

- [x] Receber os lotes de trabalho do PDF: organização das páginas 1–69, OCR das páginas 31–69 e OCR das páginas 70–116.

- [x] Criar inventário OCR das páginas 31–69.

- [x] Criar inventário OCR e matriz preliminar de pistas para as páginas 70–116.

- [x] Fazer uma primeira inspeção visual das imagens das páginas 31–69 e corrigir omissões evidentes do OCR (p. 43, p. 55 e código da p. 60); ver [inventário OCR 31–69](./inventario-ocr-paginas-031-069.md) e [checklist de conferência visual](./checklist-conferencia-visual-pdf.md).

- [x] Fazer a primeira passada visual das 116 imagens do ZIP original e cruzá-las com as páginas de referência; concluir a segunda conferência palavra por palavra, a terceira auditoria independente e a quarta conferência focalizada nas lacunas residuais; depois, fazer uma quinta conferência focalizada nas páginas 70–116 (47 imagens). Aplicar somente leituras sustentadas e harmonizar os acréscimos página-a-página. Ver [índice/mapeamento](./transcricoes-imagens-zip/README.md) e os relatórios da [segunda](./transcricoes-imagens-zip/segunda-conferencia-116-imagens.md), [terceira](./transcricoes-imagens-zip/terceira-conferencia-116-imagens.md), [quarta](./transcricoes-imagens-zip/quarta-conferencia-lacunas-116-imagens.md) e [quinta conferência](./transcricoes-imagens-zip/quinta-conferencia-paginas-070-116.md). A transcrição diplomática integral das camadas manuscritas sobrepostas/cortadas continua em andamento.

- [x] Organizar a transcrição recebida das páginas 1–20 com IDs de diário/entrada e notas de incerteza; ver [transcrição dos lotes 01–02](./transcricao-lotes-01-02-paginas-001-020.md).

- [x] Organizar a transcrição recebida das páginas 21–30 com IDs de diário/entrada e notas de incerteza; ver [transcrição das páginas 21–30](./transcricao-paginas-021-030.md).

- [x] Preparar transcrição de trabalho das páginas 31–40 a partir das imagens, com OCR auxiliar e trechos incertos marcados; ver [transcrição das páginas 31–40](./transcricao-paginas-031-040.md).

- [x] Fazer segunda conferência palavra por palavra, terceira e quarta auditorias das 116 capturas, e quinta conferência focalizada nas páginas 70–116; harmonizar a leitura confirmada “Roland Brown” na camada inglesa do `doc9.png` e manter em aberto manuscritos ilegíveis/sobrepostos e cortes. Ver os relatórios da [terceira](./transcricoes-imagens-zip/terceira-conferencia-116-imagens.md), [quarta](./transcricoes-imagens-zip/quarta-conferencia-lacunas-116-imagens.md) e [quinta conferência](./transcricoes-imagens-zip/quinta-conferencia-paginas-070-116.md).

- [ ] Completar as transcrições literais restantes, preservando trechos ilegíveis sem reconstrução inventada.

- [x] Classificar os 32 itens distintos do registro central após a conferência; manter explicitamente abertas 20 lacunas, 1 contradição e 1 ponto de design sem confirmação. A triagem está registrada em [contradições e lacunas](./contradicoes-e-lacunas.md); isso não significa que os fatos subjacentes estejam resolvidos.

## Fase 2 — Design investigativo

- [x] Criar grafo provisório de dependências por tema, com referência às fontes candidatas.

- [x] Abrir registro central de contradições e lacunas documentais.

- [ ] Validar o grafo item a item após conferência visual e estabilizar IDs duplicados.

- [x] Definir e testar a progressão principal de exploração sem bloqueios impossíveis.

- [ ] Definir a rota original com base apenas em evidências confirmadas.

- [ ] Projetar a rota alternativa em documento separado e marcá-la como design novo.

- [ ] Conferir que as duas rotas têm evidências suficientes para concluir autor, motivação e arma/meio.

- [ ] Fazer revisão de continuidade, horários, distâncias, acesso e álibis.

- [ ] Separar contradições da fonte de eventuais inconsistências introduzidas pelo design.

## Fase 3 — Implementação

- [x] Criar componente de caso isolado para o Capítulo 06, com progresso próprio no navegador.

- [x] Integrar o capítulo como opção de menu.

- [x] Criar cartões clicáveis de personagens.

- [x] Criar lista de locais exploráveis com bloqueios por evidência.

- [x] Implementar inventário de evidências persistente em `localStorage`.

- [x] Implementar leitor/visualizador dos documentos e diários anexados.

- [x] Implementar os nove enigmas, três fechaduras, conexões, cronologia e senha pós-vitória.

- [ ] Implementar entrevistas e registro de depoimentos.

- [x] Criar quadro de conexões, requisitos probatórios e formulário de acusação final por personagem, arma e motivação.

- [x] Integrar exercício opcional de dedução estilo Murdle no Caso Vivian, com grades pessoa × local e pessoa × objeto, pistas de eliminação/afirmação, validação da combinação e registro editorial no caderno; o exercício não estabelece culpa nem fecha lacunas documentais.

- [x] Persistir a conclusão correta do caso e liberar o componente “Arquivo confidencial · Revelação final” somente após a vitória.

- [x] Consolidar a narrativa final detalhada em [revelacao-final-vivian.md](./revelacao-final-vivian.md), preservando datas divergentes e limites da reconstrução.

- [ ] Garantir que a escolha de rota não apareça no texto de interface nem em nomes de arquivos públicos visíveis ao jogador.

## Fase 4 — Qualidade

- [x] Executar lint, suíte completa de testes e build de produção após a revisão.

- [x] Adicionar testes para bloqueios do veredito, acusação correta/incorreta e desbloqueio do arquivo final.

- [ ] Testar navegação por teclado e layout responsivo.

- [x] Testar a persistência da vitória e o desbloqueio do arquivo final.

- [x] Testar a rota principal do zero: cinco locais, onze fichas de evidência, nove enigmas, três fechaduras, duas conexões, cronologia, acusação e dossiê M99.

- [ ] Testar exaustivamente todos os ramos opcionais e a navegação responsiva por teclado.

- [ ] Verificar que nenhum documento foi truncado.

- [x] Verificar que nenhum spoiler aparece antes da acusação final.

- [x] Confirmar que a alteração se limita ao fluxo do Capítulo 06, sem editar o explorador/catálogo Painscreek existente.

- [x] Fazer revisão editorial e de consistência antes de publicar: relatos, suspeitas e hipóteses foram reatribuídos ou marcados como não confirmados; condição de vitória e bloqueio da revelação final preservados.

## Escopo desta preparação

O histórico do repositório já continha transcrição de trabalho das páginas 70–79, a confirmação da origem do diário de Vivian, auditorias parciais de documentos/personagens e os 116 PNGs originais do ZIP. A auditoria individual dos registros P-001–P-047 continua suspensa conforme o status de Painscreek; esta rodada revisou o fluxo de jogo e reconciliou as fichas agregadas sem declarar conferência integral das fontes.

## Observação de fechamento

A condição de vitória exige evidências essenciais, conexões-chave, três mecanismos de código, cronologia correta e as três respostas finais: **Matthew Brooks**, **machado** e **vingança pelo assassinato de Sofia Miller, mulher que Matthew amava**. O playthrough automatizado iniciado sem save confirmou os cinco locais, onze evidências, nove enigmas, fechaduras, conexões, cronologia, acusação correta e acesso ao M99 somente após a vitória. O estado persiste em `localStorage`. A suíte passou em 102 testes; `tsc`, lint (0 erros; 7 avisos preexistentes), build e `git diff --check` passaram. Isso valida o fluxo funcional, não a transcrição diplomática integral de cada fonte. A terceira e a quarta auditorias percorreram as 116 imagens; leituras adicionais seguras foram incorporadas e harmonizadas por página. Permanecem em aberto as sobreposições, cortes, leituras duvidosas e a análise das contradições documentais.
