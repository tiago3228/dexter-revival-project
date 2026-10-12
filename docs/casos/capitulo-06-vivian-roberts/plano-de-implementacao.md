# Plano de implementação — Capítulo 6

## Fase 1 — Base documental
- [x] Criar área documental separada para o capítulo.
- [x] Definir regras de proveniência e estado de revisão.
- [x] Criar catálogo inicial de personagens, locais e tipos de evidência.
- [x] Receber os lotes de trabalho do PDF: organização das páginas 1–69, OCR das páginas 31–69 e OCR das páginas 70–116.
- [x] Criar inventário OCR das páginas 31–69.
- [x] Criar inventário OCR e matriz preliminar de pistas para as páginas 70–116.
- [x] Fazer uma primeira inspeção visual das imagens das páginas 31–69 e corrigir omissões evidentes do OCR (p. 43, p. 55 e código da p. 60); ver [inventário OCR 31–69](./inventario-ocr-paginas-031-069.md) e [checklist de conferência visual](./checklist-conferencia-visual-pdf.md).
- [ ] Continuar a conferência ampliada, palavra por palavra, dos lotes 1–69 e 70–116; a inspeção inicial não equivale a transcrição diplomática integral.
- [x] Organizar a transcrição recebida das páginas 1–20 com IDs de diário/entrada e notas de incerteza; ver [transcrição dos lotes 01–02](./transcricao-lotes-01-02-paginas-001-020.md).\n- [x] Organizar a transcrição recebida das páginas 21–30 com IDs de diário/entrada e notas de incerteza; ver [transcrição das páginas 21–30](./transcricao-paginas-021-030.md).\n- [ ] Conferir a transcrição das páginas 1–20 palavra por palavra contra as imagens originais; o texto recebido ainda não foi validado de forma independente.\n- [ ] Completar as transcrições literais restantes, preservando trechos ilegíveis sem reconstrução inventada.
- [ ] Fechar o inventário e registrar lacunas/contradições após a conferência.

## Fase 2 — Design investigativo
- [x] Criar grafo provisório de dependências por tema, com referência às fontes candidatas.
- [x] Abrir registro central de contradições e lacunas documentais.
- [ ] Validar o grafo item a item após conferência visual e estabilizar IDs duplicados.
- [ ] Definir progressão de exploração sem bloqueios impossíveis.
- [ ] Definir a rota original com base apenas em evidências confirmadas.
- [ ] Projetar a rota alternativa em documento separado e marcá-la como design novo.
- [ ] Conferir que as duas rotas têm evidências suficientes para concluir autor, motivação e arma/meio.
- [ ] Fazer revisão de continuidade, horários, distâncias, acesso e álibis.
- [ ] Separar contradições da fonte de eventuais inconsistências introduzidas pelo design.

## Fase 3 — Implementação
- [ ] Criar componente de caso isolado, sem reaproveitar o estado interno do caso Painscreek existente.
- [ ] Integrar o capítulo como nova opção de menu.
- [ ] Criar cartões clicáveis de personagens.
- [ ] Criar mapa/lista de locais exploráveis.
- [ ] Implementar inventário de evidências persistente durante a sessão.
- [ ] Implementar leitor de diários/documentos multipágina.
- [ ] Implementar puzzles e dependências documentadas.
- [ ] Implementar entrevistas e registro de depoimentos.
- [ ] Implementar quadro de conexões e conclusão final.
- [ ] Garantir que a escolha de rota não apareça no texto de interface nem em nomes de arquivos públicos visíveis ao jogador.

## Fase 4 — Qualidade
- [ ] Executar lint, testes e build.
- [ ] Testar navegação por teclado e layout responsivo.
- [ ] Testar salvamento e retomada, se houver persistência.
- [ ] Testar todos os caminhos de acesso a documentos e locais.
- [ ] Verificar que nenhum documento foi truncado.
- [ ] Verificar que nenhum spoiler aparece antes da acusação final.
- [ ] Confirmar que o caso Painscreek existente permanece inalterado.
- [ ] Fazer revisão editorial e de consistência antes de publicar.

## Escopo desta preparação
Esta fase cria documentação e estrutura isoladas. A integração ao menu e a publicação do caso jogável ficam pendentes até que as transcrições sejam conferidas e o modelo investigativo seja validado. Não marcar o capítulo como concluído antes desses passos.
