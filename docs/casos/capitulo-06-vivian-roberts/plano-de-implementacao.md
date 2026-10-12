# Plano de implementação — Capítulo 6

## Fase 1 — Base documental
- [x] Criar área documental separada para o capítulo.
- [x] Definir regras de proveniência e estado de revisão.
- [x] Criar catálogo inicial de personagens, locais e tipos de evidência.
- [ ] Receber as transcrições do PDF em lotes.
- [ ] Conferir nomes, datas, documentos e paginação contra a fonte.
- [ ] Fechar o inventário e registrar lacunas/contradições.

## Fase 2 — Design investigativo
- [ ] Modelar grafo de dependências por pista.
- [ ] Definir progressão de exploração sem bloqueios impossíveis.
- [ ] Definir a rota original com base apenas em evidências confirmadas.
- [ ] Projetar a rota alternativa em documento separado e marcá-la como design novo.
- [ ] Conferir que as duas rotas têm evidências suficientes para concluir autor, motivação e arma/meio.
- [ ] Fazer revisão de continuidade, horários, distâncias, acesso e alibis.

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
Esta fase cria documentação e estrutura isoladas. A integração ao menu e a publicação do caso jogável ficam pendentes até que o modelo do jogo e as transcrições sejam conferidos; não marcar o capítulo como concluído antes desses passos.
