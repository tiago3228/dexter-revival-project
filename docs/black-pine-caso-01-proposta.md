## 11. Implementação jogável — concluída

O Caso 01 foi integrado ao menu principal como o capítulo **07 · Black Pine, Maine**. A implementação está separada dos demais casos nos arquivos `src/game/BlackPineCase.tsx` e `src/game/blackPineCase.ts`.

A interface inclui:

- Cena inicial do quarto 17 e regra explícita de separar fato de lenda.
- Registros expansíveis sobre as moedas, a estação, o caderno e os limites da evidência.
- Grade lógica no estilo Murdle, cruzando pessoas com locais e objetos, com marcações `✗`, confirmação `✓` e limpeza cíclica.
- Cinco interrogatórios independentes, cada um com leitura investigativa própria.
- Três conclusões possíveis, com validação do veredicto sustentado.
- Orientação opcional, pontuação, erros, tempo do caso e registro no sistema de conquistas.
- Testes automatizados para a solução da grade, bloqueio de conclusão prematura e encerramento correto.

O caso foi adicionado ao `CASE_IDS`, ao timer persistente e ao painel de estatísticas. Sparrow Hollow e Threshold continuam fora da implementação e serão criados como módulos independentes.

A referência Murdle anexada foi usada apenas para orientar a forma da dedução: categorias independentes, relações exclusivas e pistas que eliminam combinações. O conteúdo, os personagens, os documentos e a solução de Black Pine permanecem originais e baseados no manuscrito da trilogia.
